import { action } from "./_generated/server";
import { v } from "convex/values";

// 店舗情報の型定義
export interface ShopInfo {
  shopName: string | null;
  prefecture: string | null;
  station: string | null;
  address: string | null;
  confidence: number;
}

// Gemini APIのレスポンス型
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export const extractShopInfo = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, { url }): Promise<ShopInfo> => {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length);

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    // プロンプト作成（URLのみ）
    const prompt = createPrompt(url);

    console.log("Calling Gemini API with search grounding...");

    try {
      // Gemini API呼び出し（Google Search grounding付き）
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      console.log("API URL (without key):", apiUrl.replace(apiKey, "***"));

      const response = await fetch(apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            tools: [
              {
                googleSearch: {},
              },
            ],
            generationConfig: {
              temperature: 0.1, // 低温度で正確性重視
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // レスポンスからJSONを抽出
      let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      console.log("Text response from Gemini:", textResponse);

      if (!textResponse) {
        throw new Error("No response from Gemini API");
      }

      // マークダウンのコードブロックを除去
      textResponse = textResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      // JSONパース
      console.log("Attempting to parse JSON...");
      const shopInfo: ShopInfo = JSON.parse(textResponse);
      console.log("Parsed shop info:", shopInfo);

      // データ検証
      return validateShopInfo(shopInfo);
    } catch (error) {
      console.error("Error extracting shop info:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to extract shop info"
      );
    }
  },
});


// プロンプト作成
function createPrompt(url: string): string {
  return `Search for and extract information about the ramen shop from this URL: ${url}

Return ONLY a valid JSON object with this exact format (no markdown, no explanations):
{"shopName":"店名","prefecture":"都道府県","station":"駅名","address":"住所","confidence":95}

Rules:
- shopName: Official shop name
- prefecture: One of 47 Japanese prefectures (東京都, 大阪府, 京都府, 北海道, etc.)
- station: Nearest station name ending with "駅"
- address: Full address
- confidence: 0-100 based on information reliability
- Use null for any field if information not found
- Return ONLY the JSON object`;
}

// データ検証
function validateShopInfo(shopInfo: ShopInfo): ShopInfo {
  // 都道府県リスト
  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];

  // 都道府県の検証
  if (shopInfo.prefecture && !prefectures.includes(shopInfo.prefecture)) {
    shopInfo.prefecture = null;
    shopInfo.confidence = Math.max(0, shopInfo.confidence - 20);
  }

  // 駅名の検証（「駅」が含まれているか）
  if (shopInfo.station && !shopInfo.station.includes("駅")) {
    shopInfo.station = `${shopInfo.station}駅`;
  }

  // 信頼度の範囲チェック
  shopInfo.confidence = Math.max(0, Math.min(100, shopInfo.confidence));

  return shopInfo;
}
