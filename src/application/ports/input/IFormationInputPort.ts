import type { Formation } from "@domain/entities/Formation";
import type { FormationId } from "@domain/value-objects/FormationId";

/**
 * フォーメーションドメインの Input Port（Driving Port）
 *
 * Presentation 層はこのインターフェースを通じてフォーメーション関連の操作を実行する。
 */
export interface IFormationInputPort {
  /** 全フォーメーションを取得する */
  getAll(): Promise<Formation[]>;
  /** IDでフォーメーションを取得する */
  getById(id: FormationId): Promise<Formation | null>;
  /** フォーメーションを保存する */
  save(formation: Formation): Promise<void>;
  /** フォーメーションを削除する */
  delete(id: FormationId): Promise<void>;
}
