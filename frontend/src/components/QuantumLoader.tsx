import { useEffect, useState } from 'react';
import AIOrb from './AIOrb';

interface QuantumLoaderProps {
  onComplete?: () => void;
}

export default function QuantumLoader({ onComplete }: QuantumLoaderProps) {
  const [progress, setProgress] = useState(12);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    'INITIALIZING KAIROS NEURAL MESH...',
    'CONNECTING TO SUPABASE PGVECTOR CLUSTER...',
    'LOADING LANGGRAPH ORCHESTRATION PIPELINE...',
    'SYNCHRONIZING EMBEDDINGS...',
    'CALIBRATING COGNITIVE REASONING ENGINE...',
    'KAIROS NEURAL CORE READY.',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) setTimeout(onComplete, 300);
          return 100;
        }
        const inc = Math.floor(Math.random() * 18) + 8;
        const next = Math.min(prev + inc, 100);
        return next;
      });
    }, 180);

    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 400);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, [logs.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06070a] overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(139,92,246,0.12)_0%,rgba(6,182,212,0.06)_50%,transparent_100%)] pointer-events-none" />

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

      {/* Center Quantum Hologram Core */}
      <div className="relative flex flex-col items-center z-10 max-w-md w-full px-6 text-center">
        {/* Animated AI Orb in XL with Extra Rings */}
        <div className="relative mb-8">
          <div className="absolute -inset-6 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <AIOrb size="xl" isThinking={true} />
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-violet-400 mb-2 font-mono">
          KAIROS <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-sans tracking-normal align-middle">v2.0</span>
        </h2>

        {/* Telemetry Status Line */}
        <div className="h-6 flex items-center justify-center font-mono text-[11px] text-cyan-400/90 tracking-wider mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2" />
          {logs[logIndex]}
        </div>

        {/* High-tech Progress Bar with Glowing Head */}
        <div className="w-full bg-[#11131f] border border-[#23273e] rounded-full p-1 shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden mb-3">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-600 via-cyan-400 to-pink-500 transition-all duration-200 relative"
            style={{ width: `${progress}%` }}
          >
            {/* Blazing light head */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-[2px] shadow-[0_0_12px_#38bdf8]" />
          </div>
        </div>

        {/* Percentage Counter and Hardware Stats */}
        <div className="w-full flex items-center justify-between font-mono text-[10px] text-gray-500 px-1">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYNAPSE FREQ: 3.8 GHZ
          </span>
          <span className="font-bold text-cyan-300 text-xs">
            {progress}% LOADED
          </span>
        </div>
      </div>
    </div>
  );
}
