/**
 * チームの一意識別子を表す値オブジェクト
 * EntityId を継承し、型安全な等価比較を提供する
 */
import { EntityId } from "./EntityId";
import { generateUUID } from "@shared/utils/generateUUID";

export class TeamId extends EntityId<TeamId> {
  /** UUIDで新しいTeamIdを生成する */
  static generate(): TeamId {
    return new TeamId(generateUUID());
  }
}
