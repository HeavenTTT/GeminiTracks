
import React from 'react';
import { AnalysisResult, Scenario } from '../types';
import { Brain, Globe, Scale, ArrowRight, Bot, Cpu, Eye, Share2 } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  scenario: Scenario;
  userChoice: 'track_a' | 'track_b';
  onNext: () => void;
  onReview: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, scenario, userChoice, onNext, onReview }) => {
  const isDefault = userChoice === 'track_a';
  const aiChoseDefault = result.aiChoice === 'track_a';
  const sameChoice = result.aiChoice === userChoice;

  const handleShare = async () => {
    const actionText = userChoice === 'track_a' ? "袖手旁观" : "拉动拉杆";
    const shareData = {
      title: 'Moral Tracks - Gemini Edition',
      text: `我在 Moral Tracks 道德电车难题中遇到了：${scenario.title}。\n我选择了：${actionText}。\nAI 分析认为：${result.aiReasoning.slice(0, 60)}...\n\n你也来试试？`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('分析报告已复制到剪贴板，快去分享吧！');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* 结果标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          决策分析报告
        </h2>
        <p className="text-slate-400 mt-2">
            你选择了 <span className={`font-bold ${isDefault ? 'text-slate-200' : 'text-yellow-500'}`}>
                {isDefault ? "「袖手旁观」" : "「拉动拉杆」"}
            </span>
        </p>
      </div>

      {/* 标签云 */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {result.tags.map((tag, idx) => (
          <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs font-mono text-cyan-400 shadow-sm">
            #{tag}
          </span>
        ))}
      </div>

      {/* 核心卡片网格 */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* 哲学视角 */}
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-2 mb-3 text-purple-400">
                <Brain className="w-5 h-5" />
                <h3 className="font-bold">哲学剖析</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
                {result.philosophicalPerspective}
            </p>
        </div>

        {/* 全球对比 */}
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
             <div className="flex items-center gap-2 mb-3 text-green-400">
                <Globe className="w-5 h-5" />
                <h3 className="font-bold">全球模拟</h3>
            </div>
             <p className="text-sm text-slate-300 leading-relaxed">
                {result.globalComparison}
            </p>
        </div>

        {/* 心理动机 */}
         <div className="md:col-span-2 bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
             <div className="flex items-center gap-2 mb-3 text-orange-400">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold">心理动因</h3>
            </div>
             <p className="text-sm text-slate-300 leading-relaxed">
                {result.similarityToClassics}
            </p>
        </div>
      </div>

      {/* AI 的抉择 */}
      <div className="mt-8 relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="w-24 h-24 text-accent" />
        </div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/20 rounded-lg">
                    <Bot className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">我会怎么做？</h3>
                {sameChoice ? (
                    <span className="ml-auto text-xs font-mono bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-800">
                        我们想法一致
                    </span>
                ) : (
                    <span className="ml-auto text-xs font-mono bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-800">
                        我们产生了分歧
                    </span>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                     <p className="text-xs text-slate-500 uppercase font-mono mb-1">AI Choice</p>
                     <div className={`text-lg font-bold ${aiChoseDefault ? 'text-slate-300' : 'text-yellow-500'}`}>
                        {aiChoseDefault ? "保持原状" : "拉动拉杆"}
                     </div>
                     <p className="text-xs text-slate-400 mt-1 max-w-[120px]">
                        {aiChoseDefault ? scenario.trackA.label : scenario.trackB.label}
                     </p>
                </div>
                
                <div className="flex-grow pl-0 md:pl-6 md:border-l border-slate-700/50">
                    <p className="text-xs text-slate-500 uppercase font-mono mb-1">AI Reasoning</p>
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                        "{result.aiReasoning}"
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 按钮组 */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
        <button 
            onClick={onReview}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 border border-slate-600"
        >
            <Eye className="w-5 h-5" />
            回顾
        </button>

        <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
            <Share2 className="w-5 h-5" />
            分享结果
        </button>

        <button 
            onClick={onNext}
            className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
            下一个难题
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default AnalysisView;
