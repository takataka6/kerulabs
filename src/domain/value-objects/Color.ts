/**
 * HEXカラーコードを表す値オブジェクト
 * #で始まる3桁または6桁のHEXカラーのみ許容する
 */
export class Color {
  /** HEXカラーのバリデーション正規表現 */
  static readonly HEX_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  private constructor(public readonly hex: string) {}

  /**
   * HEX文字列が有効なカラーコードかを判定する
   * @param hex - 検証するHEXカラーコード
   * @returns 有効な場合true
   */
  static isValidHex(hex: string): boolean {
    return Color.HEX_PATTERN.test(hex.trim());
  }

  /**
   * HEX文字列からColorを生成する（小文字に正規化）
   * @param hex - HEXカラーコード（例: "#ff0000", "#f00"）
   * @returns Colorインスタンス
   * @throws 無効なHEXカラーの場合
   */
  static fromHex(hex: string): Color {
    const cleanHex = hex.trim().toLowerCase();
    if (!Color.HEX_PATTERN.test(cleanHex)) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    return new Color(cleanHex);
  }

  toHex(): string {
    return this.hex;
  }

  /**
   * 他のColorと等価比較する
   * @param other - 比較対象のColor
   * @returns 等しい場合true
   */
  equals(other: Color): boolean {
    return this.hex === other.hex;
  }

  toString(): string {
    return this.hex;
  }
}
