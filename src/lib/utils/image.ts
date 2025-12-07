/**
 * 画像リサイズ・圧縮ユーティリティ
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.6,
  mimeType: "image/webp",
};

/**
 * 画像ファイルを圧縮・リサイズする
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 画像でない場合はそのまま返す
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // GIFはそのまま返す（アニメーション保持のため）
  if (file.type === "image/gif") {
    return file;
  }

  // 画像を読み込む
  const img = await loadImage(file);

  // リサイズ計算
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    opts.maxWidth,
    opts.maxHeight
  );

  // リサイズ不要かつ非常に小さい画像はそのまま返す (100KB未満)
  if (width === img.width && height === img.height && file.size < 100 * 1024) {
    return file;
  }

  // Canvasで圧縮
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // 高品質なリサイズのための設定
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Blobに変換
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error("Failed to compress image"));
        }
      },
      opts.mimeType,
      opts.quality
    );
  });

  // 元のファイル名を保持しつつ新しい拡張子を付ける
  const ext = opts.mimeType === "image/webp" ? ".webp" : ".jpg";
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const newFileName = `${baseName}${ext}`;

  return new File([blob], newFileName, { type: opts.mimeType });
}

/**
 * 画像を読み込む
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * アスペクト比を維持したリサイズ後のサイズを計算
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * 画像ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
