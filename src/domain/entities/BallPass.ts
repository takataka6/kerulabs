/**
 * @module BallPass
 * @description ボールパスエンティティの定義。始点・終点の選手間またはカスタム座標間のパス軌道を表現する
 */

import { Color } from "../value-objects/Color";

/** ボール軌道の種類（低弾道・高弾道・左カーブ・右カーブ） */
export type TrajectoryType = "low" | "high" | "curveLeft" | "curveRight";

/** コンストラクタ引数 — 全フィールドを明示的に指定 */
export interface BallPassProps {
  /** パス元の選手の役割名 */
  startRole: string;
  /** パス先の選手の役割名 */
  endRole: string;
  /** パス開始までの遅延時間（ms） */
  delay: number;
  /** パスの表示色（HEXカラー） */
  color: string;
  /** 終点のカスタムX座標 */
  endX?: number;
  /** 終点のカスタムZ座標 */
  endZ?: number;
  /** 始点のカスタムX座標（セットプレーのボール位置など） */
  startX?: number;
  /** 始点のカスタムZ座標 */
  startZ?: number;
  /** ボール軌道の種類 */
  trajectoryType?: TrajectoryType;
}

/** ファクトリ引数（新規作成用） — delay/color はデフォルト値あり */
export interface CreateBallPassInput {
  startRole: string;
  endRole: string;
  delay?: number;
  color?: string;
  endX?: number;
  endZ?: number;
  startX?: number;
  startZ?: number;
  trajectoryType?: TrajectoryType;
}

/**
 * ボールパスを表すエンティティ
 * 始点・終点の選手間またはカスタム座標間のパスを定義する
 */
export class BallPass {
  public readonly startRole: string;
  public readonly endRole: string;
  public readonly delay: number;
  public readonly color: string;
  public readonly endX?: number;
  public readonly endZ?: number;
  public readonly startX?: number;
  public readonly startZ?: number;
  public readonly trajectoryType?: TrajectoryType;

  constructor(props: BallPassProps) {
    // カスタム座標が指定されていない場合、ロール名は必須
    const hasCustomStart =
      props.startX !== undefined && props.startZ !== undefined;
    const hasCustomEnd = props.endX !== undefined && props.endZ !== undefined;
    if (!props.startRole.trim() && !hasCustomStart) {
      throw new Error(
        "BallPass startRole is required when custom start coordinates are not provided",
      );
    }
    if (!props.endRole.trim() && !hasCustomEnd) {
      throw new Error(
        "BallPass endRole is required when custom end coordinates are not provided",
      );
    }
    if (props.delay < 0) {
      throw new Error("BallPass delay cannot be negative");
    }
    if (!Color.isValidHex(props.color)) {
      throw new Error(`BallPass has invalid hex color: ${props.color}`);
    }
    if (
      (props.endX !== undefined && !Number.isFinite(props.endX)) ||
      (props.endZ !== undefined && !Number.isFinite(props.endZ)) ||
      (props.startX !== undefined && !Number.isFinite(props.startX)) ||
      (props.startZ !== undefined && !Number.isFinite(props.startZ))
    ) {
      throw new Error("BallPass coordinates must be finite numbers");
    }

    this.startRole = props.startRole;
    this.endRole = props.endRole;
    this.delay = props.delay;
    this.color = props.color;
    this.endX = props.endX;
    this.endZ = props.endZ;
    this.startX = props.startX;
    this.startZ = props.startZ;
    this.trajectoryType = props.trajectoryType;
  }

  /**
   * ボールパスを作成するファクトリメソッド
   * @param input - ボールパス作成に必要な情報（startRole, endRole は必須）
   * @returns 新しいBallPassインスタンス
   */
  static create(input: CreateBallPassInput): BallPass {
    return new BallPass({
      startRole: input.startRole,
      endRole: input.endRole,
      delay: input.delay ?? 0,
      color: input.color ?? "#facc15",
      endX: input.endX,
      endZ: input.endZ,
      startX: input.startX,
      startZ: input.startZ,
      trajectoryType: input.trajectoryType,
    });
  }

  /** 終点座標が明示指定されているか */
  hasCustomEnd(): boolean {
    return this.endX !== undefined && this.endZ !== undefined;
  }

  /** 始点座標が明示指定されているか（セットプレーのボール位置など） */
  hasCustomStart(): boolean {
    return this.startX !== undefined && this.startZ !== undefined;
  }
}
