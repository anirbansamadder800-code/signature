import { useEffect, useRef } from 'react';

const Header = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <header style={{ position: 'relative', width: '100%', paddingTop: '3.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', overflow: 'hidden' }}>
      {/* canvas particle layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Gradient line top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, #a855f7, transparent)' }}
      />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', textAlign: 'center' }} className="fade-in-up">

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem', borderRadius: '9999px', marginBottom: '1.5rem',
          background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)',
        }}>
          <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#22d3ee', display: 'inline-block', animation: 'neon-pulse 2s ease-in-out infinite' }} />
          <span className="orbitron" style={{ color: '#22d3ee', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            AI-Powered · OpenCV + ML
          </span>
        </div>

        {/* Title */}
        <h1 className="orbitron gradient-text" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.15 }}>
          Simple Signature
          <br />
          Verification
        </h1>

        {/* Subtitle */}
        <p style={{ color: '#94a3b8', fontSize: '0.9375rem', maxWidth: '36rem', margin: '0 auto 1.5rem', lineHeight: 1.7, letterSpacing: '0.02em', textAlign: 'center' }}>
          Match signatures using structural similarity analysis
          <br />
          <span style={{ color: '#06b6d4', fontWeight: 500 }}>OpenCV</span> + <span style={{ color: '#a855f7', fontWeight: 500 }}>Machine Learning</span>
        </p>

        {/* Author chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.5rem 1.25rem', borderRadius: '9999px',
          background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)',
        }}>
          <div style={{
            width: '1.5rem', height: '1.5rem', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
          }}>A</div>
          <span style={{ color: '#cbd5e1', fontSize: '0.875rem', letterSpacing: '0.02em' }}>
            by <span style={{ color: '#c084fc', fontWeight: 600 }}>Anirban Samadder</span>
          </span>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)' }}
      />
    </header>
  );
};

export default Header;
