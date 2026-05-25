/**
 * @module TacticImportModal
 * @description 戦術データのJSONインポート用モーダルコンポーネント。ファイル読み込みとテキスト入力に対応。
 */
import { useState } from "react";
import { AccessibleModal } from "@presentation/components/ui";
import { getContainer } from "@application/ServiceContainer";
import { getLogger } from "@shared/logger";
import type { TranslationFn } from "@shared/i18n/translations";
import type { GameMode } from "@shared/types/GameMode";

interface TacticImportModalProps {
  onImport: (json: string) => Promise<void>;
  onClose: () => void;
  t: TranslationFn;
  gameMode: GameMode;
}

const TYPE_DEFINITION_COMMON = `
type TacticExportData = {
  version: number;
  tactics: Array<{
    name: Record<string, string>; // e.g. { ja: "名前", en: "Name" }
    icon: string;
    phase: string;
    movements: Record<string, Array<{  // key = formation string
      role: string;       // role key listed above
      targetX: number;    // destination X
      targetZ: number;    // destination Z
      delay: number;      // milliseconds before moving (≥ 0, e.g. 0, 300, 600)
      arrowColor: string; // hex e.g. "#FF0000"
    }>>;
    ballPasses?: Record<string, Array<{
      startRole: string;
      endRole: string;
      delay: number;
      color: string;      // hex
      endX?: number; endZ?: number;
      startX?: number; startZ?: number;
      trajectoryType?: "low" | "high" | "curveLeft" | "curveRight";
    }>>;
    stepBoundaries?: number[]; // movement indices where a new step begins
  }>;
}`;

const FOOTBALL_TYPE_DEFINITION = `// ── Coordinate system (center = 0, 0) ──────────────────────────
// Football 11v11 : X ∈ [-5, +5],  Z ∈ [-6, +6]
// Own goal: Z = -6  /  Opponent goal: Z = +6
// Penalty area width ≈ X ±3.0 (real-scale ratio)
//
// ── Available roles per formation ───────────────────────────────
// "4-3-3"   : GK  WDL CDL CDR WDR  PV  BBL BBR  WAL CF  WAR
// "4-4-2"   : GK  WDL CDL CDR WDR  WAL BBL BBR  WAR CF  SF
// "4-2-3-1" : GK  WDL CDL CDR WDR  PV  BBR WAL  PM  WAR CF
// "3-5-2"   : GK  CDL CDC CDR WDL  BBL PV  BBR  WDR CF  SF
// "5-3-2"   : GK  WDL CDL CDC CDR  WDR BBL PV   BBR CF  SF
// "3-4-2-1" : GK  CDL CDC CDR WML  BBL BBR WMR  WAL WAR CF
//
// ── Role key reference ───────────────────────────────────────────
// GK         : goalkeeper
// WDL / WDR  : left / right fullback
// CDL / CDR  : left / right center-back  |  CDC : center of 3-back
// PV         : defensive midfielder (pivot / volante)
// BBL / BBR  : left / right box-to-box midfielder
// PM         : playmaker (trequartista)
// WML / WMR  : left / right wide midfielder
// WAL / WAR  : left / right winger
// CF         : center forward  |  SF : second forward
//
// ── delay (milliseconds) ────────────────────────────────────────
// delay: 0   = moves immediately
// delay: 300 = starts 0.3 s after tactic triggers
// delay: 600 = starts 0.6 s after tactic triggers
// ────────────────────────────────────────────────────────────────
${TYPE_DEFINITION_COMMON}`;

const FUTSAL_TYPE_DEFINITION = `// ── Coordinate system (center = 0, 0) ──────────────────────────
// Futsal 5v5 : X ∈ [-4, +4],  Z ∈ [-3, +3]
// Own goal: Z = -3  /  Opponent goal: Z = +3
//
// ── Available formations & roles ────────────────────────────────
// All futsal formations use the same 5 roles:
// "2-2"   : GK  ALA_L ALA_R  FIXO  PIVOT
// "1-2-1" : GK  FIXO  ALA_L  ALA_R PIVOT
// "1-1-2" : GK  FIXO  PIVOT  ALA_L ALA_R
// "3-1"   : GK  ALA_L FIXO   ALA_R PIVOT
// "2-1-1" : GK  ALA_L ALA_R  FIXO  PIVOT
// "1-3"   : GK  FIXO  ALA_L  PIVOT ALA_R
//
// ── Role key reference ───────────────────────────────────────────
// GK    : goalkeeper
// FIXO  : defensive midfielder / fixed back
// ALA_L : left wing (ala esquerda)
// ALA_R : right wing (ala direita)
// PIVOT : striker / pivot (pivô)
//
// ── delay (milliseconds) ────────────────────────────────────────
// delay: 0   = moves immediately
// delay: 300 = starts 0.3 s after tactic triggers
// delay: 600 = starts 0.6 s after tactic triggers
// ────────────────────────────────────────────────────────────────
${TYPE_DEFINITION_COMMON}`;

const EIGHT_ASIDE_TYPE_DEFINITION = `// ── Coordinate system (center = 0, 0) ──────────────────────────
// Eight-aside 8v8 : X ∈ [-5, +5],  Z ∈ [-3.75, +3.75]
// Own goal: Z = -3.75  /  Opponent goal: Z = +3.75
//
// ── Available formations & roles ────────────────────────────────
// "2-3-2" : GK  CBL CBR  LM  CM  RM  LF  RF
// "3-3-1" : GK  CBL CM   CBR LM  RM  LF  RF
// "2-4-1" : GK  CBL CBR  LM  CM  RM  LF  RF
// "3-2-2" : GK  CBL CM   CBR LM  RM  LF  RF
// "2-2-3" : GK  CBL CBR  LM  RM  LF  CM  RF
//
// ── Role key reference ───────────────────────────────────────────
// GK  : goalkeeper
// CBL : left center-back
// CBR : right center-back
// LM  : left midfielder
// CM  : center midfielder
// RM  : right midfielder
// LF  : left forward
// RF  : right forward
//
// ── delay (milliseconds) ────────────────────────────────────────
// delay: 0   = moves immediately
// delay: 300 = starts 0.3 s after tactic triggers
// delay: 600 = starts 0.6 s after tactic triggers
// ────────────────────────────────────────────────────────────────
${TYPE_DEFINITION_COMMON}`;

const SOCIETY_TYPE_DEFINITION = `// ── Coordinate system (center = 0, 0) ──────────────────────────
// Society 7v7 : X ∈ [-4.5, +4.5],  Z ∈ [-2.75, +2.75]
// Own goal: Z = -2.75  /  Opponent goal: Z = +2.75
//
// ── Available formations & roles ────────────────────────────────
// "2-3-1" : GK  CBL CBR  LM  CM  RM  CF
// "3-2-1" : GK  CBL CM   CBR LM  RM  CF
// "2-2-2" : GK  CBL CBR  LM  RM  LF  CF
// "3-1-2" : GK  CBL CM   CBR LM  RM  CF
// "1-3-2" : GK  CBL LM   CM  RM  CF  LF
//
// ── Role key reference ───────────────────────────────────────────
// GK  : goalkeeper
// CBL : left center-back
// CBR : right center-back
// LM  : left midfielder
// CM  : center midfielder
// RM  : right midfielder
// LF  : left forward
// CF  : center forward
//
// ── delay (milliseconds) ────────────────────────────────────────
// delay: 0   = moves immediately
// delay: 300 = starts 0.3 s after tactic triggers
// delay: 600 = starts 0.6 s after tactic triggers
// ────────────────────────────────────────────────────────────────
${TYPE_DEFINITION_COMMON}`;

const TYPE_DEFINITIONS: Record<GameMode, string> = {
  football: FOOTBALL_TYPE_DEFINITION,
  futsal: FUTSAL_TYPE_DEFINITION,
  eight_aside: EIGHT_ASIDE_TYPE_DEFINITION,
  society: SOCIETY_TYPE_DEFINITION,
};

const FOOTBALL_EXAMPLE = JSON.stringify(
  {
    version: 1,
    tactics: [
      {
        name: { ja: "CB開き・ボランチ落ち", en: "CB Split + DM Drop" },
        icon: "🔻",
        phase: "attack",
        movements: {
          "4-3-3": [
            {
              role: "CDL",
              targetX: 3.5,
              targetZ: -3.8,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "CDR",
              targetX: -3.5,
              targetZ: -3.8,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "PV",
              targetX: 0,
              targetZ: -3.3,
              delay: 300,
              arrowColor: "#34D399",
            },
          ],
        },
      },
    ],
  },
  null,
  2,
);

const FUTSAL_EXAMPLE = JSON.stringify(
  {
    version: 1,
    tactics: [
      {
        name: { ja: "ピヴォ落ち・アラ開き", en: "Pivot Drop + Wing Spread" },
        icon: "🔽",
        phase: "attack",
        movements: {
          "1-2-1": [
            {
              role: "PIVOT",
              targetX: 0,
              targetZ: 0.5,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "ALA_L",
              targetX: 3.5,
              targetZ: 1.5,
              delay: 300,
              arrowColor: "#34D399",
            },
            {
              role: "ALA_R",
              targetX: -3.5,
              targetZ: 1.5,
              delay: 300,
              arrowColor: "#34D399",
            },
          ],
        },
      },
    ],
  },
  null,
  2,
);

const EIGHT_ASIDE_EXAMPLE = JSON.stringify(
  {
    version: 1,
    tactics: [
      {
        name: { ja: "CB開き・ビルドアップ", en: "CB Split Build Up" },
        icon: "⬆",
        phase: "attack",
        movements: {
          "2-3-2": [
            {
              role: "CBL",
              targetX: 3.5,
              targetZ: -2.5,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "CBR",
              targetX: -3.5,
              targetZ: -2.5,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "CM",
              targetX: 0,
              targetZ: -2.0,
              delay: 300,
              arrowColor: "#34D399",
            },
          ],
        },
      },
    ],
  },
  null,
  2,
);

const SOCIETY_EXAMPLE = JSON.stringify(
  {
    version: 1,
    tactics: [
      {
        name: { ja: "CB開き・CM落ち", en: "CB Split + CM Drop" },
        icon: "⬆",
        phase: "attack",
        movements: {
          "2-3-1": [
            {
              role: "CBL",
              targetX: 3.0,
              targetZ: -1.8,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "CBR",
              targetX: -3.0,
              targetZ: -1.8,
              delay: 0,
              arrowColor: "#60A5FA",
            },
            {
              role: "CM",
              targetX: 0,
              targetZ: -1.2,
              delay: 300,
              arrowColor: "#34D399",
            },
          ],
        },
      },
    ],
  },
  null,
  2,
);

const EXAMPLE_JSONS: Record<GameMode, string> = {
  football: FOOTBALL_EXAMPLE,
  futsal: FUTSAL_EXAMPLE,
  eight_aside: EIGHT_ASIDE_EXAMPLE,
  society: SOCIETY_EXAMPLE,
};

export function TacticImportModal({
  onImport,
  onClose,
  t,
  gameMode,
}: TacticImportModalProps) {
  const [json, setJson] = useState("");
  const [copiedExample, setCopiedExample] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeDefinition = TYPE_DEFINITIONS[gameMode];
  const exampleJSON = EXAMPLE_JSONS[gameMode];

  const handleImport = async () => {
    const trimmed = json.trim();
    if (!trimmed) return;

    try {
      JSON.parse(trimmed);
    } catch {
      setError(t("team.import.invalidJson"));
      return;
    }

    try {
      setError(null);
      setIsImporting(true);
      await onImport(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tactics.importError"));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="tactic-import-modal-title"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      <h2
        id="tactic-import-modal-title"
        className="text-2xl font-bold text-white mb-6"
      >
        {t("tactics.import.title")}
      </h2>

      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="text-blue-400 font-semibold mb-2">
          📝 {t("team.import.instructions")}
        </h3>
        <p className="text-slate-300 text-sm">
          {t("tactics.import.instructionDetail")}
        </p>
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
          {typeDefinition}
        </pre>
        <button
          type="button"
          onClick={() => {
            const prompt =
              t("import.ai.promptPrefix") +
              typeDefinition +
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
              {t("tactics.import.showExample")}
            </summary>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(exampleJSON).then(
                  () => {
                    setCopiedExample(true);
                    setTimeout(() => setCopiedExample(false), 2000);
                  },
                  () => {
                    getLogger().warn(
                      "ui",
                      "Clipboard write failed for tactic example",
                    );
                  },
                );
              }}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
            >
              {copiedExample ? "✓" : "📋"}{" "}
              {copiedExample
                ? t("tactics.import.copied")
                : t("tactics.import.copy")}
            </button>
          </div>
          <pre className="bg-slate-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto border border-slate-700">
            {exampleJSON}
          </pre>
        </details>
      </div>

      {/* JSON input */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="tactic-import-json"
          className="block text-sm font-semibold text-slate-300"
        >
          JSON
        </label>
        <button
          type="button"
          onClick={async () => {
            try {
              const content =
                await getContainer().fileService.openFilePicker(".json");
              setJson(content);
              setError(null);
            } catch {
              // ユーザーがキャンセルした場合は何もしない
            }
          }}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          {t("tactics.import.importFromFile")}
        </button>
      </div>
      <textarea
        id="tactic-import-json"
        value={json}
        onChange={(e) => {
          setJson(e.target.value);
          setError(null);
        }}
        rows={12}
        placeholder={t("tactics.import.placeholder")}
        aria-describedby={error ? "tactic-import-error" : undefined}
        aria-invalid={error ? true : undefined}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-purple-500 font-mono text-sm"
      />

      {error && (
        <div
          id="tactic-import-error"
          role="alert"
          className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={isImporting}
          aria-label={t("a11y.closeModal")}
          className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
        >
          {t("glossary.cancel")}
        </button>
        <button
          onClick={handleImport}
          disabled={isImporting || !json.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isImporting ? t("tactics.import.importing") : t("tactics.import")}
        </button>
      </div>
    </AccessibleModal>
  );
}
