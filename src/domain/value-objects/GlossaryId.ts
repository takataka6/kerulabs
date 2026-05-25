/**
 * 用語集の一意識別子を表す値オブジェクト
 * EntityId を継承し、型安全な等価比較を提供する
 */
import { EntityId } from "./EntityId";
import { generateUUID } from "@shared/utils/generateUUID";

export class GlossaryId extends EntityId<GlossaryId> {
  /** UUIDで新しいGlossaryIdを生成する */
  static generate(): GlossaryId {
    return new GlossaryId(generateUUID());
  }
}
