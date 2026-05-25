/**
 * @module FlowchartPanel
 * @description Mermaidフローチャートで戦術の流れを可視化するパネルコンポーネント。
 */
import { memo } from "react";
import { MermaidFlowchart } from "@presentation/components/ui";
import type { TranslationKey } from "@shared/i18n/translations";

interface FlowchartPanelProps {
  chartContent: string;
  onClose: () => void;
  t: (key: TranslationKey) => string;
}

/**
 * 戦術フローチャートを表示するオーバーレイパネル。
 *
 * MermaidFlowchart コンポーネントをラップし、閉じるボタン付きのパネルとして表示する。
 */
export const FlowchartPanel = memo(function FlowchartPanel({
  chartContent,
  onClose,
  t,
}: FlowchartPanelProps) {
  return (
    <div className="absolute top-48 right-4 xl:top-64 xl:right-6 bottom-4 xl:bottom-6 bg-slate-900/98 backdrop-blur-xl rounded-2xl border-2 border-purple-500/50 shadow-2xl w-[300px] xl:w-[420px] flex flex-col z-30">
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-900/80 to-purple-800/80 px-5 py-3 border-b border-purple-500/30 flex items-center justify-between rounded-t-2xl">
        <h3 className="text-white font-bold flex items-center gap-3 tracking-wide">
          <span className="text-xl">📊</span>
          <span>{t("tactics.tacticsFlow")}</span>
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-90 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          aria-label={t("a11y.closePanel")}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div
        className="flex-1 min-h-0 overflow-auto p-3 xl:p-4 custom-scrollbar bg-slate-800/50 rounded-b-2xl"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region needs tabIndex for keyboard scrolling
        tabIndex={0}
        role="region"
        aria-label={t("tactics.tacticsFlow")}
      >
        <MermaidFlowchart chart={chartContent} className="mermaid-container" />
      </div>
    </div>
  );
});
