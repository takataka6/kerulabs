/**
 * @module IEventBus
 * @description イベントバスの抽象インターフェース。具象実装への依存を排除し、テスト時のモック差し替えを容易にする
 */

import type { TacticEvent } from "./TacticEvent";

/** イベントハンドラーの型定義 */
type EventHandler<T extends TacticEvent> = (event: T) => void;

/**
 * イベントバスのインターフェース
 * 戦術イベントの発行・購読を抽象化する
 */
export interface IEventBus {
  /**
   * イベントを購読する
   * @param eventType - 購読するイベントタイプ
   * @param handler - イベント発生時に呼ばれるハンドラー
   * @returns 購読解除関数
   */
  subscribe<T extends TacticEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): () => void;

  /**
   * イベントを発行し、登録されたハンドラーに通知する
   * @param event - 発行するイベント
   */
  publish<T extends TacticEvent>(event: T): void;

  /**
   * イベント履歴を取得する
   * @param eventType - フィルタするイベントタイプ（省略時は全履歴）
   * @returns イベントの配列
   */
  getHistory(eventType?: string): TacticEvent[];

  /** イベント履歴をクリアする */
  clearHistory(): void;

  /** すべての購読とイベント履歴をクリアする */
  clearAll(): void;
}
