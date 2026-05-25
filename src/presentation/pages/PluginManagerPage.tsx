/**
 * @module PluginManagerPage
 * @description プラグ���ンの管理ページ。インポート・一覧表示・削除機能を提供する。
 */
import { useRef, useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { PageShell, PageHeader } from "@presentation/components/layout";
import {
  usePlugins,
  useImportPlugin,
  useDeletePlugin,
} from "@presentation/hooks/queries/usePlugins";
import { useToast } from "@presentation/components/ui/Toast";
import { useConfirm } from "@presentation/components/ui/ConfirmDialog";
import { PluginGuideModal } from "@presentation/components/code-lab/plugin/PluginGuideModal";
import { getLogger } from "@shared/logger";

const PLUGIN_TYPE_DEFINITION = `type I18nText = { ja: string; en: string };

// ── Coordinate system for miniPitchDemo / miniPitchSteps (center = 0, 0) ─
// Football 11v11 : X ∈ [-5, +5],      Z ∈ [-6,    +6]
// Futsal   5v5   : X ∈ [-4, +4],      Z ∈ [-3,    +3]
// Eight-aside 8v8: X ∈ [-5, +5],      Z ∈ [-3.75, +3.75]
// Society  7v7   : X ∈ [-4.5, +4.5],  Z ∈ [-2.75, +2.75]
// Own goal: Z = -max  /  Opponent goal: Z = +max
// ──────────────────────────────────────────────────────────────────────────
type PlayerDef = {
  x: number; z: number;
  number?: number; name?: string; color: string;
};

type LessonSection =
  | { type: "heading"; text: I18nText }
  | { type: "paragraph"; text: I18nText }
  | { type: "codeBlock"; language: string; code: string;
      highlightLines?: number[] }
  | { type: "mermaidDiagram"; description?: I18nText; code: string }
  | { type: "miniPitchDemo"; description?: I18nText;
      cameraPosition?: [number, number, number];
      players: PlayerDef[] }
  | { type: "miniPitchSteps"; description?: I18nText;
      cameraPosition?: [number, number, number];
      steps: Array<{ label: I18nText; players: PlayerDef[] }> }
  | { type: "interactiveDemo"; description?: I18nText;
      cameraPosition?: [number, number, number];
      state: Record<string, {
        type: "string" | "number" | "boolean";
        default: string | number | boolean;
        min?: number; max?: number;
      }>;
      controls: Array<
        | { type: "buttonGroup"; bind: string;
            options: Array<{ value: string; label: I18nText }> }
        | { type: "textInput";    bind: string; maxLength?: number; label?: I18nText }
        | { type: "numberInput";  bind: string; label?: I18nText }
        | { type: "toggle";       bind: string; label?: I18nText }
        | { type: "slider";       bind: string; label?: I18nText }
      >;
      scene?:  { players: Array<{ x: number; z: number;
                  number?: number | string; name?: string;
                  color: string | { if: string; then: string|number; else: string|number } }> };
      scenes?: Record<string, { players: Array<{ x: number; z: number;
                  number?: number | string; name?: string;
                  color: string | { if: string; then: string|number; else: string|number } }> }>;
    };

type PluginManifest = {
  kerulab_plugin: string;  // e.g. "1.0"
  type: "lesson";
  metadata: {
    id: string;
    name: I18nText;
    author: string;
    version: string;
    description: I18nText;
  };
  data: {
    lessonId: string;
    category: "programming-basics" | "file-formats" | "git"
            | "architecture" | "testing" | "custom";
    title: I18nText;
    description: I18nText;
    icon: string;      // emoji e.g. "📘"
    gradient: string;  // CSS gradient e.g. "linear-gradient(...)"
    sections: LessonSection[];
  };
}`;

export function PluginManagerPage() {
  const { t, language } = useLanguage();
  const { data: plugins, isLoading } = usePlugins();
  const importPlugin = useImportPlugin();
  const deletePlugin = useDeletePlugin();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteJson, setPasteJson] = useState("");
  const [copiedAi, setCopiedAi] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await file.text();
      await importPlugin.mutateAsync(json);
      showToast(t("code.lab.plugin.importSuccess"), "success");
    } catch {
      showToast(t("code.lab.plugin.importError"), "error");
    }

    // ファイル選択をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePasteImport = async () => {
    const trimmed = pasteJson.trim();
    if (!trimmed) return;

    try {
      await importPlugin.mutateAsync(trimmed);
      showToast(t("code.lab.plugin.importSuccess"), "success");
      setPasteJson("");
      setIsPasteOpen(false);
    } catch {
      showToast(t("code.lab.plugin.importError"), "error");
    }
  };

  const handleDelete = async (pluginId: string, pluginName: string) => {
    const confirmed = await confirm({
      title: t("code.lab.plugin.delete"),
      message: `${t("code.lab.plugin.deleteConfirm")}\n\n${pluginName}`,
      variant: "red",
    });
    if (!confirmed) return;

    try {
      await deletePlugin.mutateAsync(pluginId);
      showToast(t("code.lab.plugin.deleteSuccess"), "success");
    } catch {
      showToast(t("code.lab.plugin.importError"), "error");
    }
  };

  return (
    <PageShell
      backgroundOrbs={[
        { color: "bg-purple-500/10", position: "top-left" },
        { color: "bg-blue-500/10", position: "bottom-right" },
      ]}
    >
      <PageHeader
        icon="🧩"
        titleKey="code.lab.plugin.manager"
        subtitleKey="code.lab.plugin.category.description"
        backTo="/code-lab"
        backLabelKey="code.lab.lesson.backToList"
      />

      {/* インポートボタン & ガイドボタン */}
      <div className="mb-8 flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="plugin-import"
        />
        <label
          htmlFor="plugin-import"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
        >
          <span aria-hidden="true">📥</span>
          {t("code.lab.plugin.importButton")}
        </label>
        <button
          onClick={() => setIsPasteOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span aria-hidden="true">📋</span>
          {t("code.lab.plugin.pasteButton")}
        </button>
        <button
          onClick={() => setIsGuideOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span aria-hidden="true">📖</span>
          {t("code.lab.plugin.guide.openButton")}
        </button>
      </div>

      {/* AI Prompt Section */}
      <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <h3 className="text-purple-400 font-semibold mb-2">
          🤖 {t("import.ai.title")}
        </h3>
        <p className="text-slate-300 text-sm mb-3">
          {t("import.ai.description")}
        </p>
        <p className="text-xs font-semibold text-slate-400 mb-1">
          {t("import.ai.typeTitle")}
        </p>
        <pre className="bg-slate-950 text-purple-300 p-3 rounded-lg text-xs overflow-x-auto border border-purple-500/20 mb-3">
          {PLUGIN_TYPE_DEFINITION}
        </pre>
        <button
          type="button"
          onClick={() => {
            const prompt =
              t("import.ai.promptPrefix") +
              PLUGIN_TYPE_DEFINITION +
              t("import.ai.promptSuffix");
            navigator.clipboard.writeText(prompt).then(
              () => {
                setCopiedAi(true);
                setTimeout(() => setCopiedAi(false), 2000);
              },
              () => {
                getLogger().warn("ui", "Clipboard write failed for AI prompt");
              },
            );
          }}
          className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-medium transition-colors"
        >
          {copiedAi ? "✓" : "📋"}{" "}
          {copiedAi ? t("import.ai.copied") : t("import.ai.copyPrompt")}
        </button>
      </div>

      {/* ペースト入力エリア */}
      {isPasteOpen && (
        <div className="mb-8 p-4 rounded-xl bg-slate-900/50 border border-slate-700 space-y-3">
          <h3 className="text-white text-sm font-semibold">
            {t("code.lab.plugin.pasteImport")}
          </h3>
          <textarea
            value={pasteJson}
            onChange={(e) => setPasteJson(e.target.value)}
            placeholder={t("code.lab.plugin.pastePlaceholder")}
            className="w-full h-48 p-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-xs font-mono resize-y focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsPasteOpen(false);
                setPasteJson("");
              }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {t("code.lab.plugin.pasteCancel")}
            </button>
            <button
              onClick={handlePasteImport}
              disabled={!pasteJson.trim()}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {t("code.lab.plugin.pasteSubmit")}
            </button>
          </div>
        </div>
      )}

      {/* プラグイン一覧 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : !plugins || plugins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">🧩</p>
          <p className="text-slate-500 mt-2">{t("code.lab.plugin.empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin) => {
            const name =
              plugin.metadata.name[language] || plugin.metadata.name.ja;
            const desc =
              plugin.metadata.description[language] ||
              plugin.metadata.description.ja;
            return (
              <div
                key={plugin.id.value}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg" aria-hidden="true">
                      {plugin.data.icon}
                    </span>
                    <h3 className="text-white font-semibold truncate">
                      {name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      v{plugin.metadata.version}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm truncate">{desc}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {plugin.metadata.author} ·{" "}
                    {new Date(plugin.installedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(plugin.id.value, name)}
                  className="ml-4 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  {t("code.lab.plugin.delete")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <PluginGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </PageShell>
  );
}
