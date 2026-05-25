import type { Tactic } from "@domain/entities/Tactic";
import type { Phase, TacticId } from "@domain/value-objects";

/**
 * 戦術ドメインの Input Port（Driving Port）
 *
 * Presentation 層はこのインターフェースを通じて戦術関連の操作を実行する。
 */
export interface ITacticInputPort {
  /** 全戦術を取得する */
  getAll(): Promise<Tactic[]>;

  /** 指定フェーズの戦術を取得する */
  getByPhase(phase: Phase): Promise<Tactic[]>;

  /** 戦術を保存する（新規作成または更新） */
  save(tactic: Tactic): Promise<void>;

  /** 指定IDの戦術を削除する */
  delete(id: TacticId): Promise<void>;
}
