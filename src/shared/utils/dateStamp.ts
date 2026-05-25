/**
 * @module dateStamp
 * @description ファイル名用の日付スタンプ生成ユーティリティ。
 */

/** 今日の日付を "YYYY-MM-DD" 形式で返す（ファイル名生成用） */
export function getDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
