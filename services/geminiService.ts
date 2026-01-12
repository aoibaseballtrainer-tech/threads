import { GoogleGenAI, Type } from "@google/genai";
import { PeriodicEntry, UserProfile, SystemAiSettings } from "../types";

/**
 * Gemini APIクライアントを取得（APIキーを引数として受け取る）
 * ユーザーごとのAPIキーを使用することで、各自の課金になる
 */
const getGeminiClient = (apiKey: string) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini APIキーが設定されていません。設定画面でAPIキーを入力してください。');
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

export const analyzeGrowth = async (entries: PeriodicEntry[], profile: UserProfile, apiKey?: string) => {
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
    // ユーザーのAPIキーを使用（未設定の場合はエラー）
    const userApiKey = apiKey || profile.geminiApiKey || '';
    if (!userApiKey) {
      return "Gemini APIキーが設定されていません。設定画面でAPIキーを入力してください。";
    }
    
    const ai = getGeminiClient(userApiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    if (error.message && error.message.includes('APIキー')) {
      return error.message;
    }
    return "現在AI分析をご利用いただけません。APIキーが正しいか確認してください。";
  }
};

export const generateThreadsPosts = async (
  topic: string, 
  count: number, 
  settings: SystemAiSettings,
  userContext?: { entries: PeriodicEntry[], profile: UserProfile },
  apiKey?: string
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
    // ユーザーのAPIキーを使用（未設定の場合はエラー）
    const userApiKey = apiKey || userContext?.profile.geminiApiKey || '';
    if (!userApiKey) {
      console.error("Gemini APIキーが設定されていません");
      return [];
    }
    
    const ai = getGeminiClient(userApiKey);
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
  } catch (error: any) {
    console.error("AI Generation error:", error);
    if (error.message && error.message.includes('APIキー')) {
      console.error(error.message);
    }
    return [];
  }
};
