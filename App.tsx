
import React, { useState, useEffect } from 'react';
import { generateScenario, analyzeDecision } from './services/geminiService';
import { Scenario, AnalysisResult, GameState, Difficulty, HistoryItem } from './types';
import TrackVisual from './components/TrackVisual';
import LeverControl from './components/LeverControl';
import AnalysisView from './components/AnalysisView';
import HistoryView from './components/HistoryView';
import { Loader2, TrainFront, Github, Gauge, ArrowLeft, History } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [userChoice, setUserChoice] = useState<'track_a' | 'track_b' | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [hoveredTrack, setHoveredTrack] = useState<'track_a' | 'track_b' | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('moral_tracks_history');
    if (savedHistory) {
        try {
            setHistory(JSON.parse(savedHistory));
        } catch (e) {
            console.error("Failed to parse history", e);
        }
    }
  }, []);

  // 保存历史记录到 localStorage
  useEffect(() => {
    localStorage.setItem('moral_tracks_history', JSON.stringify(history));
  }, [history]);

  // 预加载第一个场景，或者在点击开始时加载
  const startGame = async () => {
    setGameState(GameState.GENERATING);
    setErrorMsg('');
    setIsReviewing(false);
    try {
      const scenario = await generateScenario(difficulty);
      setCurrentScenario(scenario);
      setUserChoice(null);
      setAnalysis(null);
      setGameState(GameState.PLAYING);
    } catch (err) {
      setErrorMsg('生成场景时遇到问题，也许 AI 陷入了道德困境... 请重试。');
      setGameState(GameState.ERROR);
    }
  };

  const handleDecision = async (choice: 'track_a' | 'track_b') => {
    if (!currentScenario) return;
    
    setUserChoice(choice);
    setHoveredTrack(null); // Clear hover state on decision
    setGameState(GameState.ANALYZING);

    try {
      const result = await analyzeDecision(currentScenario, choice);
      setAnalysis(result);

      // Add to history
      const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          scenario: currentScenario,
          userChoice: choice,
          analysis: result,
          difficulty: difficulty
      };
      // Prepend new item to history
      setHistory(prev => [newHistoryItem, ...prev]);

      setGameState(GameState.RESULT);
    } catch (err) {
      setErrorMsg('分析结果失败。');
      setGameState(GameState.ERROR);
    }
  };

  const handleReviewToggle = () => {
    setIsReviewing(!isReviewing);
  };

  const clearHistory = () => {
      if (window.confirm("确定要清空所有决策历史吗？此操作无法撤销。")) {
          setHistory([]);
      }
  };

  const difficultyColors = {
    'EASY': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30',
    'MEDIUM': 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
    'HARD': 'bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/30',
    'EXTREME': 'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30',
    'CHAOS': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50 hover:bg-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
  };

  // 渲染不同的游戏状态
  return (
    <div className="min-h-screen bg-track-dark text-slate-200 font-sans selection:bg-accent selection:text-black">
      
      {/* 顶部导航 */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-track-dark/90 backdrop-blur z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setGameState(GameState.IDLE)}>
          <div className="p-2 bg-accent rounded shadow-lg">
            <TrainFront className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            MORAL <span className="text-accent">TRACKS</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
             {gameState !== GameState.HISTORY && (
                <button 
                    onClick={() => setGameState(GameState.HISTORY)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    title="查看历史记录"
                >
                    <History className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-mono">HISTORY</span>
                </button>
             )}
            <div className="text-xs text-slate-500 font-mono hidden md:block">
                POWERED BY GEMINI 2.5
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl min-h-[80vh] flex flex-col items-center justify-center">
        
        {/* IDLE: 欢迎界面 */}
        {gameState === GameState.IDLE && (
          <div className="text-center space-y-8 animate-fade-in max-w-2xl w-full">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                <h2 className="relative text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                电车难题
                <br />
                生成器
                </h2>
            </div>
            <p className="text-lg text-slate-400 leading-relaxed">
              在这个由 AI 驱动的无尽实验中，你将面临一系列由算法生成的道德困境。
              <br/>
              没有绝对正确的答案，只有你的选择和随之而来的后果。
            </p>

            {/* 难度选择 */}
            <div className="flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-mono uppercase tracking-widest">
                    <Gauge className="w-4 h-4" />
                    选择你的难度
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {(['EASY', 'MEDIUM', 'HARD', 'EXTREME', 'CHAOS'] as Difficulty[]).map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 rounded-lg border font-mono text-sm transition-all duration-300
                                ${difficulty === level 
                                    ? difficultyColors[level] + ' shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-105' 
                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}
                            `}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 min-h-[1.5em] transition-opacity duration-300">
                    {difficulty === 'EASY' && "适合热身：经典的数量对比，因果清晰。"}
                    {difficulty === 'MEDIUM' && "标准模式：加入社会身份与轻微的不确定性。"}
                    {difficulty === 'HARD' && "深层拷问：复杂的亲缘关系与模糊的道德边界。"}
                    {difficulty === 'EXTREME' && "理智边缘：荒谬、宏大叙事与哲学极限。"}
                    {difficulty === 'CHAOS' && "混沌网络：迷因、抽象梗、打破第四面墙，完全不可预测。"}
                </p>
            </div>

            <button
              onClick={startGame}
              className="mt-8 px-10 py-4 bg-accent hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:-translate-y-1"
            >
              开始实验
            </button>
            <div className="text-xs text-slate-600 mt-12">
                警告：包含涉及生死抉择的描述，可能引发不适。
            </div>
          </div>
        )}

        {/* GENERATING: 加载场景 */}
        {gameState === GameState.GENERATING && (
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <p className="text-xl font-mono text-slate-300 animate-pulse">正在构建道德困境...</p>
            <p className="text-sm text-slate-500">Gemini 正在铺设{difficulty === 'CHAOS' ? '混乱' : difficulty.toLowerCase()}难度的轨道</p>
          </div>
        )}

        {/* PLAYING: 游戏主界面 */}
        {gameState === GameState.PLAYING && currentScenario && (
          <div className="w-full animate-fade-in">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-3 py-1 rounded bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700">
                        ID: {currentScenario.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-mono border ${difficultyColors[difficulty].split(' ')[0]} ${difficultyColors[difficulty].split(' ')[1]} ${difficultyColors[difficulty].split(' ')[2]}`}>
                        {difficulty}
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {currentScenario.title}
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed border-l-4 border-accent pl-4">
                {currentScenario.context}
                </p>
            </div>

            <TrackVisual 
                trackA={currentScenario.trackA} 
                trackB={currentScenario.trackB} 
                selectedTrack={null}
                hoveredTrack={hoveredTrack}
            />

            <LeverControl 
                onDecide={handleDecision} 
                disabled={false}
                trackA={currentScenario.trackA}
                trackB={currentScenario.trackB}
                onHover={setHoveredTrack}
            />
          </div>
        )}

        {/* ANALYZING: 分析中 */}
        {gameState === GameState.ANALYZING && currentScenario && (
           <div className="w-full flex flex-col items-center animate-fade-in">
             <TrackVisual 
                trackA={currentScenario.trackA} 
                trackB={currentScenario.trackB} 
                selectedTrack={userChoice}
            />
            <div className="mt-12 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-lg font-mono text-blue-400">正在解析你的灵魂...</p>
            </div>
           </div>
        )}

        {/* RESULT: 结果界面 (包含回顾模式) */}
        {gameState === GameState.RESULT && currentScenario && analysis && userChoice && (
          <>
            {/* 正常结果视图 */}
            {!isReviewing && (
                <AnalysisView 
                    result={analysis}
                    scenario={currentScenario}
                    userChoice={userChoice}
                    onNext={startGame} 
                    onReview={handleReviewToggle}
                />
            )}

            {/* 场景回顾视图 (只读) */}
            {isReviewing && (
                <div className="w-full animate-fade-in relative">
                    <div className="mb-6 flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-slate-300">场景回顾</h2>
                         <button 
                            onClick={handleReviewToggle}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors border border-slate-600"
                         >
                            <ArrowLeft className="w-4 h-4" />
                            返回分析报告
                         </button>
                    </div>

                    <TrackVisual 
                        trackA={currentScenario.trackA} 
                        trackB={currentScenario.trackB} 
                        selectedTrack={userChoice}
                    />

                    <div className="opacity-70 pointer-events-none grayscale">
                        <LeverControl 
                            onDecide={() => {}} 
                            disabled={true} // 禁用输入
                            trackA={currentScenario.trackA}
                            trackB={currentScenario.trackB} 
                        />
                    </div>
                    
                    <div className="text-center mt-6 text-slate-500 text-sm">
                        * 你已经做出了选择，无法更改。
                    </div>
                </div>
            )}
          </>
        )}

        {/* HISTORY: 历史记录界面 */}
        {gameState === GameState.HISTORY && (
            <HistoryView 
                history={history}
                onBack={() => setGameState(GameState.IDLE)}
                onClear={clearHistory}
            />
        )}

        {/* ERROR: 错误界面 */}
        {gameState === GameState.ERROR && (
          <div className="text-center p-8 bg-red-900/20 border border-red-800 rounded-xl">
            <h3 className="text-xl font-bold text-red-500 mb-2">系统故障</h3>
            <p className="text-slate-300 mb-6">{errorMsg}</p>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
            >
              重试
            </button>
          </div>
        )}

      </main>

      <footer className="py-6 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; {new Date().getFullYear()} Moral Tracks. Powered by Gemini API.</p>
        <p className="text-xs mt-1">Disclaimer: This is a philosophical simulation generated by AI.</p>
      </footer>
    </div>
  );
};

export default App;
