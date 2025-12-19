import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2クライアントの初期化
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/**
 * ファイルをCloudflare R2にアップロード
 * @param file - アップロードするファイル
 * @param key - R2のオブジェクトキー（例: "images/user123/abc123.jpg"）
 * @returns アップロードされたファイルの公開URL
 */
export async function uploadToR2(file: File, key: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    // CacheControl: "public, max-age=31536000, immutable", // 1年間キャッシュ
  });

  await r2Client.send(command);

  return getR2Url(key);
}

/**
 * R2からファイルを削除
 * @param key - R2のオブジェクトキー
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * R2のオブジェクトキーから公開URLを生成
 * @param key - R2のオブジェクトキー
 * @returns 公開URL
 */
export function getR2Url(key: string): string {
  // R2のPublic URLを使用する場合
  return `${PUBLIC_URL}/${key}`;
}

/**
 * R2のオブジェクトに署名付きURL（Presigned URL）を生成
 * プライベートバケットで一時的なアクセスを提供する場合に使用
 * @param key - R2のオブジェクトキー
 * @param expiresIn - URL有効期限（秒）デフォルト: 3600秒（1時間）
 * @returns 署名付きURL
 */
export async function getSignedR2Url(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * ユニークなファイル名を生成
 * @param userId - ユーザーID
 * @param originalFilename - 元のファイル名
 * @returns ユニークなキー（例: "images/user_abc123/1234567890_photo.jpg"）
 */
export function generateUniqueKey(userId: string, originalFilename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split(".").pop();
  const filename = `${timestamp}_${randomStr}.${extension}`;

  return `images/user_${userId}/${filename}`;
}

/**
 * ファイルサイズが制限内かチェック
 * @param file - チェックするファイル
 * @param maxSizeMB - 最大サイズ（MB）デフォルト: 5MB
 * @returns サイズが制限内であればtrue
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * ファイルタイプが許可されているかチェック
 * @param file - チェックするファイル
 * @param allowedTypes - 許可するMIMEタイプの配列
 * @returns タイプが許可されていればtrue
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"]
): boolean {
  return allowedTypes.includes(file.type);
}
