/**
 * @module BulkTeamImportModal
 * @description チームデータの一括インポートモーダルコンポーネント。JSONファイルからチーム・選手データを読み込む。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { AccessibleModal } from "@presentation/components/ui";
import { handleError } from "@shared/errors/handleError";
import { getLogger } from "@shared/logger";

interface BulkTeamImportModalProps {
  onImport: (jsonData: string) => Promise<void>;
  onClose: () => void;
}

const TEAM_TYPE_DEFINITION = `type TeamImportData = {
  name: string;
  subtitle?: string;
  country?: string;
  colors?: { gk?: string; main?: string };
  availableFormations?: string[];
  defaultFormation?: string;
  flagType?: string;
  headerGradient?: string;
  manager?: string;
  players?: Array<{
    name: string;
    number: number;  // 0–99
    position?: "gk" | "df" | "mf" | "fw";
    nationality?: string;
    club?: string;
    leagueCountry?: string;
    note?: string;
    status?: "available" | "suspended" | "injured";
  }>;
}
// Input: TeamImportData[]`;

export function BulkTeamImportModal({
  onImport,
  onClose,
}: BulkTeamImportModalProps) {
  const { t } = useLanguage();
  const [jsonText, setJsonText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setError(t("team.import.enterJson"));
      return;
    }

    // まずJSON構文を検証
    try {
      JSON.parse(jsonText);
    } catch {
      setError(t("team.import.invalidJson"));
      return;
    }

    // 検証済みJSONをインポート
    try {
      setError(null);
      setIsImporting(true);
      await onImport(jsonText);
      onClose();
    } catch (err) {
      handleError(err, "database", "Failed to import teams");
      setError(
        `${t("player.import.error")}: ${err instanceof Error ? err.message : t("team.import.processingFailed")}`,
      );
    } finally {
      setIsImporting(false);
    }
  };

  const exampleJSON = JSON.stringify(
    [
      {
        name: "Sample Team",
        subtitle: "Example FC",
        country: "Japan",
        colors: {
          gk: "#FFD700",
          main: "#1E90FF",
        },
        availableFormations: ["4-3-3", "4-4-2"],
        defaultFormation: "4-3-3",
        flagType: "jp",
        headerGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        manager: "Manager Name",
        players: [
          {
            name: "Player 1",
            number: 1,
            position: "gk",
            nationality: "Japan",
            club: "Sample FC",
            leagueCountry: "Japan",
          },
          {
            name: "Player 2",
            number: 10,
            position: "mf",
            nationality: "Brazil",
            club: "Sample FC",
            leagueCountry: "Japan",
          },
        ],
      },
    ],
    null,
    2,
  );

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="bulk-import-title"
      overlayClassName="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <h2
          id="bulk-import-title"
          className="text-2xl font-bold text-white flex items-center gap-2"
        >
          📦 {t("team.import.title")}
        </h2>
        <button
          onClick={onClose}
          aria-label={t("a11y.closeModal")}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        {/* Instructions */}
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">
            📝 {t("team.import.instructions")}
          </h3>
          <p className="text-slate-300 text-sm mb-2">
            {t("team.import.instructionDetail")}
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>
              • <strong>name</strong>: {t("team.import.fieldName")}
            </p>
            <p>
              • <strong>subtitle</strong>: {t("team.import.fieldSubtitle")}
            </p>
            <p>
              • <strong>country</strong>: {t("team.import.fieldCountry")}
            </p>
            <p>
              • <strong>colors</strong>: {t("team.import.fieldColors")}
            </p>
            <p>
              • <strong>availableFormations</strong>:{" "}
              {t("team.import.fieldFormations")}
            </p>
            <p>
              • <strong>defaultFormation</strong>:{" "}
              {t("team.import.fieldDefaultFormation")}
            </p>
            <p>
              • <strong>flagType</strong>: {t("team.import.fieldFlagType")}
            </p>
            <p>
              • <strong>headerGradient</strong>:{" "}
              {t("team.import.fieldHeaderGradient")}
            </p>
            <p>
              • <strong>manager</strong>: {t("team.import.fieldManager")}
            </p>
            <p>
              • <strong>players</strong>: {t("team.import.fieldPlayers")}
            </p>
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
            {TEAM_TYPE_DEFINITION}
          </pre>
          <button
            type="button"
            onClick={() => {
              const prompt =
                t("import.ai.promptPrefix") +
                TEAM_TYPE_DEFINITION +
                t("import.ai.promptSuffix");
              navigator.clipboard.writeText(prompt).then(
                () => {
                  setCopiedAi(true);
                  setTimeout(() => setCopiedAi(false), 2000);
                },
                () => {
                  getLogger().warn(
                    "ui",
                    "Clipboard write failed for AI prompt",
                  );
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
                {t("team.import.showExample")}
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
                        "Clipboard write failed for team import example",
                      );
                    },
                  );
                }}
                className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
              >
                {copied ? "✓" : "📋"}{" "}
                {copied ? t("team.import.copied") : t("team.import.copy")}
              </button>
            </div>
            <pre className="bg-slate-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto border border-slate-700">
              {exampleJSON}
            </pre>
          </details>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            {t("team.import.jsonData")}
          </label>
          <textarea
            id="bulk-import-json"
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            placeholder={t("team.import.placeholder")}
            aria-describedby={error ? "bulk-import-error" : undefined}
            aria-invalid={error ? true : undefined}
            className="w-full h-64 bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="bulk-import-error"
            role="alert"
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg font-semibold transition-colors"
          >
            {t("player.cancel")}
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !jsonText.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-indigo-500/50"
          >
            {isImporting
              ? t("team.import.importing")
              : t("player.import.button")}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}
