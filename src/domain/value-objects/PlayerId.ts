/**
 * 選手の一意識別子を表す値オブジェクト
 * EntityId を継承し、型安全な等価比較を提供する
 */
import { EntityId } from "./EntityId";
import { generateUUID } from "@shared/utils/generateUUID";

export class PlayerId extends EntityId<PlayerId> {
  /** UUIDで新しいPlayerIdを生成する */
  static generate(): PlayerId {
    return new PlayerId(generateUUID());
  }
}
