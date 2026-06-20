/**
 * @module rightRailPopupLayout
 * @description 右レール起点のポップアップ配置を共通化するレイアウト定数。
 */

// 右レールのボタン群と視覚的につながるように、パネルを少し重ねて表示する。
export const RIGHT_RAIL_POPUP_ANCHOR_CLASS =
  "absolute top-2 right-2 z-40 w-[320px] max-w-[calc(100vw-1rem)] sm:top-3 sm:right-[108px] xl:right-[120px]";

// 右レール内部から開くポップアップ用。親コンテナ自体に top/right オフセットがあるため、
// ここでは追加の top オフセットを積まず、レール上端に揃える。
export const RIGHT_RAIL_NESTED_POPUP_ANCHOR_CLASS =
  "absolute top-0 right-0 z-40 w-[320px] max-w-[calc(100vw-1rem)] sm:right-[96px] xl:right-[108px]";

export const RIGHT_RAIL_POPUP_HEADER_CLASS =
  "flex min-h-[52px] items-center justify-between gap-3 border-b border-slate-700/50 px-4 py-3";

export const RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/90";

export const RIGHT_RAIL_POPUP_HEADER_SUBTITLE_CLASS =
  "mt-0.5 text-xs text-slate-400";

export const RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS =
  "flex shrink-0 items-center gap-2";

export const RIGHT_RAIL_POPUP_CLOSE_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/85 text-slate-400 transition-colors hover:border-slate-500 hover:text-white";
