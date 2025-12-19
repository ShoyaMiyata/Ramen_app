import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  uploadToR2,
  deleteFromR2,
  generateUniqueKey,
  validateFileSize,
  validateFileType,
} from "@/lib/r2";

/**
 * POST /api/upload
 * 画像をCloudflare R2にアップロード
 *
 * Request Body: FormData
 * - file: File (required) - アップロードする画像ファイル
 *
 * Response:
 * - success: true
 * - url: string - アップロードされた画像のURL
 * - key: string - R2のオブジェクトキー
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // FormDataからファイルを取得
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが指定されていません" },
        { status: 400 }
      );
    }

    // ファイルサイズのバリデーション（最大5MB）
    if (!validateFileSize(file, 5)) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    // ファイルタイプのバリデーション
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: "対応している画像形式: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // ユニークなキーを生成
    const key = generateUniqueKey(userId, file.name);

    // R2にアップロード
    const url = await uploadToR2(file, key);

    return NextResponse.json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * R2から画像を削除
 *
 * Request Body: JSON
 * - key: string (required) - 削除するR2のオブジェクトキー
 *
 * Response:
 * - success: true
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // リクエストボディからキーを取得
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "キーが指定されていません" },
        { status: 400 }
      );
    }

    // キーがユーザーのものか確認（セキュリティチェック）
    if (!key.startsWith(`images/user_${userId}/`)) {
      return NextResponse.json(
        { error: "このファイルを削除する権限がありません" },
        { status: 403 }
      );
    }

    // R2から削除
    await deleteFromR2(key);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
