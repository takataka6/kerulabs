import type { TeamManual } from "@domain/entities/TeamManual";
import type { TeamManualId } from "@domain/value-objects";

/**
 * チームマニュアルドメインの Input Port（Driving Port）
 *
 * Presentation 層はこのインターフェースを通じてチームマニュアル関連の操作を実行する。
 */
export interface ITeamManualInputPort {
  /** 全チームマニュアルを取得する */
  getAll(): Promise<TeamManual[]>;

  /** 指定IDのチームマニュアルを取得する */
  getById(id: TeamManualId): Promise<TeamManual | null>;

  /** チームマニュアルを保存する（新規作成または更新） */
  save(manual: TeamManual): Promise<void>;

  /** 指定IDのチームマニュアルを削除する */
  delete(id: TeamManualId): Promise<void>;
}
