/**
 * エンティティIDの基底クラス（値オブジェクト）
 *
 * PlayerId や TeamId など、同じ構造を持つ複数の識別子型の共通ロジックを集約する。
 * ジェネリクスの「自己型パターン」を使い、異なるID型同士の誤った比較をコンパイル時に防ぐ。
 *
 * @typeParam T - 具象サブクラス自身の型（自己型バウンド）
 */
export abstract class EntityId<T extends EntityId<T>> {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(`${this.constructor.name} cannot be empty`);
    }
  }

  /**
   * 他のIDと等価比較する
   * @param other - 比較対象のID（同じ型のみ受け付ける）
   * @returns 等しい場合true
   */
  equals(other: T): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
