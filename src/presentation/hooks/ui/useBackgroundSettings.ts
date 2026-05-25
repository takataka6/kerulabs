/**
 * @module useBackgroundSettings
 * @description シーン背景とフィールド背景の設定管理フック。単色・グラデーションの切り替えと永続化を提供する。
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  DEFAULT_PITCH_COLOR,
  DEFAULT_SCENE_BG_COLOR,
  DEFAULT_SCENE_BACKGROUND,
  SCENE_BACKGROUND_GRADIENT_PRESETS,
} from "@shared/constants";
import type {
  GradientPreset,
  SceneBackgroundPreferenceV1,
} from "@shared/types";
import { getContainer } from "@application/ServiceContainer";

function isGradientBackground(
  sceneBackground: SceneBackgroundPreferenceV1,
): sceneBackground is Extract<
  SceneBackgroundPreferenceV1,
  { mode: "gradient" }
> {
  return sceneBackground.mode === "gradient";
}

function clonePresetToBackground(
  preset: GradientPreset,
): Extract<SceneBackgroundPreferenceV1, { mode: "gradient" }> {
  return {
    version: 1,
    mode: "gradient",
    gradient: {
      kind: "linear",
      from: preset.from,
      mid: preset.mid,
      midPosition: preset.midPosition,
      midWidth: preset.midWidth,
      to: preset.to,
      angle: preset.angle,
      presetId: preset.id,
    },
  };
}

function getDefaultGradient() {
  return clonePresetToBackground(SCENE_BACKGROUND_GRADIENT_PRESETS[0]).gradient;
}

function toGradientCss(sceneBackground: SceneBackgroundPreferenceV1): string {
  if (!isGradientBackground(sceneBackground)) return "none";

  const { angle, from, mid, midPosition, midWidth, to } =
    sceneBackground.gradient;
  if (mid) {
    const half = midWidth / 2;
    const start = Math.max(0, midPosition - half);
    const end = Math.min(100, midPosition + half);
    return midWidth > 0
      ? `linear-gradient(${angle}deg, ${from} 0%, ${mid} ${start}% ${end}%, ${to} 100%)`
      : `linear-gradient(${angle}deg, ${from} 0%, ${mid} ${midPosition}%, ${to} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

function isSceneBackgroundEqual(
  a: SceneBackgroundPreferenceV1,
  b: SceneBackgroundPreferenceV1,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * シーン背景・フィールド背景の設定管理。
 *
 * `sceneBackground` とフィールド背景設定を IPreferencesService 経由で永続化し、
 * UI 向けの派生値や操作ハンドラーを返す。
 */
export function useBackgroundSettings() {
  const prefs = getContainer().preferencesService;

  const [sceneBackground, setSceneBackground] =
    useState<SceneBackgroundPreferenceV1>(() => {
      const stored = prefs.get("sceneBackground");
      // 旧データに mid/midPosition がない場合のマイグレーション（既存フィールドがあれば不要）
      if (stored.mode === "gradient" && stored.gradient.mid === undefined) {
        return {
          ...stored,
          gradient: {
            ...stored.gradient,
            mid: null,
            midPosition: 50,
            midWidth: 0,
          },
        };
      }
      return stored;
    });
  const [showSceneBgSettings, setShowSceneBgSettings] = useState(false);

  const [sceneBackgroundImageUrl, setSceneBackgroundImageUrlState] =
    useState<string>(() => {
      return prefs.get("sceneBackgroundImageUrl");
    });
  const [
    sceneBackgroundImageSaturation,
    setSceneBackgroundImageSaturationState,
  ] = useState<number>(() => {
    return prefs.get("sceneBackgroundImageSaturation");
  });
  const [
    sceneBackgroundImageBrightness,
    setSceneBackgroundImageBrightnessState,
  ] = useState<number>(() => {
    return prefs.get("sceneBackgroundImageBrightness");
  });

  const [pitchColor, setPitchColor] = useState<string>(() => {
    return prefs.get("pitchColor");
  });
  const [pitchOpacity, setPitchOpacity] = useState<number>(() => {
    return prefs.get("pitchOpacity");
  });

  useEffect(() => {
    prefs.set("sceneBackground", sceneBackground);
  }, [prefs, sceneBackground]);

  useEffect(() => {
    prefs.set("sceneBackgroundImageUrl", sceneBackgroundImageUrl);
  }, [prefs, sceneBackgroundImageUrl]);

  useEffect(() => {
    prefs.set("sceneBackgroundImageSaturation", sceneBackgroundImageSaturation);
  }, [prefs, sceneBackgroundImageSaturation]);

  useEffect(() => {
    prefs.set("sceneBackgroundImageBrightness", sceneBackgroundImageBrightness);
  }, [prefs, sceneBackgroundImageBrightness]);

  const setSceneBackgroundImageUrl = useCallback((url: string) => {
    setSceneBackgroundImageUrlState(url);
    setSceneBackground({ version: 1, mode: "image" });
  }, []);

  const setSceneBackgroundImageSaturation = useCallback(
    (saturation: number) => {
      setSceneBackgroundImageSaturationState(saturation);
    },
    [],
  );

  const setSceneBackgroundImageBrightness = useCallback(
    (brightness: number) => {
      setSceneBackgroundImageBrightnessState(brightness);
    },
    [],
  );

  useEffect(() => {
    prefs.set("pitchColor", pitchColor);
  }, [prefs, pitchColor]);

  useEffect(() => {
    prefs.set("pitchOpacity", pitchOpacity);
  }, [prefs, pitchOpacity]);

  const setSceneBackgroundMode = useCallback(
    (mode: SceneBackgroundPreferenceV1["mode"]) => {
      if (mode === "none") {
        setSceneBackground({ version: 1, mode: "none" });
        return;
      }
      if (mode === "solid") {
        setSceneBackground({
          version: 1,
          mode: "solid",
          color: DEFAULT_SCENE_BG_COLOR,
        });
        return;
      }
      if (mode === "image") {
        setSceneBackground({ version: 1, mode: "image" });
        return;
      }
      setSceneBackground(DEFAULT_SCENE_BACKGROUND);
    },
    [],
  );

  const setSceneBackgroundSolidColor = useCallback((color: string) => {
    setSceneBackground({
      version: 1,
      mode: "solid",
      color,
    });
  }, []);

  const applyGradientPreset = useCallback((preset: GradientPreset) => {
    setSceneBackground(clonePresetToBackground(preset));
  }, []);

  const setGradientFrom = useCallback((from: string) => {
    setSceneBackground((prev) => {
      const gradient = isGradientBackground(prev)
        ? prev.gradient
        : getDefaultGradient();
      return {
        version: 1,
        mode: "gradient",
        gradient: {
          ...gradient,
          from,
          presetId: null,
        },
      };
    });
  }, []);

  const setGradientTo = useCallback((to: string) => {
    setSceneBackground((prev) => {
      const gradient = isGradientBackground(prev)
        ? prev.gradient
        : getDefaultGradient();
      return {
        version: 1,
        mode: "gradient",
        gradient: {
          ...gradient,
          to,
          presetId: null,
        },
      };
    });
  }, []);

  const setGradientMid = useCallback((mid: string | null) => {
    setSceneBackground((prev) => {
      const gradient = isGradientBackground(prev)
        ? prev.gradient
        : getDefaultGradient();
      return {
        version: 1,
        mode: "gradient",
        gradient: { ...gradient, mid, presetId: null },
      };
    });
  }, []);

  const setGradientMidPosition = useCallback((midPosition: number) => {
    setSceneBackground((prev) => {
      const gradient = isGradientBackground(prev)
        ? prev.gradient
        : getDefaultGradient();
      return {
        version: 1,
        mode: "gradient",
        gradient: { ...gradient, midPosition, presetId: null },
      };
    });
  }, []);

  const setGradientMidWidth = useCallback((midWidth: number) => {
    setSceneBackground((prev) => {
      const gradient = isGradientBackground(prev)
        ? prev.gradient
        : getDefaultGradient();
      return {
        version: 1,
        mode: "gradient",
        gradient: { ...gradient, midWidth, presetId: null },
      };
    });
  }, []);

  const setGradientAngle = useCallback((angle: number) => {
    setSceneBackground((prev) => {
      const gradient = isGradientBackground(prev)
        ? prev.gradient
        : getDefaultGradient();
      return {
        version: 1,
        mode: "gradient",
        gradient: {
          ...gradient,
          angle,
          presetId: null,
        },
      };
    });
  }, []);

  const selectedGradientPreset = useMemo(() => {
    if (!isGradientBackground(sceneBackground)) return null;
    if (!sceneBackground.gradient.presetId) return null;
    return (
      SCENE_BACKGROUND_GRADIENT_PRESETS.find(
        (preset) => preset.id === sceneBackground.gradient.presetId,
      ) ?? null
    );
  }, [sceneBackground]);

  const isGradientCustom =
    isGradientBackground(sceneBackground) &&
    sceneBackground.gradient.presetId === null;

  const gradientPreviewCss = useMemo(() => {
    return toGradientCss(sceneBackground);
  }, [sceneBackground]);

  const canResetBackgroundSettings = useMemo(() => {
    return (
      !isSceneBackgroundEqual(sceneBackground, DEFAULT_SCENE_BACKGROUND) ||
      pitchColor !== DEFAULT_PITCH_COLOR ||
      pitchOpacity !== 1
    );
  }, [pitchColor, pitchOpacity, sceneBackground]);

  const handleResetAllBgSettings = useCallback(() => {
    setSceneBackground(DEFAULT_SCENE_BACKGROUND);
    setSceneBackgroundImageUrlState("");
    setSceneBackgroundImageSaturationState(100);
    setSceneBackgroundImageBrightnessState(100);
    setPitchColor(DEFAULT_PITCH_COLOR);
    setPitchOpacity(1);
  }, []);

  return {
    sceneBackground,
    sceneBackgroundImageUrl,
    setSceneBackgroundImageUrl,
    sceneBackgroundImageSaturation,
    setSceneBackgroundImageSaturation,
    sceneBackgroundImageBrightness,
    setSceneBackgroundImageBrightness,
    showSceneBgSettings,
    setShowSceneBgSettings,
    setSceneBackgroundMode,
    setSceneBackgroundSolidColor,
    applyGradientPreset,
    setGradientFrom,
    setGradientMid,
    setGradientMidPosition,
    setGradientMidWidth,
    setGradientTo,
    setGradientAngle,
    selectedGradientPreset,
    isGradientCustom,
    gradientPreviewCss,
    pitchColor,
    setPitchColor,
    pitchOpacity,
    setPitchOpacity,
    canResetBackgroundSettings,
    handleResetAllBgSettings,
  };
}
