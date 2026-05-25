import type { ITeamRepository } from "./ports/output/repositories/ITeamRepository";
import type { IFormationRepository } from "./ports/output/repositories/IFormationRepository";
import type { ITacticRepository } from "./ports/output/repositories/ITacticRepository";
import type { IGlossaryRepository } from "./ports/output/repositories/IGlossaryRepository";
import type { ITeamManualRepository } from "./ports/output/repositories/ITeamManualRepository";
import type { IPluginRepository } from "./ports/output/repositories/IPluginRepository";
import type { IBackupService } from "./ports/output/services/IBackupService";
import type { IFileService } from "./ports/output/services/IFileService";
import type { IPreferencesService } from "./ports/output/services/IPreferencesService";
import type { ITacticInputPort } from "./ports/input/ITacticInputPort";
import type { ITeamInputPort } from "./ports/input/ITeamInputPort";
import type { IFormationInputPort } from "./ports/input/IFormationInputPort";
import type { IGlossaryInputPort } from "./ports/input/IGlossaryInputPort";
import type { ITeamManualInputPort } from "./ports/input/ITeamManualInputPort";
import type { IPluginInputPort } from "./ports/input/IPluginInputPort";
import { AppBackupService } from "./services/AppBackupService";

/** アプリケーション全体の依存注入コンテナ */
export interface Container {
  // 出力ポート（Infrastructure 層の抽象）
  teamRepository: ITeamRepository;
  formationRepository: IFormationRepository;
  tacticRepository: ITacticRepository;
  glossaryRepository: IGlossaryRepository;
  teamManualRepository: ITeamManualRepository;
  pluginRepository: IPluginRepository;
  backupService: IBackupService;
  fileService: IFileService;
  preferencesService: IPreferencesService;

  // Input Ports（Presentation 層が利用するユースケースの抽象）
  tacticInteractor: ITacticInputPort;
  teamInteractor: ITeamInputPort;
  formationInteractor: IFormationInputPort;
  glossaryInteractor: IGlossaryInputPort;
  teamManualInteractor: ITeamManualInputPort;
  pluginInteractor: IPluginInputPort;

  // アプリケーションサービス
  appBackupService: AppBackupService;
}

let container: Container | null = null;

/**
 * DI コンテナを初期化する。アプリ起動時に1度だけ呼ぶ。
 * Infrastructure 層の具象実装をここで注入する。
 * 2度目以降の呼び出しは無視される（冪等性保証）。
 */
export function configureContainer(c: Container): void {
  if (container) return;
  container = c;
}

/**
 * DI コンテナを取得する。Presentation / Application 層から利用。
 * @throws configureContainer() 未呼び出しの場合
 */
export function getContainer(): Container {
  if (!container) {
    throw new Error(
      "ServiceContainer not configured. Call configureContainer() at app startup.",
    );
  }
  return container;
}
