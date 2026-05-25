/**
 * @module Phase
 * @description 試合フェーズを表す値オブジェクトの定義。攻撃・守備・トランジション・セットプレー等のフェーズを型安全に管理する
 */

/** 試合フェーズの種類（攻撃・守備・トランジション・セットプレー） */
export type PhaseType =
  | "attack"
  | "defense"
  | "positive_transition"
  | "negative_transition"
  | "set_piece"
  | "throw_in"
  | "goal_kick";

/** 試合フェーズを表す値オブジェクト */
export class Phase {
  private static readonly VALID_PHASES: PhaseType[] = [
    "attack",
    "defense",
    "positive_transition",
    "negative_transition",
    "set_piece",
    "throw_in",
    "goal_kick",
  ];

  private constructor(public readonly value: PhaseType) {}

  /**
   * 文字列からPhaseを生成する
   * @param phase - フェーズ文字列
   * @returns Phaseインスタンス
   * @throws 無効なフェーズ文字列の場合
   */
  static fromString(phase: string): Phase {
    if (!this.VALID_PHASES.includes(phase as PhaseType)) {
      throw new Error(`Invalid phase: ${phase}`);
    }
    return new Phase(phase as PhaseType);
  }

  /** 攻撃フェーズを生成する */
  static attack(): Phase {
    return new Phase("attack");
  }

  /** 守備フェーズを生成する */
  static defense(): Phase {
    return new Phase("defense");
  }

  /** ポジティブトランジション（守→攻）フェーズを生成する */
  static positiveTransition(): Phase {
    return new Phase("positive_transition");
  }

  /** ネガティブトランジション（攻→守）フェーズを生成する */
  static negativeTransition(): Phase {
    return new Phase("negative_transition");
  }

  /** セットプレーフェーズを生成する */
  static setPiece(): Phase {
    return new Phase("set_piece");
  }

  /** スローインフェーズを生成する */
  static throwIn(): Phase {
    return new Phase("throw_in");
  }

  /** ゴールキックフェーズを生成する */
  static goalKick(): Phase {
    return new Phase("goal_kick");
  }

  /**
   * 他のPhaseと等価比較する
   * @param other - 比較対象のPhase
   * @returns 等しい場合true
   */
  equals(other: Phase): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
