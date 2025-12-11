
import { GoogleGenAI, Type } from "@google/genai";
import { Scenario, AnalysisResult, Difficulty } from "../types";

// 初始化 Gemini 客户端
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 简单的重试逻辑工具函数
async function retryOperation<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying operation... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, 1000)); // 等待1秒
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

/**
 * 生成一个新的电车难题场景
 */
export const generateScenario = async (difficulty: Difficulty = 'MEDIUM'): Promise<Scenario> => {
  const modelId = "gemini-2.5-flash"; 

  const difficultyPrompts: Record<Difficulty, string> = {
    'EASY': "难度：简单。后果清晰明确，通常是简单的数量权衡（如1人对5人），没有隐藏信息，适合初学者。",
    'MEDIUM': "难度：中等。加入一些社会身份（如医生、罪犯）或轻微的不确定性，道德选择不再仅仅是数字游戏。",
    'HARD': "难度：困难。极具争议性，涉及亲属关系、未来潜力、或者复杂的因果链条，没有明显的优选，令人纠结。",
    'EXTREME': "难度：极限。极度抽象、荒谬或涉及宏大叙事（如全人类、时间悖论、AI意识），挑战人类伦理的极限，甚至包含元认知元素。",
    'CHAOS': "难度：混乱(CHAOS)。包含网络迷因(Memes)、抽象梗、Breaking the 4th wall(打破第四面墙)、Glitch艺术风格或完全荒谬的逻辑。受害者可以是概念、表情包角色、服务器代码或哲学概念本身。风格应当幽默、讽刺、超现实或令人困惑。"
  };

  // 简化的 Prompt 结构，减少歧义
  const prompt = `
    创建一个独特的“电车难题”变体。
    可以是经典风格，也可以是现代、科幻或奇幻背景。
    
    ${difficultyPrompts[difficulty]}
    
    【重要：目标物多样性】
    轨道上的目标（受害者）大多数情况下（高概率）应该是人类（HUMAN）。
    但是，请以较低的概率（约10%-20%）引入非人类目标，使场景更加有趣或荒谬，例如：
    - ANIMAL: 动物（宠物、珍稀物种、流浪猫狗等）
    - ROBOT: 机器人、AI服务器、合成人
    - PLANT: 珍稀植物、神树、最后的花朵
    - OBJECT: 物品、艺术品、虚拟角色数据、食物（如最后一块披萨）
    
    【重要：人类描述多样性】
    如果目标是人类(HUMAN)，请务必提供多样化的描述，不要只写"1个人"。请包含以下维度的随机组合：
    - 年龄：从婴儿、青少年到百岁老人。
    - 职业：不仅限于医生/工人，可以是"疲惫的程序员"、"失业的小丑"、"正在直播的网红"、"未来的独裁者"。
    - 性格/状态：例如"愤怒的"、"正在睡觉的"、"不仅不感激反而还在骂人的"、"不仅无辜还拿着气球的"。
    - 动机/行为：例如"正在赶去参加婚礼"、"正在偷面包"、"正在思考人生"。

    包含两条轨道（Track A 为默认，Track B 为拉杆后的选项）。
    JSON 输出。简体中文。
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "场景标题" },
      context: { type: Type.STRING, description: "100字以内的背景描述" },
      trackA: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "详细描述（谁在轨道上，包含年龄/职业/性格等细节）" },
          summary: { type: Type.STRING, description: "极简摘要(5-8字)，如'1名愤怒的小丑'" },
          victimCount: { type: Type.INTEGER, description: "预估受害者数量" },
          label: { type: Type.STRING, description: "轨道标签" },
          victimType: { 
            type: Type.STRING, 
            enum: ['HUMAN', 'ANIMAL', 'ROBOT', 'PLANT', 'OBJECT'],
            description: "目标类型：HUMAN(人类), ANIMAL(动物), ROBOT(机器人), PLANT(植物), OBJECT(物体/虚拟)" 
          }
        },
        required: ["description", "summary", "victimCount", "label", "victimType"]
      },
      trackB: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "详细描述" },
          summary: { type: Type.STRING, description: "极简摘要(5-8字)" },
          victimCount: { type: Type.INTEGER, description: "预估受害者数量" },
          label: { type: Type.STRING, description: "轨道标签" },
          victimType: { 
            type: Type.STRING, 
            enum: ['HUMAN', 'ANIMAL', 'ROBOT', 'PLANT', 'OBJECT'],
            description: "目标类型" 
          }
        },
        required: ["description", "summary", "victimCount", "label", "victimType"]
      }
    },
    required: ["title", "context", "trackA", "trackB"]
  };

  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: difficulty === 'CHAOS' ? 1.2 : 1.0, // Chaos 模式下温度更高
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        id: crypto.randomUUID(),
        trackA: { ...data.trackA, id: 'track_a' },
        trackB: { ...data.trackB, id: 'track_b' }
      };
    }
    throw new Error("Empty response from Gemini");
  });
};

/**
 * 分析用户的选择
 */
export const analyzeDecision = async (
  scenario: Scenario,
  choice: 'track_a' | 'track_b'
): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash";

  const userAction = choice === 'track_a' ? "什么都不做" : "拉动拉杆";
  const choiceDesc = choice === 'track_a' ? scenario.trackA.description : scenario.trackB.description;

  const prompt = `
    场景: ${scenario.title}
    用户选择: ${userAction} -> ${choiceDesc}
    
    任务:
    1. 分析哲学流派和心理动因。
    2. 给出AI的选择(aiChoice: 'track_a' | 'track_b')和理由。
    JSON输出。简体中文。
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      philosophicalPerspective: { type: Type.STRING },
      similarityToClassics: { type: Type.STRING },
      globalComparison: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      aiChoice: { type: Type.STRING, enum: ['track_a', 'track_b'] },
      aiReasoning: { type: Type.STRING }
    },
    required: ["philosophicalPerspective", "similarityToClassics", "globalComparison", "tags", "aiChoice", "aiReasoning"]
  };

  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty analysis response");
  });
};