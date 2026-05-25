/**
 * @module GlossaryImportModal
 * @description 用語集のJSONインポート用モーダルコンポーネント。ファイル読み込みとバリデーションを行う。
 */
import { useState } from "react";
import { AccessibleModal } from "@presentation/components/ui";
import { getLogger } from "@shared/logger";
import type { TFunc } from "./types";

interface GlossaryImportModalProps {
  onImport: (json: string) => void;
  onClose: () => void;
  t: TFunc;
}

const GLOSSARY_TYPE_DEFINITION = `type GlossaryImportData = {
  name?: string;
  description?: string;
  terms?: Array<{
    term?: string;
    reading?: string;
    description?: string;
    keywords?: string[];
  }>;
}`;

export function GlossaryImportModal({
  onImport,
  onClose,
  t,
}: GlossaryImportModalProps) {
  const [json, setJson] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  const exampleJSON = JSON.stringify(
    {
      name: "Tactical Glossary",
      description: "Team tactical terms",
      terms: [
        {
          term: "Gegenpressing",
          reading: "gegenpressing",
          description:
            "Immediately pressing to recover the ball after losing possession.",
          keywords: ["press", "high line"],
        },
        {
          term: "False 9",
          description:
            "A center forward who drops deep to create space for wingers.",
          keywords: ["formation", "attack"],
        },
      ],
    },
    null,
    2,
  );

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="glossary-import-modal-title"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      <h2
        id="glossary-import-modal-title"
        className="text-2xl font-bold text-white mb-6"
      >
        {t("glossary.import")}
      </h2>

      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="text-blue-400 font-semibold mb-2">
          📝 {t("glossary.import.instructions")}
        </h3>
        <p className="text-slate-300 text-sm mb-2">
          {t("glossary.import.instructionDetail")}
        </p>
        <div className="text-xs text-slate-400 space-y-1">
          <p>
            • <strong>name</strong>: {t("glossary.import.fieldName")}
          </p>
          <p>
            • <strong>description</strong>:{" "}
            {t("glossary.import.fieldDescription")}
          </p>
          <p>
            • <strong>terms</strong>: {t("glossary.import.fieldTerms")}
          </p>
          <div className="ml-4 space-y-1">
            <p>
              • <strong>term</strong>: {t("glossary.import.fieldTermTerm")}
            </p>
            <p>
              • <strong>reading</strong>:{" "}
              {t("glossary.import.fieldTermReading")}
            </p>
            <p>
              • <strong>description</strong>:{" "}
              {t("glossary.import.fieldTermDescription")}
            </p>
            <p>
              • <strong>keywords</strong>:{" "}
              {t("glossary.import.fieldTermKeywords")}
            </p>
          </div>
        </div>
      </div>

      {/* AI Prompt Section */}
      <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
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
          {GLOSSARY_TYPE_DEFINITION}
        </pre>
        <button
          type="button"
          onClick={() => {
            const prompt =
              t("import.ai.promptPrefix") +
              GLOSSARY_TYPE_DEFINITION +
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

      {/* Example */}
      <div className="mb-4">
        <details className="group">
          <div className="flex items-center gap-2 mb-2">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
              <span className="group-open:rotate-90 transition-transform">
                ▶
              </span>
              {t("glossary.import.showExample")}
            </summary>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(exampleJSON).then(
                  () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  },
                  () => {
                    getLogger().warn(
                      "ui",
                      "Clipboard write failed for glossary example",
                    );
                  },
                );
              }}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
            >
              {copied ? "✓" : "📋"}{" "}
              {copied ? t("glossary.import.copied") : t("glossary.import.copy")}
            </button>
          </div>
          <pre className="bg-slate-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto border border-slate-700">
            {exampleJSON}
          </pre>
        </details>
      </div>

      <label
        htmlFor="glossary-import-json"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        JSON
      </label>
      <textarea
        id="glossary-import-json"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={14}
        placeholder={t("glossary.importPlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-purple-500 font-mono text-sm"
      />

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          aria-label={t("a11y.closeModal")}
          className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
        >
          {t("glossary.cancel")}
        </button>
        <button
          onClick={() => onImport(json)}
          disabled={!json.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("glossary.importButton")}
        </button>
      </div>
    </AccessibleModal>
  );
}
