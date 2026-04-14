const ResultDisplay = ({ result }) => {
  if (!result) return null;

  // `result` is now the full API response object:
  // { result: "match"|"nomatch", score: float, breakdown: {ssim, orb, hist}, message: str }
  const isMatch = result.result === 'match';
  const score   = result.score  ?? 0;
  const bd      = result.breakdown ?? {};

  return (
    <div className={`w-full rounded-2xl p-6 ${isMatch ? 'result-match' : 'result-nomatch'} fade-in-scale`}>
      <div className="flex flex-col items-center gap-4">

        {/* Icon ring */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: isMatch
              ? 'radial-gradient(circle, rgba(16,185,129,0.2), rgba(16,185,129,0.05))'
              : 'radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
            border: `2px solid ${isMatch ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'}`,
            boxShadow: isMatch
              ? '0 0 30px rgba(16,185,129,0.3), inset 0 0 20px rgba(16,185,129,0.1)'
              : '0 0 30px rgba(239,68,68,0.3), inset 0 0 20px rgba(239,68,68,0.1)',
          }}
        >
          <span className="text-4xl">{isMatch ? '✅' : '❌'}</span>

          {/* Rotating ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px dashed ${isMatch ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
              animation: 'spin-slow 8s linear infinite',
            }}
          />
        </div>

        {/* Result text */}
        <div className="text-center">
          <p
            className="orbitron text-3xl font-black tracking-wider mb-1"
            style={{ color: isMatch ? '#10b981' : '#ef4444' }}
          >
            {isMatch ? 'MATCH' : 'NOT MATCH'}
          </p>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">{result.message}</p>
        </div>

        {/* Primary score gauge */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 orbitron">Similarity Score</span>
            <span className="font-bold" style={{ color: isMatch ? '#10b981' : '#ef4444' }}>
              {score.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${score}%`,
                background: isMatch
                  ? 'linear-gradient(90deg, #059669, #10b981)'
                  : 'linear-gradient(90deg, #dc2626, #ef4444)',
              }}
            />
          </div>
        </div>

        {/* Breakdown stats row */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: 'SSIM',      value: bd.ssim ?? 0, desc: 'Structure' },
            { label: 'ORB',       value: bd.orb  ?? 0, desc: 'Features'  },
            { label: 'Histogram', value: bd.hist  ?? 0, desc: 'Intensity' },
          ].map(({ label, value, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center px-3 py-3 rounded-xl gap-1"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p
                className="orbitron text-sm font-bold"
                style={{ color: isMatch ? '#10b981' : '#ef4444' }}
              >
                {value.toFixed(1)}%
              </p>
              <p className="text-slate-400 text-xs font-medium">{label}</p>
              <p className="text-slate-600 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* Method badge row */}
        <div className="flex gap-2 flex-wrap justify-center">
          {['SSIM', 'ORB Matching', 'Hist Correl', 'OpenCV'].map(m => (
            <span
              key={m}
              className="px-2.5 py-1 rounded-full text-xs orbitron"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
            >
              {m}
            </span>
          ))}
        </div>

        {/* Verdict banner */}
        <div
          className="w-full py-2.5 rounded-xl text-center text-xs tracking-widest uppercase font-semibold orbitron"
          style={{
            background: isMatch ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: isMatch ? '#10b981' : '#ef4444',
          }}
        >
          {isMatch ? '✓ Identity Verified Successfully' : '✗ Identity Verification Failed'}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
