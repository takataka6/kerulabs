declare const process: { env: { ELECTRON: boolean } };

/** ビルド時に Vite の `define` で置換される環境フラグ */
export const IS_ELECTRON: boolean = process.env.ELECTRON;
