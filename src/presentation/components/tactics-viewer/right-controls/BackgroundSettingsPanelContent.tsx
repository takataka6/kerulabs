/**
 * @module BackgroundSettingsPanelContent
 * @description 背景設定パネルのコンテンツコンポーネント。TacticsMainContent の直接の子として fixed 位置に表示する。
 */
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { useBackgroundSettings } from "@presentation/hooks/ui";
import { useClickOutside } from "@presentation/hooks/ui";
import { ImageCropModal } from "@presentation/components/ui";
import {
  RIGHT_RAIL_POPUP_ANCHOR_CLASS,
  RIGHT_RAIL_POPUP_CLOSE_BUTTON_CLASS,
  RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS,
  RIGHT_RAIL_POPUP_HEADER_CLASS,
  RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS,
} from "../rightRailPopupLayout";
import {
  PITCH_COLOR_PRESETS,
  THREE_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS,
  TWO_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS,
} from "@shared/constants";
import type { GradientPreset } from "@shared/types";
import type { TranslationFn } from "../types";

interface BackgroundSettingsPanelContentProps {
  bgSettings: ReturnType<typeof useBackgroundSettings>;
  t: TranslationFn;
}

const ANGLE_OPTIONS = [0, 45, 90, 135, 180];
type PresetTab = "twoColor" | "threeColor";

function toPresetGradientCss(preset: GradientPreset): string {
  if (preset.mid) {
    const half = preset.midWidth / 2;
    const start = Math.max(0, preset.midPosition - half);
    const end = Math.min(100, preset.midPosition + half);
    return preset.midWidth > 0
      ? `linear-gradient(${preset.angle}deg, ${preset.from} 0%, ${preset.mid} ${start}% ${end}%, ${preset.to} 100%)`
      : `linear-gradient(${preset.angle}deg, ${preset.from} 0%, ${preset.mid} ${preset.midPosition}%, ${preset.to} 100%)`;
  }

  return `linear-gradient(${preset.angle}deg, ${preset.from} 0%, ${preset.to} 100%)`;
}

export const BackgroundSettingsPanelContent = memo(
  function BackgroundSettingsPanelContent({
    bgSettings,
    t,
  }: BackgroundSettingsPanelContentProps) {
    const { sceneBackground } = bgSettings;
    const panelRef = useRef<HTMLDivElement>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const handleClose = useCallback(() => {
      bgSettings.setShowSceneBgSettings(false);
    }, [bgSettings]);

    // プリセット適用中はそのカテゴリを自動表示、カスタム時はユーザー選択を優先
    const [manualTab, setManualTab] = useState<PresetTab | null>(null);
    const presetTab = useMemo<PresetTab>(() => {
      if (manualTab !== null) return manualTab;

      if (
        sceneBackground.mode === "gradient" &&
        sceneBackground.gradient.presetId !== null
      ) {
        const currentPreset = [
          ...THREE_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS,
          ...TWO_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS,
        ].find((p) => p.id === sceneBackground.gradient.presetId);
        if (currentPreset)
          return currentPreset.colorCount === 3 ? "threeColor" : "twoColor";
      }
      if (sceneBackground.mode === "gradient") {
        return sceneBackground.gradient.mid ? "threeColor" : "twoColor";
      }
      return "threeColor";
    }, [sceneBackground, manualTab]);

    const visiblePresets = useMemo(
      () =>
        presetTab === "twoColor"
          ? TWO_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS
          : THREE_COLOR_SCENE_BACKGROUND_GRADIENT_PRESETS,
      [presetTab],
    );

    useClickOutside(panelRef, handleClose, !showCropModal);

    if (!bgSettings.showSceneBgSettings) return null;

    return (
      <div
        ref={panelRef}
        className={`${RIGHT_RAIL_POPUP_ANCHOR_CLASS} rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl backdrop-blur-xl`}
      >
        <div className={RIGHT_RAIL_POPUP_HEADER_CLASS}>
          <div className={RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS}>
            {t("tactics.sceneBackground")}
          </div>
          <div className={RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS}>
            <button
              onClick={bgSettings.handleResetAllBgSettings}
              disabled={!bgSettings.canResetBackgroundSettings}
              className="rounded-lg border border-slate-700/50 px-2 py-1 text-[10px] font-semibold text-slate-300 transition-colors enabled:hover:bg-slate-700 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t("tactics.sceneBackground.resetAll")}
            >
              {t("tactics.reset")}
            </button>
            <button
              onClick={handleClose}
              className={RIGHT_RAIL_POPUP_CLOSE_BUTTON_CLASS}
              aria-label={t("a11y.closeModal")}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>

        <div className="max-h-[min(70vh,560px)] overflow-y-auto p-3 custom-scrollbar">
          <div className="mb-3">
            <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
              {t("tactics.sceneBackground.type")}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  ["none", t("tactics.sceneBackground.none")],
                  ["solid", t("tactics.sceneBackground.solid")],
                  ["gradient", t("tactics.sceneBackground.gradient")],
                  ["image", t("tactics.sceneBackground.image")],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => bgSettings.setSceneBackgroundMode(mode)}
                  className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
                    sceneBackground.mode === mode
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                      : "border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {sceneBackground.mode === "image" && (
            <ImageSection
              bgSettings={bgSettings}
              t={t}
              showCropModal={showCropModal}
              setShowCropModal={setShowCropModal}
            />
          )}

          {sceneBackground.mode === "solid" && (
            <div className="mb-3">
              <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                {t("tactics.sceneBackground.color")}
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2">
                <input
                  type="color"
                  value={sceneBackground.color}
                  onChange={(e) =>
                    bgSettings.setSceneBackgroundSolidColor(e.target.value)
                  }
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-700/50 bg-slate-900"
                  aria-label={t("tactics.sceneBackground.color")}
                />
              </div>
            </div>
          )}

          {sceneBackground.mode === "gradient" && (
            <div className="mb-3 space-y-3">
              <div>
                <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                  {t("tactics.sceneBackground.preset")}
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-2">
                  <div className="mb-2 grid grid-cols-2 gap-1">
                    {(
                      [
                        [
                          "threeColor",
                          t("tactics.sceneBackground.preset.threeColor"),
                        ],
                        [
                          "twoColor",
                          t("tactics.sceneBackground.preset.twoColor"),
                        ],
                      ] as const
                    ).map(([tab, label]) => (
                      <button
                        key={tab}
                        onClick={() => setManualTab(tab)}
                        className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
                          presetTab === tab
                            ? "bg-gradient-to-r from-sky-600 to-blue-500 text-white shadow-lg"
                            : "border border-slate-700/50 bg-slate-800/70 text-slate-300 hover:bg-slate-700"
                        }`}
                        aria-pressed={presetTab === tab}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    <span>
                      {presetTab === "twoColor"
                        ? t("tactics.sceneBackground.preset.twoColor")
                        : t("tactics.sceneBackground.preset.threeColor")}
                    </span>
                    <span>{visiblePresets.length}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {visiblePresets.map((preset) => {
                      const isSelected =
                        sceneBackground.gradient.presetId === preset.id;

                      return (
                        <button
                          key={preset.id}
                          onClick={() => bgSettings.applyGradientPreset(preset)}
                          title={preset.name}
                          className={`rounded-lg border p-1 text-left transition-all ${
                            isSelected
                              ? "border-blue-500 bg-slate-800 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                              : "border-slate-700/50 bg-slate-800/60 hover:border-slate-500"
                          }`}
                        >
                          <div
                            className="mb-0.5 h-6 rounded-sm"
                            style={{
                              background: toPresetGradientCss(preset),
                            }}
                          />
                          <div className="truncate text-[9px] font-medium text-slate-300">
                            {preset.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                    {t("tactics.sceneBackground.gradientFrom")}
                  </div>
                  <input
                    type="color"
                    value={sceneBackground.gradient.from}
                    onChange={(e) => bgSettings.setGradientFrom(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-1"
                    aria-label={t("tactics.sceneBackground.gradientFrom")}
                  />
                </div>
                <div>
                  <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                    {t("tactics.sceneBackground.gradientTo")}
                  </div>
                  <input
                    type="color"
                    value={sceneBackground.gradient.to}
                    onChange={(e) => bgSettings.setGradientTo(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-1"
                    aria-label={t("tactics.sceneBackground.gradientTo")}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-bold tracking-wide">
                    {t("tactics.sceneBackground.gradientMid")}
                  </div>
                  <button
                    onClick={() =>
                      bgSettings.setGradientMid(
                        sceneBackground.gradient.mid ? null : "#7c3aed",
                      )
                    }
                    className={`rounded-md px-2 py-0.5 text-[9px] font-semibold transition-all ${
                      sceneBackground.gradient.mid
                        ? "bg-blue-600 text-white"
                        : "border border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {sceneBackground.gradient.mid
                      ? t("tactics.sceneBackground.gradientMid.remove")
                      : t("tactics.sceneBackground.gradientMid.add")}
                  </button>
                </div>
                {sceneBackground.gradient.mid && (
                  <div className="space-y-2">
                    <input
                      type="color"
                      value={sceneBackground.gradient.mid}
                      onChange={(e) =>
                        bgSettings.setGradientMid(e.target.value)
                      }
                      className="h-10 w-full cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-1"
                      aria-label={t("tactics.sceneBackground.gradientMid")}
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wide">
                      <span>
                        {t("tactics.sceneBackground.gradientMid.position")}
                      </span>
                      <span>{sceneBackground.gradient.midPosition}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={sceneBackground.gradient.midPosition}
                      onChange={(e) =>
                        bgSettings.setGradientMidPosition(
                          Number(e.target.value),
                        )
                      }
                      className="h-1 w-full cursor-pointer accent-blue-500"
                      aria-label={t(
                        "tactics.sceneBackground.gradientMid.position",
                      )}
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wide">
                      <span>
                        {t("tactics.sceneBackground.gradientMid.width")}
                      </span>
                      <span>
                        {sceneBackground.gradient.midWidth.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="98"
                      step="0.5"
                      value={sceneBackground.gradient.midWidth}
                      onChange={(e) =>
                        bgSettings.setGradientMidWidth(Number(e.target.value))
                      }
                      className="h-1 w-full cursor-pointer accent-blue-500"
                      aria-label={t(
                        "tactics.sceneBackground.gradientMid.width",
                      )}
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                  {t("tactics.sceneBackground.angle")}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {ANGLE_OPTIONS.map((angle) => (
                    <button
                      key={angle}
                      onClick={() => bgSettings.setGradientAngle(angle)}
                      aria-pressed={sceneBackground.gradient.angle === angle}
                      className={`rounded-lg px-1 py-1.5 text-[10px] font-semibold transition-all ${
                        sceneBackground.gradient.angle === angle
                          ? "bg-blue-600 text-white"
                          : "border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {angle}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-2">
                <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                  {t("tactics.sceneBackground.current")}
                </div>
                <div className="text-[10px] text-slate-200">
                  {bgSettings.isGradientCustom
                    ? t("tactics.sceneBackground.custom")
                    : `${t("tactics.sceneBackground.presetLabel")}: ${bgSettings.selectedGradientPreset?.name ?? ""}`}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-700/50 pt-3">
            <div className="mb-2 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              {t("tactics.pitchBackground")}
            </div>
            <div className="mb-2">
              <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
                {t("tactics.pitchBackground.color")}
              </div>
              <div className="mb-2">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  {t("tactics.pitchBackground.preset")}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {PITCH_COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      bgSettings.pitchColor.toLowerCase() ===
                      preset.color.toLowerCase();

                    return (
                      <button
                        key={preset.id}
                        onClick={() => bgSettings.setPitchColor(preset.color)}
                        title={preset.name}
                        className={`rounded-lg border p-1 text-left transition-all ${
                          isSelected
                            ? "border-emerald-400 bg-slate-800 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                            : "border-slate-700/50 bg-slate-800/60 hover:border-slate-500"
                        }`}
                        aria-label={`${t("tactics.pitchBackground.preset")} ${preset.name}`}
                      >
                        <div
                          className="mb-0.5 h-6 rounded-sm"
                          style={{ background: preset.color }}
                        />
                        <div className="truncate text-[9px] font-medium text-slate-300">
                          {preset.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                type="color"
                value={bgSettings.pitchColor}
                onChange={(e) => bgSettings.setPitchColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-1"
                aria-label={t("tactics.pitchBackground.color")}
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wide">
                <span>{t("tactics.pitchBackground.opacity")}</span>
                <span>{Math.round(bgSettings.pitchOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgSettings.pitchOpacity}
                onChange={(e) =>
                  bgSettings.setPitchOpacity(parseFloat(e.target.value))
                }
                className="h-1 w-full cursor-pointer accent-emerald-500"
                aria-label={t("tactics.pitchBackground.opacity")}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

function ImageSection({
  bgSettings,
  t,
  showCropModal,
  setShowCropModal,
}: {
  bgSettings: ReturnType<typeof useBackgroundSettings>;
  t: TranslationFn;
  showCropModal: boolean;
  setShowCropModal: (v: boolean) => void;
}) {
  const { sceneBackgroundImageUrl } = bgSettings;

  return (
    <div className="mb-3">
      <div className="mb-1 text-[10px] text-slate-400 font-bold tracking-wide">
        {t("tactics.sceneBackground.image")}
      </div>
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-2 space-y-2">
        {sceneBackgroundImageUrl ? (
          <img
            src={sceneBackgroundImageUrl}
            alt=""
            className="w-full rounded-lg object-cover"
            style={{ maxHeight: "80px" }}
          />
        ) : (
          <div className="w-full h-16 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-500 text-[10px]">
            {t("tactics.sceneBackground.image.none")}
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={() => setShowCropModal(true)}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-[10px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {sceneBackgroundImageUrl
              ? t("tactics.sceneBackground.image.change")
              : t("tactics.sceneBackground.image.select")}
          </button>
          {sceneBackgroundImageUrl && (
            <button
              onClick={() => bgSettings.setSceneBackgroundImageUrl("")}
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-900/30 transition-colors"
            >
              {t("tactics.sceneBackground.image.remove")}
            </button>
          )}
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wide">
            <span>{t("tactics.sceneBackground.image.saturation")}</span>
            <span>{bgSettings.sceneBackgroundImageSaturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={bgSettings.sceneBackgroundImageSaturation}
            onChange={(e) =>
              bgSettings.setSceneBackgroundImageSaturation(
                Number(e.target.value),
              )
            }
            className="h-1 w-full cursor-pointer accent-blue-500"
            aria-label={t("tactics.sceneBackground.image.saturation")}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wide">
            <span>{t("tactics.sceneBackground.image.brightness")}</span>
            <span>{bgSettings.sceneBackgroundImageBrightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="1"
            value={bgSettings.sceneBackgroundImageBrightness}
            onChange={(e) =>
              bgSettings.setSceneBackgroundImageBrightness(
                Number(e.target.value),
              )
            }
            className="h-1 w-full cursor-pointer accent-blue-500"
            aria-label={t("tactics.sceneBackground.image.brightness")}
          />
        </div>
      </div>
      {showCropModal && (
        <ImageCropModal
          initialImage={sceneBackgroundImageUrl || undefined}
          onSave={(url) => bgSettings.setSceneBackgroundImageUrl(url)}
          onRemove={
            sceneBackgroundImageUrl
              ? () => bgSettings.setSceneBackgroundImageUrl("")
              : undefined
          }
          onClose={() => setShowCropModal(false)}
          title={t("tactics.sceneBackground.image")}
          aspectRatio={16 / 9}
          cropShape="rect"
          outputWidth={1920}
          outputHeight={1080}
        />
      )}
    </div>
  );
}
