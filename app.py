"""
Simple Signature Verification — Flask Backend
by Anirban Samadder

Uses OpenCV + Scikit-Image (SSIM) + ORB feature matching to compare
two uploaded signature images and returns Match / Not Match.

HOW TO RUN:
  pip install -r requirements.txt
  python app.py
  Open http://localhost:5000 in your browser
"""

import os
import io
import numpy as np
import cv2
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from skimage.metrics import structural_similarity as ssim
from PIL import Image

# Serve the built React frontend from the 'dist' folder
DIST_DIR = os.path.join(os.path.dirname(__file__), 'dist')
app = Flask(__name__, static_folder=DIST_DIR, static_url_path='')
CORS(app)

# ── Tunable thresholds ────────────────────────────────────────────
SSIM_WEIGHT      = 0.5   # weight of SSIM score in final score
ORB_WEIGHT       = 0.3   # weight of ORB feature match ratio
HIST_WEIGHT      = 0.2   # weight of histogram correlation
MATCH_THRESHOLD  = 0.60  # combined score above this → MATCH
ORB_GOOD_RATIO   = 0.75  # Lowe's ratio test threshold
# ─────────────────────────────────────────────────────────────────


def decode_image(file_storage) -> np.ndarray:
    """Read an uploaded file into a BGR numpy array."""
    data = file_storage.read()
    img  = Image.open(io.BytesIO(data)).convert("RGB")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def preprocess(img: np.ndarray, size=(256, 256)) -> np.ndarray:
    """Convert to greyscale, resize, and apply adaptive thresholding."""
    gray    = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, size, interpolation=cv2.INTER_AREA)
    # Denoise
    blurred = cv2.GaussianBlur(resized, (3, 3), 0)
    # Adaptive threshold → clean binary signature on white background
    binary  = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 11, 2
    )
    return binary


def compute_ssim_score(img1: np.ndarray, img2: np.ndarray) -> float:
    """Return SSIM score [0, 1] between two preprocessed greyscale images."""
    score, _ = ssim(img1, img2, full=True)
    return float(np.clip(score, 0, 1))


def compute_orb_score(img1: np.ndarray, img2: np.ndarray) -> float:
    """Return ORB feature match ratio [0, 1] using Lowe's ratio test."""
    orb = cv2.ORB_create(nfeatures=500)
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)

    if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
        return 0.0

    bf      = cv2.BFMatcher(cv2.NORM_HAMMING)
    matches = bf.knnMatch(des1, des2, k=2)

    good_matches = [
        m for m, n in matches
        if m.distance < ORB_GOOD_RATIO * n.distance
    ]

    ratio = len(good_matches) / max(len(kp1), len(kp2), 1)
    return float(np.clip(ratio * 2.5, 0, 1))  # scale up — raw ratio is naturally small


def compute_hist_score(img1: np.ndarray, img2: np.ndarray) -> float:
    """Return histogram correlation [0, 1] between two greyscale images."""
    h1 = cv2.calcHist([img1], [0], None, [256], [0, 256])
    h2 = cv2.calcHist([img2], [0], None, [256], [0, 256])
    cv2.normalize(h1, h1)
    cv2.normalize(h2, h2)
    score = cv2.compareHist(h1, h2, cv2.HISTCMP_CORREL)
    return float(np.clip(score, 0, 1))


@app.route("/verify", methods=["POST"])
def verify():
    """
    POST /verify
    Form fields:
        reference  — the original / known signature image file
        test       — the signature to verify image file

    Response JSON:
        {
          "result":    "match" | "nomatch",
          "score":     float (0–100),
          "breakdown": { "ssim": float, "orb": float, "hist": float },
          "message":   str
        }
    """
    if "reference" not in request.files or "test" not in request.files:
        return jsonify({"error": "Both 'reference' and 'test' image files are required."}), 400

    try:
        ref_img  = decode_image(request.files["reference"])
        test_img = decode_image(request.files["test"])
    except Exception as exc:
        return jsonify({"error": f"Could not decode image: {exc}"}), 400

    # Preprocess both images the same way
    ref_proc  = preprocess(ref_img)
    test_proc = preprocess(test_img)

    # Compute individual scores
    ssim_score = compute_ssim_score(ref_proc, test_proc)
    orb_score  = compute_orb_score(ref_proc, test_proc)
    hist_score = compute_hist_score(ref_proc, test_proc)

    # Weighted combination
    combined = (
        SSIM_WEIGHT * ssim_score +
        ORB_WEIGHT  * orb_score  +
        HIST_WEIGHT * hist_score
    )

    result  = "match" if combined >= MATCH_THRESHOLD else "nomatch"
    pct     = round(combined * 100, 2)

    return jsonify({
        "result":  result,
        "score":   pct,
        "breakdown": {
            "ssim": round(ssim_score * 100, 2),
            "orb":  round(orb_score  * 100, 2),
            "hist": round(hist_score * 100, 2),
        },
        "message": (
            "Signatures are structurally similar — likely from the same person."
            if result == "match" else
            "Signatures show significant differences — verification failed."
        )
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Simple Signature Verification API"})


# ── Serve React frontend for all other routes ─────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve the built React app for any route not matched by the API."""
    target = os.path.join(DIST_DIR, path)
    if path and os.path.exists(target):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, 'index.html')
# ─────────────────────────────────────────────────────────────────


if __name__ == "__main__":
    print("=" * 55)
    print("  Simple Signature Verification")
    print("  by Anirban Samadder")
    print()
    print("  Opening: http://localhost:5000")
    print("=" * 55)
    import webbrowser, threading
    threading.Timer(1.2, lambda: webbrowser.open("http://localhost:5000")).start()
    app.run(host="0.0.0.0", port=5000, debug=False)
