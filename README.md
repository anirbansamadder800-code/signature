# Simple Signature Verification
**by Anirban Samadder**

> Verify handwritten signatures using OpenCV + Machine Learning (SSIM + ORB + Histogram Analysis)

---

## 🚀 How to Run (Teacher / Evaluator)

### Prerequisites
- **Python 3.10+** must be installed → [python.org/downloads](https://www.python.org/downloads/)

### Step 1 — Install dependencies (one time only)
Double-click **`setup.bat`**  
_(or run in terminal: `pip install -r requirements.txt`)_

### Step 2 — Start the application
Double-click **`run.bat`**  
_(or run in terminal: `python app.py`)_

### Step 3 — Use the app
The browser will open automatically at **http://localhost:5000**

> ✅ That's it — no Node.js, no npm, no React setup needed!

---

## 🧠 How It Works

| Step | Algorithm | Weight |
|------|-----------|--------|
| 1 | **SSIM** — Structural Similarity Index | 50% |
| 2 | **ORB** — Feature Keypoint Matching (Lowe's ratio test) | 30% |
| 3 | **Histogram** — Pixel intensity correlation | 20% |

Combined score **≥ 60%** → **Match ✅**  
Combined score **< 60%** → **Not Match ❌**

---

## 📁 Project Structure

```
signature/
├── app.py              ← Flask backend (API + serves UI)
├── requirements.txt    ← Python dependencies
├── setup.bat           ← Install dependencies (run once)
├── run.bat             ← Start the app (double-click to run)
├── dist/               ← Built React frontend (pre-built, ready to serve)
└── src/                ← React source code (not needed to run)
```

---

## 🛠 Tech Stack

- **Frontend**: React + Tailwind CSS (pre-built into `dist/`)
- **Backend**: Python + Flask
- **CV/ML**: OpenCV, scikit-image (SSIM), ORB feature matching

---

*Project for AI Lab | Anirban Samadder*
