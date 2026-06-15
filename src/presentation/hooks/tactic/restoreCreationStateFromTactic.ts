import type { Tactic } from "@domain/entities/Tactic";
import { Tactic as TacticEntity } from "@domain/entities/Tactic";
import { SET_POSITION_ARROW_COLOR } from "@shared/constants";
import type { PhaseKey } from "@shared/constants/phases";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import type {
  CreationMode,
  CreationState,
  CreationStep,
  CreationStepBallPass,
} from "./tacticCreationTypes";
import {
  BALL_HIGHLIGHT_PAUSE_MS,
  BALL_KICK_TO_MOVEMENT_MS,
  createEmptyStep,
} from "./tacticCreationTypes";

function phaseTypeToPhaseKey(phase: string): PhaseKey {
  switch (phase) {
    case "attack":
    case "defense":
    case "positive_transition":
    case "negative_transition":
    case "set_piece":
    case "throw_in":
    case "goal_kick":
      return phase;
    default:
      return "attack";
  }
}

export function getVisibleTacticStepCount(tactic: Tactic): number {
  return tactic.hasSetupStepExecution
    ? Math.max(1, tactic.totalSteps - 1)
    : tactic.totalSteps;
}

export function createPreviewTacticFromCopyRange(params: {
  tactic: Tactic;
  formationKey: string;
  copyUntilStep: number;
}): Tactic {
  const { tactic, formationKey, copyUntilStep } = params;
  const visibleStepCount = getVisibleTacticStepCount(tactic);
  const clampedVisibleSteps = Math.max(
    1,
    Math.min(copyUntilStep, visibleStepCount),
  );
  const hasSetupStep = tactic.hasSetupStepExecution;
  const allBoundaries = tactic.stepBoundaries
    ? [...tactic.stepBoundaries]
    : [0];
  const includedBoundaryCount = clampedVisibleSteps + (hasSetupStep ? 1 : 0);
  const nextBoundary = allBoundaries[includedBoundaryCount];
  const delayCutoff = nextBoundary ?? Number.POSITIVE_INFINITY;

  const filteredMovements = tactic
    .getMovementsForFormation(formationKey)
    .filter((movement) => movement.delay < delayCutoff)
    .map((movement) =>
      Movement.create(
        movement.role,
        movement.targetX,
        movement.targetZ,
        movement.delay,
        movement.arrowColor,
      ),
    );

  const filteredBallPasses = tactic
    .getBallPassesForFormation(formationKey)
    .filter((ballPass) => ballPass.delay < delayCutoff)
    .map((ballPass) =>
      BallPass.create({
        startRole: ballPass.startRole,
        endRole: ballPass.endRole,
        delay: ballPass.delay,
        color: ballPass.color,
        ...(ballPass.startX !== undefined ? { startX: ballPass.startX } : {}),
        ...(ballPass.startZ !== undefined ? { startZ: ballPass.startZ } : {}),
        ...(ballPass.endX !== undefined ? { endX: ballPass.endX } : {}),
        ...(ballPass.endZ !== undefined ? { endZ: ballPass.endZ } : {}),
        ...(ballPass.trajectoryType
          ? { trajectoryType: ballPass.trajectoryType }
          : {}),
      }),
    );

  const movementsMap = new Map<string, Movement[]>();
  movementsMap.set(formationKey, filteredMovements);

  const ballPassesMap = new Map<string, BallPass[]>();
  ballPassesMap.set(formationKey, filteredBallPasses);

  const previewStepBoundaries =
    allBoundaries.length > 1
      ? allBoundaries.slice(0, includedBoundaryCount)
      : undefined;

  return TacticEntity.create({
    name: { ...tactic.name },
    icon: tactic.icon,
    phase: tactic.phase,
    movements: movementsMap,
    ballPasses: ballPassesMap,
    ballPosition: tactic.ballPosition ? { ...tactic.ballPosition } : undefined,
    stepBoundaries:
      previewStepBoundaries && previewStepBoundaries.length > 1
        ? previewStepBoundaries
        : undefined,
  });
}

interface RestoreCreationStateParams {
  tactic: Tactic;
  formationName: string;
  formationId?: string;
  copyUntilStep?: number;
}

export function restoreCreationStateFromTactic({
  tactic,
  formationName,
  formationId,
  copyUntilStep,
}: RestoreCreationStateParams): CreationState {
  const movements = tactic.getMovementsForFormation(
    formationId ?? formationName,
  );
  const ballPasses = tactic.getBallPassesForFormation(
    formationId ?? formationName,
  );
  const hasBall = !!tactic.ballPosition;
  const hasSetupStep = tactic.hasSetupStepExecution;
  const visibleOffset = hasSetupStep ? 1 : 0;
  const allBoundaries = tactic.stepBoundaries
    ? [...tactic.stepBoundaries]
    : [0];
  const visibleStepCount = getVisibleTacticStepCount(tactic);
  const copiedStepCount = Math.max(
    1,
    Math.min(copyUntilStep ?? visibleStepCount, visibleStepCount),
  );
  const visibleBoundaries = Array.from(
    { length: visibleStepCount },
    (_, index) => allBoundaries[index + visibleOffset] ?? 0,
  );
  const baseDelays = visibleBoundaries.map(
    (boundary) => boundary + (hasBall ? BALL_KICK_TO_MOVEMENT_MS : 0),
  );
  const setupMovementDelay = hasBall ? BALL_HIGHLIGHT_PAUSE_MS : 0;
  const firstStepBaseDelay = baseDelays[0] ?? 0;

  const copiedSteps: CreationStep[] = Array.from(
    { length: copiedStepCount },
    (_, index) => {
      const currentBoundary = visibleBoundaries[index] ?? 0;
      const nextBoundary = visibleBoundaries[index + 1];
      return {
        id: index + 1,
        movements: new Map(),
        ballPasses: [],
        duration:
          nextBoundary !== undefined && nextBoundary > currentBoundary
            ? nextBoundary - currentBoundary
            : 1000,
      };
    },
  );
  const steps: CreationStep[] = [
    ...copiedSteps,
    createEmptyStep(copiedStepCount + 1),
  ];

  const movementDelays: Record<number, Record<string, number>> = {};
  const setPositions = new Map<string, { x: number; z: number }>();

  const setupBallPass = hasBall
    ? ballPasses
        .filter(
          (ballPass) =>
            ballPass.startX !== undefined &&
            ballPass.startZ !== undefined &&
            ballPass.endX !== undefined &&
            ballPass.endZ !== undefined &&
            ballPass.delay < firstStepBaseDelay,
        )
        .sort((left, right) => left.delay - right.delay)[0]
    : undefined;

  const findStepIndexForDelay = (delay: number): number | null => {
    let stepIndex = 0;
    for (let index = 0; index < baseDelays.length; index += 1) {
      if (delay >= baseDelays[index]) {
        stepIndex = index;
      }
    }
    return stepIndex < copiedStepCount ? stepIndex : null;
  };

  for (const movement of movements) {
    if (
      movement.arrowColor === SET_POSITION_ARROW_COLOR &&
      movement.delay === setupMovementDelay
    ) {
      setPositions.set(movement.role, {
        x: movement.targetX,
        z: movement.targetZ,
      });
      continue;
    }

    const stepIndex = findStepIndexForDelay(movement.delay);
    if (stepIndex === null) continue;

    const step = copiedSteps[stepIndex];
    const baseDelay = baseDelays[stepIndex] ?? 0;
    const individualDelay = Math.max(0, movement.delay - baseDelay);
    step.movements.set(movement.role, {
      targetX: movement.targetX,
      targetZ: movement.targetZ,
      color: movement.arrowColor,
    });
    if (individualDelay > 0) {
      movementDelays[step.id] = {
        ...(movementDelays[step.id] ?? {}),
        [movement.role]: individualDelay,
      };
    }
  }

  for (const ballPass of ballPasses) {
    if (ballPass === setupBallPass) continue;

    const stepIndex = findStepIndexForDelay(ballPass.delay);
    if (stepIndex === null) continue;

    const creationBallPass: CreationStepBallPass = {
      startRole: ballPass.startRole,
      endRole: ballPass.endRole,
      color: ballPass.color,
      trajectoryType: ballPass.trajectoryType,
      ...(ballPass.startX !== undefined ? { startX: ballPass.startX } : {}),
      ...(ballPass.startZ !== undefined ? { startZ: ballPass.startZ } : {}),
      ...(ballPass.endX !== undefined ? { endX: ballPass.endX } : {}),
      ...(ballPass.endZ !== undefined ? { endZ: ballPass.endZ } : {}),
    };
    copiedSteps[stepIndex].ballPasses.push(creationBallPass);
  }

  // Prefill name from source so user can edit it in the metadata step.
  // Start at "metadata" so there is a place to decide/rename the new tactic
  // (instead of jumping straight to editing with the original name).
  const baseNameJa = tactic.name.ja ?? "";
  const baseNameEn = tactic.name.en ?? "";
  const creationMode: CreationMode = hasBall
    ? "setPlay"
    : setPositions.size > 0
      ? "situation"
      : "standard";

  return {
    nameJa: baseNameJa ? `${baseNameJa} (コピー)` : "",
    nameEn: baseNameEn ? `${baseNameEn} (Copy)` : "",
    icon: tactic.icon,
    gamePhase: phaseTypeToPhaseKey(tactic.phase.value),
    formationId: formationId ?? formationName,
    formationName,
    currentStepIndex: steps.length - 1,
    steps,
    timelineOpen: false,
    movementDelays,
    wizardStep: "metadata",
    creationMode,
    ballPosition: tactic.ballPosition ? { ...tactic.ballPosition } : null,
    ballTrajectory: setupBallPass
      ? {
          endX: setupBallPass.endX!,
          endZ: setupBallPass.endZ!,
          color: setupBallPass.color,
          trajectoryType: setupBallPass.trajectoryType ?? "low",
        }
      : null,
    setPositions,
  };
}
