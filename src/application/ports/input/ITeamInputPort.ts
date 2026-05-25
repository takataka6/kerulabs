import type { Team } from "@domain/entities/Team";
import type { TeamId } from "@domain/value-objects";

/**
 * チームドメインの Input Port（Driving Port）
 *
 * Presentation 層はこのインターフェースを通じてチーム関連の操作を実行する。
 */
export interface ITeamInputPort {
  /** 全チームを取得する */
  getAll(): Promise<Team[]>;

  /** 指定IDのチームを取得する */
  getById(id: TeamId): Promise<Team | null>;

  /** チームを保存（作成・更新）する */
  save(team: Team): Promise<void>;

  /** チームを削除する */
  delete(id: TeamId): Promise<void>;
}
