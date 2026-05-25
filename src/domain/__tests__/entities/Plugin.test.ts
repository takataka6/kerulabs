/**
 * @module Plugin
 * @description Plugin エンティティの単体テスト
 */
import { describe, it, expect } from "vitest";
import { Plugin } from "../../entities/Plugin";
import type { PluginProps, LessonPluginData } from "../../entities/Plugin";
import { PluginId } from "../../value-objects/PluginId";

function createTestData(): LessonPluginData {
  return {
    lessonId: "test-lesson",
    category: "programming-basics",
    title: { ja: "テストレッスン", en: "Test Lesson" },
    description: { ja: "テスト用", en: "For testing" },
    icon: "🧪",
    gradient: "from-blue-600 to-cyan-500",
    sections: [
      { type: "heading", text: { ja: "見出し", en: "Heading" } },
      { type: "paragraph", text: { ja: "本文", en: "Body" } },
    ],
  };
}

function createTestPlugin(overrides?: Partial<PluginProps>): Plugin {
  return new Plugin({
    id: new PluginId("plugin-1"),
    kerulabsPlugin: "1.0",
    type: "lesson",
    metadata: {
      id: "test-plugin",
      name: { ja: "テスト", en: "Test" },
      author: "Test Author",
      version: "1.0.0",
      description: { ja: "テスト用プラグイン", en: "Test plugin" },
    },
    data: createTestData(),
    installedAt: new Date("2025-01-01"),
    ...overrides,
  });
}

describe("Plugin", () => {
  it("正しいプロパティでインスタンスを生成できる", () => {
    const plugin = createTestPlugin();

    expect(plugin.id.value).toBe("plugin-1");
    expect(plugin.kerulabsPlugin).toBe("1.0");
    expect(plugin.type).toBe("lesson");
    expect(plugin.metadata.id).toBe("test-plugin");
    expect(plugin.metadata.author).toBe("Test Author");
    expect(plugin.metadata.version).toBe("1.0.0");
    expect(plugin.data.lessonId).toBe("test-lesson");
    expect(plugin.data.sections).toHaveLength(2);
  });

  it("metadataId はメタデータのIDを返す", () => {
    const plugin = createTestPlugin();
    expect(plugin.metadataId).toBe("test-plugin");
  });

  it("lessonId はデータのlessonIdを返す", () => {
    const plugin = createTestPlugin();
    expect(plugin.lessonId).toBe("test-lesson");
  });

  it("installedAt は正しい日時を返す", () => {
    const plugin = createTestPlugin();
    expect(plugin.installedAt).toEqual(new Date("2025-01-01"));
  });

  it("異なるカテゴリのレッスンデータを保持できる", () => {
    const data = createTestData();
    data.category = "architecture";
    const plugin = createTestPlugin({ data });
    expect(plugin.data.category).toBe("architecture");
  });
});
