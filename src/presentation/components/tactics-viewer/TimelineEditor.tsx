/**
 * @module TimelineEditor
 * @description タクティクス作成時のタイムラインエディターコンポーネント。ステップ間の遷移時間と選手の個別遅延を編集する。
 */
import { useRef, useCallback, useMemo } from "react";
import type { CreationStep } from "@presentation/hooks/tactic";
import type { TrajectoryType } from "@domain/entities/BallPass";
import { Formation } from "@domain/entities/Formation";
import type { TranslationKey } from "@shared/i18n/translations";

const TRAJECTORY_ICONS: Record<TrajectoryType, string> = {
  low: "➡️",
  high: "⤴️",
  curveLeft: "↩️",
  curveRight: "↪️",
};

const TRAJECTORY_CYCLE: TrajectoryType[] = [
  "low",
  "high",
  "curveLeft",
  "curveRight",
];

// ---------------------------------------------------------------------------
// 定数
// ---------------------------------------------------------------------------

const ANIMATION_DURATION = 500; // ms – matches TacticExecutor
const PX_PER_MS = 0.15; // pixels per millisecond
const ROW_HEIGHT = 28; // px
const LABEL_WIDTH = 100; // px
const SNAP_GRID = 50; // ms
const RULER_INTERVAL = 500; // ms
const TIMELINE_PADDING_MS = 500; // extra space after last event

// ---------------------------------------------------------------------------
// Props型
// ---------------------------------------------------------------------------

interface TimelineEditorProps {
  steps: CreationStep[];
  movementDelays: Record<number, Record<string, number>>; // stepId -> role -> delay(ms)
  formation: Formation;
  t: (key: TranslationKey) => string;
  onMovementDelayChange: (
    stepIndex: number,
    role: string,
    delay: number,
  ) => void;
  onStepDurationChange: (stepIndex: number, duration: number) => void;
  onRemoveBallPass?: (bpIdx: number) => void;
  onBallPassTrajectoryChange?: (bpIdx: number, type: TrajectoryType) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// ヘルパー関数
// ---------------------------------------------------------------------------

function snapToGrid(ms: number): number {
  return Math.max(0, Math.round(ms / SNAP_GRID) * SNAP_GRID);
}

function computeBaseDelay(steps: CreationStep[], stepIndex: number): number {
  let base = 0;
  for (let i = 0; i < stepIndex; i++) {
    base += steps[i].duration;
  }
  return base;
}

// ---------------------------------------------------------------------------
// コンポーネント
// ---------------------------------------------------------------------------

export function TimelineEditor({
  steps,
  movementDelays,
  formation: _formation,
  t,
  onMovementDelayChange,
  onStepDurationChange,
  onRemoveBallPass,
  onBallPassTrajectoryChange,
  onClose,
}: TimelineEditorProps) {
  void _formation;
  // ドラッグ中の再レンダーを避けるためrefでポインタードラッグ状態を追跡
  const dragRef = useRef<{
    stepIndex: number;
    role: string;
    startX: number;
    startDelay: number;
  } | null>(null);

  // ── タイムライン全体幅の計算 ──

  const totalTimeMs = useMemo(() => {
    let maxTime = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const base = computeBaseDelay(steps, i);
      step.movements.forEach((_mov, role) => {
        const individual = movementDelays[step.id]?.[role] ?? 0;
        const end = base + individual + ANIMATION_DURATION;
        if (end > maxTime) maxTime = end;
      });
      // ボールパスはbase + ANIMATION_DURATIONで終了
      if (step.ballPasses.length > 0) {
        const end = base + ANIMATION_DURATION;
        if (end > maxTime) maxTime = end;
      }
      // 最低限、ステップのdurationを考慮
      const stepEnd = base + step.duration;
      if (stepEnd > maxTime) maxTime = stepEnd;
    }
    return maxTime + TIMELINE_PADDING_MS;
  }, [steps, movementDelays]);

  const totalWidthPx = totalTimeMs * PX_PER_MS;

  // ── ルーラー目盛り ──

  const rulerTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let ms = 0; ms <= totalTimeMs; ms += RULER_INTERVAL) {
      ticks.push(ms);
    }
    return ticks;
  }, [totalTimeMs]);

  // ── ドラッグハンドラー ──

  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent,
      stepIndex: number,
      role: string,
      currentDelay: number,
    ) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        stepIndex,
        role,
        startX: e.clientX,
        startDelay: currentDelay,
      };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const deltaMs = dx / PX_PER_MS;
      const newDelay = snapToGrid(dragRef.current.startDelay + deltaMs);
      onMovementDelayChange(
        dragRef.current.stepIndex,
        dragRef.current.role,
        newDelay,
      );
    },
    [onMovementDelayChange],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ── レンダリング ──

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl select-none">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700/50">
        <span className="text-slate-300 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full" />
          Timeline
        </span>
        <button
          onClick={onClose}
          aria-label={t("timeline.close")}
          className="text-slate-400 hover:text-white transition-all duration-300 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <div
        className="overflow-x-auto overflow-y-auto max-h-[40vh] custom-scrollbar"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={{ minWidth: LABEL_WIDTH + totalWidthPx + 32 }}>
          {/* ── Time ruler ─────────────────────────────────────────────── */}
          <div className="flex" style={{ height: ROW_HEIGHT }}>
            {/* label column spacer */}
            <div
              className="shrink-0 bg-slate-800/60 border-r border-slate-700/40"
              style={{ width: LABEL_WIDTH }}
            />
            {/* ruler area */}
            <div className="relative flex-1">
              {rulerTicks.map((ms) => (
                <div
                  key={ms}
                  className="absolute top-0 flex flex-col items-start"
                  style={{ left: ms * PX_PER_MS }}
                >
                  <div className="w-px h-3 bg-slate-700" />
                  <span className="text-slate-600 text-[10px] font-mono ml-0.5 leading-none mt-0.5">
                    {ms}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Steps ──────────────────────────────────────────────────── */}
          {steps.map((step, stepIndex) => {
            const baseDelay = computeBaseDelay(steps, stepIndex);
            const movementEntries = Array.from(step.movements.entries());

            return (
              <div key={step.id}>
                {/* Step divider */}
                {stepIndex > 0 && (
                  <div className="border-t border-slate-700/40" />
                )}

                {/* Step header row */}
                <div
                  className="flex items-center"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div
                    className="shrink-0 bg-slate-800/50 border-r border-slate-700/40 px-2 flex items-center gap-1.5"
                    style={{ width: LABEL_WIDTH }}
                  >
                    <span className="text-slate-400 text-[11px] font-semibold">
                      Step {stepIndex + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <label
                      htmlFor={`step-duration-${stepIndex}`}
                      className="text-slate-600 text-[10px] font-mono"
                    >
                      dur:
                    </label>
                    <input
                      id={`step-duration-${stepIndex}`}
                      type="number"
                      min={100}
                      step={100}
                      value={step.duration}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 100) {
                          onStepDurationChange(stepIndex, v);
                        }
                      }}
                      aria-label={t("timeline.stepDuration").replace(
                        "{step}",
                        String(stepIndex + 1),
                      )}
                      className="w-16 bg-slate-800 border border-slate-700 rounded text-slate-300 text-[11px] font-mono px-1.5 py-0.5 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600 text-[10px] font-mono">
                      ms
                    </span>
                  </div>
                </div>

                {/* Movement bars */}
                {movementEntries.map(([role, mov]) => {
                  const individualDelay = movementDelays[step.id]?.[role] ?? 0;
                  const leftPx = (baseDelay + individualDelay) * PX_PER_MS;
                  const widthPx = ANIMATION_DURATION * PX_PER_MS;

                  return (
                    <div
                      key={`${step.id}-${role}`}
                      className="flex items-center"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/* Role label */}
                      <div
                        className="shrink-0 border-r border-slate-700/40 px-2 flex items-center"
                        style={{ width: LABEL_WIDTH }}
                      >
                        <span className="text-slate-500 text-[11px] font-mono truncate pl-2">
                          {role}
                        </span>
                      </div>

                      {/* Track */}
                      <div
                        className="relative flex-1"
                        style={{ height: ROW_HEIGHT }}
                      >
                        <div
                          role="slider"
                          aria-label={t("timeline.delay")
                            .replace("{role}", role)
                            .replace("{delay}", String(individualDelay))}
                          aria-valuenow={individualDelay}
                          aria-valuemin={0}
                          tabIndex={0}
                          className="absolute top-1 rounded-sm cursor-grab active:cursor-grabbing flex items-center justify-center"
                          style={{
                            left: leftPx,
                            width: widthPx,
                            height: ROW_HEIGHT - 8,
                            backgroundColor: mov.color,
                            opacity: 0.8,
                          }}
                          onPointerDown={(e) =>
                            handlePointerDown(
                              e,
                              stepIndex,
                              role,
                              individualDelay,
                            )
                          }
                        >
                          <span className="text-[9px] text-white/80 font-mono select-none pointer-events-none truncate px-1">
                            {individualDelay > 0 ? `+${individualDelay}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Ball pass bars */}
                {step.ballPasses.map((bp, bpIdx) => {
                  const leftPx = baseDelay * PX_PER_MS;
                  const widthPx = ANIMATION_DURATION * PX_PER_MS;
                  const isCoordPass =
                    bp.startX !== undefined && bp.startZ !== undefined;
                  const isSpacePass = !bp.endRole && bp.endX !== undefined;
                  const currentType = bp.trajectoryType ?? "low";
                  const trajectoryIcon = TRAJECTORY_ICONS[currentType] || "➡️";

                  return (
                    <div
                      key={`${step.id}-pass-${bpIdx}`}
                      className="flex items-center group"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/* Label */}
                      <div
                        className="shrink-0 border-r border-slate-700/40 px-2 flex items-center justify-between"
                        style={{ width: LABEL_WIDTH }}
                      >
                        <div className="flex items-center gap-1 pl-2 truncate">
                          {onBallPassTrajectoryChange ? (
                            <button
                              onClick={() => {
                                const idx =
                                  TRAJECTORY_CYCLE.indexOf(currentType);
                                const next =
                                  TRAJECTORY_CYCLE[
                                    (idx + 1) % TRAJECTORY_CYCLE.length
                                  ];
                                onBallPassTrajectoryChange(bpIdx, next);
                              }}
                              aria-label={t("timeline.trajectoryType").replace(
                                "{type}",
                                currentType,
                              )}
                              className="text-[11px] hover:scale-125 transition-transform"
                              title={currentType}
                            >
                              {trajectoryIcon}
                            </button>
                          ) : (
                            <span className="text-[11px]">
                              {trajectoryIcon}
                            </span>
                          )}
                          <span className="text-slate-500 text-[11px] font-mono truncate">
                            Pass
                          </span>
                        </div>
                        {onRemoveBallPass && (
                          <button
                            onClick={() => onRemoveBallPass(bpIdx)}
                            aria-label={t("timeline.removePass").replace(
                              "{index}",
                              String(bpIdx + 1),
                            )}
                            className="text-slate-600 hover:text-red-400 text-[10px] transition-opacity"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Track */}
                      <div
                        className="relative flex-1"
                        style={{ height: ROW_HEIGHT }}
                      >
                        <div
                          className="absolute top-1 rounded-sm border border-dashed flex items-center justify-center"
                          style={{
                            left: leftPx,
                            width: widthPx,
                            height: ROW_HEIGHT - 8,
                            borderColor: bp.color,
                            backgroundColor: `${bp.color}22`,
                          }}
                        >
                          <span
                            className="text-[9px] font-mono select-none pointer-events-none truncate px-1"
                            style={{ color: bp.color }}
                          >
                            {isCoordPass
                              ? `(${bp.startX!.toFixed(0)},${bp.startZ!.toFixed(0)})`
                              : bp.startRole}{" "}
                            →{" "}
                            {isSpacePass
                              ? `(${bp.endX!.toFixed(0)},${bp.endZ!.toFixed(0)})`
                              : bp.endRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
