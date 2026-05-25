/**
 * @module Glossary
 * @description サッカー用語集エンティティの定義。用語の追加・削除・更新とキーワード検索機能を提供する
 *
 * フィールドは private で保護し、getter 経由の読み取りと
 * ミューテーションメソッド経由の変更のみを許可する（DDD の不変性パターン）
 */

import { GlossaryId } from "../value-objects/GlossaryId";
import { generateUUID } from "@shared/utils/generateUUID";

/** 用語集の各用語を表すインターフェース */
export interface GlossaryTerm {
  /** 用語の一意識別子 */
  id: string;
  /** 用語名 */
  term: string;
  /** 読み仮名 */
  reading?: string;
  /** 用語の説明文 */
  description: string;
  /** 検索用キーワードの配列 */
  keywords: string[];
}

/** コンストラクタ引数（DB復元・テスト用） — 全フィールドを明示的に指定 */
export interface GlossaryProps {
  id: GlossaryId;
  name: string;
  description: string;
  terms: GlossaryTerm[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * サッカー用語集を表すエンティティ
 * 用語の追加・削除・更新とキーワード検索機能を提供する
 */
export class Glossary {
  public readonly id: GlossaryId;
  public readonly createdAt: Date;

  private _name: string;
  private _description: string;
  private _terms: GlossaryTerm[];
  private _updatedAt: Date;

  constructor(props: GlossaryProps) {
    if (!props.name.trim()) {
      throw new Error("Glossary name cannot be empty");
    }
    this.id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._terms = [...props.terms];
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // ── Getters ─────────────────────────────────────────────

  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get terms(): readonly GlossaryTerm[] {
    return this._terms;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 新しい用語集を作成するファクトリメソッド
   * @param name - 用語集名
   * @param description - 用語集の説明
   * @returns 新しいGlossaryインスタンス
   */
  static create(name: string, description: string): Glossary {
    const now = new Date();
    return new Glossary({
      id: GlossaryId.generate(),
      name,
      description,
      terms: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * 用語を追加する（IDは自動生成）
   * @param term - 追加する用語（ID以外のフィールド）
   */
  addTerm(term: Omit<GlossaryTerm, "id">): void {
    this._terms = [...this._terms, { ...term, id: generateUUID() }];
    this._updatedAt = new Date();
  }

  /**
   * 用語を削除する
   * @param termId - 削除する用語のID
   * @returns 削除対象が見つかった場合true
   */
  removeTerm(termId: string): boolean {
    const filtered = this._terms.filter((t) => t.id !== termId);
    if (filtered.length < this._terms.length) {
      this._terms = filtered;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 用語を部分更新する
   * @param termId - 更新する用語のID
   * @param updates - 更新するフィールド（ID以外）
   * @returns 更新対象が見つかった場合true
   */
  updateTerm(
    termId: string,
    updates: Partial<Omit<GlossaryTerm, "id">>,
  ): boolean {
    if (!this._terms.some((t) => t.id === termId)) return false;
    this._terms = this._terms.map((t) =>
      t.id === termId ? { ...t, ...updates } : t,
    );
    this._updatedAt = new Date();
    return true;
  }

  /**
   * 用語集の名前と説明を更新する
   * @param name - 新しい用語集名
   * @param description - 新しい説明
   */
  updateInfo(name: string, description: string): void {
    if (!name.trim()) {
      throw new Error("Glossary name cannot be empty");
    }
    this._name = name;
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * 全用語のキーワードを重複排除してソート済みで取得する
   * @returns ソート済みキーワード配列
   */
  getAllKeywords(): string[] {
    const set = new Set<string>();
    for (const term of this._terms) {
      for (const cat of term.keywords) {
        if (cat) set.add(cat);
      }
    }
    return [...set].sort();
  }
}
