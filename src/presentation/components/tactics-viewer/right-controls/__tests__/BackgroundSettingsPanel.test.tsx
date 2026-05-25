import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackgroundSettingsPanel } from "../BackgroundSettingsPanel";
import { BackgroundSettingsPanelContent } from "../BackgroundSettingsPanelContent";
import { DEFAULT_SCENE_BACKGROUND } from "@shared/constants";
import type { GradientPreset } from "@shared/types";

const mockT = vi.fn((key: string) => key);

const gradientSceneBackground = {
  version: 1 as const,
  mode: "gradient" as const,
  gradient: {
    kind: "linear" as const,
    from: "#09101c",
    mid: "#dbe4f0",
    midPosition: 28,
    midWidth: 0,
    to: "#334155",
    angle: 135,
    presetId: "storm",
  },
};

function createBgSettings() {
  const selectedGradientPreset: GradientPreset = {
    id: "studio",
    name: "Studio",
    from: "#09101c",
    mid: "#dbe4f0",
    midPosition: 28,
    midWidth: 0,
    to: "#334155",
    angle: 135,
    colorCount: 3,
  };

  return {
    sceneBackground: DEFAULT_SCENE_BACKGROUND,
    sceneBackgroundImageUrl: "",
    setSceneBackgroundImageUrl: vi.fn(),
    sceneBackgroundImageSaturation: 100,
    setSceneBackgroundImageSaturation: vi.fn(),
    sceneBackgroundImageBrightness: 100,
    setSceneBackgroundImageBrightness: vi.fn(),
    showSceneBgSettings: true,
    setShowSceneBgSettings: vi.fn(),
    setSceneBackgroundMode: vi.fn(),
    setSceneBackgroundSolidColor: vi.fn(),
    applyGradientPreset: vi.fn(),
    setGradientFrom: vi.fn(),
    setGradientMid: vi.fn(),
    setGradientMidPosition: vi.fn(),
    setGradientMidWidth: vi.fn(),
    setGradientTo: vi.fn(),
    setGradientAngle: vi.fn(),
    selectedGradientPreset,
    isGradientCustom: false,
    gradientPreviewCss:
      "linear-gradient(135deg, #09101c 0%, #dbe4f0 28%, #334155 100%)",
    pitchColor: "#16a34a",
    setPitchColor: vi.fn(),
    pitchOpacity: 1,
    setPitchOpacity: vi.fn(),
    canResetBackgroundSettings: false,
    handleResetAllBgSettings: vi.fn(),
  };
}

function renderComponent(
  overrides: Partial<ReturnType<typeof createBgSettings>> = {},
) {
  const bgSettings = { ...createBgSettings(), ...overrides };
  return {
    ...render(
      <>
        <BackgroundSettingsPanel bgSettings={bgSettings} t={mockT} />
        <BackgroundSettingsPanelContent
          bgSettings={bgSettings}
          headerVisible={true}
          t={mockT}
        />
      </>,
    ),
    bgSettings,
  };
}

describe("BackgroundSettingsPanel", () => {
  it("トグルボタンを表示する", () => {
    renderComponent({ showSceneBgSettings: false });
    expect(
      screen.getByLabelText("tactics.sceneBackground"),
    ).toBeInTheDocument();
  });

  it("ボタンをクリックすると setShowSceneBgSettings が呼ばれる", () => {
    const { bgSettings } = renderComponent({ showSceneBgSettings: false });
    fireEvent.click(screen.getByLabelText("tactics.sceneBackground"));
    expect(bgSettings.setShowSceneBgSettings).toHaveBeenCalled();
  });

  it("パネル表示時に背景タイプセクションを表示する", () => {
    renderComponent();
    expect(
      screen.getByText("tactics.sceneBackground.type"),
    ).toBeInTheDocument();
  });

  it("Reset ボタンは常時表示され、未変更時は disabled", () => {
    renderComponent({ canResetBackgroundSettings: false });
    expect(
      screen.getByLabelText("tactics.sceneBackground.resetAll"),
    ).toBeDisabled();
  });

  it("背景タイプボタン押下で setSceneBackgroundMode が呼ばれる", () => {
    const { bgSettings } = renderComponent();
    fireEvent.click(screen.getByText("tactics.sceneBackground.solid"));
    expect(bgSettings.setSceneBackgroundMode).toHaveBeenCalledWith("solid");
  });

  it("プリセット押下で applyGradientPreset が呼ばれる", () => {
    const { bgSettings } = renderComponent({
      sceneBackground: gradientSceneBackground,
    });
    fireEvent.click(screen.getByText("Storm").closest("button")!);
    expect(bgSettings.applyGradientPreset).toHaveBeenCalled();
  });

  it("プリセット選択時も対応する角度ボタンがハイライトされる", () => {
    renderComponent({ sceneBackground: gradientSceneBackground });
    expect(screen.getByRole("button", { name: "135" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("3色タブが先頭で初期選択される", () => {
    renderComponent({ sceneBackground: gradientSceneBackground });
    const buttons = screen.getAllByRole("button", {
      name: /tactics\.sceneBackground\.preset\./,
    });
    expect(buttons[0]).toHaveTextContent(
      "tactics.sceneBackground.preset.threeColor",
    );
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("プリセットタブを切り替えると3色プリセットが表示される", () => {
    renderComponent({
      sceneBackground: {
        version: 1,
        mode: "gradient",
        gradient: {
          kind: "linear",
          from: "#64748b",
          mid: null,
          midPosition: 50,
          midWidth: 0,
          to: "#cbd5e1",
          angle: 165,
          presetId: "arena",
        },
      },
      selectedGradientPreset: {
        id: "arena",
        name: "Arena",
        from: "#64748b",
        mid: null,
        midPosition: 50,
        midWidth: 0,
        to: "#cbd5e1",
        angle: 165,
        colorCount: 2 as const,
      },
      gradientPreviewCss: "linear-gradient(165deg, #64748b 0%, #cbd5e1 100%)",
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "tactics.sceneBackground.preset.threeColor",
      }),
    );
    expect(screen.getByText("Aurora")).toBeInTheDocument();
    expect(screen.queryByText("Abyss")).not.toBeInTheDocument();
  });

  it("パネル非表示時はコンテンツを表示しない", () => {
    renderComponent({ showSceneBgSettings: false });
    expect(
      screen.queryByText("tactics.sceneBackground.type"),
    ).not.toBeInTheDocument();
  });

  it("閉じるボタン押下で setShowSceneBgSettings(false) が呼ばれる", () => {
    const { bgSettings } = renderComponent();
    fireEvent.click(screen.getByLabelText("a11y.closeModal"));
    expect(bgSettings.setShowSceneBgSettings).toHaveBeenCalledWith(false);
  });

  it("フィールド背景透明度変更で setPitchOpacity が呼ばれる", () => {
    const { bgSettings } = renderComponent();
    fireEvent.change(screen.getByLabelText("tactics.pitchBackground.opacity"), {
      target: { value: "0.5" },
    });
    expect(bgSettings.setPitchOpacity).toHaveBeenCalledWith(0.5);
  });

  it("芝生プリセット押下で setPitchColor が呼ばれる", () => {
    const { bgSettings } = renderComponent();
    fireEvent.click(
      screen.getByRole("button", {
        name: "tactics.pitchBackground.preset Deep Grass",
      }),
    );
    expect(bgSettings.setPitchColor).toHaveBeenCalledWith("#15803d");
  });

  it("パネル外クリックで setShowSceneBgSettings(false) が呼ばれる", () => {
    const { bgSettings } = renderComponent();
    fireEvent.mouseDown(document.body);
    expect(bgSettings.setShowSceneBgSettings).toHaveBeenCalledWith(false);
  });
});
