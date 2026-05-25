/**
 * アプリケーションデータのバックアップ・リストアを抽象化するポートインターフェース。
 *
 * Infrastructure 層（IndexedDB 等）の具体実装から Application 層を分離し、
 * テスタビリティとクリーンアーキテクチャの依存ルールを維持する。
 */
export interface IBackupService {
  /**
   * 全ストアのデータをエクスポートする
   * @returns ストア名をキー、レコード配列を値とするオブジェクト
   */
  exportAll(): Promise<Record<string, unknown[]>>;

  /**
   * 全ストアをクリアしてデータをインポートする（既存データは上書き）
   * @param data - ストア名をキー、レコード配列を値とするオブジェクト
   */
  importAll(data: Record<string, unknown[]>): Promise<void>;
}
