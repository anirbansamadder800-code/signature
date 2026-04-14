import { useRef, useState, useCallback } from 'react';

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SignatureUpload = ({ label, description, image, onImageChange, accentColor = 'cyan', index }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const accentMap = {
    cyan: {
      text: 'text-cyan-400',
      border: 'rgba(6, 182, 212, 0.7)',
      bg: 'rgba(6, 182, 212, 0.05)',
      glow: 'rgba(6, 182, 212, 0.3)',
      badge: 'bg-cyan-400',
      labelBg: 'rgba(6, 182, 212, 0.1)',
      labelBorder: 'rgba(6, 182, 212, 0.3)',
    },
    purple: {
      text: 'text-purple-400',
      border: 'rgba(168, 85, 247, 0.7)',
      bg: 'rgba(168, 85, 247, 0.05)',
      glow: 'rgba(168, 85, 247, 0.3)',
      badge: 'bg-purple-400',
      labelBg: 'rgba(168, 85, 247, 0.1)',
      labelBorder: 'rgba(168, 85, 247, 0.3)',
    },
  };
  const accent = accentMap[accentColor];

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  return (
    <div
      className="fade-in-up"
      style={{
        flex: 1,
        minWidth: '280px',
        borderRadius: '1rem',
        overflow: 'hidden',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        animationDelay: `${index * 0.15}s`,
      }}
    >
      {/* Label */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold orbitron"
          style={{ background: `linear-gradient(135deg, ${accent.glow}, ${accent.border})`, color: '#fff' }}
        >
          {index + 1}
        </div>
        <div>
          <p className={`text-sm font-semibold tracking-wide ${accent.text} orbitron`}>{label}</p>
          <p className="text-slate-500 text-xs">{description}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div style={{ padding: '1.25rem' }}>
        {!image ? (
          <div
            className={`upload-zone rounded-xl flex flex-col items-center justify-center gap-3 py-10 px-4 cursor-pointer transition-all duration-300 ${dragging ? 'drag-over' : ''}`}
            style={dragging ? { borderColor: accent.border, background: accent.bg, boxShadow: `inset 0 0 30px ${accent.glow}` } : {}}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
          >
            <div
              className="p-4 rounded-full"
              style={{ background: accent.bg, color: accent.border, border: `1px solid ${accent.glow}` }}
            >
              <UploadIcon />
            </div>
            <div className="text-center">
              <p className="text-slate-300 text-sm font-medium mb-1">Drop signature here</p>
              <p className="text-slate-500 text-xs">or <span className={`${accent.text} cursor-pointer hover:underline`}>browse files</span></p>
              <p className="text-slate-600 text-xs mt-2">PNG, JPG, JPEG supported</p>
            </div>

            {/* Animated corner indicators */}
            {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((cls, i) => (
              <span
                key={i}
                className={`absolute ${cls} w-4 h-4 pointer-events-none`}
                style={{ borderColor: dragging ? accent.border : 'rgba(0,212,255,0.3)', transition: 'border-color 0.3s' }}
              />
            ))}
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden group" style={{ aspectRatio: '4/3' }}>
            <img
              src={image}
              alt={label}
              className="w-full h-full object-contain"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />

            {/* Scan line overlay on hover */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                className="scanning-line absolute left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${accent.border}, transparent)` }}
              />
            </div>

            {/* Uploaded badge */}
            <div
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }}
            >
              <CheckIcon />
              Loaded
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); onImageChange(null); }}
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-slate-300 hover:text-white transition-colors"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <XIcon />
              Remove
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
};

export default SignatureUpload;
