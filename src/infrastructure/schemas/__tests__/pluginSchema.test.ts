/**
 * @module pluginSchema
 * @description プラグインZodスキーマのバリデーションテスト
 */
import { describe, it, expect } from "vitest";
import { pluginManifestSchema, pluginRecordSchema } from "../pluginSchema";

function validManifest(): {
  kerulabs_plugin: string;
  type: "lesson";
  metadata: {
    id: string;
    name: { ja: string; en: string };
    author: string;
    version: string;
    description: { ja: string; en: string };
  };
  data: {
    lessonId: string;
    category: string;
    title: { ja: string; en: string };
    description: { ja: string; en: string };
    icon: string;
    gradient: string;
    sections: Record<string, unknown>[];
  };
} {
  return {
    kerulabs_plugin: "1.0",
    type: "lesson",
    metadata: {
      id: "test-plugin",
      name: { ja: "テスト", en: "Test" },
      author: "Author",
      version: "1.0.0",
      description: { ja: "説明", en: "Description" },
    },
    data: {
      lessonId: "test-lesson",
      category: "programming-basics",
      title: { ja: "タイトル", en: "Title" },
      description: { ja: "説明", en: "Desc" },
      icon: "🧪",
      gradient: "from-blue-600 to-cyan-500",
      sections: [{ type: "heading", text: { ja: "見出し", en: "Heading" } }],
    },
  };
}

describe("pluginManifestSchema", () => {
  it("有効なマニフェストを受理する", () => {
    const result = pluginManifestSchema.safeParse(validManifest());
    expect(result.success).toBe(true);
  });

  it("kerulabs_pluginが空の場合は拒否する", () => {
    const manifest = validManifest();
    manifest.kerulabs_plugin = "";
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("typeがlesson以外の場合は拒否する", () => {
    const manifest = { ...validManifest(), type: "invalid" };
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("metadata.idが空の場合は拒否する", () => {
    const manifest = validManifest();
    manifest.metadata.id = "";
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("sectionsが空の場合は拒否する", () => {
    const manifest = validManifest();
    manifest.data.sections = [];
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("paragraphセクションを受理する", () => {
    const manifest = validManifest();
    manifest.data.sections = [
      { type: "paragraph", text: { ja: "本文", en: "Body" } },
    ];
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("codeBlockセクションを受理する", () => {
    const manifest = validManifest();
    manifest.data.sections = [
      {
        type: "codeBlock",
        language: "typescript",
        code: "const x = 1;",
        highlightLines: [1],
      },
    ];
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("miniPitchDemoセクションを受理する", () => {
    const manifest = validManifest();
    manifest.data.sections = [
      {
        type: "miniPitchDemo",
        players: [{ x: 0, z: -5, number: 1, name: "GK", color: "#eab308" }],
      },
    ];
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("miniPitchStepsセクションを受理する", () => {
    const manifest = validManifest();
    manifest.data.sections = [
      {
        type: "miniPitchSteps",
        steps: [
          {
            label: { ja: "ステップ1", en: "Step 1" },
            players: [{ x: 0, z: 0, color: "#3b82f6" }],
          },
        ],
      },
    ];
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("interactiveDemoセクションを受理する", () => {
    const manifest = validManifest();
    manifest.data.sections = [
      {
        type: "interactiveDemo",
        state: {
          formation: { type: "string", default: "4-3-3" },
        },
        controls: [
          {
            type: "buttonGroup",
            bind: "formation",
            options: [{ value: "4-3-3", label: { ja: "4-3-3", en: "4-3-3" } }],
          },
        ],
        scenes: {
          "4-3-3": {
            players: [{ x: 0, z: 0, color: "#3b82f6" }],
          },
        },
      },
    ];
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("不正なカテゴリは拒否する", () => {
    const manifest = validManifest();
    manifest.data.category = "invalid-category";
    const result = pluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("全カテゴリを受理する", () => {
    const categories = [
      "programming-basics",
      "file-formats",
      "git",
      "architecture",
      "testing",
      "custom",
    ] as const;

    for (const category of categories) {
      const manifest = validManifest();
      manifest.data.category = category;
      const result = pluginManifestSchema.safeParse(manifest);
      expect(result.success).toBe(true);
    }
  });
});

describe("pluginRecordSchema", () => {
  it("有効なレコードを受理する", () => {
    const record = {
      id: "uuid-1",
      ...validManifest(),
      installedAt: Date.now(),
    };
    const result = pluginRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it("idが空の場合は拒否する", () => {
    const record = {
      id: "",
      ...validManifest(),
      installedAt: Date.now(),
    };
    const result = pluginRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("installedAtがない場合は拒否する", () => {
    const record = {
      id: "uuid-1",
      ...validManifest(),
    };
    const result = pluginRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });
});
