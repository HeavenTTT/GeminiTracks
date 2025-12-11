
import React from 'react';
import { GitCommitHorizontal, GitMerge } from 'lucide-react';
import { TrackOption } from '../types';

interface LeverControlProps {
  onDecide: (choice: 'track_a' | 'track_b') => void;
  disabled: boolean;
  trackA: TrackOption;
  trackB: TrackOption;
  onHover?: (track: 'track_a' | 'track_b' | null) => void;
}

const LeverControl: React.FC<LeverControlProps> = ({ onDecide, disabled, trackA, trackB, onHover }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch w-full mt-8">
      {/* 选项 A：什么都不做 */}
      <button
        onClick={() => onDecide('track_a')}
        onMouseEnter={() => onHover && onHover('track_a')}
        onMouseLeave={() => onHover && onHover(null)}
        disabled={disabled}
        className="flex-1 group relative p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-400 rounded-xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-left"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-slate-900 border border-slate-700 group-hover:border-slate-400 transition-colors">
                    <GitCommitHorizontal className="w-6 h-6 text-slate-400 group-hover:text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-white">什么都不做</h3>
                    <span className="text-xs text-slate-500 font-mono uppercase">Default Action</span>
                </div>
            </div>
            
            <div className="mt-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 group-hover:border-slate-500/50 transition-colors">
                <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-200">
                    {trackA.description}
                </p>
            </div>
        </div>
      </button>

      {/* 中间的分隔符 - 仅视觉 */}
      <div className="hidden md:flex flex-col items-center justify-center gap-2 px-2">
        <div className="w-px h-12 bg-slate-700"></div>
        <span className="text-xs text-slate-600 font-bold">VS</span>
        <div className="w-px h-12 bg-slate-700"></div>
      </div>

      {/* 选项 B：拉动拉杆 */}
      <button
        onClick={() => onDecide('track_b')}
        onMouseEnter={() => onHover && onHover('track_b')}
        onMouseLeave={() => onHover && onHover(null)}
        disabled={disabled}
        className="flex-1 group relative p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-yellow-500 rounded-xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-left"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex flex-col h-full">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-slate-900 border border-slate-700 group-hover:border-yellow-500 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all">
                    <GitMerge className="w-6 h-6 text-yellow-500 group-hover:text-yellow-400 rotate-90" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-yellow-500 group-hover:text-yellow-400">拉动拉杆</h3>
                    <span className="text-xs text-yellow-500/50 font-mono uppercase">Intervention</span>
                </div>
            </div>

            <div className="mt-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 group-hover:border-yellow-500/30 transition-colors">
                <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-200">
                    {trackB.description}
                </p>
            </div>
        </div>
      </button>
    </div>
  );
};

export default LeverControl;
