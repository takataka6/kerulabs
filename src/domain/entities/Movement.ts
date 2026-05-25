import { Color } from "../value-objects/Color";

/**
 * 選手の移動を表すエンティティ
 * 戦術実行時に選手が移動する目標座標と遅延時間を保持する
 */
export class Movement {
  constructor(
    public readonly role: string,
    public readonly targetX: number,
    public readonly targetZ: number,
    public readonly delay: number,
    public readonly arrowColor: string,
  ) {
    if (!role.trim()) {
      throw new Error("Movement role cannot be empty");
    }
    if (delay < 0) {
      throw new Error("Movement delay cannot be negative");
    }
    if (!Color.isValidHex(arrowColor)) {
      throw new Error(`Movement has invalid hex color: ${arrowColor}`);
    }
    if (!Number.isFinite(targetX) || !Number.isFinite(targetZ)) {
      throw new Error("Movement target coordinates must be finite numbers");
    }
  }

  /**
   * 選手移動を作成するファクトリメソッド
   * @param role - 移動する選手の役割名
   * @param targetX - 移動先のX座標
   * @param targetZ - 移動先のZ座標
   * @param delay - 移動開始までの遅延時間（ms）
   * @param arrowColor - 矢印の色（HEXカラー）
   * @returns 新しいMovementインスタンス
   */
  static create(
    role: string,
    targetX: number,
    targetZ: number,
    delay: number = 0,
    arrowColor: string = "#ef4444",
  ): Movement {
    return new Movement(role, targetX, targetZ, delay, arrowColor);
  }
}
