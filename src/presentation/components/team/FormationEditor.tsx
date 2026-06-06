/**
 * @module FormationEditor
 * @description フォーメーション編集モーダルコンポーネント。ポジション配置のドラッグ編集・保存・削除を行う。
 */
import { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useClickOutside } from "@presentation/hooks/ui";
import { Team } from "@domain/entities/Team";
import { Tactic } from "@domain/entities/Tactic";
import type { Formation } from "@domain/entities/Formation";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { AccessibleModal } from "@presentation/components/ui";
import {
  FORMATION_OPTIONS,
  ensureFormationDefaultForGameMode,
  getFormationOptions,
  getFormationOptionsWithDefault,
  getFormationNameById,
  normalizeFormationKey,
} from "@shared/constants/formations";
import type { GameMode } from "@shared/types/GameMode";
import { PHASE_CONFIG } from "@shared/constants/phases";
import { getContainer } from "@application/ServiceContainer";
import { handleError } from "@shared/errors/handleError";
import { z } from "zod";

const formationSettingsSchema = z.object({
  availableFormations: z.array(z.string()).min(1),
  defaultFormation: z.string().optional(),
  availableTactics: z.record(z.string(), z.array(z.string())).optional(),
});

const PHASE_ORDER = [
  "attack",
  "defense",
  "positive_transition",
  "negative_transition",
] as const;

interface FormationEditorProps {
  team: Team;
  allTactics: Tactic[];
  formations?: Formation[];
  onUpdateTeam: (team: Team) => void;
  onClose: () => void;
  gameMode?: GameMode;
}

export const FormationEditor = memo(function FormationEditor({
  team,
  allTactics,
  formations = [],
  onUpdateTeam,
  onClose,
  gameMode = "football",
}: FormationEditorProps) {
  const { t, tDynamic, language } = useLanguage();
  const formationOptions = useMemo(
    () => getFormationOptions(gameMode),
    [gameMode],
  );
  const initialSelectedFormations = useMemo(
    () => ensureFormationDefaultForGameMode(team.availableFormations, gameMode),
    [team.availableFormations, gameMode],
  );
  const initialModeFormations = useMemo(
    () => getFormationOptionsWithDefault(team.availableFormations, gameMode),
    [team.availableFormations, gameMode],
  );
  const initialDefaultFormation =
    team.defaultFormation &&
    initialModeFormations.includes(team.defaultFormation)
      ? team.defaultFormation
      : initialModeFormations[0];
  const [selectedFormations, setSelectedFormations] = useState<string[]>(
    initialSelectedFormations,
  );
  const [defaultFormation, setDefaultFormation] = useState<string>(
    initialDefaultFormation,
  );
  const [activeTab, setActiveTab] = useState<"formations" | "tactics">(
    "formations",
  );
  const [editingFormation, setEditingFormation] = useState<string>(
    initialDefaultFormation,
  );
  const [localAvailableTactics, setLocalAvailableTactics] = useState<
    Record<string, string[]>
  >(
    team.availableTactics
      ? (structuredClone(team.availableTactics) as Record<string, string[]>)
      : {},
  );
  const [showImportArea, setShowImportArea] = useState(false);
  const [importText, setImportText] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 通知を一定時間後に消す
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useClickOutside(panelRef, onClose);

  const getFormationId = useCallback(
    (formationKey: string) =>
      formations.find(
        (formation) =>
          formation.id.value === formationKey ||
          formation.name === formationKey,
      )?.id.value ?? normalizeFormationKey(formationKey),
    [formations],
  );

  const handleFormationToggle = (formation: string) => {
    if (selectedFormations.includes(formation)) {
      if (selectedFormations.length <= 1) return;
      const newFormations = selectedFormations.filter((f) => f !== formation);
      setSelectedFormations(newFormations);
      if (formation === defaultFormation) {
        setDefaultFormation(newFormations[0]);
      }
    } else {
      setSelectedFormations([...selectedFormations, formation]);
    }
  };

  // 編集中フォーメーションで利用可能な戦術（フェーズごとにグループ化）
  const tacticsForEditingFormation = useMemo(() => {
    const formationId = getFormationId(editingFormation);
    return allTactics.filter((t) => t.supportsFormation(formationId));
  }, [allTactics, editingFormation, getFormationId]);

  const tacticsByPhase = useMemo(() => {
    const grouped: Record<string, Tactic[]> = {};
    for (const tactic of tacticsForEditingFormation) {
      const phase = tactic.phase.value;
      if (!grouped[phase]) grouped[phase] = [];
      grouped[phase].push(tactic);
    }
    return grouped;
  }, [tacticsForEditingFormation]);

  // 戦術が有効かどうか
  const isTacticEnabled = (tacticId: string): boolean => {
    const whitelist = localAvailableTactics[getFormationId(editingFormation)];
    if (!whitelist || whitelist.length === 0) return true;
    return whitelist.includes(tacticId);
  };

  // 全戦術モードかどうか
  const isAllMode = (formationName: string): boolean => {
    const whitelist = localAvailableTactics[getFormationId(formationName)];
    return !whitelist || whitelist.length === 0;
  };

  // 選択中の戦術数
  const selectedTacticCount = useMemo(() => {
    const whitelist = localAvailableTactics[getFormationId(editingFormation)];
    if (!whitelist || whitelist.length === 0)
      return tacticsForEditingFormation.length;
    return whitelist.length;
  }, [
    localAvailableTactics,
    editingFormation,
    tacticsForEditingFormation,
    getFormationId,
  ]);

  // 戦術のトグル
  const handleTacticToggle = (tacticId: string) => {
    setLocalAvailableTactics((prev) => {
      const next = { ...prev };
      const formationId = getFormationId(editingFormation);
      const currentList = next[formationId];

      if (!currentList || currentList.length === 0) {
        // 「全戦術」モードから明示モードに移行
        const allIds = tacticsForEditingFormation.map((t) => t.id.value);
        next[formationId] = allIds.filter((id) => id !== tacticId);
      } else if (currentList.includes(tacticId)) {
        next[formationId] = currentList.filter((id) => id !== tacticId);
      } else {
        next[formationId] = [...currentList, tacticId];
        if (next[formationId].length >= tacticsForEditingFormation.length) {
          delete next[formationId];
        }
      }
      return next;
    });
  };

  // フェーズ全選択
  const handleSelectAllPhase = (phase: string) => {
    setLocalAvailableTactics((prev) => {
      const next = { ...prev };
      const formationId = getFormationId(editingFormation);
      const currentList = next[formationId];

      if (!currentList || currentList.length === 0) {
        return prev; // 既に全選択
      }

      const phaseIds = (tacticsByPhase[phase] || []).map((t) => t.id.value);
      const merged = [...new Set([...currentList, ...phaseIds])];

      if (merged.length >= tacticsForEditingFormation.length) {
        delete next[formationId];
      } else {
        next[formationId] = merged;
      }
      return next;
    });
  };

  // フェーズ全解除
  const handleDeselectAllPhase = (phase: string) => {
    setLocalAvailableTactics((prev) => {
      const next = { ...prev };
      const formationId = getFormationId(editingFormation);
      const currentList = next[formationId];
      const phaseIds = new Set(
        (tacticsByPhase[phase] || []).map((t) => t.id.value),
      );

      if (!currentList || currentList.length === 0) {
        const allIds = tacticsForEditingFormation.map((t) => t.id.value);
        next[formationId] = allIds.filter((id) => !phaseIds.has(id));
      } else {
        next[formationId] = currentList.filter((id) => !phaseIds.has(id));
      }
      return next;
    });
  };

  // エクスポートデータ生成
  const getExportData = useCallback(() => {
    const exportData = {
      availableFormations: selectedFormations,
      defaultFormation,
      availableTactics:
        Object.keys(localAvailableTactics).length > 0
          ? localAvailableTactics
          : undefined,
    };
    return JSON.stringify(exportData, null, 2);
  }, [selectedFormations, defaultFormation, localAvailableTactics]);

  // エクスポート: クリップボードにコピー
  const handleExportClipboard = useCallback(() => {
    const json = getExportData();
    navigator.clipboard
      .writeText(json)
      .then(() => {
        setNotification({
          type: "success",
          message: t("tactics.editFormations.exportSuccess"),
        });
      })
      .catch(() => {
        setImportText(json);
        setShowImportArea(true);
      });
  }, [getExportData, t]);

  // エクスポート: ファイルダウンロード
  const handleExportFile = useCallback(() => {
    const json = getExportData();
    const teamSlug = team.name.replace(/\s+/g, "_").toLowerCase();
    getContainer().fileService.downloadJson(
      json,
      `formation-config_${teamSlug}.json`,
    );
    setNotification({
      type: "success",
      message: t("tactics.editFormations.exportFileSuccess"),
    });
  }, [getExportData, team.name, t]);

  // インポート: JSONテキストから設定を読み込み
  const handleImport = useCallback(
    (jsonString: string) => {
      try {
        const data = formationSettingsSchema.parse(JSON.parse(jsonString));

        // バリデーション: フォーメーション名が有効か確認（全モードの選択肢を許容）
        const allOptions = new Set<string>([
          ...FORMATION_OPTIONS,
          ...getFormationOptions("futsal"),
          ...getFormationOptions("eight_aside"),
          ...getFormationOptions("society"),
        ]);
        const validFormations = [
          ...new Set(
            data.availableFormations
              .map((f: string) => normalizeFormationKey(f))
              .filter((f: string) =>
                allOptions.has(getFormationNameById(f) ?? f),
              ),
          ),
        ];
        if (validFormations.length === 0) {
          throw new Error("No valid formations found");
        }

        setSelectedFormations(validFormations);

        // デフォルトフォーメーション
        if (
          data.defaultFormation &&
          validFormations.includes(data.defaultFormation)
        ) {
          setDefaultFormation(data.defaultFormation);
        } else {
          setDefaultFormation(validFormations[0]);
        }

        // 戦術設定
        setLocalAvailableTactics(data.availableTactics ?? {});

        // 編集フォーメーションもリセット
        setEditingFormation(
          data.defaultFormation &&
            validFormations.includes(data.defaultFormation)
            ? data.defaultFormation
            : validFormations[0],
        );

        setShowImportArea(false);
        setImportText("");
        setNotification({
          type: "success",
          message: t("tactics.editFormations.importSuccess"),
        });
      } catch (error) {
        handleError(error, "validation", "Failed to import formation settings");
        setNotification({
          type: "error",
          message: t("tactics.editFormations.importError"),
        });
      }
    },
    [t],
  );

  // ファイルからインポート
  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleImport(text);
      };
      reader.readAsText(file);
      // inputをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleImport],
  );

  const handleSave = () => {
    team.updateFormations(selectedFormations, defaultFormation);
    team.updateAvailableTactics(localAvailableTactics);
    onUpdateTeam(team);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="formation-editor-title"
      overlayClassName="fixed inset-0 z-50"
      className="fixed top-16 right-4 xl:right-6 w-72 xl:w-80 max-h-[80vh] bg-slate-900 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col"
    >
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between shrink-0">
        <div
          id="formation-editor-title"
          className="text-xs text-slate-300 font-bold tracking-widest uppercase flex items-center gap-2"
        >
          <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
          {t("tactics.editFormations.title")}
        </div>
        <button
          onClick={onClose}
          aria-label={t("a11y.closePanel")}
          className="text-slate-400 hover:text-white transition-all duration-300 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* タブ */}
      <div className="flex border-b border-slate-700/50 shrink-0">
        <button
          onClick={() => setActiveTab("formations")}
          className={`flex-1 py-2 text-xs font-bold tracking-wide transition-colors ${
            activeTab === "formations"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tactics.editFormations.tabFormations")}
        </button>
        <button
          onClick={() => setActiveTab("tactics")}
          className={`flex-1 py-2 text-xs font-bold tracking-wide transition-colors ${
            activeTab === "tactics"
              ? "text-orange-400 border-b-2 border-orange-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tactics.editFormations.tabTactics")}
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "formations" && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {formationOptions.map((formation) => {
                const formationId = normalizeFormationKey(formation);
                const isSelected = selectedFormations.includes(formationId);
                const isLastOne = isSelected && selectedFormations.length <= 1;
                return (
                  <button
                    key={formation}
                    onClick={() => handleFormationToggle(formationId)}
                    disabled={isLastOne}
                    className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/30"
                    } ${isLastOne ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {formation}
                  </button>
                );
              })}
            </div>

            {selectedFormations.length > 1 && (
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">
                  {t("tactics.editFormations.default")}
                </label>
                <select
                  value={defaultFormation}
                  onChange={(e) => setDefaultFormation(e.target.value)}
                  aria-label={t("tactics.editFormations.default")}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {selectedFormations.map((f) => (
                    <option key={f} value={f}>
                      {getFormationNameById(f) ?? f}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {activeTab === "tactics" && (
          <div className="p-3 space-y-3">
            {/* 対象フォーメーション選択 */}
            <div>
              <label className="block text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase">
                {t("tactics.editFormations.targetFormation")}
              </label>
              <select
                value={editingFormation}
                onChange={(e) => setEditingFormation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-orange-500"
              >
                {selectedFormations.map((f) => (
                  <option key={f} value={f}>
                    {getFormationNameById(f) ?? f}
                  </option>
                ))}
              </select>
            </div>

            {/* 状態表示 */}
            <div
              className={`text-xs px-2 py-1 rounded-lg ${
                isAllMode(editingFormation)
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-orange-400 bg-orange-500/10"
              }`}
            >
              {isAllMode(editingFormation)
                ? `✓ ${t("tactics.editFormations.allTactics")}`
                : `${selectedTacticCount}/${tacticsForEditingFormation.length} ${t("tactics.editFormations.tacticsSelected")}`}
            </div>

            {/* フェーズごとの戦術リスト */}
            {PHASE_ORDER.map((phase) => {
              const phaseTactics = tacticsByPhase[phase];
              if (!phaseTactics || phaseTactics.length === 0) return null;
              const phaseConfig =
                PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];

              return (
                <div key={phase}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                      {phaseConfig?.icon} {tDynamic(`phase.${phase}`)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSelectAllPhase(phase)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {t("tactics.editFormations.selectAll")}
                      </button>
                      <span className="text-slate-600 text-[10px]">|</span>
                      <button
                        onClick={() => handleDeselectAllPhase(phase)}
                        className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
                      >
                        {t("tactics.editFormations.deselectAll")}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {phaseTactics.map((tactic) => {
                      const enabled = isTacticEnabled(tactic.id.value);
                      return (
                        <label
                          key={tactic.id.value}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                            enabled
                              ? "hover:bg-slate-800/50"
                              : "hover:bg-slate-800/30 opacity-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => handleTacticToggle(tactic.id.value)}
                            className="w-3.5 h-3.5 rounded border-slate-600 text-blue-500 bg-slate-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-xs">{tactic.icon}</span>
                          <span className="text-xs text-slate-300 truncate">
                            {tactic.isCustom
                              ? tactic.getDisplayName(language)
                              : tDynamic(`tactics.name.${tactic.id.value}`)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 通知 */}
      {notification && (
        <div
          className={`mx-3 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
            notification.type === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* インポートエリア */}
      {showImportArea && (
        <div className="px-3 pt-2 space-y-2 shrink-0">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"availableFormations": ["4-3-3"], ...}'
            className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-orange-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleImport(importText)}
              disabled={!importText.trim()}
              className="flex-1 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all"
            >
              {t("tactics.editFormations.import")}
            </button>
            <button
              onClick={() => {
                setShowImportArea(false);
                setImportText("");
              }}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-700/50"
            >
              {t("tactics.squadBuilder.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* ボタンエリア */}
      <div className="p-3 border-t border-slate-700/50 shrink-0 space-y-2">
        {/* エクスポート */}
        <div className="flex gap-1.5">
          <button
            onClick={handleExportFile}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-all border border-slate-700/50 flex items-center justify-center gap-1"
            title={t("tactics.editFormations.exportFile")}
          >
            <span className="text-xs">💾</span>
            {t("tactics.editFormations.exportFile")}
          </button>
          <button
            onClick={handleExportClipboard}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-all border border-slate-700/50 flex items-center justify-center gap-1"
            title={t("tactics.editFormations.export")}
          >
            <span className="text-xs">📋</span>
            {t("tactics.editFormations.export")}
          </button>
        </div>

        {/* インポート */}
        <div className="flex gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-all border border-slate-700/50 flex items-center justify-center gap-1"
            title={t("tactics.editFormations.importFile")}
          >
            <span className="text-xs">📂</span>
            {t("tactics.editFormations.importFile")}
          </button>
          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-all border border-slate-700/50 flex items-center justify-center gap-1"
            title={t("tactics.editFormations.importText")}
          >
            <span className="text-xs">📝</span>
            {t("tactics.editFormations.importText")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg"
        >
          {t("tactics.squadBuilder.save")}
        </button>
      </div>
    </AccessibleModal>
  );
});
