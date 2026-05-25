/**
 * @module TeamManual
 * @description チームマニュアルエンティティの定義。セクション（攻撃・守備・トランジション等）の追加・削除・更新と
 * Mermaid図解の管理機能を提供する
 *
 * フィールドは private で保護し、getter 経由の読み取りと
 * ミューテーションメソッド経由の変更のみを許可する（DDD の不変性パターン）
 */

import { TeamManualId } from "../value-objects/TeamManualId";
import { generateUUID } from "@shared/utils/generateUUID";

/** マニュアルセクション内の個別項目 */
export interface ManualItem {
  /** 項目の一意識別子 */
  id: string;
  /** 項目タイトル */
  title: string;
  /** 項目の説明（Markdown記法可） */
  content: string;
  /** Mermaid図解コード（任意） */
  diagram?: string;
  /** 関連する戦術ID（任意） */
  linkedTacticIds: string[];
}

/** マニュアルのセクション（攻撃の原則、守備の原則など） */
export interface ManualSection {
  /** セクションの一意識別子 */
  id: string;
  /** セクション名 */
  title: string;
  /** セクションの種別 */
  category: ManualCategory;
  /** 対象フォーメーション（空配列の場合は全フォーメーション対象） */
  formations: string[];
  /** セクション内の項目リスト */
  items: ManualItem[];
}

/** マニュアルカテゴリ */
export type ManualCategory =
  | "offense"
  | "defense"
  | "positive_transition"
  | "negative_transition"
  | "set_piece"
  | "position_task"
  | "free_note";

/** コンストラクタ引数（DB復元・テスト用） — 全フィールドを明示的に指定 */
export interface TeamManualProps {
  id: TeamManualId;
  name: string;
  description: string;
  teamId?: string;
  sections: ManualSection[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * チームマニュアルを表すエンティティ
 * セクションの追加・削除・更新とMermaid図解管理機能を提供する
 */
export class TeamManual {
  public readonly id: TeamManualId;
  public readonly createdAt: Date;

  private _name: string;
  private _description: string;
  private _teamId?: string;
  private _sections: ManualSection[];
  private _updatedAt: Date;

  constructor(props: TeamManualProps) {
    if (!props.name.trim()) {
      throw new Error("TeamManual name cannot be empty");
    }
    this.id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._teamId = props.teamId;
    this._sections = props.sections.map((s) => ({
      ...s,
      items: [...s.items],
    }));
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
  get teamId(): string | undefined {
    return this._teamId;
  }
  get sections(): readonly ManualSection[] {
    return this._sections;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 新しいチームマニュアルを作成するファクトリメソッド
   * @param name - マニュアル名
   * @param description - マニュアルの説明
   * @param teamId - 紐づけるチームID（任意）
   * @returns 新しいTeamManualインスタンス
   */
  static create(
    name: string,
    description: string,
    teamId?: string,
  ): TeamManual {
    const now = new Date();
    return new TeamManual({
      id: TeamManualId.generate(),
      name,
      description,
      teamId,
      sections: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * マニュアル情報を更新する
   * @param name - 新しいマニュアル名
   * @param description - 新しい説明
   */
  updateInfo(name: string, description: string): void {
    if (!name.trim()) {
      throw new Error("TeamManual name cannot be empty");
    }
    this._name = name;
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * セクションを追加する（IDは自動生成）
   * @param section - 追加するセクション（ID以外のフィールド）
   */
  addSection(section: Omit<ManualSection, "id">): void {
    this._sections = [
      ...this._sections,
      { ...section, id: generateUUID(), items: [...section.items] },
    ];
    this._updatedAt = new Date();
  }

  /**
   * セクションを削除する
   * @param sectionId - 削除するセクションのID
   * @returns 削除対象が見つかった場合true
   */
  removeSection(sectionId: string): boolean {
    const filtered = this._sections.filter((s) => s.id !== sectionId);
    if (filtered.length < this._sections.length) {
      this._sections = filtered;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * セクションを部分更新する
   * @param sectionId - 更新するセクションのID
   * @param updates - 更新するフィールド（ID以外）
   * @returns 更新対象が見つかった場合true
   */
  updateSection(
    sectionId: string,
    updates: Partial<Omit<ManualSection, "id">>,
  ): boolean {
    if (!this._sections.some((s) => s.id === sectionId)) return false;
    this._sections = this._sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s,
    );
    this._updatedAt = new Date();
    return true;
  }

  /**
   * セクションに項目を追加する
   * @param sectionId - 対象セクションのID
   * @param item - 追加する項目（ID以外のフィールド）
   * @returns 対象セクションが見つかった場合true
   */
  addItem(sectionId: string, item: Omit<ManualItem, "id">): boolean {
    const section = this._sections.find((s) => s.id === sectionId);
    if (!section) return false;
    section.items = [...section.items, { ...item, id: generateUUID() }];
    this._updatedAt = new Date();
    return true;
  }

  /**
   * セクションから項目を削除する
   * @param sectionId - 対象セクションのID
   * @param itemId - 削除する項目のID
   * @returns 削除対象が見つかった場合true
   */
  removeItem(sectionId: string, itemId: string): boolean {
    const section = this._sections.find((s) => s.id === sectionId);
    if (!section) return false;
    const filtered = section.items.filter((i) => i.id !== itemId);
    if (filtered.length < section.items.length) {
      section.items = filtered;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * セクション内の項目を更新する
   * @param sectionId - 対象セクションのID
   * @param itemId - 更新する項目のID
   * @param updates - 更新するフィールド（ID以外）
   * @returns 更新対象が見つかった場合true
   */
  updateItem(
    sectionId: string,
    itemId: string,
    updates: Partial<Omit<ManualItem, "id">>,
  ): boolean {
    const section = this._sections.find((s) => s.id === sectionId);
    if (!section) return false;
    if (!section.items.some((i) => i.id === itemId)) return false;
    section.items = section.items.map((i) =>
      i.id === itemId ? { ...i, ...updates } : i,
    );
    this._updatedAt = new Date();
    return true;
  }

  /**
   * 全カテゴリを重複排除してソート済みで取得する
   * @returns ソート済みカテゴリ配列
   */
  getAllCategories(): ManualCategory[] {
    const set = new Set<ManualCategory>();
    for (const section of this._sections) {
      set.add(section.category);
    }
    return [...set].sort();
  }
}
