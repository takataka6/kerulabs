/**
 * @module TeamSelectionScreen
 * @description チーム選択画面コンポーネント。登録済みチーム一覧からタクティクスビューアーで使用するチームを選択する。
 */
import { memo } from "react";
import type { Team } from "@domain/entities/Team";
import { getCountryInfo, IS_ELECTRON } from "@shared/constants";
import {
  TeamCreator,
  TeamEditor,
  BulkTeamImportModal,
} from "@presentation/components/team";
import { TacticsPageIcon } from "@presentation/components/ui";
import { getFormationNameById } from "@shared/constants/formations";
import type { TranslationFn, Language } from "./types";

interface TeamSelectionScreenProps {
  teams: Team[] | undefined;
  language: Language;
  showTeamCreator: boolean;
  showBulkTeamImport: boolean;
  onSelectTeam: (teamId: string) => void;
  onDeleteTeam: (
    teamId: string,
    teamName: string,
    event: React.MouseEvent,
  ) => void;
  onNavigateHome: () => void;
  onShowTeamCreator: () => void;
  onCloseTeamCreator: () => void;
  onShowBulkTeamImport: () => void;
  onCloseBulkTeamImport: () => void;
  onCreateTeam: (team: Team) => Promise<void>;
  onBulkImport: (jsonData: string) => Promise<void>;
  editingTeam?: Team;
  onEditTeam: (teamId: string, event: React.MouseEvent) => void;
  onCloseEditTeam: () => void;
  onUpdateTeam: (team: Team) => Promise<void>;
  onSeedSampleData?: () => void;
  isSeedingData?: boolean;
  t: TranslationFn;
}

export const TeamSelectionScreen = memo(function TeamSelectionScreen({
  teams,
  language,
  showTeamCreator,
  showBulkTeamImport,
  onSelectTeam,
  onDeleteTeam,
  onNavigateHome,
  onShowTeamCreator,
  onCloseTeamCreator,
  onShowBulkTeamImport,
  onCloseBulkTeamImport,
  onCreateTeam,
  onBulkImport,
  editingTeam,
  onEditTeam,
  onCloseEditTeam,
  onUpdateTeam,
  onSeedSampleData,
  isSeedingData = false,
  t,
}: TeamSelectionScreenProps) {
  const sortedTeams = teams
    ? [...teams].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      )
    : undefined;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-y-auto">
      {/* ウィンドウドラッグ領域（Electron のみ） */}
      {IS_ELECTRON && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-30"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        ></div>
      )}

      {/* 背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ナビゲーション */}
        <div className="flex items-center gap-4 mb-8 sm:mb-12">
          <button
            onClick={onNavigateHome}
            className="text-slate-400 hover:text-white transition-colors text-sm"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            ← {t("tactics.home")}
          </button>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8 sm:mb-12">
          <div
            className="mx-auto mb-3 h-16 w-16 text-blue-400 sm:mb-4 sm:h-20 sm:w-20"
            aria-hidden="true"
          >
            <TacticsPageIcon className="h-full w-full" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            {t("tactics.title")}
          </h1>
          <p className="text-base sm:text-xl text-slate-400 mb-2">
            {t("tactics.simulator.subtitle")}
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            {t("tactics.selectTeam")}
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={onShowBulkTeamImport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            📋 {t("team.bulkImport")}
          </button>
          <button
            onClick={onShowTeamCreator}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            ➕ {t("tactics.createTeam")}
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {teams?.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <p className="text-slate-400 text-lg">
                {t("tactics.emptyTeams")}
              </p>
              {onSeedSampleData && (
                <button
                  onClick={onSeedSampleData}
                  disabled={isSeedingData}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-blue-500/60 hover:border-blue-400 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  {...(IS_ELECTRON && {
                    style: {
                      WebkitAppRegion: "no-drag",
                    } as React.CSSProperties,
                  })}
                >
                  {t("app.seed.trySample")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {sortedTeams?.map((team, index) => (
                <div
                  key={team.id.value}
                  className="group relative animate-slide-in-right"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => onSelectTeam(team.id.value)}
                    className="w-full p-5 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
                  >
                    {/* ホバー時のグラデーションオーバーレイ */}
                    <div
                      className={`absolute inset-0 ${team.headerGradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                    ></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-5 mb-4">
                        {team.country && (
                          <div className="text-4xl sm:text-6xl transform group-hover:scale-110 transition-transform duration-300">
                            {getCountryInfo(team.country, language).flag}
                          </div>
                        )}
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                              {team.name}
                            </h2>
                          </div>
                          <p className="text-slate-400 text-sm font-light">
                            {team.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {team.availableFormations.map((formationId) => (
                          <span
                            key={formationId}
                            className="px-3 py-1.5 bg-slate-800/80 text-slate-300 rounded-lg text-xs font-semibold tracking-wider border border-slate-700/50 group-hover:border-blue-500/30 transition-colors"
                          >
                            {getFormationNameById(formationId) ?? formationId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>

                  {/* 編集ボタン */}
                  <button
                    onClick={(e) => onEditTeam(team.id.value, e)}
                    className="absolute top-3 right-14 sm:right-16 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 shadow-lg hover:shadow-xl border border-blue-500/50"
                    title={t("teamEditor.editTeam")}
                    aria-label={`${t("teamEditor.editTeam")} ${team.name}`}
                  >
                    <span className="text-lg" aria-hidden="true">
                      ✏️
                    </span>
                  </button>

                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => onDeleteTeam(team.id.value, team.name, e)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-red-600/90 hover:bg-red-500 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 shadow-lg hover:shadow-xl border border-red-500/50"
                    title={t("team.deleteTeam")}
                    aria-label={`${t("tactics.creation.delete")} ${team.name}`}
                  >
                    <span className="text-lg" aria-hidden="true">
                      🗑️
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TeamCreatorモーダル */}
      {showTeamCreator && (
        <TeamCreator onCreateTeam={onCreateTeam} onClose={onCloseTeamCreator} />
      )}

      {/* 一括インポートモーダル */}
      {showBulkTeamImport && (
        <BulkTeamImportModal
          onImport={onBulkImport}
          onClose={onCloseBulkTeamImport}
        />
      )}

      {/* チーム編集モーダル */}
      {editingTeam && (
        <TeamEditor
          team={editingTeam}
          onSave={onUpdateTeam}
          onClose={onCloseEditTeam}
        />
      )}
    </div>
  );
});
