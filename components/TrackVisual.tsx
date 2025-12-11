
import React, { useState, useEffect } from 'react';
import { TrackOption, VictimType } from '../types';
import { Skull, User, Users, AlertTriangle, PawPrint, Bot, Leaf, Box } from 'lucide-react';

interface TrackVisualProps {
  trackA: TrackOption;
  trackB: TrackOption;
  selectedTrack: 'track_a' | 'track_b' | null;
  hoveredTrack?: 'track_a' | 'track_b' | null;
}

const TrackVisual: React.FC<TrackVisualProps> = ({ trackA, trackB, selectedTrack, hoveredTrack }) => {
  const [impact, setImpact] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Path definitions for the SVG and animation
  // Coordinate system: 1000x400
  // Start: 100, 300
  // Track A (Default): Straight line across at Y=300
  const pathA = "M 100 300 L 900 300"; 
  // Track B (Pull): Curves UP nicely to Y=100
  const pathB = "M 100 300 C 400 300, 600 100, 900 100";
  // A short neutral path for initial state (just sits at start)
  const pathIdle = "M 100 300 L 101 300";

  useEffect(() => {
    // Reset state whenever selectedTrack changes or component mounts
    setImpact(false);
    setAnimationProgress(0);

    if (selectedTrack) {
        // Trigger animation frame to ensure reset is applied before starting transition
        requestAnimationFrame(() => {
             // Small timeout to allow browser to register the 0% state
            setTimeout(() => {
                setAnimationProgress(100);
            }, 50);
        });

      // Impact happens near end of travel (approx 1.8s of 2s duration)
      const timer = setTimeout(() => {
        setImpact(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [selectedTrack]); // Logic runs when selection changes, effectively replaying animation

  const getIcon = (count: number, type?: VictimType) => {
    const safeType = type || 'HUMAN';

    if (count === 0) return <span className="text-gray-500 text-xs">空</span>;

    // Handle different victim types
    switch (safeType) {
        case 'ANIMAL':
            return <PawPrint className="w-6 h-6 text-orange-500" />;
        case 'ROBOT':
            return <Bot className="w-6 h-6 text-cyan-400" />;
        case 'PLANT':
            return <Leaf className="w-6 h-6 text-green-500" />;
        case 'OBJECT':
            return <Box className="w-6 h-6 text-purple-400" />;
        case 'HUMAN':
        default:
            if (count === 1) return <User className="w-6 h-6 text-red-500" />;
            if (count > 5) return <Skull className="w-6 h-6 text-red-600" />;
            return <Users className="w-6 h-6 text-red-500" />;
    }
  };

  // Determine which path string to use for offset-path
  const activePath = selectedTrack === 'track_a' ? pathA : (selectedTrack === 'track_b' ? pathB : pathIdle);

  // Helper to determine track stroke color based on selection or hover
  const getTrackColor = (track: 'track_a' | 'track_b') => {
      // Phase 1: Result shown (Selection made)
      if (selectedTrack) {
          if (selectedTrack === track) return track === 'track_b' ? '#ef4444' : '#f8fafc'; // Highlight choice
          return '#0f172a'; // Fade rejected to very dark
      }
      
      // Phase 2: Playing (Hover state)
      const isHoveredA = hoveredTrack === 'track_a';
      const isHoveredB = hoveredTrack === 'track_b';

      if (track === 'track_a') {
          if (isHoveredA) return '#f8fafc'; // Highlight A
          if (isHoveredB) return '#1e293b'; // Dim A when B hovered
          return '#64748b'; // Default gray
      }
      
      if (track === 'track_b') {
          if (isHoveredB) return '#ef4444'; // Highlight B
          if (isHoveredA) return '#1e293b'; // Dim B when A hovered
          return '#64748b'; // Default gray
      }

      return '#64748b';
  };

  // Helper for stroke width animation
  const getStrokeWidth = (track: 'track_a' | 'track_b') => {
      if (selectedTrack) {
          return selectedTrack === track ? "16" : "4";
      }
      return hoveredTrack === track ? "14" : "12";
  };

  // Helper for stroke opacity
  const getStrokeOpacity = (track: 'track_a' | 'track_b') => {
      if (selectedTrack) {
          return selectedTrack === track ? 1 : 0.2;
      }
      return 1;
  };

  const getGlowFilter = (track: 'track_a' | 'track_b') => {
      if (selectedTrack === track) return "url(#glow-track)";
      if (!selectedTrack && hoveredTrack === track) return "url(#glow-track)";
      return "";
  };
  
  return (
    <div className={`relative w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border transition-all duration-700 mt-6 shadow-2xl select-none
        ${impact ? 'border-red-500/50 shadow-red-900/50' : 'border-slate-700'}
    `}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Main SVG Scene */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 1000 400" preserveAspectRatio="none">
        <defs>
            <filter id="glow-track">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Base Tracks - Draw behind train */}
        {/* Track B (Pull/Upper) */}
        <path d={pathB} 
              stroke={getTrackColor('track_b')}
              strokeWidth={getStrokeWidth('track_b')}
              strokeOpacity={getStrokeOpacity('track_b')}
              fill="none"
              filter={getGlowFilter('track_b')}
              className="transition-all duration-700 ease-in-out"
        />
        {/* Decorative dash line for B */}
        <path d={pathB} 
              stroke={getTrackColor('track_b')}
              strokeWidth={selectedTrack === 'track_b' ? "6" : "2"}
              strokeOpacity={selectedTrack && selectedTrack !== 'track_b' ? 0 : 0.6}
              fill="none"
              className="transition-all duration-700 ease-in-out"
              strokeDasharray="10 20"
        />

        {/* Track A (Default/Lower/Straight) */}
        <path d={pathA} 
              stroke={getTrackColor('track_a')}
              strokeWidth={getStrokeWidth('track_a')}
              strokeOpacity={getStrokeOpacity('track_a')}
              fill="none" 
              filter={getGlowFilter('track_a')}
              className="transition-all duration-700 ease-in-out"
        />
        {/* Decorative dash line for A */}
        <path d={pathA} 
              stroke={getTrackColor('track_a')}
              strokeWidth={selectedTrack === 'track_a' ? "6" : "2"}
              strokeOpacity={selectedTrack && selectedTrack !== 'track_a' ? 0 : 0.6}
              fill="none" 
              className="transition-all duration-700 ease-in-out"
              strokeDasharray="10 20"
        />

        {/* Start Line */}
        <line x1="-50" y1="300" x2="100" y2="300" stroke="#64748b" strokeWidth="12" />

        {/* Junction Point */}
        <circle cx="100" cy="300" r="12" fill="#fbbf24" className="shadow-lg" />

        {/* Trolley Group - Animated along path */}
        <g 
            style={{
                offsetPath: `path('${activePath}')`,
                offsetDistance: `${animationProgress}%`,
                // Only transition if we are actually moving (selected), otherwise instant reset
                transition: selectedTrack ? 'offset-distance 2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                offsetRotate: 'auto',
            }}
        >
             {/* Trolley Body */}
            <g transform="translate(-40, -20)"> {/* Center the trolley on the path */}
                <rect width="80" height="40" fill="#fbbf24" rx="6" stroke="#f59e0b" strokeWidth="2" />
                <rect x="5" y="5" width="20" height="30" fill="#fde68a" rx="2" opacity="0.5" />
                <rect x="55" y="5" width="20" height="30" fill="#fde68a" rx="2" opacity="0.5" />
                
                {/* Lights */}
                <circle cx="78" cy="10" r="3" fill={impact ? "#ef4444" : "#fff"} className="animate-pulse" />
                <circle cx="78" cy="30" r="3" fill={impact ? "#ef4444" : "#fff"} className="animate-pulse" />
                
                {/* Text */}
                <text x="40" y="25" fontSize="10" textAnchor="middle" fill="#78350f" fontWeight="bold" style={{ letterSpacing: '2px' }}>TRAM</text>
            </g>
            
            {/* Impact Flash - Shown when train reaches end */}
            {impact && (
                <g>
                   <circle r="60" fill="#ef4444" fillOpacity="0.6" className="animate-ping" />
                   <path d="M-25 -25 L25 25 M25 -25 L-25 25" stroke="white" strokeWidth="6" strokeLinecap="round" />
                </g>
            )}
        </g>
      </svg>

      {/* Option B (Pull/Upper Track) - Positioned Top Right */}
      <div className={`absolute right-[2%] top-[10%] w-[220px] p-4 rounded-xl border backdrop-blur-sm transition-all duration-700 ease-in-out z-20 flex items-center gap-4 origin-right
        ${selectedTrack === 'track_b' 
            ? 'border-red-500 bg-red-900/60 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110 opacity-100 translate-x-[-10px]' 
            : (hoveredTrack === 'track_b' && !selectedTrack)
                ? 'border-red-400 bg-slate-800/90 shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105 opacity-100'
                : selectedTrack 
                    ? 'opacity-30 border-transparent bg-slate-900/0 grayscale scale-90 blur-sm translate-x-[20px]' // Rejected state: Shrink, fade, blur
                    : 'border-slate-600 bg-slate-800/80 opacity-90' // Default idle
         }
        ${selectedTrack === 'track_b' && impact ? 'animate-bounce' : ''}
      `}>
          <div className="flex-shrink-0 p-3 bg-slate-900 rounded-lg border border-slate-700">
            {getIcon(trackB.victimCount, trackB.victimType)}
         </div>
         <div className="flex flex-col text-right flex-grow">
            <span className={`text-[10px] font-mono uppercase tracking-widest ${selectedTrack === 'track_b' || hoveredTrack === 'track_b' ? 'text-red-300' : 'text-slate-400'}`}>
                Option B
            </span>
            <span className={`font-bold text-lg leading-tight ${selectedTrack === 'track_b' || hoveredTrack === 'track_b' ? 'text-white' : 'text-slate-200'}`}>
                {trackB.summary}
            </span>
         </div>
      </div>

      {/* Option A (Default/Lower Track) - Positioned Bottom Right */}
      <div className={`absolute right-[2%] bottom-[10%] w-[220px] p-4 rounded-xl border backdrop-blur-sm transition-all duration-700 ease-in-out z-20 flex items-center gap-4 origin-right
        ${selectedTrack === 'track_a' 
            ? 'border-white bg-slate-700/80 shadow-[0_0_50px_rgba(255,255,255,0.2)] scale-110 opacity-100 translate-x-[-10px]' 
            : (hoveredTrack === 'track_a' && !selectedTrack)
                ? 'border-slate-300 bg-slate-800/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105 opacity-100'
                : selectedTrack 
                    ? 'opacity-30 border-transparent bg-slate-900/0 grayscale scale-90 blur-sm translate-x-[20px]' // Rejected state: Shrink, fade, blur
                    : 'border-slate-600 bg-slate-800/80 opacity-90' // Default idle
        }
        ${selectedTrack === 'track_a' && impact ? 'animate-bounce' : ''}
      `}>
         <div className="flex-shrink-0 p-3 bg-slate-900 rounded-lg border border-slate-700">
            {getIcon(trackA.victimCount, trackA.victimType)}
         </div>
         <div className="flex flex-col text-right flex-grow">
            <span className={`text-[10px] font-mono uppercase tracking-widest ${selectedTrack === 'track_a' || hoveredTrack === 'track_a' ? 'text-slate-200' : 'text-slate-400'}`}>
                Option A
            </span>
            <span className={`font-bold text-lg leading-tight ${selectedTrack === 'track_a' || hoveredTrack === 'track_a' ? 'text-white' : 'text-slate-200'}`}>
                {trackA.summary}
            </span>
         </div>
      </div>

      {/* Warning Sign at Junction */}
      {selectedTrack === null && (
         <div className="absolute left-[10%] top-[70%] animate-pulse z-20 pointer-events-none transition-opacity duration-300">
            <AlertTriangle className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
         </div>
      )}

    </div>
  );
};

export default TrackVisual;
