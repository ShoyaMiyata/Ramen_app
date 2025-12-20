import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * AI画像生成アクション
 * ユーザーのプロンプトから画像を生成し、Convex Storageに保存
 */
export const generateProfileImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<{ storageId: string; url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    // Cloudflare Workers AI APIキーの確認
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
      throw new Error("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set");
    }

    try {
      console.log("画像生成開始:", args.prompt);

      // Cloudflare Workers AIを使用（Stable Diffusion XL - 完全無料）
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `avatar illustration, ${args.prompt}, high quality, digital art, profile picture style`,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudflare Workers AI error:", response.status, errorText);
        throw new Error(`Cloudflare Workers AI error: ${response.status} ${errorText}`);
      }

      console.log("画像生成完了");

      // レスポンスをBlobとして取得
      const imageBlob = await response.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // Convex Storageに保存
      const storageId = await ctx.storage.store(new Blob([imageBuffer], { type: "image/png" }));

      // Storage URLを取得
      const url = await ctx.storage.getUrl(storageId);
      if (!url) {
        throw new Error("画像URLの取得に失敗しました");
      }

      console.log("画像保存完了:", storageId);

      return {
        storageId,
        url,
      };
    } catch (error) {
      console.error("AI画像生成エラー:", error);
      if (error instanceof Error) {
        throw new Error(`画像生成に失敗しました: ${error.message}`);
      }
      throw new Error("画像生成に失敗しました");
    }
  },
});

/**
 * 生成した画像をプロフィール画像として設定
 */
export const setGeneratedImageAsProfile = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    // ユーザー情報を更新（mutation経由）
    await ctx.runMutation(api.users.updateCustomImage, {
      imageId: args.storageId,
    });

    return { success: true };
  },
});
