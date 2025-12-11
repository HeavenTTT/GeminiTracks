
import React from 'react';
import { HistoryItem } from '../types';
import { Clock, ArrowLeft, GitCommitHorizontal, GitMerge, Bot, Quote, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onBack: () => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, onClear }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const difficultyColors = {
    'EASY': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'MEDIUM': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    'HARD': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    'EXTREME': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    'CHAOS': 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10'
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Clock className="w-6 h-6 text-accent" />
          决策档案
        </h2>
        <button 
           onClick={onClear}
           disabled={history.length === 0}
           className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">清空</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
          <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">暂无历史记录</p>
          <p className="text-slate-600 text-sm mt-2">去做出一些艰难的决定吧，它们会留在这里。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => {
            const isDefault = item.userChoice === 'track_a';
            const aiAgree = item.analysis.aiChoice === item.userChoice;

            return (
              <div key={item.id} className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all duration-300 group">
                {/* Card Header */}
                <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-mono rounded border ${difficultyColors[item.difficulty]}`}>
                      {item.difficulty}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {item.analysis.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-cyan-500/80 bg-cyan-900/20 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-12 gap-6">
                  {/* Scenario Info */}
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-accent transition-colors">
                      {item.scenario.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {item.scenario.context}
                    </p>
                    
                    {/* Visual Comparison Summary */}
                    <div className="flex items-center gap-4 mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                        <div className={`flex-1 text-right text-xs ${isDefault ? 'opacity-100 font-bold text-white' : 'opacity-40 text-slate-400'}`}>
                             {item.scenario.trackA.summary}
                        </div>
                        <div className="text-xs font-mono text-slate-600">VS</div>
                        <div className={`flex-1 text-left text-xs ${!isDefault ? 'opacity-100 font-bold text-yellow-500' : 'opacity-40 text-slate-400'}`}>
                            {item.scenario.trackB.summary}
                        </div>
                    </div>
                  </div>

                  {/* Choice & Result */}
                  <div className="md:col-span-5 flex flex-col justify-between border-l border-slate-700/50 md:pl-6 pl-0 md:border-t-0 border-t md:pt-0 pt-4">
                    <div>
                         <p className="text-xs text-slate-500 uppercase font-mono mb-2">你的选择</p>
                         <div className={`flex items-center gap-2 text-lg font-bold mb-4 ${isDefault ? 'text-slate-300' : 'text-yellow-500'}`}>
                            {isDefault ? <GitCommitHorizontal className="w-5 h-5" /> : <GitMerge className="w-5 h-5 rotate-90" />}
                            {isDefault ? "袖手旁观" : "拉动拉杆"}
                         </div>
                    </div>
                    
                    <div>
                         <div className="flex items-center gap-2 mb-2">
                             <Bot className="w-4 h-4 text-slate-500" />
                             <span className="text-xs text-slate-500 uppercase font-mono">AI 观点</span>
                         </div>
                         <div className={`text-sm p-3 rounded border ${aiAgree ? 'bg-green-900/10 border-green-500/20 text-green-300' : 'bg-red-900/10 border-red-500/20 text-red-300'}`}>
                             <p className="flex items-start gap-2">
                                <Quote className="w-3 h-3 flex-shrink-0 mt-1 opacity-50" />
                                {item.analysis.aiReasoning.slice(0, 60)}...
                             </p>
                             <div className="mt-2 text-xs font-bold text-right opacity-80">
                                {aiAgree ? "AI 表示赞同" : "AI 持反对意见"}
                             </div>
                         </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
