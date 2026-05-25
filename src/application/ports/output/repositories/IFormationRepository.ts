import { Formation } from "@domain/entities/Formation";
import type { FormationId } from "@domain/value-objects/FormationId";

/** フォーメーションの永続化を抽象化するリポジトリインターフェース */
export interface IFormationRepository {
  /** 全フォーメーションを取得する */
  findAll(): Promise<Formation[]>;
  /**
   * IDでフォーメーションを取得する
   * @param id - フォーメーションID
   * @returns フォーメーション。見つからない場合はnull
   */
  findById(id: FormationId): Promise<Formation | null>;
  /**
   * タイプでフォーメーションを検索する
   * @param type - フォーメーションタイプ
   * @returns 該当するフォーメーションの配列
   */
  findByType(type: string): Promise<Formation[]>;
  /**
   * フォーメーションを保存する
   * @param formation - 保存するフォーメーション
   */
  save(formation: Formation): Promise<void>;
  /**
   * フォーメーションを削除する
   * @param id - 削除するフォーメーションのID
   */
  delete(id: FormationId): Promise<void>;
}
