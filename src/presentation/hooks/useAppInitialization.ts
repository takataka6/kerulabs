import { useEffect, useState } from "react";
import { IndexedDBClient } from "@infrastructure/repositories";
import {
  DEFAULT_FORMATIONS,
  DEFAULT_FUTSAL_FORMATIONS,
  DEFAULT_EIGHT_ASIDE_FORMATIONS,
  DEFAULT_SOCIETY_FORMATIONS,
  DEFAULT_TACTICS,
} from "@infrastructure/seed";
import { RepositoryFactory } from "@infrastructure/factories";
import {
  BrowserFileService,
  IndexedDBPreferencesService,
} from "@infrastructure/services";
import { configureContainer } from "@application/ServiceContainer";
import {
  TacticInteractor,
  TeamInteractor,
  FormationInteractor,
  GlossaryInteractor,
  TeamManualInteractor,
  PluginInteractor,
} from "@application/use-cases";
import { AppBackupService } from "@application/services/AppBackupService";
import { handleError } from "@shared/errors/handleError";
import { getLogger } from "@shared/logger";

/**
 * アプリケーションの初期化を行うカスタムフック。
 *
 * - IndexedDB スキーマ初期化
 * - DI コンテナ設定
 * - シードデータ投入（フォーメーション・戦術）
 */
export function useAppInitialization(): {
  isInitialized: boolean;
  initError: Error | null;
} {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // IndexedDB スキーマ初期化
        const client = IndexedDBClient.getInstance();
        await client.getDB();

        // IndexedDB ベース設定サービス（インメモリキャッシュ初期化）
        const preferencesService = new IndexedDBPreferencesService();
        await preferencesService.initialize();

        // DI コンテナ初期化
        const tacticRepo = RepositoryFactory.createTacticRepository();
        const teamRepo = RepositoryFactory.createTeamRepository();
        const formationRepo = RepositoryFactory.createFormationRepository();
        const glossaryRepo = RepositoryFactory.createGlossaryRepository();
        const teamManualRepo = RepositoryFactory.createTeamManualRepository();
        const pluginRepo = RepositoryFactory.createPluginRepository();

        configureContainer({
          // 出力ポート
          teamRepository: teamRepo,
          formationRepository: formationRepo,
          tacticRepository: tacticRepo,
          glossaryRepository: glossaryRepo,
          teamManualRepository: teamManualRepo,
          pluginRepository: pluginRepo,
          backupService: client,
          fileService: new BrowserFileService(),
          preferencesService,
          // 入力ポート
          tacticInteractor: new TacticInteractor(tacticRepo),
          teamInteractor: new TeamInteractor(teamRepo),
          formationInteractor: new FormationInteractor(formationRepo),
          glossaryInteractor: new GlossaryInteractor(glossaryRepo),
          teamManualInteractor: new TeamManualInteractor(teamManualRepo),
          pluginInteractor: new PluginInteractor(pluginRepo),
          // アプリケーションサービス
          appBackupService: new AppBackupService(client),
        });

        await seedFormations(formationRepo);
        await reseedDefaultTactics(tacticRepo);

        setIsInitialized(true);
      } catch (error) {
        handleError(error, "database", "Failed to initialize database");
        setInitError(
          error instanceof Error
            ? error
            : new Error("Failed to initialize database"),
        );
      }
    };

    initialize();
  }, []);

  return { isInitialized, initError };
}

/* ------------------------------------------------------------------ */
/*  シードデータ投入                                                     */
/* ------------------------------------------------------------------ */

type FormationRepository = ReturnType<
  typeof RepositoryFactory.createFormationRepository
>;
type TacticRepository = ReturnType<
  typeof RepositoryFactory.createTacticRepository
>;

/**
 * フォーメーションのシード。初回起動時は全フォーメーションを投入し、
 * 既存データがある場合は不足分のみ追加する。
 */
async function seedFormations(repo: FormationRepository): Promise<void> {
  const existing = await repo.findAll();

  const formationsToSave =
    existing.length === 0
      ? [
          ...DEFAULT_FORMATIONS,
          ...DEFAULT_FUTSAL_FORMATIONS,
          ...DEFAULT_EIGHT_ASIDE_FORMATIONS,
          ...DEFAULT_SOCIETY_FORMATIONS,
        ]
      : (() => {
          const existingIds = new Set(existing.map((f) => f.id));
          return [
            ...DEFAULT_FORMATIONS,
            ...DEFAULT_FUTSAL_FORMATIONS,
            ...DEFAULT_EIGHT_ASIDE_FORMATIONS,
            ...DEFAULT_SOCIETY_FORMATIONS,
          ].filter((f) => !existingIds.has(f.id));
        })();

  if (formationsToSave.length === 0) return;

  const results = await Promise.allSettled(
    formationsToSave.map((f) => repo.save(f)),
  );
  logSettledFailures(results, "formation seed");
}

/**
 * デフォルト（非カスタム）戦術を削除して再シード。ユーザー作成のカスタム戦術は保持。
 */
async function reseedDefaultTactics(repo: TacticRepository): Promise<void> {
  const existing = await repo.findAll();
  const nonCustomIds = existing.filter((t) => !t.isCustom).map((t) => t.id);

  const deleteResults = await Promise.allSettled(
    nonCustomIds.map((id) => repo.delete(id)),
  );
  logSettledFailures(deleteResults, "tactic delete");

  const saveResults = await Promise.allSettled(
    DEFAULT_TACTICS.map((t) => repo.save(t)),
  );
  logSettledFailures(saveResults, "tactic seed");
}

/**
 * Promise.allSettled の結果から失敗をログに記録する。
 */
function logSettledFailures(
  results: PromiseSettledResult<unknown>[],
  context: string,
): void {
  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === "rejected",
  );
  if (failures.length > 0) {
    const logger = getLogger();
    logger.warn(
      "database",
      `${context}: ${failures.length} operation(s) failed`,
      {
        reasons: failures.map((f) => f.reason),
      },
    );
  }
}
