/**
 * 画像処理に関する定数。
 *
 * ファイルアップロード・クロップ・リサイズで使用するサイズ制限や品質設定を一元管理する。
 */

/** アップロード可能な最大ファイルサイズ (10 MB) */
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;

/** 背景画像リサイズ時の最大辺 (px) */
export const BG_IMAGE_MAX_SIZE = 2048;

/** 背景画像の JPEG 品質 (0–1) */
export const BG_IMAGE_JPEG_QUALITY = 0.8;

/** プレイヤー画像のデフォルトクロップサイズ (px) */
export const CROP_OUTPUT_SIZE = 128;

/** クロップ画像の JPEG 品質 (0–1) */
export const CROP_JPEG_QUALITY = 0.85;

/** 背景画像の最大保存スロット数 */
export const MAX_BG_IMAGE_SLOTS = 5;
