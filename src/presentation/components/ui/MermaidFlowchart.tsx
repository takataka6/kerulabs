/**
 * @module MermaidFlowchart
 * @description Mermaid記法をSVGフローチャートとしてレンダリングするコンポーネント。
 */
import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { getLogger } from "@shared/logger";
import { generateUUID } from "@shared/utils/generateUUID";

interface MermaidFlowchartProps {
  chart: string;
  className?: string;
}

type MermaidAPI = Awaited<typeof import("mermaid")>["default"];
let mermaidInstance: MermaidAPI | null = null;

/**
 * mermaid ライブラリを遅延読み込みし、初回のみ初期化する。
 * 動的 import により mermaid (~500KB) がメインバンドルから分離される。
 */
async function getMermaid(): Promise<MermaidAPI> {
  if (!mermaidInstance) {
    const mod = await import("mermaid");
    mermaidInstance = mod.default;
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#3b82f6",
        primaryTextColor: "#fff",
        primaryBorderColor: "#60a5fa",
        lineColor: "#60a5fa",
        secondaryColor: "#1e293b",
        tertiaryColor: "#0f172a",
        background: "#0f172a",
        mainBkg: "#1e293b",
        nodeBorder: "#60a5fa",
        clusterBkg: "#1e293b",
        clusterBorder: "#475569",
        textColor: "#e2e8f0",
        fontSize: "14px",
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "basis",
      },
    });
  }
  return mermaidInstance;
}

export function MermaidFlowchart({
  chart,
  className = "",
}: MermaidFlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const renderIdRef = useRef(0);

  useEffect(() => {
    if (!chart) {
      setSvgContent(""); // eslint-disable-line react-hooks/set-state-in-effect -- chart prop が空になったときに SVG をクリア。chart の変化に同期する派生ステート
      return;
    }

    const currentRenderId = ++renderIdRef.current;

    const renderChart = async () => {
      try {
        const mermaid = await getMermaid();
        const id = `mermaid-${generateUUID()}`;
        const { svg } = await mermaid.render(id, chart);

        // 最新のレンダリングリクエストのみを反映
        if (currentRenderId === renderIdRef.current) {
          setSvgContent(svg);
        }
      } catch (error) {
        getLogger().warn("ui", "Mermaid rendering error", { error });
        if (currentRenderId === renderIdRef.current) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          // Mermaid のエラーメッセージからユーザーに有益な部分を抽出
          const sanitized = DOMPurify.sanitize(message);
          setSvgContent(
            `<div class="text-left"><p class="text-red-400 text-xs font-semibold mb-1">Syntax Error</p><pre class="text-red-300/70 text-xs font-mono whitespace-pre-wrap break-words">${sanitized}</pre></div>`,
          );
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{
        // DOMPurify はデフォルトで script, iframe, object, embed タグと
        // 全ての on* イベントハンドラ属性を自動除去する。
        // FORBID_TAGS にはデフォルトで除去されない危険タグのみ列挙:
        //   form/input/textarea/button/select → フィッシング防止
        // 注: style タグは Mermaid が SVG スタイリングに使用するため許可
        __html: DOMPurify.sanitize(svgContent, {
          USE_PROFILES: { svg: true, svgFilters: true, html: true },
          ADD_TAGS: ["foreignObject"],
          FORBID_TAGS: ["form", "input", "textarea", "button", "select"],
        }),
      }}
    />
  );
}
