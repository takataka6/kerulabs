import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_SCENE_BACKGROUND } from "@shared/constants";

const mockGetAll = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("@infrastructure/repositories/indexeddb/IndexedDBClient", () => ({
  IndexedDBClient: {
    getInstance: () => ({
      getDB: async () => ({
        getAll: mockGetAll,
        put: mockPut,
        delete: mockDelete,
      }),
    }),
  },
}));

import { IndexedDBPreferencesService } from "../../services/IndexedDBPreferencesService";

describe("IndexedDBPreferencesService", () => {
  let service: IndexedDBPreferencesService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue([]);
    mockPut.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
    service = new IndexedDBPreferencesService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("IndexedDB から全設定値をキャッシュにロードする", async () => {
    mockGetAll.mockResolvedValue([
      { key: "language", value: "en" },
      { key: "tacticsViewerGuideDismissed", value: true },
      { key: "pitchColor", value: "#ff0000" },
      { key: "sceneBackground", value: DEFAULT_SCENE_BACKGROUND },
    ]);

    await service.initialize();

    expect(service.get("language")).toBe("en");
    expect(service.get("tacticsViewerGuideDismissed")).toBe(true);
    expect(service.get("pitchColor")).toBe("#ff0000");
    expect(service.get("sceneBackground")).toEqual(DEFAULT_SCENE_BACKGROUND);
  });

  it("sceneBackground が不正な場合はデフォルト値へフォールバックする", async () => {
    mockGetAll.mockResolvedValue([{ key: "sceneBackground", value: "broken" }]);

    await service.initialize();

    expect(service.get("sceneBackground")).toEqual(DEFAULT_SCENE_BACKGROUND);
    expect(mockPut).toHaveBeenCalledWith("preferences", {
      key: "sceneBackground",
      value: DEFAULT_SCENE_BACKGROUND,
    });
  });

  it("旧背景関連キーを削除する", async () => {
    mockGetAll.mockResolvedValue([
      { key: "sceneBgColor", value: "#000000" },
      { key: "sceneBgImages", value: ["legacy"] },
      { key: "sceneBgSelectedIndex", value: 0 },
      { key: "sceneBgImageUrl", value: "legacy-url" },
    ]);

    await service.initialize();

    expect(mockDelete).toHaveBeenCalledWith("preferences", "sceneBgColor");
    expect(mockDelete).toHaveBeenCalledWith("preferences", "sceneBgImages");
    expect(mockDelete).toHaveBeenCalledWith(
      "preferences",
      "sceneBgSelectedIndex",
    );
    expect(mockDelete).toHaveBeenCalledWith("preferences", "sceneBgImageUrl");
  });

  it("キャッシュにない場合はデフォルト値を返す", () => {
    expect(service.get("language")).toBe("ja");
    expect(service.get("tacticsViewerGuideDismissed")).toBe(false);
    expect(service.get("pitchOpacity")).toBe(1);
    expect(service.get("sceneBackground")).toEqual(DEFAULT_SCENE_BACKGROUND);
  });

  it("set でキャッシュ更新と非同期書き込みを行う", async () => {
    service.set("language", "en");

    expect(service.get("language")).toBe("en");

    await vi.waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("preferences", {
        key: "language",
        value: "en",
      });
    });
  });

  it("remove でキャッシュを削除しデフォルト値へ戻す", async () => {
    service.set("language", "en");

    service.remove("language");

    expect(service.get("language")).toBe("ja");

    await vi.waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("preferences", "language");
    });
  });
});
