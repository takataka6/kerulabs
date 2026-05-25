/**
 * @module ImageCropModal
 * @description 画像トリミングモーダルコンポーネント。アップロード画像のクロップ・リサイズ操作UIを表示する。
 */
import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { AccessibleModal } from "./AccessibleModal";
import { useToast } from "./Toast";
import { handleError } from "@shared/errors/handleError";
import { getLogger } from "@shared/logger";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import {
  Z_INDEX,
  MAX_IMAGE_FILE_SIZE,
  CROP_OUTPUT_SIZE,
  CROP_JPEG_QUALITY,
} from "@shared/constants";

interface ImageCropModalProps {
  initialImage?: string;
  onSave: (imageUrl: string) => void;
  onRemove?: () => void;
  onClose: () => void;
  title?: string;
  aspectRatio?: number;
  cropShape?: "round" | "rect";
  outputWidth?: number;
  outputHeight?: number;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = CROP_OUTPUT_SIZE,
  outputHeight: number = CROP_OUTPUT_SIZE,
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("Failed to load image for cropping"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2D context");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return canvas.toDataURL("image/jpeg", CROP_JPEG_QUALITY);
}

export function ImageCropModal({
  initialImage,
  onSave,
  onRemove,
  onClose,
  title,
  aspectRatio = 1,
  cropShape = "round",
  outputWidth = CROP_OUTPUT_SIZE,
  outputHeight = CROP_OUTPUT_SIZE,
}: ImageCropModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      getLogger().warn("ui", "Invalid file type for image crop", {
        type: file.type,
        fileName: file.name,
      });
      showToast(t("imageCrop.invalidFileType"), "error");
      return;
    }
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      getLogger().warn("ui", "Image file too large for crop", {
        size: file.size,
        fileName: file.name,
      });
      showToast(
        t("imageCrop.fileTooLarge").replace(
          "{limit}",
          String(Math.round(MAX_IMAGE_FILE_SIZE / (1024 * 1024))),
        ),
        "error",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.onerror = () => {
      handleError(reader.error, "ui", "Failed to read image file", {
        meta: { fileName: file.name },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        outputWidth,
        outputHeight,
      );
      onSave(croppedImage);
      onClose();
    } catch (error) {
      handleError(error, "ui", "Failed to crop and save image");
    }
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="image-crop-title"
      className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-md overflow-hidden flex flex-col"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      overlayStyle={{ zIndex: Z_INDEX.MODAL_OVERLAY }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <h3 id="image-crop-title" className="text-white font-semibold">
          {title || t("imageCrop.setPhoto")}
        </h3>
        <button
          onClick={onClose}
          aria-label={t("imageCrop.close")}
          className="text-slate-400 hover:text-white transition-colors text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        {imageSrc ? (
          <>
            {/* Crop area */}
            <div className="relative w-full h-64 bg-slate-800 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs" aria-hidden="true">
                -
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label={t("imageCrop.zoom")}
                className="flex-1 accent-blue-500"
              />
              <span className="text-slate-400 text-xs" aria-hidden="true">
                +
              </span>
            </div>

            {/* Change image button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {t("imageCrop.selectOtherImage")}
            </button>
          </>
        ) : (
          /* No image selected */
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors cursor-pointer"
          >
            <span className="text-3xl">📷</span>
            <span className="text-slate-400 text-sm">
              {t("imageCrop.clickToSelect")}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/50 flex gap-2">
        {onRemove && (
          <button
            onClick={() => {
              onRemove();
              onClose();
            }}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            {t("imageCrop.delete")}
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t("imageCrop.cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={!imageSrc || !croppedAreaPixels}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t("imageCrop.save")}
        </button>
      </div>
    </AccessibleModal>
  );
}
