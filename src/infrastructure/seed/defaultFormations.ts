import { Formation, FormationPosition } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { FormationId } from "@domain/value-objects/FormationId";
import {
  ROLES,
  FUTSAL_ROLES,
  EIGHT_ASIDE_ROLES,
  SOCIETY_ROLES,
} from "@shared/constants/roles";

const createFormationPositions = (
  data: Array<{
    pos: string;
    x: number;
    z: number;
    cat: "gk" | "df" | "mf" | "fw";
  }>,
): FormationPosition[] => {
  return data.map((p) => ({
    pos: p.pos,
    position: Position.create(p.x, p.z),
    category: p.cat,
  }));
};

// ROLE_MAP - 各フォーメーションにおける戦術ロールと選手インデックスの対応表（GKはインデックス0）
const ROLE_MAP = {
  "4-3-3": {
    [ROLES.GOALKEEPER]: 0,
    [ROLES.WIDE_DEF_L]: 1,
    [ROLES.CENTER_DEF_L]: 2,
    [ROLES.CENTER_DEF_R]: 3,
    [ROLES.WIDE_DEF_R]: 4,
    [ROLES.PIVOT]: 5,
    [ROLES.BOX_TO_BOX_L]: 6,
    [ROLES.BOX_TO_BOX_R]: 7,
    [ROLES.WIDE_ATK_L]: 8,
    [ROLES.CENTER_FWD]: 9,
    [ROLES.WIDE_ATK_R]: 10,
  },
  "4-4-2": {
    [ROLES.GOALKEEPER]: 0,
    [ROLES.WIDE_DEF_L]: 1,
    [ROLES.CENTER_DEF_L]: 2,
    [ROLES.CENTER_DEF_R]: 3,
    [ROLES.WIDE_DEF_R]: 4,
    [ROLES.WIDE_ATK_L]: 5,
    [ROLES.BOX_TO_BOX_L]: 6,
    [ROLES.BOX_TO_BOX_R]: 7,
    [ROLES.WIDE_ATK_R]: 8,
    [ROLES.CENTER_FWD]: 9,
    [ROLES.SECOND_FWD]: 10,
  },
  "4-2-3-1": {
    [ROLES.GOALKEEPER]: 0,
    [ROLES.WIDE_DEF_L]: 1,
    [ROLES.CENTER_DEF_L]: 2,
    [ROLES.CENTER_DEF_R]: 3,
    [ROLES.WIDE_DEF_R]: 4,
    [ROLES.PIVOT]: 5,
    [ROLES.BOX_TO_BOX_R]: 6,
    [ROLES.WIDE_ATK_L]: 7,
    [ROLES.PLAYMAKER]: 8,
    [ROLES.WIDE_ATK_R]: 9,
    [ROLES.CENTER_FWD]: 10,
  },
  "3-5-2": {
    [ROLES.GOALKEEPER]: 0,
    [ROLES.CENTER_DEF_L]: 1,
    [ROLES.CENTER_DEF_C]: 2,
    [ROLES.CENTER_DEF_R]: 3,
    [ROLES.WIDE_DEF_L]: 4,
    [ROLES.BOX_TO_BOX_L]: 5,
    [ROLES.PIVOT]: 6,
    [ROLES.BOX_TO_BOX_R]: 7,
    [ROLES.WIDE_DEF_R]: 8,
    [ROLES.CENTER_FWD]: 9,
    [ROLES.SECOND_FWD]: 10,
  },
  "5-3-2": {
    [ROLES.GOALKEEPER]: 0,
    [ROLES.WIDE_DEF_L]: 1,
    [ROLES.CENTER_DEF_L]: 2,
    [ROLES.CENTER_DEF_C]: 3,
    [ROLES.CENTER_DEF_R]: 4,
    [ROLES.WIDE_DEF_R]: 5,
    [ROLES.BOX_TO_BOX_L]: 6,
    [ROLES.PIVOT]: 7,
    [ROLES.BOX_TO_BOX_R]: 8,
    [ROLES.CENTER_FWD]: 9,
    [ROLES.SECOND_FWD]: 10,
  },
  "3-4-2-1": {
    [ROLES.GOALKEEPER]: 0,
    [ROLES.CENTER_DEF_L]: 1,
    [ROLES.CENTER_DEF_C]: 2,
    [ROLES.CENTER_DEF_R]: 3,
    [ROLES.WIDE_MID_L]: 4,
    [ROLES.BOX_TO_BOX_L]: 5,
    [ROLES.BOX_TO_BOX_R]: 6,
    [ROLES.WIDE_MID_R]: 7,
    [ROLES.WIDE_ATK_L]: 8,
    [ROLES.WIDE_ATK_R]: 9,
    [ROLES.CENTER_FWD]: 10,
  },
};

// ROLE_MAPをMapに変換
export const createRoleMap = (
  formationType: keyof typeof ROLE_MAP,
): Map<string, number> => {
  const roleMapObj = ROLE_MAP[formationType];
  const roleMap = new Map<string, number>();
  Object.entries(roleMapObj).forEach(([role, index]) => {
    roleMap.set(role, index);
  });
  return roleMap;
};

export const DEFAULT_FORMATIONS = [
  Formation.createDefault(
    new FormationId("4-3-3"),
    "4-3-3",
    "4-3-3",
    createFormationPositions([
      { pos: "GK", x: 0, z: -4.5, cat: "gk" },
      { pos: "LB", x: 3, z: -3, cat: "df" },
      { pos: "LCB", x: 1, z: -3.3, cat: "df" },
      { pos: "RCB", x: -1, z: -3.3, cat: "df" },
      { pos: "RB", x: -3, z: -3, cat: "df" },
      { pos: "DMF", x: 0, z: -1.5, cat: "mf" },
      { pos: "LCM", x: 2, z: -0.5, cat: "mf" },
      { pos: "RCM", x: -2, z: -0.5, cat: "mf" },
      { pos: "LW", x: 3, z: 1.5, cat: "fw" },
      { pos: "CF", x: 0, z: 2.5, cat: "fw" },
      { pos: "RW", x: -3, z: 1.5, cat: "fw" },
    ]),
    createRoleMap("4-3-3"),
  ),
  Formation.createDefault(
    new FormationId("4-4-2"),
    "4-4-2",
    "4-4-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -4.5, cat: "gk" },
      { pos: "LB", x: 3, z: -3, cat: "df" },
      { pos: "LCB", x: 1, z: -3.3, cat: "df" },
      { pos: "RCB", x: -1, z: -3.3, cat: "df" },
      { pos: "RB", x: -3, z: -3, cat: "df" },
      { pos: "LM", x: 3, z: -0.5, cat: "mf" },
      { pos: "LCM", x: 1, z: -1, cat: "mf" },
      { pos: "RCM", x: -1, z: -1, cat: "mf" },
      { pos: "RM", x: -3, z: -0.5, cat: "mf" },
      { pos: "LST", x: 1, z: 2, cat: "fw" },
      { pos: "RST", x: -1, z: 2, cat: "fw" },
    ]),
    createRoleMap("4-4-2"),
  ),
  Formation.createDefault(
    new FormationId("4-2-3-1"),
    "4-2-3-1",
    "4-2-3-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -4.5, cat: "gk" },
      { pos: "LB", x: 3, z: -3, cat: "df" },
      { pos: "LCB", x: 1, z: -3.3, cat: "df" },
      { pos: "RCB", x: -1, z: -3.3, cat: "df" },
      { pos: "RB", x: -3, z: -3, cat: "df" },
      { pos: "LDMF", x: 1, z: -1.5, cat: "mf" },
      { pos: "RDMF", x: -1, z: -1.5, cat: "mf" },
      { pos: "LAM", x: 2.5, z: 0.5, cat: "mf" },
      { pos: "CAM", x: 0, z: 0.3, cat: "mf" },
      { pos: "RAM", x: -2.5, z: 0.5, cat: "mf" },
      { pos: "ST", x: 0, z: 2.3, cat: "fw" },
    ]),
    createRoleMap("4-2-3-1"),
  ),
  Formation.createDefault(
    new FormationId("3-5-2"),
    "3-5-2",
    "3-5-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -4.5, cat: "gk" },
      { pos: "LCB", x: 2, z: -3.3, cat: "df" },
      { pos: "CB", x: 0, z: -3.5, cat: "df" },
      { pos: "RCB", x: -2, z: -3.3, cat: "df" },
      { pos: "LWB", x: 4, z: -1, cat: "mf" },
      { pos: "LCM", x: 1.5, z: -1.5, cat: "mf" },
      { pos: "CDM", x: 0, z: -2, cat: "mf" },
      { pos: "RCM", x: -1.5, z: -1.5, cat: "mf" },
      { pos: "RWB", x: -4, z: -1, cat: "mf" },
      { pos: "LST", x: 1.5, z: 2, cat: "fw" },
      { pos: "RST", x: -1.5, z: 2, cat: "fw" },
    ]),
    createRoleMap("3-5-2"),
  ),
  Formation.createDefault(
    new FormationId("5-3-2"),
    "5-3-2",
    "5-3-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -4.5, cat: "gk" },
      { pos: "LWB", x: 4, z: -2.5, cat: "df" },
      { pos: "LCB", x: 2, z: -3.5, cat: "df" },
      { pos: "CB", x: 0, z: -3.8, cat: "df" },
      { pos: "RCB", x: -2, z: -3.5, cat: "df" },
      { pos: "RWB", x: -4, z: -2.5, cat: "df" },
      { pos: "LCM", x: 2, z: -0.5, cat: "mf" },
      { pos: "CDM", x: 0, z: -1, cat: "mf" },
      { pos: "RCM", x: -2, z: -0.5, cat: "mf" },
      { pos: "LST", x: 1.5, z: 2, cat: "fw" },
      { pos: "RST", x: -1.5, z: 2, cat: "fw" },
    ]),
    createRoleMap("5-3-2"),
  ),
  Formation.createDefault(
    new FormationId("3-4-2-1"),
    "3-4-2-1",
    "3-4-2-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -4.5, cat: "gk" },
      { pos: "LCB", x: 2, z: -3.3, cat: "df" },
      { pos: "CB", x: 0, z: -3.5, cat: "df" },
      { pos: "RCB", x: -2, z: -3.3, cat: "df" },
      { pos: "LM", x: 4, z: -1, cat: "mf" },
      { pos: "LCM", x: 1.5, z: -1.5, cat: "mf" },
      { pos: "RCM", x: -1.5, z: -1.5, cat: "mf" },
      { pos: "RM", x: -4, z: -1, cat: "mf" },
      { pos: "LAM", x: 2, z: 0.8, cat: "mf" },
      { pos: "RAM", x: -2, z: 0.8, cat: "mf" },
      { pos: "ST", x: 0, z: 2.5, cat: "fw" },
    ]),
    createRoleMap("3-4-2-1"),
  ),
];

// ========== フットサル フォーメーション（5人制、GK含む） ==========

const FUTSAL_ROLE_MAP = {
  "2-2": {
    [FUTSAL_ROLES.GOALKEEPER]: 0,
    [FUTSAL_ROLES.ALA_L]: 1,
    [FUTSAL_ROLES.ALA_R]: 2,
    [FUTSAL_ROLES.FIXO]: 3,
    [FUTSAL_ROLES.PIVOT]: 4,
  },
  "1-2-1": {
    [FUTSAL_ROLES.GOALKEEPER]: 0,
    [FUTSAL_ROLES.FIXO]: 1,
    [FUTSAL_ROLES.ALA_L]: 2,
    [FUTSAL_ROLES.ALA_R]: 3,
    [FUTSAL_ROLES.PIVOT]: 4,
  },
  "1-1-2": {
    [FUTSAL_ROLES.GOALKEEPER]: 0,
    [FUTSAL_ROLES.FIXO]: 1,
    [FUTSAL_ROLES.PIVOT]: 2,
    [FUTSAL_ROLES.ALA_L]: 3,
    [FUTSAL_ROLES.ALA_R]: 4,
  },
  "3-1": {
    [FUTSAL_ROLES.GOALKEEPER]: 0,
    [FUTSAL_ROLES.ALA_L]: 1,
    [FUTSAL_ROLES.FIXO]: 2,
    [FUTSAL_ROLES.ALA_R]: 3,
    [FUTSAL_ROLES.PIVOT]: 4,
  },
  "2-1-1": {
    [FUTSAL_ROLES.GOALKEEPER]: 0,
    [FUTSAL_ROLES.ALA_L]: 1,
    [FUTSAL_ROLES.ALA_R]: 2,
    [FUTSAL_ROLES.FIXO]: 3,
    [FUTSAL_ROLES.PIVOT]: 4,
  },
  "1-3": {
    [FUTSAL_ROLES.GOALKEEPER]: 0,
    [FUTSAL_ROLES.FIXO]: 1,
    [FUTSAL_ROLES.ALA_L]: 2,
    [FUTSAL_ROLES.PIVOT]: 3,
    [FUTSAL_ROLES.ALA_R]: 4,
  },
};

const createFutsalRoleMap = (
  formationType: keyof typeof FUTSAL_ROLE_MAP,
): Map<string, number> => {
  const roleMapObj = FUTSAL_ROLE_MAP[formationType];
  const roleMap = new Map<string, number>();
  Object.entries(roleMapObj).forEach(([role, index]) => {
    roleMap.set(role, index);
  });
  return roleMap;
};

export const DEFAULT_FUTSAL_FORMATIONS = [
  // 2-2: フラット2ライン
  Formation.createDefault(
    new FormationId("futsal-2-2"),
    "2-2",
    "2-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.5, cat: "gk" },
      { pos: "ALA_L", x: 2, z: -0.8, cat: "df" },
      { pos: "ALA_R", x: -2, z: -0.8, cat: "df" },
      { pos: "FIXO", x: 2, z: 1, cat: "fw" },
      { pos: "PIVOT", x: -2, z: 1, cat: "fw" },
    ]),
    createFutsalRoleMap("2-2"),
    "futsal",
  ),
  // 1-2-1: ダイヤモンド型
  Formation.createDefault(
    new FormationId("futsal-1-2-1"),
    "1-2-1",
    "1-2-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.5, cat: "gk" },
      { pos: "FIXO", x: 0, z: -1.2, cat: "df" },
      { pos: "ALA_L", x: 2.5, z: 0, cat: "mf" },
      { pos: "ALA_R", x: -2.5, z: 0, cat: "mf" },
      { pos: "PIVOT", x: 0, z: 1.5, cat: "fw" },
    ]),
    createFutsalRoleMap("1-2-1"),
    "futsal",
  ),
  // 1-1-2: 攻撃的ダイヤモンド
  Formation.createDefault(
    new FormationId("futsal-1-1-2"),
    "1-1-2",
    "1-1-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.5, cat: "gk" },
      { pos: "FIXO", x: 0, z: -1.2, cat: "df" },
      { pos: "PIVOT", x: 0, z: 0.3, cat: "mf" },
      { pos: "ALA_L", x: 2, z: 1.5, cat: "fw" },
      { pos: "ALA_R", x: -2, z: 1.5, cat: "fw" },
    ]),
    createFutsalRoleMap("1-1-2"),
    "futsal",
  ),
  // 3-1: 守備的フラット
  Formation.createDefault(
    new FormationId("futsal-3-1"),
    "3-1",
    "3-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.5, cat: "gk" },
      { pos: "ALA_L", x: 2.5, z: -0.8, cat: "df" },
      { pos: "FIXO", x: 0, z: -1, cat: "df" },
      { pos: "ALA_R", x: -2.5, z: -0.8, cat: "df" },
      { pos: "PIVOT", x: 0, z: 1.2, cat: "fw" },
    ]),
    createFutsalRoleMap("3-1"),
    "futsal",
  ),
  // 2-1-1: バランス型
  Formation.createDefault(
    new FormationId("futsal-2-1-1"),
    "2-1-1",
    "2-1-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.5, cat: "gk" },
      { pos: "ALA_L", x: 2, z: -0.8, cat: "df" },
      { pos: "ALA_R", x: -2, z: -0.8, cat: "df" },
      { pos: "FIXO", x: 0, z: 0.3, cat: "mf" },
      { pos: "PIVOT", x: 0, z: 1.5, cat: "fw" },
    ]),
    createFutsalRoleMap("2-1-1"),
    "futsal",
  ),
  // 1-3: 攻撃的（1バック + 3トップ）
  Formation.createDefault(
    new FormationId("futsal-1-3"),
    "1-3",
    "1-3",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.5, cat: "gk" },
      { pos: "FIXO", x: 0, z: -1.2, cat: "df" },
      { pos: "ALA_L", x: 2.5, z: 0.8, cat: "fw" },
      { pos: "PIVOT", x: 0, z: 1.5, cat: "fw" },
      { pos: "ALA_R", x: -2.5, z: 0.8, cat: "fw" },
    ]),
    createFutsalRoleMap("1-3"),
    "futsal",
  ),
];

// ========== 8人制サッカー Formations (8-a-side, GK included) ==========

const EIGHT_ASIDE_ROLE_MAP = {
  "2-3-2": {
    [EIGHT_ASIDE_ROLES.GOALKEEPER]: 0,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_L]: 1,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_R]: 2,
    [EIGHT_ASIDE_ROLES.LEFT_MID]: 3,
    [EIGHT_ASIDE_ROLES.CENTER_MID]: 4,
    [EIGHT_ASIDE_ROLES.RIGHT_MID]: 5,
    [EIGHT_ASIDE_ROLES.LEFT_FWD]: 6,
    [EIGHT_ASIDE_ROLES.RIGHT_FWD]: 7,
  },
  "3-3-1": {
    [EIGHT_ASIDE_ROLES.GOALKEEPER]: 0,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_L]: 1,
    [EIGHT_ASIDE_ROLES.CENTER_MID]: 2,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_R]: 3,
    [EIGHT_ASIDE_ROLES.LEFT_MID]: 4,
    [EIGHT_ASIDE_ROLES.RIGHT_MID]: 5,
    [EIGHT_ASIDE_ROLES.LEFT_FWD]: 6,
    [EIGHT_ASIDE_ROLES.RIGHT_FWD]: 7,
  },
  "2-4-1": {
    [EIGHT_ASIDE_ROLES.GOALKEEPER]: 0,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_L]: 1,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_R]: 2,
    [EIGHT_ASIDE_ROLES.LEFT_MID]: 3,
    [EIGHT_ASIDE_ROLES.CENTER_MID]: 4,
    [EIGHT_ASIDE_ROLES.RIGHT_MID]: 5,
    [EIGHT_ASIDE_ROLES.LEFT_FWD]: 6,
    [EIGHT_ASIDE_ROLES.RIGHT_FWD]: 7,
  },
  "3-2-2": {
    [EIGHT_ASIDE_ROLES.GOALKEEPER]: 0,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_L]: 1,
    [EIGHT_ASIDE_ROLES.CENTER_MID]: 2,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_R]: 3,
    [EIGHT_ASIDE_ROLES.LEFT_MID]: 4,
    [EIGHT_ASIDE_ROLES.RIGHT_MID]: 5,
    [EIGHT_ASIDE_ROLES.LEFT_FWD]: 6,
    [EIGHT_ASIDE_ROLES.RIGHT_FWD]: 7,
  },
  "2-2-3": {
    [EIGHT_ASIDE_ROLES.GOALKEEPER]: 0,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_L]: 1,
    [EIGHT_ASIDE_ROLES.CENTER_BACK_R]: 2,
    [EIGHT_ASIDE_ROLES.LEFT_MID]: 3,
    [EIGHT_ASIDE_ROLES.RIGHT_MID]: 4,
    [EIGHT_ASIDE_ROLES.LEFT_FWD]: 5,
    [EIGHT_ASIDE_ROLES.CENTER_MID]: 6,
    [EIGHT_ASIDE_ROLES.RIGHT_FWD]: 7,
  },
};

const createEightAsideRoleMap = (
  formationType: keyof typeof EIGHT_ASIDE_ROLE_MAP,
): Map<string, number> => {
  const roleMapObj = EIGHT_ASIDE_ROLE_MAP[formationType];
  const roleMap = new Map<string, number>();
  Object.entries(roleMapObj).forEach(([role, index]) => {
    roleMap.set(role, index);
  });
  return roleMap;
};

export const DEFAULT_EIGHT_ASIDE_FORMATIONS = [
  // 2-3-2: バランス型
  Formation.createDefault(
    new FormationId("eight-2-3-2"),
    "2-3-2",
    "2-3-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -3.2, cat: "gk" },
      { pos: "CBL", x: 2, z: -2, cat: "df" },
      { pos: "CBR", x: -2, z: -2, cat: "df" },
      { pos: "LM", x: 3.5, z: 0, cat: "mf" },
      { pos: "CM", x: 0, z: -0.3, cat: "mf" },
      { pos: "RM", x: -3.5, z: 0, cat: "mf" },
      { pos: "LF", x: 2, z: 1.8, cat: "fw" },
      { pos: "RF", x: -2, z: 1.8, cat: "fw" },
    ]),
    createEightAsideRoleMap("2-3-2"),
    "eight_aside",
  ),
  // 3-3-1: 安定型
  Formation.createDefault(
    new FormationId("eight-3-3-1"),
    "3-3-1",
    "3-3-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -3.2, cat: "gk" },
      { pos: "CBL", x: 3, z: -2, cat: "df" },
      { pos: "CM", x: 0, z: -2.2, cat: "df" },
      { pos: "CBR", x: -3, z: -2, cat: "df" },
      { pos: "LM", x: 3.5, z: 0.3, cat: "mf" },
      { pos: "RM", x: -3.5, z: 0.3, cat: "mf" },
      { pos: "LF", x: 1.5, z: 0.3, cat: "mf" },
      { pos: "RF", x: 0, z: 2, cat: "fw" },
    ]),
    createEightAsideRoleMap("3-3-1"),
    "eight_aside",
  ),
  // 2-4-1: 中盤厚め
  Formation.createDefault(
    new FormationId("eight-2-4-1"),
    "2-4-1",
    "2-4-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -3.2, cat: "gk" },
      { pos: "CBL", x: 2, z: -2, cat: "df" },
      { pos: "CBR", x: -2, z: -2, cat: "df" },
      { pos: "LM", x: 3.5, z: 0, cat: "mf" },
      { pos: "CM", x: 1, z: -0.3, cat: "mf" },
      { pos: "RM", x: -3.5, z: 0, cat: "mf" },
      { pos: "LF", x: -1, z: -0.3, cat: "mf" },
      { pos: "RF", x: 0, z: 2, cat: "fw" },
    ]),
    createEightAsideRoleMap("2-4-1"),
    "eight_aside",
  ),
  // 3-2-2: 守備的
  Formation.createDefault(
    new FormationId("eight-3-2-2"),
    "3-2-2",
    "3-2-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -3.2, cat: "gk" },
      { pos: "CBL", x: 3, z: -2, cat: "df" },
      { pos: "CM", x: 0, z: -2.2, cat: "df" },
      { pos: "CBR", x: -3, z: -2, cat: "df" },
      { pos: "LM", x: 2.5, z: 0.3, cat: "mf" },
      { pos: "RM", x: -2.5, z: 0.3, cat: "mf" },
      { pos: "LF", x: 2, z: 2, cat: "fw" },
      { pos: "RF", x: -2, z: 2, cat: "fw" },
    ]),
    createEightAsideRoleMap("3-2-2"),
    "eight_aside",
  ),
  // 2-2-3: 攻撃的
  Formation.createDefault(
    new FormationId("eight-2-2-3"),
    "2-2-3",
    "2-2-3",
    createFormationPositions([
      { pos: "GK", x: 0, z: -3.2, cat: "gk" },
      { pos: "CBL", x: 2.5, z: -2, cat: "df" },
      { pos: "CBR", x: -2.5, z: -2, cat: "df" },
      { pos: "LM", x: 2.5, z: 0, cat: "mf" },
      { pos: "RM", x: -2.5, z: 0, cat: "mf" },
      { pos: "LF", x: 3, z: 1.8, cat: "fw" },
      { pos: "CM", x: 0, z: 2, cat: "fw" },
      { pos: "RF", x: -3, z: 1.8, cat: "fw" },
    ]),
    createEightAsideRoleMap("2-2-3"),
    "eight_aside",
  ),
];

// ========== ソサイチ Formations (7-a-side / Society, GK included) ==========

const SOCIETY_ROLE_MAP = {
  "2-3-1": {
    [SOCIETY_ROLES.GOALKEEPER]: 0,
    [SOCIETY_ROLES.CENTER_BACK_L]: 1,
    [SOCIETY_ROLES.CENTER_BACK_R]: 2,
    [SOCIETY_ROLES.LEFT_MID]: 3,
    [SOCIETY_ROLES.CENTER_MID]: 4,
    [SOCIETY_ROLES.RIGHT_MID]: 5,
    [SOCIETY_ROLES.CENTER_FWD]: 6,
  },
  "3-2-1": {
    [SOCIETY_ROLES.GOALKEEPER]: 0,
    [SOCIETY_ROLES.CENTER_BACK_L]: 1,
    [SOCIETY_ROLES.CENTER_MID]: 2,
    [SOCIETY_ROLES.CENTER_BACK_R]: 3,
    [SOCIETY_ROLES.LEFT_MID]: 4,
    [SOCIETY_ROLES.RIGHT_MID]: 5,
    [SOCIETY_ROLES.CENTER_FWD]: 6,
  },
  "2-2-2": {
    [SOCIETY_ROLES.GOALKEEPER]: 0,
    [SOCIETY_ROLES.CENTER_BACK_L]: 1,
    [SOCIETY_ROLES.CENTER_BACK_R]: 2,
    [SOCIETY_ROLES.LEFT_MID]: 3,
    [SOCIETY_ROLES.RIGHT_MID]: 4,
    [SOCIETY_ROLES.LEFT_FWD]: 5,
    [SOCIETY_ROLES.CENTER_FWD]: 6,
  },
  "3-1-2": {
    [SOCIETY_ROLES.GOALKEEPER]: 0,
    [SOCIETY_ROLES.CENTER_BACK_L]: 1,
    [SOCIETY_ROLES.CENTER_MID]: 2,
    [SOCIETY_ROLES.CENTER_BACK_R]: 3,
    [SOCIETY_ROLES.LEFT_MID]: 4,
    [SOCIETY_ROLES.RIGHT_MID]: 5,
    [SOCIETY_ROLES.CENTER_FWD]: 6,
  },
  "1-3-2": {
    [SOCIETY_ROLES.GOALKEEPER]: 0,
    [SOCIETY_ROLES.CENTER_BACK_L]: 1,
    [SOCIETY_ROLES.LEFT_MID]: 2,
    [SOCIETY_ROLES.CENTER_MID]: 3,
    [SOCIETY_ROLES.RIGHT_MID]: 4,
    [SOCIETY_ROLES.CENTER_FWD]: 5,
    [SOCIETY_ROLES.LEFT_FWD]: 6,
  },
};

const createSocietyRoleMap = (
  formationType: keyof typeof SOCIETY_ROLE_MAP,
): Map<string, number> => {
  const roleMapObj = SOCIETY_ROLE_MAP[formationType];
  const roleMap = new Map<string, number>();
  Object.entries(roleMapObj).forEach(([role, index]) => {
    roleMap.set(role, index);
  });
  return roleMap;
};

export const DEFAULT_SOCIETY_FORMATIONS = [
  // 2-3-1: バランス型
  Formation.createDefault(
    new FormationId("society-2-3-1"),
    "2-3-1",
    "2-3-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.2, cat: "gk" },
      { pos: "CBL", x: 2.5, z: -1.3, cat: "df" },
      { pos: "CBR", x: -2.5, z: -1.3, cat: "df" },
      { pos: "LM", x: 3.5, z: 0.3, cat: "mf" },
      { pos: "CM", x: 0, z: 0, cat: "mf" },
      { pos: "RM", x: -3.5, z: 0.3, cat: "mf" },
      { pos: "CF", x: 0, z: 1.5, cat: "fw" },
    ]),
    createSocietyRoleMap("2-3-1"),
    "society",
  ),
  // 3-2-1: 守備的
  Formation.createDefault(
    new FormationId("society-3-2-1"),
    "3-2-1",
    "3-2-1",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.2, cat: "gk" },
      { pos: "CBL", x: 3, z: -1.3, cat: "df" },
      { pos: "CM", x: 0, z: -1.5, cat: "df" },
      { pos: "CBR", x: -3, z: -1.3, cat: "df" },
      { pos: "LM", x: 2.5, z: 0.3, cat: "mf" },
      { pos: "RM", x: -2.5, z: 0.3, cat: "mf" },
      { pos: "CF", x: 0, z: 1.5, cat: "fw" },
    ]),
    createSocietyRoleMap("3-2-1"),
    "society",
  ),
  // 2-2-2: フラット型
  Formation.createDefault(
    new FormationId("society-2-2-2"),
    "2-2-2",
    "2-2-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.2, cat: "gk" },
      { pos: "CBL", x: 2.5, z: -1.3, cat: "df" },
      { pos: "CBR", x: -2.5, z: -1.3, cat: "df" },
      { pos: "LM", x: 2.5, z: 0.3, cat: "mf" },
      { pos: "RM", x: -2.5, z: 0.3, cat: "mf" },
      { pos: "LF", x: 2, z: 1.5, cat: "fw" },
      { pos: "CF", x: -2, z: 1.5, cat: "fw" },
    ]),
    createSocietyRoleMap("2-2-2"),
    "society",
  ),
  // 3-1-2: カウンター型
  Formation.createDefault(
    new FormationId("society-3-1-2"),
    "3-1-2",
    "3-1-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.2, cat: "gk" },
      { pos: "CBL", x: 3, z: -1.3, cat: "df" },
      { pos: "CM", x: 0, z: -1.5, cat: "df" },
      { pos: "CBR", x: -3, z: -1.3, cat: "df" },
      { pos: "LM", x: 0, z: 0, cat: "mf" },
      { pos: "RM", x: 2, z: 1.3, cat: "fw" },
      { pos: "CF", x: -2, z: 1.3, cat: "fw" },
    ]),
    createSocietyRoleMap("3-1-2"),
    "society",
  ),
  // 1-3-2: 攻撃的
  Formation.createDefault(
    new FormationId("society-1-3-2"),
    "1-3-2",
    "1-3-2",
    createFormationPositions([
      { pos: "GK", x: 0, z: -2.2, cat: "gk" },
      { pos: "CBL", x: 0, z: -1.3, cat: "df" },
      { pos: "LM", x: 3.5, z: 0, cat: "mf" },
      { pos: "CM", x: 0, z: 0, cat: "mf" },
      { pos: "RM", x: -3.5, z: 0, cat: "mf" },
      { pos: "CF", x: 1.5, z: 1.5, cat: "fw" },
      { pos: "CBR", x: -1.5, z: 1.5, cat: "fw" },
    ]),
    createSocietyRoleMap("1-3-2"),
    "society",
  ),
];
