import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { Phase } from "@domain/value-objects/Phase";
import { TacticId } from "@domain/value-objects/TacticId";
import { ROLES, FUTSAL_ROLES } from "@shared/constants/roles";

export const DEFAULT_TACTICS = [
  // ========== ATTACK (攻撃フェーズ) ==========

  // 左オーバーラップ
  Tactic.createDefault(new TacticId("LEFT_SB_OVERLAP"), {
    name: { ja: "左オーバーラップ", en: "Left Overlap" },
    icon: "↖️",
    phase: Phase.attack(),
    movements: new Map([
      [
        "4-3-3",
        [
          Movement.create(ROLES.WIDE_ATK_L, 2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_L, 4.5, 3, 600, "#3b82f6"),
        ],
      ],
      [
        "4-2-3-1",
        [
          Movement.create(ROLES.WIDE_ATK_L, 2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_L, 4.5, 3, 600, "#3b82f6"),
        ],
      ],
      [
        "4-4-2 Flat",
        [
          Movement.create(ROLES.WIDE_ATK_L, 2.5, 2, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_L, 4.5, 2.8, 600, "#3b82f6"),
        ],
      ],
      [
        "3-4-2-1",
        [
          Movement.create(ROLES.WIDE_ATK_L, 2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_L, 4.5, 2, 600, "#3b82f6"),
        ],
      ],
      [
        "3-4-3",
        [
          Movement.create(ROLES.WIDE_ATK_L, 2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_L, 4.5, 2, 600, "#3b82f6"),
        ],
      ],
      [
        "5-4-1",
        [
          Movement.create(ROLES.WIDE_MID_L, 2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_L, 4.5, 2, 600, "#3b82f6"),
        ],
      ],
    ]),
  }),

  // 右オーバーラップ
  Tactic.createDefault(new TacticId("RIGHT_SB_OVERLAP"), {
    name: { ja: "右オーバーラップ", en: "Right Overlap" },
    icon: "↗️",
    phase: Phase.attack(),
    movements: new Map([
      [
        "4-3-3",
        [
          Movement.create(ROLES.WIDE_ATK_R, -2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_R, -4.5, 3, 600, "#3b82f6"),
        ],
      ],
      [
        "4-2-3-1",
        [
          Movement.create(ROLES.WIDE_ATK_R, -2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_R, -4.5, 3, 600, "#3b82f6"),
        ],
      ],
      [
        "4-4-2 Flat",
        [
          Movement.create(ROLES.WIDE_ATK_R, -2.5, 2, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_R, -4.5, 2.8, 600, "#3b82f6"),
        ],
      ],
      [
        "3-4-2-1",
        [
          Movement.create(ROLES.WIDE_ATK_R, -2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_R, -4.5, 2, 600, "#3b82f6"),
        ],
      ],
      [
        "3-4-3",
        [
          Movement.create(ROLES.WIDE_ATK_R, -2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_R, -4.5, 2, 600, "#3b82f6"),
        ],
      ],
      [
        "5-4-1",
        [
          Movement.create(ROLES.WIDE_MID_R, -2, 2.5, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_DEF_R, -4.5, 2, 600, "#3b82f6"),
        ],
      ],
    ]),
  }),

  // ========== DEFENSE (守備フェーズ) ==========

  // ハイプレス
  Tactic.createDefault(new TacticId("HIGH_PRESS"), {
    name: { ja: "ハイプレス", en: "ハイプレス" },
    icon: "🔥",
    phase: Phase.defense(),
    movements: new Map([
      [
        "4-3-3",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 2, 3, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -2, 3, 200, "#ef4444"),
        ],
      ],
      [
        "4-2-3-1",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 2.5, 2.5, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -2.5, 2.5, 200, "#ef4444"),
        ],
      ],
      [
        "3-5-2",
        [
          Movement.create(ROLES.CENTER_FWD, 0.5, 4, 0, "#ef4444"),
          Movement.create(ROLES.SECOND_FWD, -0.5, 3.5, 0, "#ef4444"),
        ],
      ],
      [
        "4-4-2 Flat",
        [
          Movement.create(ROLES.CENTER_FWD, 0.5, 3.8, 0, "#ef4444"),
          Movement.create(ROLES.SECOND_FWD, -0.5, 3.8, 0, "#ef4444"),
        ],
      ],
      [
        "3-4-2-1",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 2.5, 2.5, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -2.5, 2.5, 200, "#ef4444"),
        ],
      ],
      [
        "3-4-3",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 2.5, 2.5, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -2.5, 2.5, 200, "#ef4444"),
        ],
      ],
      [
        "5-4-1",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_L, 2.5, 2.2, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_R, -2.5, 2.2, 200, "#ef4444"),
        ],
      ],
    ]),
  }),

  // ========== POSITIVE TRANSITION (ポジティブトランジション) ==========

  // カウンター
  Tactic.createDefault(new TacticId("COUNTER_ATK"), {
    name: { ja: "カウンター", en: "カウンター" },
    icon: "⚡",
    phase: Phase.positiveTransition(),
    movements: new Map([
      [
        "4-3-3",
        [
          Movement.create(ROLES.WIDE_ATK_L, 4, 3, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -4, 3, 0, "#ef4444"),
          Movement.create(ROLES.CENTER_FWD, 0, 4, 200, "#ef4444"),
        ],
      ],
      [
        "4-2-3-1",
        [
          Movement.create(ROLES.WIDE_ATK_L, 4, 3, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -4, 3, 0, "#ef4444"),
          Movement.create(ROLES.CENTER_FWD, 0, 4, 200, "#ef4444"),
        ],
      ],
      [
        "3-5-2",
        [
          Movement.create(ROLES.CENTER_FWD, 1, 4, 0, "#ef4444"),
          Movement.create(ROLES.SECOND_FWD, -1, 3.5, 0, "#ef4444"),
        ],
      ],
      [
        "4-4-2 Flat",
        [
          Movement.create(ROLES.CENTER_FWD, 0.5, 4, 0, "#ef4444"),
          Movement.create(ROLES.SECOND_FWD, -0.5, 3.8, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 3, 3, 300, "#7c3aed"),
          Movement.create(ROLES.WIDE_ATK_R, -3, 3, 300, "#7c3aed"),
        ],
      ],
      [
        "3-4-2-1",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 3, 3.5, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -3, 3.5, 200, "#ef4444"),
        ],
      ],
      [
        "3-4-3",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_L, 3, 3.5, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_ATK_R, -3, 3.5, 200, "#ef4444"),
        ],
      ],
      [
        "5-4-1",
        [
          Movement.create(ROLES.CENTER_FWD, 0, 4, 0, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_L, 3, 3, 200, "#ef4444"),
          Movement.create(ROLES.WIDE_MID_R, -3, 3, 200, "#ef4444"),
        ],
      ],
    ]),
  }),

  // ========== FUTSAL ==========

  // 左回りローテーション
  Tactic.createDefault(new TacticId("FUTSAL_ROTATION_LEFT"), {
    name: { ja: "左回りローテーション", en: "Left Rotation" },
    icon: "🔄",
    phase: Phase.attack(),
    movements: new Map([
      [
        "1-2-1",
        [
          Movement.create(FUTSAL_ROLES.ALA_L, 0, 1.5, 0, "#ef4444"),
          Movement.create(FUTSAL_ROLES.PIVOT, -2.5, 0, 300, "#3b82f6"),
          Movement.create(FUTSAL_ROLES.ALA_R, 0, -1.2, 600, "#7c3aed"),
          Movement.create(FUTSAL_ROLES.FIXO, 2.5, 0, 900, "#22c55e"),
        ],
      ],
    ]),
  }),
];
