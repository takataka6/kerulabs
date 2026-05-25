import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBackgroundSettings } from "../useBackgroundSettings";
import {
  DEFAULT_PITCH_COLOR,
  DEFAULT_SCENE_BG_COLOR,
  DEFAULT_SCENE_BACKGROUND,
  THREE_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS,
} from "@shared/constants";

const mockPrefs = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    preferencesService: mockPrefs,
  }),
}));

function setupDefaultPrefs() {
  mockPrefs.get.mockImplementation((key: string) => {
    switch (key) {
      case "sceneBackground":
        return DEFAULT_SCENE_BACKGROUND;
      case "pitchColor":
        return DEFAULT_PITCH_COLOR;
      case "pitchOpacity":
        return 1;
      default:
        return undefined;
    }
  });
}

describe("useBackgroundSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultPrefs();
  });

  it("デフォルト設定を返す", () => {
    const { result } = renderHook(() => useBackgroundSettings());

    expect(result.current.sceneBackground).toEqual(DEFAULT_SCENE_BACKGROUND);
    expect(result.current.pitchColor).toBe(DEFAULT_PITCH_COLOR);
    expect(result.current.pitchOpacity).toBe(1);
    expect(result.current.canResetBackgroundSettings).toBe(false);
  });

  it("背景タイプを単色に切り替えられる", () => {
    const { result } = renderHook(() => useBackgroundSettings());

    act(() => result.current.setSceneBackgroundMode("solid"));

    expect(result.current.sceneBackground).toEqual({
      version: 1,
      mode: "solid",
      color: DEFAULT_SCENE_BG_COLOR,
    });
  });

  it("プリセット適用後に色を手動変更するとカスタム状態になる", () => {
    const { result } = renderHook(() => useBackgroundSettings());

    act(() => result.current.setGradientFrom("#ffffff"));

    expect(result.current.sceneBackground.mode).toBe("gradient");
    if (result.current.sceneBackground.mode !== "gradient") return;

    expect(result.current.sceneBackground.gradient.from).toBe("#ffffff");
    expect(result.current.sceneBackground.gradient.presetId).toBeNull();
    expect(result.current.isGradientCustom).toBe(true);
  });

  it("3色プリセット適用で中間色も反映される", () => {
    const { result } = renderHook(() => useBackgroundSettings());
    const preset = THREE_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS[0];

    act(() => result.current.applyGradientPreset(preset));

    expect(result.current.sceneBackground.mode).toBe("gradient");
    if (result.current.sceneBackground.mode !== "gradient") return;

    expect(result.current.sceneBackground.gradient.from).toBe(preset.from);
    expect(result.current.sceneBackground.gradient.mid).toBe(preset.mid);
    expect(result.current.sceneBackground.gradient.midPosition).toBe(
      preset.midPosition,
    );
    expect(result.current.sceneBackground.gradient.to).toBe(preset.to);
    expect(result.current.sceneBackground.gradient.presetId).toBe(preset.id);
  });

  it("設定変更時に preferencesService.set が呼ばれる", () => {
    const { result } = renderHook(() => useBackgroundSettings());

    act(() => result.current.setPitchOpacity(0.75));

    expect(mockPrefs.set).toHaveBeenCalledWith("pitchOpacity", 0.75);
  });

  it("リセットでデフォルト値に戻る", () => {
    const { result } = renderHook(() => useBackgroundSettings());

    act(() => {
      result.current.setSceneBackgroundMode("none");
      result.current.setPitchColor("#000000");
    });

    act(() => result.current.handleResetAllBgSettings());

    expect(result.current.sceneBackground).toEqual(DEFAULT_SCENE_BACKGROUND);
    expect(result.current.pitchColor).toBe(DEFAULT_PITCH_COLOR);
    expect(result.current.pitchOpacity).toBe(1);
  });
});
