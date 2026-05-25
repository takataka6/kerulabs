/**
 * @module generateUUID
 * @description crypto.randomUUID() のラッパー。
 * セキュアコンテキスト（HTTPS / localhost）以外でも動作するフォールバックを提供する。
 */

/**
 * UUID v4 を生成する。
 * crypto.randomUUID() が利用��能な場合はそれを使用し、
 * 利用不可（HTTP デプロイ等）の場合は crypto.getRandomValues() ベースで生成する。
 */
export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // crypto.getRandomValues() は非セキュアコンテキストでも利用可能
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // RFC 4122 section 4.4: version 4 (0100) と variant 1 (10xx) を設定
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
