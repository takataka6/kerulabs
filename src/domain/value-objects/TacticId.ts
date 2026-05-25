/**
 * 戦術の一意識別子を表す値オブジェクト
 * EntityId を継承し、型安全な等価比較を提供する
 */
import { EntityId } from "./EntityId";
import { generateUUID } from "@shared/utils/generateUUID";

export class TacticId extends EntityId<TacticId> {
  /** UUIDで新しいTacticIdを生成する */
  static generate(): TacticId {
    return new TacticId(generateUUID());
  }
}
