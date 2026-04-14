import { useEffect, useRef } from 'react';

const LoadingScanner = ({ active }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 320;
    const H = canvas.height = 80;

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin((x * 0.04) + t) * 15 + Math.sin((x * 0.08) + t * 1.5) * 8;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Ghost wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin((x * 0.04) + t + 1) * 12 + Math.cos((x * 0.06) + t) * 6;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Scan dot
      const dotX = ((t * 30) % W);
      const gradient = ctx.createRadialGradient(dotX, H / 2, 0, dotX, H / 2, 12);
      gradient.addColorStop(0, 'rgba(0,212,255,0.9)');
      gradient.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath();
      ctx.arc(dotX, H / 2, 12, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      t += 0.05;
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fade-in-up w-full flex flex-col items-center gap-4 py-4">
      <div className="relative">
        <canvas ref={canvasRef} className="rounded-lg" style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)' }} />
        {/* Scan grid lines */}
        <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
          {[25, 50, 75].map(pct => (
            <div key={pct} className="absolute left-0 right-0 h-px" style={{ top: `${pct}%`, background: 'rgba(0,212,255,0.08)' }} />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="orbitron text-cyan-400 text-sm font-semibold tracking-widest">ANALYZING</div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        <div className="text-slate-500 text-xs tracking-wide">Running similarity computation...</div>

        {/* Progress bar */}
        <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,212,255,0.1)' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
              animation: 'shimmer 1.5s linear infinite',
              backgroundSize: '200% 100%',
              width: '60%',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScanner;
