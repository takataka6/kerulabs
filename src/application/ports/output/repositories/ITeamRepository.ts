import { Team } from "@domain/entities/Team";
import { TeamId } from "@domain/value-objects/TeamId";

/** チームの永続化を抽象化するリポジトリインターフェース */
export interface ITeamRepository {
  /** 全チームを取得する */
  findAll(): Promise<Team[]>;
  /**
   * IDでチームを取得する
   * @param id - チームID
   * @returns チーム。見つからない場合はnull
   */
  findById(id: TeamId): Promise<Team | null>;
  /**
   * チームを保存する
   * @param team - 保存するチーム
   */
  save(team: Team): Promise<void>;
  /**
   * チームを削除する
   * @param id - 削除するチームのID
   */
  delete(id: TeamId): Promise<void>;
}
