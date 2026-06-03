/**
 * @module CanvasText
 * @description Canvas 2D を使って Three.js の Mesh にテキストテクスチャを生成するコンポーネント。
 * drei の <Text> の代替として、フォントサイズ・アウトライン・letterSpacing などの制御をシンプルに実現。
 * 選手/相手の背番号・名前ラベルで使用。
 */
import { forwardRef, useEffect, useMemo, type ReactNode } from "react";
import {
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
  type Euler,
  type Mesh,
  type Vector3,
} from "three";

interface CanvasTextProps {
  children: ReactNode;
  position?: [number, number, number] | Vector3;
  rotation?: [number, number, number] | Euler;
  fontSize: number;
  color?: string;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  fontWeight?: string;
  outlineWidth?: number;
  outlineColor?: string;
  letterSpacing?: number;
}

function getTextContent(children: ReactNode): string {
  if (
    children === null ||
    children === undefined ||
    typeof children === "boolean"
  ) {
    return "";
  }
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  return "";
}

export const CanvasText = forwardRef<Mesh, CanvasTextProps>(function CanvasText(
  {
    children,
    position,
    rotation,
    fontSize,
    color = "white",
    anchorX = "center",
    anchorY = "middle",
    fontWeight = "normal",
    outlineWidth = 0,
    outlineColor = "#000000",
    letterSpacing = 0,
  },
  ref,
) {
  const text = getTextContent(children);

  const { texture, width, height } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const scale = 4;
    const fontPx = Math.max(32, Math.ceil(fontSize * 180));
    const padding = Math.ceil(fontPx * (outlineWidth > 0 ? 0.4 : 0.2));
    const font = `${fontWeight} ${fontPx}px sans-serif`;
    const measureCtx = canvas.getContext("2d");

    let measuredWidth = Math.max(fontPx, text.length * fontPx * 0.65);
    if (measureCtx) {
      measureCtx.font = font;
      measuredWidth = Math.max(fontPx, measureCtx.measureText(text).width);
    }

    canvas.width = Math.ceil((measuredWidth + padding * 2) * scale);
    canvas.height = Math.ceil((fontPx + padding * 2) * scale);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(scale, scale);
      ctx.font = font;
      ctx.textAlign =
        anchorX === "left" ? "left" : anchorX === "right" ? "right" : "center";
      ctx.textBaseline =
        anchorY === "top" ? "top" : anchorY === "bottom" ? "bottom" : "middle";
      const x =
        anchorX === "left"
          ? padding
          : anchorX === "right"
            ? measuredWidth + padding
            : measuredWidth / 2 + padding;
      const y =
        anchorY === "top"
          ? padding
          : anchorY === "bottom"
            ? fontPx + padding
            : fontPx / 2 + padding;

      if (outlineWidth > 0) {
        ctx.lineWidth = Math.max(1, outlineWidth * fontPx * 8);
        ctx.strokeStyle = outlineColor;
        ctx.strokeText(text, x, y);
      }
      ctx.fillStyle = color;
      if (letterSpacing !== 0 && text.length > 1) {
        const spacing = letterSpacing * fontPx;
        let cursor = x - (measuredWidth + spacing * (text.length - 1)) / 2;
        ctx.textAlign = "left";
        for (const char of text) {
          ctx.fillText(char, cursor, y);
          cursor += ctx.measureText(char).width + spacing;
        }
      } else {
        ctx.fillText(text, x, y);
      }
    }

    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.colorSpace = SRGBColorSpace;
    canvasTexture.minFilter = LinearFilter;
    canvasTexture.generateMipmaps = false;
    canvasTexture.needsUpdate = true;

    const aspect = canvas.width / canvas.height;
    return {
      texture: canvasTexture,
      width: Math.max(fontSize * 1.6, fontSize * aspect),
      height: Math.max(fontSize * 0.9, fontSize),
    };
  }, [
    anchorX,
    anchorY,
    color,
    fontSize,
    fontWeight,
    letterSpacing,
    outlineColor,
    outlineWidth,
    text,
  ]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
});
