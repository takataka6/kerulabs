/**
 * @module PluginId
 * @description PluginId 値オブジェクトの単体テスト
 */
import { describe, it, expect } from "vitest";
import { PluginId } from "../../value-objects/PluginId";

describe("PluginId", () => {
  it("有効な文字列でインスタンスを生成できる", () => {
    const id = new PluginId("plugin-1");
    expect(id.value).toBe("plugin-1");
  });

  it("空文字列ではエラーを投げる", () => {
    expect(() => new PluginId("")).toThrow("PluginId cannot be empty");
  });

  it("空白のみではエラーを投げる", () => {
    expect(() => new PluginId("   ")).toThrow("PluginId cannot be empty");
  });

  it("同じ値のPluginIdは等価である", () => {
    const a = new PluginId("p-1");
    const b = new PluginId("p-1");
    expect(a.equals(b)).toBe(true);
  });

  it("異なる値のPluginIdは等価でない", () => {
    const a = new PluginId("p-1");
    const b = new PluginId("p-2");
    expect(a.equals(b)).toBe(false);
  });

  it("generate() はUUIDで新しいインスタンスを生成する", () => {
    const id = PluginId.generate();
    expect(id.value).toBeTruthy();
    expect(id.value.length).toBeGreaterThan(0);
  });

  it("toString() は値を返す", () => {
    const id = new PluginId("plugin-abc");
    expect(id.toString()).toBe("plugin-abc");
  });
});
