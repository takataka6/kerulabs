/**
 * @module EventBus
 * @description 戦術イベントの発行・購読を管理するシングルトンイベントバス。イベント履歴の保持とハンドラーのライフサイクル管理を行う
 */

import type { IEventBus } from "./IEventBus";
import { TacticEvent } from "./TacticEvent";
import { handleError } from "@shared/errors/handleError";

/** イベントハンドラーの型定義 */
type EventHandler<T extends TacticEvent> = (event: T) => void;

/**
 * 戦術イベントの発行・購読を管理するシングルトンイベントバス
 * イベント履歴の保持とハンドラーのライフサイクル管理を行う
 */
export class EventBus implements IEventBus {
  private static instance: EventBus;
  private handlers: Map<string, ((event: TacticEvent) => void)[]> = new Map();
  private eventHistory: TacticEvent[] = [];
  private maxHistorySize = 100;

  private constructor() {}

  /** シングルトンインスタンスを取得する */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * イベントを購読する
   * @param eventType - 購読するイベントタイプ
   * @param handler - イベント発生時に呼ばれるハンドラー
   * @returns 購読解除関数
   */
  subscribe<T extends TacticEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const h = handler as (event: TacticEvent) => void;
    this.handlers.get(eventType)!.push(h);

    // 購読解除関数を返す
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(h);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * イベントを発行し、登録されたハンドラーに通知する
   * @param event - 発行するイベント
   */
  publish<T extends TacticEvent>(event: T): void {
    // イベント履歴に追加
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // ハンドラーを実行
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          handleError(
            error,
            "domain",
            `Error in event handler for ${event.type}`,
          );
        }
      });
    }
  }

  /**
   * イベント履歴を取得する
   * @param eventType - フィルタするイベントタイプ（省略時は全履歴）
   * @returns イベントの配列
   */
  getHistory(eventType?: string): TacticEvent[] {
    if (eventType) {
      return this.eventHistory.filter((e) => e.type === eventType);
    }
    return [...this.eventHistory];
  }

  /** イベント履歴をクリアする */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /** すべての購読とイベント履歴をクリアする */
  clearAll(): void {
    this.handlers.clear();
    this.eventHistory = [];
  }
}
