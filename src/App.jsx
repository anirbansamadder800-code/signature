import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SignatureUpload from './components/SignatureUpload';
import LoadingScanner from './components/LoadingScanner';
import ResultDisplay from './components/ResultDisplay';

// Particle background system
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.05,
    }));

    let id;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // connections
      ctx.strokeStyle = 'rgba(0,212,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.624 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .28 2.701-1.079 2.701H3.877a1.875 1.875 0 01-1.325-3.198L5 14.5" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const BACKEND_URL = 'http://localhost:5000';

/** Convert a base64 data-URL back to a Blob so we can POST it as multipart */
function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export default function App() {
  const [refImage, setRefImage] = useState(null);   // base64 data-URL
  const [testImage, setTestImage] = useState(null); // base64 data-URL
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);       // full API response object
  const [apiError, setApiError] = useState(null);

  const canVerify = refImage && testImage && !loading;

  const handleVerify = async () => {
    if (!canVerify) return;
    setResult(null);
    setApiError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('reference', dataURLtoBlob(refImage), 'reference.png');
      form.append('test',      dataURLtoBlob(testImage), 'test.png');

      const res = await fetch(`${BACKEND_URL}/verify`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);          // { result, score, breakdown, message }
    } catch (err) {
      setApiError(
        err.message.includes('fetch')
          ? 'Cannot reach the Python backend. Make sure `python app.py` is running on port 5000.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRefImage(null);
    setTestImage(null);
    setResult(null);
    setApiError(null);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen grid-bg" style={{ background: '#030712' }}>
      <ParticleField />

      {/* Gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06), transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main style={{ flex: 1, width: '100%', maxWidth: '1024px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: <ShieldIcon />, label: 'Secure', desc: 'Local Processing', color: '#00d4ff' },
              { icon: <BrainIcon />, label: 'AI-Powered', desc: 'ML Similarity', color: '#a855f7' },
              { icon: <ZapIcon />, label: 'Fast', desc: '< 3s Analysis', color: '#06b6d4' },
            ].map(({ icon, label, desc, color }, i) => (
              <div
                key={label}
                className="glass-card fade-in-up"
                style={{
                  borderRadius: '0.75rem',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold orbitron">{label}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main verification card */}
          <div
            className="glass-card fade-in-up"
            style={{
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '1.5rem',
              animationDelay: '0.3s',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 className="orbitron" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Signature Comparison</h2>
                <p className="text-slate-500 text-sm">Upload both signatures to begin analysis</p>
              </div>
              {(refImage || testImage || result) && (
                <button
                  onClick={handleReset}
                  className="orbitron"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'color 0.2s',
                    letterSpacing: '0.05em',
                  }}
                >
                  ↺ Reset
                </button>
              )}
            </div>

            {/* Upload panels */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <SignatureUpload
                label="Reference Signature"
                description="Original / known document"
                image={refImage}
                onImageChange={setRefImage}
                accentColor="cyan"
                index={0}
              />

              {/* Center divider */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0 0.5rem', flexShrink: 0 }}>
                <div style={{ flex: 1, width: '1px', background: 'rgba(255,255,255,0.07)', minHeight: '60px' }} />
                <div
                  className="orbitron"
                  style={{
                    width: '2.25rem', height: '2.25rem',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    flexShrink: 0,
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: '#00d4ff',
                  }}
                >
                  VS
                </div>
                <div style={{ flex: 1, width: '1px', background: 'rgba(255,255,255,0.07)', minHeight: '60px' }} />
              </div>

              <SignatureUpload
                label="Test Signature"
                description="Signature to verify"
                image={testImage}
                onImageChange={setTestImage}
                accentColor="purple"
                index={1}
              />
            </div>

            {/* Loading scanner */}
            <LoadingScanner active={loading} />

            {/* Verify button */}
            {!loading && (
              <button
                id="verify-btn"
                onClick={handleVerify}
                disabled={!canVerify}
                className="verify-btn w-full py-4 rounded-2xl text-white font-bold text-base orbitron tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {!refImage && !testImage
                  ? '⬆ Upload Both Signatures'
                  : !refImage
                  ? '⬆ Upload Reference Signature'
                  : !testImage
                  ? '⬆ Upload Test Signature'
                  : '⚡ Verify Signatures'}
              </button>
            )}

            {/* Hint text */}
            {!canVerify && !loading && (
              <p className="text-center text-slate-600 text-xs mt-3">
                {refImage && testImage ? '' : 'Both signatures are required for comparison'}
              </p>
            )}
          </div>

          {/* API error banner */}
          {apiError && !loading && (
            <div
              className="w-full rounded-2xl px-5 py-4 mb-4 fade-in-scale flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)' }}
            >
              <span className="text-red-400 text-lg mt-0.5">⚠</span>
              <div>
                <p className="text-red-400 text-sm font-semibold orbitron mb-0.5">Backend Error</p>
                <p className="text-slate-400 text-xs">{apiError}</p>
              </div>
            </div>
          )}

          {/* Result panel */}
          {result && !loading && (
            <div className="fade-in-up">
              <ResultDisplay result={result} />
            </div>
          )}

          {/* Footer info strip */}
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: '#475569', fontSize: '0.75rem' }}>
            {['SSIM Algorithm', 'ORB Feature Matching', 'Histogram Analysis', 'OpenCV Backend', 'Scikit-Learn'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-900" />
                {t}
              </span>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-slate-600 text-xs orbitron tracking-widest">
            © 2026 ANIRBAN SAMADDER · SIMPLE SIGNATURE VERIFICATION
          </p>
        </footer>
      </div>
    </div>
  );
}
