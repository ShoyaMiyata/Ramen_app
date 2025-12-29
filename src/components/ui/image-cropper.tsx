"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ASPECT_RATIOS = [
  { label: "自由", value: undefined, icon: "⬜" },
  { label: "正方形 (1:1)", value: 1, icon: "◻️" },
  { label: "横長 (4:3)", value: 4 / 3, icon: "▭" },
  { label: "ワイド (16:9)", value: 16 / 9, icon: "▬" },
  { label: "縦長 (3:4)", value: 3 / 4, icon: "▯" },
] as const;

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio: initialAspectRatio = 1,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(initialAspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("トリミングエラー:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio) || ASPECT_RATIOS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 bg-black/80 shrink-0">
        <button
          onClick={onCancel}
          className="text-white hover:text-gray-300 transition-colors p-2"
          disabled={isProcessing}
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold text-lg">画像をトリミング</h2>
        <button
          onClick={createCroppedImage}
          className="text-orange-500 hover:text-orange-400 font-semibold px-4 py-2"
          disabled={isProcessing}
        >
          {isProcessing ? "処理中..." : "完了"}
        </button>
      </div>

      {/* クロッパー */}
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
          showGrid={true}
          zoomWithScroll={true}
        />

        {/* アスペクト比選択ボタン（画面右下に配置） */}
        <div className="absolute bottom-6 right-6">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all shadow-lg"
                disabled={isProcessing}
              >
                <Maximize2 className="w-6 h-6" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-black/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-white/10 min-w-[200px] z-50"
                sideOffset={8}
                align="end"
              >
                {ASPECT_RATIOS.map((ratio) => (
                  <DropdownMenu.Item
                    key={ratio.label}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer outline-none transition-colors",
                      aspectRatio === ratio.value
                        ? "bg-orange-500/20 text-orange-400"
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    <span className="text-xl">{ratio.icon}</span>
                    <span className="text-sm font-medium">{ratio.label}</span>
                    {aspectRatio === ratio.value && (
                      <span className="ml-auto text-orange-400">✓</span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* ヒント */}
      <div className="bg-black/80 p-4 pb-8 shrink-0 safe-area-inset-bottom">
        <p className="text-gray-400 text-xs text-center">
          指でドラッグして位置調整、ピンチで拡大縮小
        </p>
      </div>
    </div>
  );
}

// トリミング処理のヘルパー関数
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
