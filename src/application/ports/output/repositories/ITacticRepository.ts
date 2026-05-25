import { Tactic } from "@domain/entities/Tactic";
import { Phase } from "@domain/value-objects/Phase";
import type { TacticId } from "@domain/value-objects/TacticId";

/** 戦術の永続化を抽象化するリポジトリインターフェース */
export interface ITacticRepository {
  /** 全戦術を取得する */
  findAll(): Promise<Tactic[]>;
  /**
   * IDで戦術を取得する
   * @param id - 戦術ID
   * @returns 戦術。見つからない場合はnull
   */
  findById(id: TacticId): Promise<Tactic | null>;
  /**
   * 試合フェーズで戦術を検索する
   * @param phase - 試合フェーズ
   * @returns 該当する戦術の配列
   */
  findByPhase(phase: Phase): Promise<Tactic[]>;
  /**
   * 試合フェーズとフォーメーションで戦術を検索する
   * @param phase - 試合フェーズ
   * @param formation - フォーメーション名
   * @returns 該当する戦術の配列
   */
  findByPhaseAndFormation(phase: Phase, formation: string): Promise<Tactic[]>;
  /**
   * 戦術を保存する
   * @param tactic - 保存する戦術
   */
  save(tactic: Tactic): Promise<void>;
  /**
   * 戦術を削除する
   * @param id - 削除する戦術のID
   */
  delete(id: TacticId): Promise<void>;
}
