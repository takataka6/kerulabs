/**
 * @module useTacticCreation フック
 * @description 戦術作成ウィザードの状態管理フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - ウィザードステップ進行（メタデータ→ポジション設定→ボール→軌道→確認）を検証
 * - 移動・ボールパス・ボール位置/軌道の追加・編集・削除を検証
 * - phaseKeyToPhaseType 変換関数の網羅的テスト
 * - リセット・キャンセル時の状態クリアを検証
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { phaseKeyToPhaseType, useTacticCreation } from "../useTacticCreation";
import type { PhaseKey } from "@shared/constants/phases";
import { Formation } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import type { FormationPosition } from "@domain/entities/Formation";

// =============================================================================
// テスト用ヘルパー
// =============================================================================

/**
 * テスト用の11人フォーメーションを作成する。
 * roleMap: GK->0, CB1->1, CB2->2, LB->3, RB->4,
 *          CM1->5, CM2->6, CM3->7, LW->8, RW->9, CF->10
 */
function createTestFormation(name = "4-3-3"): Formation {
  const roles = [
    "GK",
    "CB1",
    "CB2",
    "LB",
    "RB",
    "CM1",
    "CM2",
    "CM3",
    "LW",
    "RW",
    "CF",
  ];
  const positions: FormationPosition[] = roles.map((role, idx) => ({
    pos: role,
    position: Position.create(idx * 10, idx * 5),
    category: idx === 0 ? "gk" : idx < 5 ? "df" : idx < 8 ? "mf" : "fw",
  }));
  return Formation.create(name, "standard", positions, "football");
}

// =============================================================================
// phaseKeyToPhaseType
// =============================================================================

describe("phaseKeyToPhaseType", () => {
  it('"attack" を "attack" に変換する', () => {
    expect(phaseKeyToPhaseType("attack")).toBe("attack");
  });

  it('"transition" を "positive_transition" に変換する', () => {
    expect(phaseKeyToPhaseType("transition")).toBe("positive_transition");
  });

  it('"positive_transition" を "positive_transition" に変換する', () => {
    expect(phaseKeyToPhaseType("positive_transition")).toBe(
      "positive_transition",
    );
  });

  it('"pressing" を "defense" に変換する', () => {
    expect(phaseKeyToPhaseType("pressing")).toBe("defense");
  });

  it('"defense" を "defense" に変換する', () => {
    expect(phaseKeyToPhaseType("defense")).toBe("defense");
  });

  it('"counter" を "negative_transition" に変換する', () => {
    expect(phaseKeyToPhaseType("counter")).toBe("negative_transition");
  });

  it('"negative_transition" を "negative_transition" に変換する', () => {
    expect(phaseKeyToPhaseType("negative_transition")).toBe(
      "negative_transition",
    );
  });

  it('"set_piece" を "set_piece" に変換する', () => {
    expect(phaseKeyToPhaseType("set_piece")).toBe("set_piece");
  });

  it('"throw_in" を "throw_in" に変換する', () => {
    expect(phaseKeyToPhaseType("throw_in")).toBe("throw_in");
  });

  it('"goal_kick" を "goal_kick" に変換する', () => {
    expect(phaseKeyToPhaseType("goal_kick")).toBe("goal_kick");
  });

  it('未知のキーは "attack" にフォールバックする', () => {
    expect(phaseKeyToPhaseType("unknown_key" as PhaseKey)).toBe("attack");
  });
});

// =============================================================================
// useTacticCreation
// =============================================================================

describe("useTacticCreation", () => {
  // ---------------------------------------------------------------------------
  // ライフサイクル
  // ---------------------------------------------------------------------------

  it("初期状態: creation が null である", () => {
    const { result } = renderHook(() => useTacticCreation());
    expect(result.current.creation).toBeNull();
  });

  it("startCreation: 正しい初期状態を作成する", () => {
    const { result } = renderHook(() => useTacticCreation());

    act(() => {
      result.current.startCreation("4-3-3", "attack");
    });

    const c = result.current.creation;
    expect(c).not.toBeNull();
    expect(c!.nameJa).toBe("");
    expect(c!.nameEn).toBe("");
    expect(c!.icon).toBe("\u26BD");
    expect(c!.gamePhase).toBe("attack");
    expect(c!.formationName).toBe("4-3-3");
    expect(c!.currentStepIndex).toBe(0);
    expect(c!.steps).toHaveLength(1);
    expect(c!.steps[0].id).toBe(1);
    expect(c!.steps[0].movements.size).toBe(0);
    expect(c!.steps[0].ballPasses).toEqual([]);
    expect(c!.steps[0].duration).toBe(1000);
    expect(c!.timelineOpen).toBe(false);
    expect(c!.wizardStep).toBe("metadata");
    expect(c!.ballPosition).toBeNull();
    expect(c!.ballTrajectory).toBeNull();
    expect(c!.setPositions).toBeInstanceOf(Map);
    expect(c!.setPositions.size).toBe(0);
  });

  it("startCreation: ゲームフェーズのアイコンをデフォルトにする", () => {
    const { result } = renderHook(() => useTacticCreation());

    act(() => {
      result.current.startCreation("4-3-3", "defense");
    });

    expect(result.current.creation!.icon).toBe("\uD83D\uDEE1\uFE0F");
  });

  it("cancelCreation: creation を null に戻す", () => {
    const { result } = renderHook(() => useTacticCreation());

    act(() => result.current.startCreation("4-4-2", "defense"));
    expect(result.current.creation).not.toBeNull();

    act(() => result.current.cancelCreation());
    expect(result.current.creation).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // ムーブメント編集
  // ---------------------------------------------------------------------------

  it("setPlayerTarget: 現在のステップにムーブメントを追加する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setPlayerTarget("CF", 10, 20, "#00ff00"));

    const step = result.current.creation!.steps[0];
    expect(step.movements.size).toBe(1);
    expect(step.movements.get("CF")).toEqual({
      targetX: 10,
      targetZ: 20,
      color: "#00ff00",
    });
  });

  it("setPlayerTarget: デフォルトカラーは #ef4444 である", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setPlayerTarget("LW", 5, 15));

    const movement = result.current.creation!.steps[0].movements.get("LW");
    expect(movement).toBeDefined();
    expect(movement!.color).toBe("#ef4444");
  });

  it("setPlayerTarget: 同じロールを再設定すると上書きされる", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setPlayerTarget("CF", 10, 20));
    act(() => result.current.setPlayerTarget("CF", 30, 40, "#0000ff"));

    const step = result.current.creation!.steps[0];
    expect(step.movements.size).toBe(1);
    expect(step.movements.get("CF")).toEqual({
      targetX: 30,
      targetZ: 40,
      color: "#0000ff",
    });
  });

  it("removePlayerTarget: ムーブメントを削除する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setPlayerTarget("CF", 10, 20));
    expect(result.current.creation!.steps[0].movements.size).toBe(1);

    act(() => result.current.removePlayerTarget("CF"));
    expect(result.current.creation!.steps[0].movements.size).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // ボールパス編集
  // ---------------------------------------------------------------------------

  it("addBallPass: 現在のステップにボールパスを追加する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addBallPass("CM", "CF", "#ff0000", "high"));

    const passes = result.current.creation!.steps[0].ballPasses;
    expect(passes).toHaveLength(1);
    expect(passes[0]).toEqual({
      startRole: "CM",
      endRole: "CF",
      color: "#ff0000",
      trajectoryType: "high",
    });
  });

  it("addBallPass: デフォルトカラーは #facc15 である", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addBallPass("CM", "CF"));

    const pass = result.current.creation!.steps[0].ballPasses[0];
    expect(pass.color).toBe("#facc15");
  });

  it("addBallPass: trajectoryType を省略すると含まれない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addBallPass("CM", "CF"));

    const pass = result.current.creation!.steps[0].ballPasses[0];
    expect(pass.trajectoryType).toBeUndefined();
  });

  it("addBallPassByCoords: 座標でボールパスを追加する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() =>
      result.current.addBallPassByCoords(1, 2, 3, 4, "#abcdef", "curveLeft"),
    );

    const passes = result.current.creation!.steps[0].ballPasses;
    expect(passes).toHaveLength(1);
    expect(passes[0]).toEqual({
      startRole: "",
      endRole: "",
      color: "#abcdef",
      startX: 1,
      startZ: 2,
      endX: 3,
      endZ: 4,
      trajectoryType: "curveLeft",
    });
  });

  it("addBallPassByCoords: デフォルトカラーは #facc15 である", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addBallPassByCoords(0, 0, 5, 5));

    const pass = result.current.creation!.steps[0].ballPasses[0];
    expect(pass.color).toBe("#facc15");
  });

  it("removeBallPass: インデックスのボールパスを削除する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addBallPass("CM", "CF"));
    act(() => result.current.addBallPass("LW", "RW"));
    expect(result.current.creation!.steps[0].ballPasses).toHaveLength(2);

    act(() => result.current.removeBallPass(0));

    const passes = result.current.creation!.steps[0].ballPasses;
    expect(passes).toHaveLength(1);
    expect(passes[0].startRole).toBe("LW");
    expect(passes[0].endRole).toBe("RW");
  });

  // ---------------------------------------------------------------------------
  // ステップ管理
  // ---------------------------------------------------------------------------

  it("addStep: 新しいステップを追加して切り替える", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addStep());

    const c = result.current.creation!;
    expect(c.steps).toHaveLength(2);
    expect(c.currentStepIndex).toBe(1);
    expect(c.steps[1].id).toBe(2);
    expect(c.steps[1].movements.size).toBe(0);
    expect(c.steps[1].ballPasses).toEqual([]);
  });

  it("switchToStep: 有効なインデックスに切り替える", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));
    act(() => result.current.addStep());
    act(() => result.current.addStep());

    act(() => result.current.switchToStep(1));
    expect(result.current.creation!.currentStepIndex).toBe(1);
  });

  it("switchToStep: 範囲外のインデックスはクランプされる", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    // 上限クランプ（ステップは1つ、インデックス最大は0）
    act(() => result.current.switchToStep(100));
    expect(result.current.creation!.currentStepIndex).toBe(0);

    // 下限クランプ
    act(() => result.current.switchToStep(-5));
    expect(result.current.creation!.currentStepIndex).toBe(0);
  });

  it("addStep: ステップ追加後に元のステップにムーブメントが保持される", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setPlayerTarget("CF", 10, 20));
    act(() => result.current.addStep());

    // 新しいステップは空
    expect(result.current.creation!.steps[1].movements.size).toBe(0);
    // 元のステップはムーブメントを保持
    expect(result.current.creation!.steps[0].movements.get("CF")).toEqual({
      targetX: 10,
      targetZ: 20,
      color: "#ef4444",
    });
  });

  // ---------------------------------------------------------------------------
  // メタデータセッター
  // ---------------------------------------------------------------------------

  it("setNameJa: 日本語名を変更する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setNameJa("ビルドアップ"));
    expect(result.current.creation!.nameJa).toBe("ビルドアップ");
  });

  it("setNameEn: 英語名を変更する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setNameEn("Build Up"));
    expect(result.current.creation!.nameEn).toBe("Build Up");
  });

  it("setIcon: アイコンを変更する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setIcon("\uD83D\uDD25"));
    expect(result.current.creation!.icon).toBe("\uD83D\uDD25");
  });

  it("setGamePhase: フェーズを変更する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setGamePhase("defense"));
    expect(result.current.creation!.gamePhase).toBe("defense");
    expect(result.current.creation!.icon).toBe("\uD83D\uDEE1\uFE0F");
  });

  it("setGamePhase: カスタムアイコン選択後は上書きしない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));
    act(() => result.current.setIcon("\uD83D\uDD25"));

    act(() => result.current.setGamePhase("defense"));

    expect(result.current.creation!.gamePhase).toBe("defense");
    expect(result.current.creation!.icon).toBe("\uD83D\uDD25");
  });

  // ---------------------------------------------------------------------------
  // ウィザードステップ
  // ---------------------------------------------------------------------------

  it("setWizardStep: ウィザードステップを変更する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setWizardStep("editing"));
    expect(result.current.creation!.wizardStep).toBe("editing");

    act(() => result.current.setWizardStep("confirm"));
    expect(result.current.creation!.wizardStep).toBe("confirm");
  });

  // ---------------------------------------------------------------------------
  // ボール位置・軌道
  // ---------------------------------------------------------------------------

  it("setBallPosition: ボール位置を設定する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    act(() => result.current.setBallPosition({ x: 50, z: 30 }));
    expect(result.current.creation!.ballPosition).toEqual({ x: 50, z: 30 });
  });

  it("setBallPosition: null を設定してボール位置をクリアする", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    act(() => result.current.setBallPosition({ x: 50, z: 30 }));
    act(() => result.current.setBallPosition(null));
    expect(result.current.creation!.ballPosition).toBeNull();
  });

  it("setBallTrajectory: ボール軌道を設定する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    const trajectory = {
      endX: 60,
      endZ: 40,
      color: "#ff0000",
      trajectoryType: "high" as const,
    };
    act(() => result.current.setBallTrajectory(trajectory));
    expect(result.current.creation!.ballTrajectory).toEqual(trajectory);
  });

  it("setTrajectoryType: 既存の軌道のタイプを更新する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    act(() =>
      result.current.setBallTrajectory({
        endX: 60,
        endZ: 40,
        color: "#ff0000",
        trajectoryType: "high",
      }),
    );

    act(() => result.current.setTrajectoryType("curveRight"));
    expect(result.current.creation!.ballTrajectory!.trajectoryType).toBe(
      "curveRight",
    );
    // 他のプロパティは変更されない
    expect(result.current.creation!.ballTrajectory!.endX).toBe(60);
    expect(result.current.creation!.ballTrajectory!.color).toBe("#ff0000");
  });

  it("setTrajectoryType: ballTrajectory が null の場合は何もしない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    // ballTrajectory はデフォルトで null
    act(() => result.current.setTrajectoryType("low"));
    expect(result.current.creation!.ballTrajectory).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // セットポジション
  // ---------------------------------------------------------------------------

  it("setSetPosition: セットプレー開始位置を設定する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    act(() => result.current.setSetPosition("CF", 55, 35));
    expect(result.current.creation!.setPositions.get("CF")).toEqual({
      x: 55,
      z: 35,
    });
  });

  it("setSetPosition: 複数のロールに設定できる", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    act(() => result.current.setSetPosition("CF", 55, 35));
    act(() => result.current.setSetPosition("LW", 40, 25));

    expect(result.current.creation!.setPositions.size).toBe(2);
    expect(result.current.creation!.setPositions.get("CF")).toEqual({
      x: 55,
      z: 35,
    });
    expect(result.current.creation!.setPositions.get("LW")).toEqual({
      x: 40,
      z: 25,
    });
  });

  it("resetSetPositions: セットプレー位置をクリアする", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "set_piece"));

    act(() => result.current.setSetPosition("CF", 55, 35));
    act(() => result.current.setSetPosition("LW", 40, 25));
    expect(result.current.creation!.setPositions.size).toBe(2);

    act(() => result.current.resetSetPositions());
    expect(result.current.creation!.setPositions.size).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // リセット・タイムライン
  // ---------------------------------------------------------------------------

  it("resetCurrentStep: 現在のステップのムーブメントとボールパスをクリアする", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setPlayerTarget("CF", 10, 20));
    act(() => result.current.setPlayerTarget("LW", 5, 15));
    act(() => result.current.addBallPass("CM", "CF"));

    expect(result.current.creation!.steps[0].movements.size).toBe(2);
    expect(result.current.creation!.steps[0].ballPasses).toHaveLength(1);

    act(() => result.current.resetCurrentStep());

    expect(result.current.creation!.steps[0].movements.size).toBe(0);
    expect(result.current.creation!.steps[0].ballPasses).toEqual([]);
  });

  it("resetCurrentStep: 他のステップに影響しない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    // ステップ0にムーブメントを追加
    act(() => result.current.setPlayerTarget("CF", 10, 20));

    // ステップ1を追加してムーブメントを追加
    act(() => result.current.addStep());
    act(() => result.current.setPlayerTarget("LW", 5, 15));

    // ステップ1（現在）をリセット
    act(() => result.current.resetCurrentStep());

    expect(result.current.creation!.steps[1].movements.size).toBe(0);
    // ステップ0は影響なし
    expect(result.current.creation!.steps[0].movements.size).toBe(1);
  });

  it("setTimelineOpen: タイムラインの開閉を切り替える", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    expect(result.current.creation!.timelineOpen).toBe(false);

    act(() => result.current.setTimelineOpen(true));
    expect(result.current.creation!.timelineOpen).toBe(true);

    act(() => result.current.setTimelineOpen(false));
    expect(result.current.creation!.timelineOpen).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // ムーブメント遅延・ステップduration
  // ---------------------------------------------------------------------------

  it("setMovementDelay: 個別のムーブメント遅延を設定する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setMovementDelay(0, "CF", 500));

    // ステップのidは1なので、movementDelays[1] にデータが入る
    const delays = result.current.creation!.movementDelays;
    expect(delays[1]).toBeDefined();
    expect(delays[1]["CF"]).toBe(500);
  });

  it("setMovementDelay: 存在しないステップインデックスの場合は何も変わらない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    const before = result.current.creation!.movementDelays;
    act(() => result.current.setMovementDelay(99, "CF", 500));
    expect(result.current.creation!.movementDelays).toEqual(before);
  });

  it("setStepDuration: ステップの duration を変更する", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    expect(result.current.creation!.steps[0].duration).toBe(1000);

    act(() => result.current.setStepDuration(0, 2000));
    expect(result.current.creation!.steps[0].duration).toBe(2000);
  });

  it("setStepDuration: 存在しないステップインデックスでも他のステップに影響しない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setStepDuration(99, 3000));
    // 既存のステップには影響なし
    expect(result.current.creation!.steps[0].duration).toBe(1000);
  });

  // ---------------------------------------------------------------------------
  // creation が null の場合のセッター動作
  // ---------------------------------------------------------------------------

  describe("creation が null の場合、各セッター関数は何も変更しない", () => {
    it("setPlayerTarget は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setPlayerTarget("CF", 10, 20));
      expect(result.current.creation).toBeNull();
    });

    it("removePlayerTarget は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.removePlayerTarget("CF"));
      expect(result.current.creation).toBeNull();
    });

    it("addBallPass は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.addBallPass("CM", "CF"));
      expect(result.current.creation).toBeNull();
    });

    it("addBallPassByCoords は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.addBallPassByCoords(0, 0, 1, 1));
      expect(result.current.creation).toBeNull();
    });

    it("removeBallPass は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.removeBallPass(0));
      expect(result.current.creation).toBeNull();
    });

    it("addStep は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.addStep());
      expect(result.current.creation).toBeNull();
    });

    it("switchToStep は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.switchToStep(0));
      expect(result.current.creation).toBeNull();
    });

    it("setNameJa は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setNameJa("テスト"));
      expect(result.current.creation).toBeNull();
    });

    it("setNameEn は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setNameEn("test"));
      expect(result.current.creation).toBeNull();
    });

    it("setIcon は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setIcon("\uD83D\uDD25"));
      expect(result.current.creation).toBeNull();
    });

    it("setGamePhase は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setGamePhase("defense"));
      expect(result.current.creation).toBeNull();
    });

    it("setWizardStep は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setWizardStep("editing"));
      expect(result.current.creation).toBeNull();
    });

    it("setBallPosition は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setBallPosition({ x: 1, z: 2 }));
      expect(result.current.creation).toBeNull();
    });

    it("setBallTrajectory は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() =>
        result.current.setBallTrajectory({
          endX: 1,
          endZ: 2,
          color: "#fff",
          trajectoryType: "low",
        }),
      );
      expect(result.current.creation).toBeNull();
    });

    it("setTrajectoryType は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setTrajectoryType("high"));
      expect(result.current.creation).toBeNull();
    });

    it("setSetPosition は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setSetPosition("CF", 10, 20));
      expect(result.current.creation).toBeNull();
    });

    it("resetSetPositions は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.resetSetPositions());
      expect(result.current.creation).toBeNull();
    });

    it("resetCurrentStep は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.resetCurrentStep());
      expect(result.current.creation).toBeNull();
    });

    it("setTimelineOpen は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setTimelineOpen(true));
      expect(result.current.creation).toBeNull();
    });

    it("setMovementDelay は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setMovementDelay(0, "CF", 300));
      expect(result.current.creation).toBeNull();
    });

    it("setStepDuration は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.setStepDuration(0, 2000));
      expect(result.current.creation).toBeNull();
    });

    it("updateBallPassTrajectoryType は何もしない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.updateBallPassTrajectoryType(0, "high"));
      expect(result.current.creation).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // updateBallPassTrajectoryType
  // ---------------------------------------------------------------------------

  describe("updateBallPassTrajectoryType", () => {
    it("指定インデックスのボールパスの trajectoryType を更新する", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.startCreation("4-3-3", "attack"));

      act(() => result.current.addBallPass("CM1", "CF", "#ff0000", "low"));
      act(() => result.current.addBallPass("LW", "RW", "#00ff00", "high"));

      act(() => result.current.updateBallPassTrajectoryType(0, "curveLeft"));

      const passes = result.current.creation!.steps[0].ballPasses;
      expect(passes[0].trajectoryType).toBe("curveLeft");
      // 他のパスは変更されない
      expect(passes[1].trajectoryType).toBe("high");
    });

    it("他のプロパティ（色・ロール）は変更されない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.startCreation("4-3-3", "attack"));

      act(() => result.current.addBallPass("CM1", "CF", "#ff0000", "low"));
      act(() => result.current.updateBallPassTrajectoryType(0, "curveRight"));

      const pass = result.current.creation!.steps[0].ballPasses[0];
      expect(pass.startRole).toBe("CM1");
      expect(pass.endRole).toBe("CF");
      expect(pass.color).toBe("#ff0000");
      expect(pass.trajectoryType).toBe("curveRight");
    });

    it("存在しないインデックスの場合は何も変更しない", () => {
      const { result } = renderHook(() => useTacticCreation());
      act(() => result.current.startCreation("4-3-3", "attack"));

      act(() => result.current.addBallPass("CM1", "CF", "#ff0000", "low"));
      act(() => result.current.updateBallPassTrajectoryType(99, "high"));

      // 元のパスは変更されていない
      expect(
        result.current.creation!.steps[0].ballPasses[0].trajectoryType,
      ).toBe("low");
    });
  });

  // ---------------------------------------------------------------------------
  // buildTactic
  // ---------------------------------------------------------------------------

  describe("buildTactic", () => {
    it("creation が null の場合にエラーをスローする", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      expect(() => result.current.buildTactic(formation)).toThrow(
        "No creation state",
      );
    });

    it("基本的な Tactic を構築する（ボールなし・セットポジションなし）", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.setNameJa("テスト戦術"));
      act(() => result.current.setNameEn("Test Tactic"));
      act(() => result.current.setPlayerTarget("CF", 50, 30, "#ff0000"));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      expect(tactic!).toBeDefined();
      expect(tactic!.name).toEqual({ ja: "テスト戦術", en: "Test Tactic" });
      expect(tactic!.icon).toBe("\u26BD");
      expect(tactic!.phase.value).toBe("attack");
      expect(tactic!.isCustom).toBe(true);

      // ムーブメントを確認
      const movements = tactic!.getMovementsForFormation("4-3-3");
      expect(movements).toHaveLength(1);
      expect(movements[0].role).toBe("CF");
      expect(movements[0].targetX).toBe(50);
      expect(movements[0].targetZ).toBe(30);
      expect(movements[0].delay).toBe(0); // ボールなし・セットポジションなし → delay = 0
      expect(movements[0].arrowColor).toBe("#ff0000");
    });

    it("ボール位置と軌道がある場合にハイライトオフセットを含む", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setBallPosition({ x: 50, z: 30 }));
      act(() =>
        result.current.setBallTrajectory({
          endX: 60,
          endZ: 40,
          color: "#facc15",
          trajectoryType: "high",
        }),
      );
      act(() => result.current.setPlayerTarget("CF", 70, 50));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      // ボールパスが生成される
      const ballPasses = tactic!.getBallPassesForFormation("4-3-3");
      expect(ballPasses).toHaveLength(1);
      expect(ballPasses[0].startX).toBe(50);
      expect(ballPasses[0].startZ).toBe(30);
      expect(ballPasses[0].endX).toBe(60);
      expect(ballPasses[0].endZ).toBe(40);
      expect(ballPasses[0].color).toBe("#facc15");
      expect(ballPasses[0].trajectoryType).toBe("high");

      // ムーブメントにはハイライト + ボールキック遅延が含まれる
      // highlightOffset=1500, setPositionOffset=1500 (no set positions), ballKickOffset=500
      // baseDelay = 1500 + 500 = 2000
      const movements = tactic!.getMovementsForFormation("4-3-3");
      expect(movements).toHaveLength(1);
      expect(movements[0].delay).toBe(2000);

      // ボール位置が設定される
      expect(tactic!.ballPosition).toEqual({ x: 50, z: 30 });
    });

    it("セットポジションがある場合にセットポジションムーブメントを生成する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setSetPosition("CF", 55, 35));
      act(() => result.current.setSetPosition("LW", 40, 25));
      act(() => result.current.setPlayerTarget("CF", 70, 50));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      const movements = tactic!.getMovementsForFormation("4-3-3");
      // 2 set-position movements + 1 player target
      expect(movements).toHaveLength(3);

      // セットポジションムーブメントは delay=0 (highlightOffset=0, no ball)
      const setMovements = movements.filter((m) => m.arrowColor === "#64748b");
      expect(setMovements).toHaveLength(2);
      setMovements.forEach((m) => {
        expect(m.delay).toBe(0);
      });

      // プレイヤームーブメントは SET_POSITION_PAUSE_MS (2000) 後
      // setPositionOffset = 0 + 2000 = 2000, ballKickOffset = 0
      // baseDelay = 2000 + 0 = 2000
      const playerMovement = movements.find((m) => m.arrowColor !== "#64748b");
      expect(playerMovement!.delay).toBe(2000);
    });

    it("ボール + セットポジションの両方がある場合の遅延計算", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setBallPosition({ x: 50, z: 30 }));
      act(() =>
        result.current.setBallTrajectory({
          endX: 60,
          endZ: 40,
          color: "#facc15",
          trajectoryType: "low",
        }),
      );
      act(() => result.current.setSetPosition("CF", 55, 35));
      act(() => result.current.setPlayerTarget("CF", 70, 50));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      const movements = tactic!.getMovementsForFormation("4-3-3");

      // セットポジションムーブメント: delay = highlightOffset = 1500
      const setMovement = movements.find((m) => m.arrowColor === "#64748b");
      expect(setMovement!.delay).toBe(1500);

      // プレイヤームーブメント:
      // highlightOffset=1500, setPositionOffset=1500+2000=3500, ballKickOffset=500
      // baseDelay = 3500 + 500 = 4000
      const playerMovement = movements.find((m) => m.arrowColor !== "#64748b");
      expect(playerMovement!.delay).toBe(4000);

      // ボールパスの delay = setPositionOffset = 3500
      const ballPasses = tactic!.getBallPassesForFormation("4-3-3");
      expect(ballPasses[0].delay).toBe(3500);
    });

    it("複数ステップでの遅延累積を正しく計算する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: CF を移動、duration=1000
      act(() => result.current.setPlayerTarget("CF", 50, 30));

      // ステップ1を追加: LW を移動
      act(() => result.current.addStep());
      act(() => result.current.setPlayerTarget("LW", 20, 10));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      const movements = tactic!.getMovementsForFormation("4-3-3");
      expect(movements).toHaveLength(2);

      // ステップ0: baseDelay = 0 (no ball, no set positions)
      const cfMovement = movements.find((m) => m.role === "CF");
      expect(cfMovement!.delay).toBe(0);

      // ステップ1: baseDelay = 0 + steps[0].duration (1000) = 1000
      const lwMovement = movements.find((m) => m.role === "LW");
      expect(lwMovement!.delay).toBe(1000);
    });

    it("個別ムーブメント遅延を baseDelay に加算する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.setPlayerTarget("CF", 50, 30));
      act(() => result.current.setMovementDelay(0, "CF", 300));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      const movements = tactic!.getMovementsForFormation("4-3-3");
      // baseDelay = 0, individualDelay = 300
      expect(movements[0].delay).toBe(300);
    });

    it("ステップ内のボールパスが buildTactic に含まれる", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.addBallPass("CM1", "CF", "#ff0000", "high"));
      act(() =>
        result.current.addBallPassByCoords(10, 20, 30, 40, "#00ff00", "low"),
      );

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      const ballPasses = tactic!.getBallPassesForFormation("4-3-3");
      expect(ballPasses).toHaveLength(2);

      // ロールベースのパス
      expect(ballPasses[0].startRole).toBe("CM1");
      expect(ballPasses[0].endRole).toBe("CF");
      expect(ballPasses[0].color).toBe("#ff0000");
      expect(ballPasses[0].trajectoryType).toBe("high");

      // 座標ベースのパス
      expect(ballPasses[1].startX).toBe(10);
      expect(ballPasses[1].startZ).toBe(20);
      expect(ballPasses[1].endX).toBe(30);
      expect(ballPasses[1].endZ).toBe(40);
      expect(ballPasses[1].color).toBe("#00ff00");
    });

    it("名前が空の場合はデフォルト名を使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      expect(tactic!.name).toEqual({ ja: "新規戦術", en: "" });
    });

    it("フェーズマッピングが正しく適用される", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "defense"));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      expect(tactic!.phase.value).toBe("defense");
    });

    it("ballPosition なしの場合は Tactic.ballPosition が undefined", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      expect(tactic!.ballPosition).toBeUndefined();
    });

    it("複数ステップで duration が異なる場合の遅延累積", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: duration=500
      act(() => result.current.setStepDuration(0, 500));
      act(() => result.current.setPlayerTarget("CF", 50, 30));

      // ステップ1: duration=700
      act(() => result.current.addStep());
      act(() => result.current.setStepDuration(1, 700));
      act(() => result.current.setPlayerTarget("LW", 20, 10));

      // ステップ2
      act(() => result.current.addStep());
      act(() => result.current.setPlayerTarget("RW", 80, 10));

      let tactic: ReturnType<typeof result.current.buildTactic>;
      act(() => {
        tactic = result.current.buildTactic(formation);
      });

      const movements = tactic!.getMovementsForFormation("4-3-3");

      const cfMov = movements.find((m) => m.role === "CF");
      const lwMov = movements.find((m) => m.role === "LW");
      const rwMov = movements.find((m) => m.role === "RW");

      // ステップ0: baseDelay = 0
      expect(cfMov!.delay).toBe(0);
      // ステップ1: baseDelay = 500
      expect(lwMov!.delay).toBe(500);
      // ステップ2: baseDelay = 500 + 700 = 1200
      expect(rwMov!.delay).toBe(1200);
    });
  });

  // ---------------------------------------------------------------------------
  // getPreviewArrows
  // ---------------------------------------------------------------------------

  describe("getPreviewArrows", () => {
    it("creation が null の場合は空配列を返す", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      const arrows = result.current.getPreviewArrows(formation);
      expect(arrows).toEqual([]);
    });

    it("ステップ0でフォーメーション位置から矢印を生成する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.setPlayerTarget("CF", 50, 30, "#ff0000"));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(1);
      // CF はインデックス10、position = (100, 50)
      expect(arrows![0].start).toEqual({ x: 100, z: 50 });
      expect(arrows![0].end).toEqual({ x: 50, z: 30 });
      expect(arrows![0].color).toBe("#ff0000");
    });

    it("ステップ0でセットポジションが設定されている場合はそれを開始位置として使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setSetPosition("CF", 55, 35));
      act(() => result.current.setPlayerTarget("CF", 70, 50, "#ff0000"));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(1);
      // セットポジションが開始位置になる
      expect(arrows![0].start).toEqual({ x: 55, z: 35 });
      expect(arrows![0].end).toEqual({ x: 70, z: 50 });
    });

    it("ステップ1以降で前のステップのムーブメントを開始位置として使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: CF を (50, 30) に移動
      act(() => result.current.setPlayerTarget("CF", 50, 30));

      // ステップ1: CF を (70, 40) に移動
      act(() => result.current.addStep());
      act(() => result.current.setPlayerTarget("CF", 70, 40, "#00ff00"));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(1);
      // 前のステップのムーブメント先が開始位置
      expect(arrows![0].start).toEqual({ x: 50, z: 30 });
      expect(arrows![0].end).toEqual({ x: 70, z: 40 });
    });

    it("ステップ1以降で前のステップにムーブメントがない場合はフォーメーション位置を使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: CF は移動なし
      // ステップ1: CF を移動
      act(() => result.current.addStep());
      act(() => result.current.setPlayerTarget("CF", 70, 40));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(1);
      // CF: index=10, formation position = (100, 50)
      expect(arrows![0].start).toEqual({ x: 100, z: 50 });
    });

    it("ステップ2で2つ前のステップからムーブメントを検索する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: CF を (50, 30) に移動
      act(() => result.current.setPlayerTarget("CF", 50, 30));

      // ステップ1: CF は移動なし
      act(() => result.current.addStep());

      // ステップ2: CF を (90, 60) に移動
      act(() => result.current.addStep());
      act(() => result.current.setPlayerTarget("CF", 90, 60));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(1);
      // ステップ0のムーブメント先が開始位置
      expect(arrows![0].start).toEqual({ x: 50, z: 30 });
      expect(arrows![0].end).toEqual({ x: 90, z: 60 });
    });

    it("roleMap に存在しないロールの場合は矢印を生成しない", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.setPlayerTarget("UNKNOWN", 50, 30));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(0);
    });

    it("複数のムーブメントがある場合にすべての矢印を生成する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.setPlayerTarget("CF", 50, 30, "#ff0000"));
      act(() => result.current.setPlayerTarget("LW", 20, 10, "#00ff00"));

      let arrows: ReturnType<typeof result.current.getPreviewArrows>;
      act(() => {
        arrows = result.current.getPreviewArrows(formation);
      });

      expect(arrows!).toHaveLength(2);
    });
  });

  // ---------------------------------------------------------------------------
  // getPreviewBallPasses
  // ---------------------------------------------------------------------------

  describe("getPreviewBallPasses", () => {
    it("creation が null の場合は空配列を返す", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      const passes = result.current.getPreviewBallPasses(formation);
      expect(passes).toEqual([]);
    });

    it("ロールベースのボールパスでフォーメーション位置を使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.addBallPass("CM1", "CF", "#ff0000", "high"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      expect(passes!).toHaveLength(1);
      // CM1: index=5, position=(50, 25)
      expect(passes![0].start).toEqual({ x: 50, z: 25 });
      // CF: index=10, position=(100, 50)
      expect(passes![0].end).toEqual({ x: 100, z: 50 });
      expect(passes![0].color).toBe("#ff0000");
      expect(passes![0].trajectoryType).toBe("high");
    });

    it("座標ベースのボールパスで直接座標を使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() =>
        result.current.addBallPassByCoords(
          10,
          20,
          30,
          40,
          "#00ff00",
          "curveLeft",
        ),
      );

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      expect(passes!).toHaveLength(1);
      expect(passes![0].start).toEqual({ x: 10, z: 20 });
      expect(passes![0].end).toEqual({ x: 30, z: 40 });
      expect(passes![0].color).toBe("#00ff00");
      expect(passes![0].trajectoryType).toBe("curveLeft");
    });

    it("ロールベースのパスでセットポジションが設定されている場合はそれを使用する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setSetPosition("CM1", 55, 35));
      act(() => result.current.setSetPosition("CF", 65, 45));
      act(() => result.current.addBallPass("CM1", "CF", "#ff0000"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      expect(passes!).toHaveLength(1);
      // セットポジションが使用される
      expect(passes![0].start).toEqual({ x: 55, z: 35 });
      expect(passes![0].end).toEqual({ x: 65, z: 45 });
    });

    it("startRole が roleMap に存在しない場合はスキップする", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.addBallPass("UNKNOWN_START", "CF", "#ff0000"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      expect(passes!).toHaveLength(0);
    });

    it("endRole が roleMap に存在しない場合はスキップする", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.addBallPass("CM1", "UNKNOWN_END", "#ff0000"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      expect(passes!).toHaveLength(0);
    });

    it("startRole も endRole も空で座標もない場合はスキップする", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      // addBallPass with empty strings (no coords)
      act(() => result.current.addBallPass("", "", "#ff0000"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      // startRole="" → no coords, no startRole → continue (skip)
      expect(passes!).toHaveLength(0);
    });

    it("trajectoryType がない場合は結果に含まれない", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      act(() => result.current.addBallPass("CM1", "CF"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      expect(passes!).toHaveLength(1);
      expect(passes![0].trajectoryType).toBeUndefined();
    });

    it("endRole が空で endX/endZ もない場合はスキップする", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));
      // startRole with coords, but endRole empty and no end coords
      // This requires direct state manipulation - we use addBallPassByCoords with valid start but rely on the bp having no endRole
      // Actually, addBallPass("CM1", "") creates startRole="CM1", endRole="" with no endX/endZ
      act(() => result.current.addBallPass("CM1", "", "#ff0000"));

      let passes: ReturnType<typeof result.current.getPreviewBallPasses>;
      act(() => {
        passes = result.current.getPreviewBallPasses(formation);
      });

      // startRole="CM1" resolved, endRole="" → no idx → no endPos → skip
      expect(passes!).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getStepStartPositions
  // ---------------------------------------------------------------------------

  describe("getStepStartPositions", () => {
    it("creation が null の場合は空オブジェクトを返す", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      const positions = result.current.getStepStartPositions(0, formation);
      expect(positions).toEqual({});
    });

    it("ステップ0でフォーメーション位置を返す", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      let positions: ReturnType<typeof result.current.getStepStartPositions>;
      act(() => {
        positions = result.current.getStepStartPositions(0, formation);
      });

      // 11人のポジション
      expect(Object.keys(positions!)).toHaveLength(11);
      // GK: index=0, position=(0, 0)
      expect(positions![0]).toEqual({ x: 0, z: 0 });
      // CF: index=10, position=(100, 50)
      expect(positions![10]).toEqual({ x: 100, z: 50 });
    });

    it("セットポジションがある場合はフォーメーション位置を上書きする", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setSetPosition("CF", 55, 35));

      let positions: ReturnType<typeof result.current.getStepStartPositions>;
      act(() => {
        positions = result.current.getStepStartPositions(0, formation);
      });

      // CF (index=10) はセットポジションで上書き
      expect(positions![10]).toEqual({ x: 55, z: 35 });
      // 他のポジションはフォーメーション位置のまま
      expect(positions![0]).toEqual({ x: 0, z: 0 });
    });

    it("ステップ1で前のステップのムーブメントを反映する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: CF を (50, 30) に移動
      act(() => result.current.setPlayerTarget("CF", 50, 30));

      // ステップ1を追加
      act(() => result.current.addStep());

      let positions: ReturnType<typeof result.current.getStepStartPositions>;
      act(() => {
        positions = result.current.getStepStartPositions(1, formation);
      });

      // CF (index=10) はステップ0のムーブメント先
      expect(positions![10]).toEqual({ x: 50, z: 30 });
      // 移動しなかった選手はフォーメーション位置
      expect(positions![0]).toEqual({ x: 0, z: 0 });
    });

    it("ステップ2で複数の前ステップのムーブメントを累積する", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "attack"));

      // ステップ0: CF を (50, 30) に移動
      act(() => result.current.setPlayerTarget("CF", 50, 30));

      // ステップ1: CF を (70, 40) に移動, LW を (25, 15) に移動
      act(() => result.current.addStep());
      act(() => result.current.setPlayerTarget("CF", 70, 40));
      act(() => result.current.setPlayerTarget("LW", 25, 15));

      // ステップ2を追加
      act(() => result.current.addStep());

      let positions: ReturnType<typeof result.current.getStepStartPositions>;
      act(() => {
        positions = result.current.getStepStartPositions(2, formation);
      });

      // CF (index=10): ステップ1のムーブメント先（最新が適用される）
      expect(positions![10]).toEqual({ x: 70, z: 40 });
      // LW (index=8): ステップ1のムーブメント先
      expect(positions![8]).toEqual({ x: 25, z: 15 });
      // 他の選手はフォーメーション位置
      expect(positions![0]).toEqual({ x: 0, z: 0 });
    });

    it("セットポジション + 前ステップムーブメントの両方がある場合", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setSetPosition("CF", 55, 35));

      // ステップ0: CF を (70, 45) に移動
      act(() => result.current.setPlayerTarget("CF", 70, 45));

      // ステップ1を追加
      act(() => result.current.addStep());

      let positions: ReturnType<typeof result.current.getStepStartPositions>;
      act(() => {
        positions = result.current.getStepStartPositions(1, formation);
      });

      // CF (index=10): ステップ0のムーブメント先が最終位置（セットポジションは上書きされる）
      expect(positions![10]).toEqual({ x: 70, z: 45 });
    });

    it("roleMap に存在しないロールのセットポジションは無視される", () => {
      const { result } = renderHook(() => useTacticCreation());
      const formation = createTestFormation();

      act(() => result.current.startCreation("4-3-3", "set_piece"));
      act(() => result.current.setSetPosition("UNKNOWN", 55, 35));

      let positions: ReturnType<typeof result.current.getStepStartPositions>;
      act(() => {
        positions = result.current.getStepStartPositions(0, formation);
      });

      // 11人のフォーメーション位置のみ（UNKNOWNは無視）
      expect(Object.keys(positions!)).toHaveLength(11);
    });
  });

  // ---------------------------------------------------------------------------
  // addBallPassByCoords の追加テスト
  // ---------------------------------------------------------------------------

  it("addBallPassByCoords: trajectoryType を省略すると含まれない", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.addBallPassByCoords(1, 2, 3, 4));

    const pass = result.current.creation!.steps[0].ballPasses[0];
    expect(pass.trajectoryType).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // setMovementDelay の追加テスト
  // ---------------------------------------------------------------------------

  it("setMovementDelay: 同じステップの同じロールに再設定すると上書きする", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setMovementDelay(0, "CF", 500));
    act(() => result.current.setMovementDelay(0, "CF", 800));

    const delays = result.current.creation!.movementDelays;
    expect(delays[1]["CF"]).toBe(800);
  });

  it("setMovementDelay: 同じステップの異なるロールに設定できる", () => {
    const { result } = renderHook(() => useTacticCreation());
    act(() => result.current.startCreation("4-3-3", "attack"));

    act(() => result.current.setMovementDelay(0, "CF", 500));
    act(() => result.current.setMovementDelay(0, "LW", 300));

    const delays = result.current.creation!.movementDelays;
    expect(delays[1]["CF"]).toBe(500);
    expect(delays[1]["LW"]).toBe(300);
  });
});
