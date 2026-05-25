/**
 * アプリケーション全体の z-index スケール。
 *
 * 標準 Tailwind z-index (z-10, z-20, z-30, z-50) の上位レイヤーとして、
 * モーダル・ドロップダウン・トーストの重なり順を一元管理する。
 */
export const Z_INDEX = {
  /** モーダルオーバーレイ (ImageCropModal 等) */
  MODAL_OVERLAY: 60,
  /** モーダル内のドロップダウン (アイコンピッカー等) */
  DROPDOWN: 70,
  /** トースト通知・スキップリンク (最前面) */
  TOAST: 100,
} as const;
