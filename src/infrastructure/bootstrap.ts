/**
 * @module bootstrap
 * @description アプリケーションの起動時初期化を担うモジュール。
 *
 * 役割:
 * - IndexedDB のオープンとマイグレーション実行
 * - 各種永続化サービスの初期化（PreferencesService など）
 * - RepositoryFactory 経由でのリポジトリ生成
 * - DI コンテナ（ServiceContainer）の組み立て
 * - デフォルトデータ（フォーメーション・戦術）のシード
 *
 * このモジュールを Presentation 層から分離することで、
 * Clean Architecture の依存ルール（Presentation は Application と Domain にのみ依存）を守る。
 *
 * 呼び出し側（useAppInitialization など）はこの関数を await して成功/失敗をハンドルする。
 */
import { IndexedDBClient } from "@infrastructure/repositories";
import {
  DEFAULT_FORMATIONS,
  DEFAULT_FUTSAL_FORMATIONS,
  DEFAULT_EIGHT_ASIDE_FORMATIONS,
  DEFAULT_SOCIETY_FORMATIONS,
  DEFAULT_TACTICS,
} from "./seed";
import { RepositoryFactory } from "./factories";
import { BrowserFileService, IndexedDBPreferencesService } from "./services";
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
import { SketchStorage } from "@infrastructure/repositories";
import { getLogger } from "@shared/logger";

/**
 * アプリケーション全体を初期化する。
 * 1回だけ実行されるべき処理をまとめる（冪等性は configureContainer 側とシード側で一部担保）。
 *
 * @throws 初期化に失敗した場合（呼び出し側で catch してエラー状態にする）
 */
export async function initializeApp(): Promise<void> {
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
    // スケッチ永続化（Presentation 層が直接 new するのを避けるための Output Port 実装）
    sketchStorage: new SketchStorage(),
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
}

/* ------------------------------------------------------------------ */
/*  シードデータ投入（内部実装）                                         */
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
