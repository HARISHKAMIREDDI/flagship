interface AIOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  isThinking?: boolean;
  className?: string;
}

export default function AIOrb({
  size = 'md',
  isActive = true,
  isThinking = false,
  className = '',
}: AIOrbProps) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dim = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center select-none ${dim} ${className}`}>
      {/* Outer ambient glow aura */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 blur-md ${
          isThinking
            ? 'bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-pink-500/50 animate-pulse scale-125'
            : isActive
            ? 'bg-gradient-to-r from-violet-600/40 to-cyan-500/40 animate-pulse-glow'
            : 'bg-zinc-800/40'
        }`}
      />

      {/* SVG Neural Holographic Core */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="orbGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <linearGradient id="ringGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id="plasmaCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
          </radialGradient>

          <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbital Ring 1 - Clockwise Slow */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#ringGrad1)"
          strokeWidth="1.2"
          strokeDasharray="16 10 32 8"
          strokeLinecap="round"
          className="origin-center animate-spin-slow opacity-80"
        />

        {/* Orbit Satellite Ticks */}
        <g className="origin-center animate-spin-slow">
          <circle cx="50" cy="5" r="2.2" fill="#38bdf8" filter="url(#glowFilter)" />
          <circle cx="95" cy="50" r="1.8" fill="#c084fc" />
          <circle cx="50" cy="95" r="2.2" fill="#06b6d4" />
          <circle cx="5" cy="50" r="1.8" fill="#ec4899" />
        </g>

        {/* Middle Ring 2 - Reverse Spin */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="url(#orbGradPrimary)"
          strokeWidth="1.6"
          strokeDasharray="4 8 18 6"
          strokeLinecap="round"
          className="origin-center animate-spin-reverse opacity-90"
        />

        {/* Inner Gyroscope Hexagonal/Diamond Arc */}
        <g className="origin-center animate-spin-slow opacity-60">
          <polygon
            points="50,22 74,36 74,64 50,78 26,64 26,36"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="0.8"
            strokeDasharray="8 6"
          />
        </g>

        {/* Quantum Plasma Core */}
        <circle
          cx="50"
          cy="50"
          r="19"
          fill="url(#plasmaCore)"
          filter="url(#glowFilter)"
          className={`origin-center ${isThinking ? 'animate-ping' : 'animate-pulse'}`}
        />

        {/* Center Iris Nucleus */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="#ffffff"
          className="origin-center animate-pulse-glow"
        />
        <circle cx="50" cy="50" r="4" fill="#0e7490" />
        <circle cx="51.5" cy="48.5" r="1.5" fill="#ffffff" />
      </svg>

      {/* Dynamic Soundwave Visualizer Bars (shows when thinking or active) */}
      {isThinking && (
        <div className="absolute -bottom-2 flex items-center gap-0.5 z-20">
          <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:300ms]" />
          <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:200ms]" />
        </div>
      )}
    </div>
  );
}
