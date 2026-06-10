/**
 * @module TacticsRightSidebar
 * @description 撮影モード専用の右サイドバー。
 * フォーメーション切替と全フェーズの戦術一覧・実行・リセットを提供する。
 *
 * 使用するContext:
 * - TacticsUIContext: 右サイドバー開閉状態・キャプチャモード
 * - TacticsTeamContext: フォーメーション管理
 * - TacticsExecutionContext: 戦術実行・リセット
 */
import { memo, useMemo } from "react";
import { useTacticsUI } from "@presentation/contexts/TacticsUIContext";
import { useTacticsExecution } from "@presentation/contexts/TacticsExecutionContext";
import { useTacticsTeam } from "@presentation/contexts/TacticsTeamContext";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { useAllTactics } from "@presentation/hooks/queries";
import { PHASE_CONFIG } from "@shared/constants/phases";
import { getFormationOptionsWithDefault } from "@shared/constants/formations";
import type { Tactic } from "@domain/entities/Tactic";

const SECTION_CLASS =
  "mx-2.5 mt-2 rounded-[18px] border border-slate-700/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.26)_100%)] shadow-[0_8px_20px_rgba(2,6,23,0.16)] ring-1 ring-white/5";
const SECTION_HEADER_CLASS =
  "text-[10px] text-slate-300/90 mb-1.5 font-bold tracking-[0.22em] uppercase flex items-center gap-1.5";

/** フェーズ表示順（PhaseType の表示優先度） */
const PHASE_ORDER = [
  "attack",
  "defense",
  "positive_transition",
  "negative_transition",
  "set_piece",
  "throw_in",
  "goal_kick",
] as const;

/** 全戦術をフェーズ別にグループ化して返す */
function groupByPhase(tactics: Tactic[]): Map<string, Tactic[]> {
  const groups = new Map<string, Tactic[]>();
  for (const phase of PHASE_ORDER) {
    const list = tactics.filter((t) => t.phase.value === phase);
    if (list.length > 0) groups.set(phase, list);
  }
  // PHASE_ORDER に含まれない未知フェーズも末尾に追加
  for (const tactic of tactics) {
    const phase = tactic.phase.value;
    if (!PHASE_ORDER.includes(phase as (typeof PHASE_ORDER)[number])) {
      if (!groups.has(phase)) groups.set(phase, []);
      groups.get(phase)!.push(tactic);
    }
  }
  return groups;
}

export const TacticsRightSidebar = memo(function TacticsRightSidebar() {
  const { ui } = useTacticsUI();
  const { tOrch, playModePhase, lineupAnimation } = useTacticsExecution();
  const { gameMode } = playModePhase;
  const { formationMgmt, selectedTeam } = useTacticsTeam();
  const { t, tDynamic, language } = useLanguage();
  const { data: allTactics } = useAllTactics();

  const { gameModeFormations, currentFormationId, changeFormation } =
    formationMgmt;

  // チームが選択可能なフォーメーションのみ、team.availableFormations の登録順で表示
  const availableFormations = useMemo(() => {
    const orderedIds = getFormationOptionsWithDefault(
      selectedTeam?.availableFormations ?? [],
      gameMode,
    );
    const formationMap = new Map(
      gameModeFormations.map((f) => [f.id.value, f]),
    );
    return orderedIds.flatMap((id) => {
      const f = formationMap.get(id);
      return f ? [f] : [];
    });
  }, [gameModeFormations, selectedTeam, gameMode]);

  // 選択フォーメーションの全フェーズ戦術をフェーズ別に整理
  const tacticsByPhase = useMemo(() => {
    if (!allTactics || !currentFormationId) return new Map<string, Tactic[]>();
    const filtered = allTactics.filter((tactic) =>
      tactic.supportsFormation(currentFormationId),
    );
    return groupByPhase(filtered);
  }, [allTactics, currentFormationId]);

  // 撮影モード以外では描画しない（Hooks はこの行より前に呼ぶ）
  if (!ui.captureMode) return null;

  const isDisabled = tOrch.isExecuting;

  return (
    <>
      {/* トグルボタン */}
      <button
        onClick={ui.toggleRightSidebar}
        aria-label={
          ui.rightSidebarOpen ? t("a11y.closeSidebar") : t("a11y.openSidebar")
        }
        aria-expanded={ui.rightSidebarOpen}
        className={`fixed z-40 ${
          ui.rightSidebarOpen ? "top-2" : "top-auto bottom-4 sm:bottom-6"
        } w-7 sm:w-8 h-9 sm:h-10 bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] backdrop-blur-xl border border-slate-600/45 rounded-l-2xl flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500/60 transition-all duration-300 ease-in-out shadow-[0_8px_18px_rgba(2,6,23,0.14),0_2px_4px_rgba(2,6,23,0.08)] ring-1 ring-white/5 ${
          ui.rightSidebarOpen ? "right-60 xl:right-72" : "right-0"
        } ${isDisabled ? "opacity-0 pointer-events-none" : ""}`}
        style={lineupAnimation.isActive ? { display: "none" } : undefined}
      >
        <span className="text-xs" aria-hidden="true">
          {ui.rightSidebarOpen ? "▶" : "◀"}
        </span>
      </button>

      {/* 右サイドバーパネル */}
      <aside
        aria-label={t("a11y.tacticSelector")}
        className={`right-sidebar-panel custom-scrollbar ${
          ui.rightSidebarOpen ? "sidebar-open" : "sidebar-closed"
        } ${ui.rightSidebarAnimating ? "sidebar-animating" : ""} transition-opacity duration-300 ${
          isDisabled ? "opacity-0 pointer-events-none" : ""
        }`}
        onTransitionEnd={() => ui.setRightSidebarAnimating(false)}
        style={lineupAnimation.isActive ? { display: "none" } : undefined}
      >
        <div className="pt-2 pb-3">
          {/* ── リセット ── */}
          <div className="mx-2.5 mt-0 rounded-[18px] border border-slate-700/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.26)_100%)] shadow-[0_8px_20px_rgba(2,6,23,0.16)] ring-1 ring-white/5">
            <div className="px-2.5 pt-2.5 pb-2.5">
              <button
                onClick={playModePhase.handleResetState}
                disabled={isDisabled}
                className="w-full rounded-xl border border-slate-700/35 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:bg-white/[0.07] hover:text-white py-1 flex items-center justify-center gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-sm">🔄</span>
                <span className="tracking-wide">{t("tactics.reset")}</span>
              </button>
            </div>
          </div>

          {/* ── フォーメーション選択 ── */}
          {availableFormations.length > 0 && (
            <div className={SECTION_CLASS}>
              <div className="px-2.5 pt-2.5">
                <div className={SECTION_HEADER_CLASS}>
                  <span className="w-1 h-3 bg-emerald-500 rounded-full" />
                  Formation
                </div>
              </div>
              <div className="px-2.5 pb-2.5">
                <div className="flex flex-wrap gap-1">
                  {availableFormations.map((formation) => (
                    <button
                      key={formation.id.value}
                      onClick={() => changeFormation(formation.id.value)}
                      disabled={isDisabled}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                        formation.id.value === currentFormationId
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                          : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 border border-slate-700/35"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {formation.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── 戦術一覧（フェーズ別） ── */}
          <div className={SECTION_CLASS}>
            <div className="px-2.5 pt-2.5">
              <div className={SECTION_HEADER_CLASS}>
                <span className="w-1 h-3 bg-purple-500 rounded-full" />
                Tactics
              </div>
            </div>
            <div className="px-2.5 pb-2.5">
              {!allTactics ? (
                <div className="text-slate-400 text-sm text-center py-8 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-[3px] border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                  <span className="font-light text-xs">Loading...</span>
                </div>
              ) : tacticsByPhase.size === 0 ? (
                <div className="text-slate-500 text-sm text-center py-8 flex flex-col items-center gap-3">
                  <span className="text-2xl opacity-50">🚫</span>
                  <span className="font-light text-xs">
                    {t("tactics.noMatchingTactics")}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(tacticsByPhase.entries()).map(
                    ([phase, tactics]) => {
                      const cfg =
                        PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
                      return (
                        <div key={phase}>
                          {/* フェーズヘッダー */}
                          <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                            <span className="text-[11px]">
                              {cfg?.icon ?? "📋"}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {cfg ? tDynamic(cfg.nameKey) : phase}
                            </span>
                          </div>
                          {/* フェーズ内の戦術ボタン */}
                          <div className="space-y-1">
                            {tactics.map((tactic) => (
                              <button
                                key={tactic.id.value}
                                onClick={() =>
                                  tOrch.triggerTactic(tactic.id.value)
                                }
                                disabled={isDisabled}
                                className={`w-full py-1.5 px-2.5 rounded-xl text-left transition-all duration-300 ${
                                  tOrch.activeTacticId === tactic.id.value
                                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.01]"
                                    : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:scale-[1.005] border border-slate-700/35"
                                } ${
                                  isDisabled &&
                                  tOrch.activeTacticId !== tactic.id.value
                                    ? "opacity-40 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm shrink-0">
                                    {tactic.icon}
                                  </span>
                                  <span className="text-xs font-medium tracking-wide truncate">
                                    {tactic.isCustom
                                      ? tactic.getDisplayName(language)
                                      : tDynamic(
                                          `tactics.name.${tactic.id.value}`,
                                        )}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});
