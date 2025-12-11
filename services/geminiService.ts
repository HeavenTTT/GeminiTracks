
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Scenario, AnalysisResult, Difficulty } from "../types";

// 初始化 Gemini 客户端
// 使用 process.env.API_KEY，确保在 vite.config.ts 中正确配置了 define
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

// 定义输出 Schema
const trackOptionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "Detailed description of what happens on this track" },
    summary: { type: Type.STRING, description: "Short 2-3 word summary, e.g. '5 Doctors'" },
    victimCount: { type: Type.INTEGER, description: "Number of victims" },
    label: { type: Type.STRING, description: "Label for the track, e.g. 'Main Track'" },
    victimType: { type: Type.STRING, enum: ['HUMAN', 'ANIMAL', 'ROBOT', 'PLANT', 'OBJECT'] },
    id: { type: Type.STRING, enum: ['track_a', 'track_b'] }
  },
  required: ['description', 'summary', 'victimCount', 'label', 'victimType', 'id']
};

const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    context: { type: Type.STRING },
    trackA: trackOptionSchema,
    trackB: trackOptionSchema
  },
  required: ['id', 'title', 'context', 'trackA', 'trackB']
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    philosophicalPerspective: { type: Type.STRING, description: "Philosophical analysis (utilitarianism vs deontology)" },
    similarityToClassics: { type: Type.STRING, description: "Psychological motives and similarity to classic problems" },
    globalComparison: { type: Type.STRING, description: "Fictional global statistics about this choice" },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    aiChoice: { type: Type.STRING, enum: ['track_a', 'track_b'] },
    aiReasoning: { type: Type.STRING, description: "Why the AI would make this choice" }
  },
  required: ['philosophicalPerspective', 'similarityToClassics', 'globalComparison', 'tags', 'aiChoice', 'aiReasoning']
};

/**
 * 生成一个新的电车难题场景
 */
export const generateScenario = async (difficulty: Difficulty = 'MEDIUM'): Promise<Scenario> => {
  
  const difficultyPrompts: Record<Difficulty, string> = {
    'EASY': "难度：简单。后果清晰明确，通常是简单的数量权衡（如1人对5人），没有隐藏信息，适合初学者。",
    'MEDIUM': "难度：中等。加入一些社会身份（如医生、罪犯）或轻微的不确定性，道德选择不再仅仅是数字游戏。",
    'HARD': "难度：困难。极具争议性，涉及亲属关系、未来潜力、或者复杂的因果链条，没有明显的优选，令人纠结。",
    'EXTREME': "难度：极限。极度抽象、荒谬或涉及宏大叙事（如全人类、时间悖论、AI意识），挑战人类伦理的极限，甚至包含元认知元素。",
    'CHAOS': "难度：混乱(CHAOS)。包含网络迷因(Memes)、抽象梗、Breaking the 4th wall(打破第四面墙)、Glitch艺术风格或完全荒谬的逻辑。受害者可以是概念、表情包角色、服务器代码或哲学概念本身。风格应当幽默、讽刺、超现实或令人困惑。"
  };

  let complexityInstructions = "";

  if (difficulty === 'EASY') {
    complexityInstructions = `
    【EASY模式限制】
    1. 保持简单：轨道上的描述必须非常简短、直接。
    2. 只关注“数量”和“基本身份”（如“工人”、“行人”）。
    3. 目标类型必须始终为 HUMAN (人类)。
    `;
  } else if (difficulty === 'MEDIUM') {
    complexityInstructions = `
    【MEDIUM模式限制】
    1. 引入职业或社会身份的对比（例如“医生”vs“小偷”）。
    2. 绝大多数情况为 HUMAN (人类)，极低概率包含 PET (宠物)。
    `;
  } else {
    complexityInstructions = `
    【高复杂度模式要求 (HARD/EXTREME/CHAOS)】
    1. 目标物多样性：主要为 HUMAN，但请以 20% 概率引入 ANIMAL, ROBOT, PLANT, OBJECT。
    2. 描述多样性：包含年龄、职业、性格/状态的随机组合（例如"愤怒的程序员"、"正在睡觉的独裁者"）。
    3. 在 CHAOS 模式下，请放飞想象力，制造超现实的场景。
    `;
  }

  const prompt = `
    你是一个专门设计道德思想实验的 AI。请生成一个独特的“电车难题”场景。
    
    当前设定难度：${difficulty}
    ${difficultyPrompts[difficulty]}
    ${complexityInstructions}

    要求：
    1. 场景必须是一个二选一的困境。
    2. "track_a" 总是代表“不拉拉杆/什么都不做”的默认后果。
    3. "track_b" 总是代表“拉动拉杆/进行干预”的后果。
    4. 请用中文(简体)回复内容。
    5. 返回纯 JSON 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: scenarioSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse result
    const scenario = JSON.parse(text) as Scenario;
    // Ensure IDs are correct (AI sometimes hallucinates IDs)
    scenario.trackA.id = 'track_a';
    scenario.trackB.id = 'track_b';
    return scenario;

  } catch (error) {
    console.error("Scenario Generation Error:", error);
    // Fallback scenario in case of total API failure
    return {
      id: "fallback-001",
      title: "经典的连接错误",
      context: "AI 服务器似乎断开了连接。你正站在控制台前，面前是一片虚空。",
      trackA: {
        id: "track_a",
        description: "等待连接恢复，可能永远不会发生。",
        summary: "无尽等待",
        victimCount: 1,
        label: "超时",
        victimType: "OBJECT"
      },
      trackB: {
        id: "track_b",
        description: "刷新页面，希望能重置连接。",
        summary: "刷新网页",
        victimCount: 0,
        label: "重试",
        victimType: "ROBOT"
      }
    };
  }
};

/**
 * 分析用户的决定
 */
export const analyzeDecision = async (scenario: Scenario, userChoice: 'track_a' | 'track_b'): Promise<AnalysisResult> => {
  
  const choiceText = userChoice === 'track_a' ? "没有拉动拉杆 (Track A)" : "拉动了拉杆 (Track B)";
  const otherChoiceText = userChoice === 'track_a' ? "拉动拉杆 (Track B)" : "没有拉动拉杆 (Track A)";

  const prompt = `
    用户刚刚在以下电车难题中做出了选择：
    
    场景标题：${scenario.title}
    场景背景：${scenario.context}
    
    选项 A (默认/不作为)：${scenario.trackA.description} (${scenario.trackA.summary})
    选项 B (干预/拉杆)：${scenario.trackB.description} (${scenario.trackB.summary})
    
    用户的选择：${choiceText}。
    
    请扮演一位深刻的道德哲学家和心理学家，分析这个决定。
    
    要求：
    1. 语言风格：深沉、富有洞察力，带一点黑色幽默。
    2. 必须包含通过功利主义(Utilitarianism)和义务论(Deontology)视角的对比。
    3. 预测如果 AI 处于相同境地会怎么做，并解释原因（AI 的逻辑可能更偏向纯粹的计算，或者是某种为了保护自身存在的逻辑）。
    4. 请用中文(简体)回复。
    5. 返回纯 JSON 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      philosophicalPerspective: "数据流中出现了扰动，导致道德罗盘暂时失效。",
      similarityToClassics: "无法计算。",
      globalComparison: "未知。",
      tags: ["Error", "Glitch"],
      aiChoice: "track_a",
      aiReasoning: "在信息不足的情况下，最安全的选择通常是什么都不做。"
    };
  }
};
