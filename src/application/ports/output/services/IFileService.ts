/** ファイルのダウンロード・読み込みを抽象化するポートインターフェース */
export interface IFileService {
  /**
   * JSON文字列をファイルとしてダウンロードする
   * @param json - ダウンロードするJSON文字列
   * @param filename - ファイル名
   */
  downloadJson(json: string, filename: string): void;

  /**
   * ファイル選択ダイアログを開き、選択されたファイルの内容を返す
   * @param accept - 受け入れるファイル形式（例: ".json"）
   * @returns ファイルの内容文字列
   */
  openFilePicker(accept: string): Promise<string>;
}
