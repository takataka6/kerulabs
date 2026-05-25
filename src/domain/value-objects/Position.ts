/**
 * ピッチ上の2D座標を表す値オブジェクト
 * X軸（横方向）とZ軸（縦方向）の座標を保持する
 */
export class Position {
  constructor(
    public readonly x: number,
    public readonly z: number,
  ) {
    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      throw new Error("Position coordinates must be finite numbers");
    }
  }

  /**
   * 座標からPositionを生成する
   * @param x - X座標
   * @param z - Z座標
   * @returns Positionインスタンス
   */
  static create(x: number, z: number): Position {
    return new Position(x, z);
  }

  /**
   * 他のPositionまでのユークリッド距離を計算する
   * @param other - 比較対象のPosition
   * @returns 2点間の距離
   */
  distanceTo(other: Position): number {
    const dx = this.x - other.x;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * 他のPositionと等価比較する
   * @param other - 比較対象のPosition
   * @returns 等しい場合true
   */
  equals(other: Position): boolean {
    return this.x === other.x && this.z === other.z;
  }

  toString(): string {
    return `(${this.x}, ${this.z})`;
  }
}
