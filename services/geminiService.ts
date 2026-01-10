import { GoogleGenAI, Type } from "@google/genai";
import { PeriodicEntry, UserProfile, SystemAiSettings } from "../types";

// Vite環境変数を使用（ブラウザで実行されるため）
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeGrowth = async (entries: PeriodicEntry[], profile: UserProfile) => {
  if (entries.length < 2) return "データが不足しています。分析を開始するには少なくとも2回以上の定期登録が必要です。";

  const prompt = `
    Threadsのアカウント成長を分析してください。
    ユーザー名: ${profile.fullName}
    ジャンル: ${profile.genre}
    
    最近のデータ2件:
    1回目: 日付 ${entries[entries.length-2].date}, フォロワー数 ${entries[entries.length-2].followers}, 7日間閲覧数 ${entries[entries.length-2].views7Days}
    2回目: 日付 ${entries[entries.length-1].date}, フォロワー数 ${entries[entries.length-1].followers}, 7日間閲覧数 ${entries[entries.length-1].views7Days}
    
    これらのデータを比較して、成長の傾向と今後のアクションプランを300文字以内で日本語でアドバイスしてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "現在AI分析をご利用いただけません。";
  }
};

export const generateThreadsPosts = async (
  topic: string, 
  count: number, 
  settings: SystemAiSettings,
  userContext?: { entries: PeriodicEntry[], profile: UserProfile }
): Promise<string[]> => {
  
  // ユーザーのインサイトコンテキストを作成
  let insightContext = "";
  if (userContext && userContext.entries.length > 0) {
    const latest = userContext.entries[userContext.entries.length - 1];
    insightContext = `
      [ユーザーの現状]
      ジャンル: ${userContext.profile.genre}
      最近のインサイト: フォロワー ${latest.followers}名, 週間閲覧数 ${latest.views7Days}回
      過去に反響のあった投稿内容:
      ${latest.topContents.map(c => `- ${c.content.substring(0, 50)}...`).join('\n')}
    `;
  }

  const prompt = `
    ${settings.systemPrompt}

    [共有知識・学習データ]
    ${settings.knowledgeBase}

    ${insightContext}

    [ユーザーからのリクエスト]
    トピック: "${topic}"
    作成件数: ${count}件
    
    条件:
    1. 各投稿は500文字以内。
    2. 適度に改行を入れ、スマホで読みやすくすること。
    3. ハッシュタグは最小限（0-2個）。
    
    出力は必ず以下のJSON形式の配列で返してください:
    ["投稿内容1", "投稿内容2", ...]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Generation error:", error);
    return [];
  }
};
