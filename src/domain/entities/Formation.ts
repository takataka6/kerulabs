/**
 * @module Formation
 * @description フォーメーションエンティティの定義。ゲームモードに応じた選手配置とポジション管理を行う
 */

import { Position } from "../value-objects/Position";
import { FormationId } from "../value-objects/FormationId";
import type { GameMode } from "@shared/types/GameMode";
import type { PositionCategory } from "@shared/types/PositionCategory";

export type { PositionCategory };

/** フォーメーション内の各ポジション情報 */
export interface FormationPosition {
  /** ポジションの役割名（例: "GK", "CB1"） */
  pos: string;
  /** ピッチ上の座標 */
  position: Position;
  /** ポジションカテゴリ（GK/DF/MF/FW） */
  category: PositionCategory;
}

/** コンストラクタ引数（DB復元・テスト用） — 全フィールドを明示的に指定 */
export interface FormationProps {
  id: FormationId;
  name: string;
  type: string;
  positions: FormationPosition[];
  roleMap: Map<string, number>;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  gameMode?: GameMode;
}

/** ゲームモードごとの選手数（GK含む） */
function getExpectedPlayerCount(gameMode: GameMode): number {
  switch (gameMode) {
    case "futsal":
      return 5;
    case "society":
      return 7;
    case "eight_aside":
      return 8;
    default:
      return 11;
  }
}

/**
 * フォーメーションを表すエンティティ
 * ゲームモードに応じた選手数の検証を行う（サッカー:11、フットサル:5など）
 */
export class Formation {
  public readonly id: FormationId;
  public readonly name: string;
  public readonly type: string;
  public readonly positions: readonly FormationPosition[];
  public readonly roleMap: ReadonlyMap<string, number>;
  public readonly isCustom: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly gameMode: GameMode;

  constructor(props: FormationProps) {
    if (!props.name.trim()) {
      throw new Error("Formation name cannot be empty");
    }
    const gameMode = props.gameMode ?? "football";
    const expected = getExpectedPlayerCount(gameMode);
    if (props.positions.length !== expected) {
      throw new Error(
        `Formation must have exactly ${expected} positions for ${gameMode}`,
      );
    }
    const posNames = props.positions.map((p) => p.pos);
    const uniquePosNames = new Set(posNames);
    if (uniquePosNames.size !== posNames.length) {
      throw new Error("Formation has duplicate position names");
    }

    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.positions = [...props.positions];
    this.roleMap = new Map(props.roleMap);
    this.isCustom = props.isCustom;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.gameMode = gameMode;
  }

  /**
   * カスタムフォーメーションを作成するファクトリメソッド
   * @param name - フォーメーション名（例: "4-4-2"）
   * @param type - フォーメーションのタイプ
   * @param positions - 各ポジションの配置情報
   * @param gameMode - ゲームモード（デフォルト: football）
   * @returns 新しいFormationインスタンス
   */
  static create(
    name: string,
    type: string,
    positions: FormationPosition[],
    gameMode: GameMode = "football",
  ): Formation {
    const now = new Date();
    const roleMap = new Map<string, number>();

    for (const [index, pos] of positions.entries()) {
      roleMap.set(pos.pos, index);
    }

    return new Formation({
      id: FormationId.generate(),
      name,
      type,
      positions,
      roleMap,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
      gameMode,
    });
  }

  /**
   * デフォルト（組み込み）フォーメーションを作成するファクトリメソッド
   * @param id - フォーメーションID
   * @param name - フォーメーション名
   * @param type - フォーメーションのタイプ
   * @param positions - 各ポジションの配置情報
   * @param customRoleMap - カスタムロールマップ（省略時はpositionsから自動生成）
   * @param gameMode - ゲームモード（デフォルト: football）
   * @returns 新しいFormationインスタンス
   */
  static createDefault(
    id: FormationId,
    name: string,
    type: string,
    positions: FormationPosition[],
    customRoleMap?: Map<string, number>,
    gameMode: GameMode = "football",
  ): Formation {
    const now = new Date();
    const roleMap = customRoleMap || new Map<string, number>();

    if (!customRoleMap) {
      for (const [index, pos] of positions.entries()) {
        roleMap.set(pos.pos, index);
      }
    }

    return new Formation({
      id,
      name,
      type,
      positions,
      roleMap,
      isCustom: false,
      createdAt: now,
      updatedAt: now,
      gameMode,
    });
  }

  /**
   * 役割名から選手インデックスを取得する
   * @param role - ポジションの役割名
   * @returns 選手インデックス。該当なしの場合はundefined
   */
  getPlayerIndexByRole(role: string): number | undefined {
    return this.roleMap.get(role);
  }

  /**
   * インデックスからポジション情報を取得する
   * @param index - 選手インデックス
   * @returns ポジション情報。該当なしの場合はundefined
   */
  getPositionByIndex(index: number): FormationPosition | undefined {
    return this.positions[index];
  }
}
