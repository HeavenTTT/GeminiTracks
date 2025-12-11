
// 定义场景中轨道的详细信息
export type VictimType = 'HUMAN' | 'ANIMAL' | 'ROBOT' | 'PLANT' | 'OBJECT';

export interface TrackOption {
  description: string; // 轨道上的详细描述（用于按钮上的详细说明）
  summary: string; // 简短摘要（用于轨道末端的视觉展示，例如“5名医生”）
  victimCount: number; // 受害者数量（用于可视化估算）
  label: string; // 简短标签（例如：主轨道）
  victimType?: VictimType; // 受害者类型，默认为 HUMAN
  id: 'track_a' | 'track_b';
}

// 定义完整的电车难题场景结构
export interface Scenario {
  id: string;
  title: string; // 场景标题
  context: string; // 场景背景故事
  trackA: TrackOption; // 默认轨道（如果不拉拉杆）
  trackB: TrackOption; // 替代轨道（如果拉拉杆）
}

// 定义 AI 分析结果的结构
export interface AnalysisResult {
  philosophicalPerspective: string; // 哲学视角分析
  similarityToClassics: string; // 与经典案例的相似度
  globalComparison: string; // 模拟的全球比较数据描述
  tags: string[]; // 关键词标签
  aiChoice: 'track_a' | 'track_b'; // AI 的选择
  aiReasoning: string; // AI 选择的原因
}

// 难度等级
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME' | 'CHAOS';

// 游戏状态枚举
export enum GameState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}