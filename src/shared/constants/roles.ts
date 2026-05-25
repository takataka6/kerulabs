/**
 * フォーメーションと戦術で使用する選手ロール定数。
 * 各ロール識別子は選手の戦術的役割へのマッピングに使用される。
 */
export const ROLES = {
  // ゴールキーパー
  GOALKEEPER: "GK",

  // ディフェンダー
  WIDE_DEF_L: "WDL",
  WIDE_DEF_R: "WDR",
  CENTER_DEF_L: "CDL",
  CENTER_DEF_R: "CDR",
  CENTER_DEF_C: "CDC",

  // ミッドフィルダー
  PIVOT: "PV",
  BOX_TO_BOX_L: "BBL",
  BOX_TO_BOX_R: "BBR",
  PLAYMAKER: "PM",
  WIDE_MID_L: "WML",
  WIDE_MID_R: "WMR",
  WIDE_ATK_L: "WAL",
  WIDE_ATK_R: "WAR",

  // フォワード
  CENTER_FWD: "CF",
  SECOND_FWD: "SF",
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

/**
 * フットサル専用の選手ロール（5人制）
 */
export const FUTSAL_ROLES = {
  GOALKEEPER: "GK",
  FIXO: "FIXO", // ディフェンダー
  ALA_L: "ALA_L", // 左ウイング
  ALA_R: "ALA_R", // 右ウイング
  PIVOT: "PIVOT", // ストライカー/ピヴォ
} as const;

export type FutsalRoleKey = keyof typeof FUTSAL_ROLES;
export type FutsalRoleValue = (typeof FUTSAL_ROLES)[FutsalRoleKey];

/**
 * 8人制サッカー用ロール (8-a-side)
 * GK + フィールドプレイヤー7人
 */
export const EIGHT_ASIDE_ROLES = {
  GOALKEEPER: "GK",
  CENTER_BACK_L: "CBL",
  CENTER_BACK_R: "CBR",
  LEFT_MID: "LM",
  CENTER_MID: "CM",
  RIGHT_MID: "RM",
  LEFT_FWD: "LF",
  RIGHT_FWD: "RF",
} as const;

export type EightAsideRoleKey = keyof typeof EIGHT_ASIDE_ROLES;
export type EightAsideRoleValue = (typeof EIGHT_ASIDE_ROLES)[EightAsideRoleKey];

/**
 * ソサイチ用ロール (7-a-side / Society)
 * GK + フィールドプレイヤー6人
 */
export const SOCIETY_ROLES = {
  GOALKEEPER: "GK",
  CENTER_BACK_L: "CBL",
  CENTER_BACK_R: "CBR",
  LEFT_MID: "LM",
  CENTER_MID: "CM",
  RIGHT_MID: "RM",
  LEFT_FWD: "LF",
  CENTER_FWD: "CF",
} as const;

export type SocietyRoleKey = keyof typeof SOCIETY_ROLES;
export type SocietyRoleValue = (typeof SOCIETY_ROLES)[SocietyRoleKey];
