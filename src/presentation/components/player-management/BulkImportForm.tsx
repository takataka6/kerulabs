/**
 * @module BulkImportForm
 * @description 選手データの一括インポートフォームコンポーネント。JSON/CSVからの選手データ読み込みとバリデーションを行う。
 */
import { useState } from "react";
import type { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import type { PositionCategory } from "@domain/types";
import type { PlayerStatus } from "@shared/types/PlayerStatus";
import type { TranslationFn } from "@shared/i18n/translations";
import { handleError } from "@shared/errors";
import { isValidPlayerNumber } from "@shared/utils";
import { getLogger } from "@shared/logger";
import { useToast, useConfirm } from "@presentation/components/ui";
import { POSITION_CONFIG, playerBulkImportSchema } from "./constants";

const PLAYER_TYPE_DEFINITION = `type PlayerImportData = {
  name: string;
  number: number;  // 0–99
  position?: "gk" | "df" | "mf" | "fw";
  nationality?: string;
  club?: string;
  leagueCountry?: string;
  note?: string;
  status?: "available" | "suspended" | "injured";
}
// Input: PlayerImportData[]`;

interface BulkImportFormProps {
  team: Team;
  onUpdateTeam: (team: Team) => void;
  onClose: () => void;
  t: TranslationFn;
}

/** ポジション文字列を PositionCategory に変換。不明なら null を返す */
function parsePosition(
  positionStr: string,
): { position: PositionCategory } | null {
  if (positionStr === "gk" || positionStr === "goalkeeper") {
    return { position: "gk" };
  }
  if (positionStr === "df" || positionStr === "defender") {
    return { position: "df" };
  }
  if (positionStr === "mf" || positionStr === "midfielder") {
    return { position: "mf" };
  }
  if (
    positionStr === "fw" ||
    positionStr === "forward" ||
    positionStr === "striker"
  ) {
    return { position: "fw" };
  }
  return null;
}

interface PlayerToAdd {
  name: string;
  number: number;
  position: PositionCategory;
  nationality?: string;
  club?: string;
  leagueCountry?: string;
  note?: string;
  status?: PlayerStatus;
}

/** JSON 形式のテキストを解析して選手リストを返す */
function parseJsonImport(
  text: string,
  existingNumbers: Set<number>,
  t: TranslationFn,
): { players: PlayerToAdd[]; errors: string[] } {
  const errors: string[] = [];
  const players: PlayerToAdd[] = [];

  try {
    const raw = JSON.parse(text);
    const dataArray = playerBulkImportSchema.parse(
      Array.isArray(raw) ? raw : [raw],
    );

    dataArray.forEach((item, index) => {
      const number = item.number;
      const positionStr = item.position?.toLowerCase() || "mf";

      if (!isValidPlayerNumber(number)) {
        errors.push(
          t("player.import.rowNumberRange")
            .replace("{row}", String(index + 1))
            .replace("{value}", String(item.number)),
        );
        return;
      }

      if (
        existingNumbers.has(number) ||
        players.some((p) => p.number === number)
      ) {
        errors.push(
          t("player.import.rowNumberInUse")
            .replace("{row}", String(index + 1))
            .replace("{number}", String(number)),
        );
        return;
      }

      const parsed = parsePosition(positionStr);
      if (!parsed && item.position) {
        errors.push(
          t("player.import.rowInvalidPosition")
            .replace("{row}", String(index + 1))
            .replace("{position}", positionStr),
        );
        return;
      }

      players.push({
        name: item.name,
        number,
        position: parsed?.position ?? "mf",
        nationality: item.nationality,
        club: item.club,
        leagueCountry: item.leagueCountry,
        note: item.note,
        status: item.status as PlayerStatus | undefined,
      });
    });
  } catch {
    return {
      players: [],
      errors: [t("player.import.invalidJson")],
    };
  }

  return { players, errors };
}

/** CSV / TSV / スペース区切り形式のテキストを解析 */
function parseCsvImport(
  text: string,
  existingNumbers: Set<number>,
  t: TranslationFn,
): { players: PlayerToAdd[]; errors: string[] } {
  const errors: string[] = [];
  const players: PlayerToAdd[] = [];
  const lines = text.split("\n");

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const parts = trimmedLine.includes(",")
      ? trimmedLine.split(",").map((p) => p.trim())
      : trimmedLine.includes("\t")
        ? trimmedLine.split("\t").map((p) => p.trim())
        : trimmedLine.split(/\s+/);

    if (parts.length < 2) {
      errors.push(
        t("player.import.lineNameNumberRequired").replace(
          "{line}",
          String(index + 1),
        ),
      );
      return;
    }

    const name = parts[0];
    const numberStr = parts[1];
    const positionStr = parts[2]?.toLowerCase() || "mf";

    const number = parseInt(numberStr, 10);
    if (!isValidPlayerNumber(number)) {
      errors.push(
        t("player.import.lineNumberRange")
          .replace("{line}", String(index + 1))
          .replace("{value}", numberStr),
      );
      return;
    }

    if (
      existingNumbers.has(number) ||
      players.some((p) => p.number === number)
    ) {
      errors.push(
        t("player.import.lineNumberInUse")
          .replace("{line}", String(index + 1))
          .replace("{number}", String(number)),
      );
      return;
    }

    const parsed = parsePosition(positionStr);
    if (!parsed && parts.length > 2) {
      errors.push(
        t("player.import.lineInvalidPosition")
          .replace("{line}", String(index + 1))
          .replace("{position}", positionStr),
      );
      return;
    }

    players.push({ name, number, position: parsed?.position ?? "mf" });
  });

  return { players, errors };
}

export function BulkImportForm({
  team,
  onUpdateTeam,
  onClose,
  t,
}: BulkImportFormProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [bulkImportText, setBulkImportText] = useState("");
  const [copiedAi, setCopiedAi] = useState(false);

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) {
      showToast(t("player.import.noData"), "error");
      return;
    }

    const trimmedText = bulkImportText.trim();
    const existingNumbers = new Set(team.players.map((p) => p.number));

    const isJson = trimmedText.startsWith("[") || trimmedText.startsWith("{");
    const { players: playersToAdd, errors } = isJson
      ? parseJsonImport(trimmedText, existingNumbers, t)
      : parseCsvImport(trimmedText, existingNumbers, t);

    if (errors.length > 0) {
      const isInvalidJson =
        errors.length === 1 && errors[0] === t("player.import.invalidJson");
      showToast(
        isInvalidJson
          ? errors[0]
          : `${t("player.import.error")}: ${errors[0]}${errors.length > 1 ? ` (${t("player.import.moreErrors").replace("{count}", String(errors.length - 1))})` : ""}`,
        "error",
      );
      return;
    }

    if (playersToAdd.length === 0) {
      showToast(t("player.import.noPlayers"), "error");
      return;
    }

    const preview = playersToAdd
      .slice(0, 5)
      .map(
        (p) => `${p.name} (${p.number}) - ${POSITION_CONFIG[p.position].label}`,
      )
      .join("\n");
    const moreNote =
      playersToAdd.length > 5
        ? `\n... ${t("player.import.morePlayersNote").replace("{count}", String(playersToAdd.length - 5))}`
        : "";
    const confirmMessage = `${t("player.import.confirm").replace("{count}", String(playersToAdd.length))}\n\n${preview}${moreNote}`;

    if (!(await confirm({ message: confirmMessage }))) {
      return;
    }

    try {
      playersToAdd.forEach(
        ({
          name,
          number,
          position,
          nationality,
          club,
          leagueCountry,
          note,
          status,
        }) => {
          const newPlayer = Player.create({
            name,
            number,
            teamId: team.id,
            position,
            nationality,
            club,
            leagueCountry,
            note,
            status,
          });
          team.addPlayer(newPlayer);
        },
      );

      onUpdateTeam(team);
      showToast(
        t("player.import.success").replace(
          "{count}",
          String(playersToAdd.length),
        ),
        "success",
      );
      onClose();
    } catch (error) {
      handleError(error, "ui", "Failed to bulk import players", {
        toast: {
          show: showToast,
          message:
            error instanceof Error ? error.message : t("player.import.failed"),
        },
      });
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden mb-5">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-[10px] text-slate-200 font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="w-1 h-4 bg-violet-500 rounded-full"></span>
          <span>{t("player.import.title")}</span>
        </h3>
      </div>
      <div className="p-4">
        {/* AI Prompt Section */}
        <div className="mb-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
          <h4 className="text-violet-300 font-semibold text-sm mb-2">
            🤖 {t("import.ai.title")}
          </h4>
          <p className="text-slate-300 text-xs mb-2">
            {t("import.ai.description")}
          </p>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {t("import.ai.typeTitle")}
          </p>
          <pre className="bg-slate-950 text-violet-300 p-3 rounded-xl text-xs overflow-x-auto border border-violet-500/20 mb-2">
            {PLAYER_TYPE_DEFINITION}
          </pre>
          <button
            type="button"
            onClick={() => {
              const prompt =
                t("import.ai.promptPrefix") +
                PLAYER_TYPE_DEFINITION +
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
            className="w-full px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 hover:text-violet-200 rounded-xl text-xs font-medium transition-colors"
          >
            {copiedAi ? "✓" : "📋"}{" "}
            {copiedAi ? t("import.ai.copied") : t("import.ai.copyPrompt")}
          </button>
        </div>

        <div className="mb-4">
          <div className="text-slate-400 text-xs mb-3 space-y-1">
            <p className="font-bold text-slate-300">
              {t("player.import.csvFormat")}
            </p>
            <p>• {t("player.import.csvInstruction1")}</p>
            <p>
              • {t("player.import.csvInstruction2")}{" "}
              <code className="bg-slate-900 px-1 py-0.5 rounded-md">
                {t("player.import.csvFormatExample")}
              </code>
            </p>
            <p>• {t("player.import.csvPositionNote")}</p>
            <p className="text-slate-400 mt-2">
              {t("player.import.csvExample")}
            </p>
            <code className="bg-slate-950 px-3 py-2 rounded-xl block text-green-400 mb-3 border border-slate-700/50">
              Player A,1,gk
              <br />
              Player B,2,df
            </code>

            <p className="font-bold text-slate-300 mt-3">
              {t("player.import.jsonFormat")}
            </p>
            <p>• {t("player.import.jsonInstruction")}</p>
            <p>• {t("player.import.jsonFields")}</p>
            <p className="text-slate-400 mt-2">
              {t("player.import.jsonExample")}
            </p>
            <code className="bg-slate-950 px-3 py-2 rounded-xl block text-green-400 border border-slate-700/50">
              [<br />
              &nbsp;&nbsp;&#123;&quot;name&quot;: &quot;Player A&quot;,
              &quot;number&quot;: 1, &quot;position&quot;: &quot;gk&quot;&#125;,
              <br />
              &nbsp;&nbsp;&#123;&quot;name&quot;: &quot;Player B&quot;,
              &quot;number&quot;: 2, &quot;position&quot;: &quot;df&quot;&#125;
              <br />]
            </code>
          </div>
          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder="Player A,1,gk&#10;Player B,2,df&#10;Player C,3,mf&#10;Player D,10,fw"
            rows={10}
            aria-label={t("player.import.dataLabel")}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors font-mono text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkImport}
            className="flex-1 py-2.5 bg-violet-600/80 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
          >
            {t("player.import.button")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700/60"
          >
            {t("player.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
