/**
 * @module useTacticBuilder
 * @description Tacticエンティティの構築とプレビューデータの生成を提供するフック。
 * CreationStateからMovement/BallPassを組み立て、フォーメーション座標と連携してプレビューを生成する。
 */
import { useCallback } from "react";
import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import { Formation } from "@domain/entities/Formation";
import { Phase } from "@domain/value-objects/Phase";
import { SET_POSITION_ARROW_COLOR } from "@shared/constants";
import type {
  CreationState,
  ArrowPreview,
  BallPassPreview,
} from "./tacticCreationTypes";
import {
  BALL_HIGHLIGHT_PAUSE_MS,
  SET_POSITION_PAUSE_MS,
  BALL_KICK_TO_MOVEMENT_MS,
  phaseKeyToPhaseType,
  getBasePosition,
} from "./tacticCreationTypes";

export interface UseTacticBuilderReturn {
  buildTactic: (formation: Formation) => Tactic;
  getPreviewArrows: (formation: Formation) => ArrowPreview[];
  getPreviewBallPasses: (formation: Formation) => BallPassPreview[];
  getStepStartPositions: (
    stepIndex: number,
    formation: Formation,
  ) => Record<number, { x: number; z: number }>;
}

/**
 * Tacticエンティティの構築とプレビュー生成フック。
 *
 * @param creation - 現在の作成ウィザード状態（null の場合は空のプレビューを返す）
 */
export function useTacticBuilder(
  creation: CreationState | null,
): UseTacticBuilderReturn {
  const buildTactic = useCallback(
    (formation: Formation): Tactic => {
      if (!creation) {
        throw new Error("No creation state – call startCreation first");
      }

      const allMovements: Movement[] = [];
      const allBallPasses: BallPass[] = [];

      // ハイライトオフセット: ボール位置が存在する場合、セットポジション前にハイライト一時停止を追加
      const hasBall = !!(creation.ballPosition && creation.ballTrajectory);
      const highlightOffset = hasBall ? BALL_HIGHLIGHT_PAUSE_MS : 0;

      // セットプレーのセットポジション: 選手が開始位置にスナップする
      if (creation.setPositions.size > 0) {
        creation.setPositions.forEach((pos, role) => {
          allMovements.push(
            Movement.create(
              role,
              pos.x,
              pos.z,
              highlightOffset,
              SET_POSITION_ARROW_COLOR,
            ),
          );
        });
      }

      // セットポジションが存在する場合、実際の移動アニメーション開始前に一時停止を追加
      const setPositionOffset =
        creation.setPositions.size > 0
          ? highlightOffset + SET_POSITION_PAUSE_MS
          : highlightOffset;

      // セットプレーのボール軌道: 「走り出し」フェーズ開始時にボールが飛ぶ
      if (hasBall) {
        allBallPasses.push(
          BallPass.create({
            startRole: "",
            endRole: "",
            delay: setPositionOffset,
            color: creation.ballTrajectory!.color,
            endX: creation.ballTrajectory!.endX,
            endZ: creation.ballTrajectory!.endZ,
            startX: creation.ballPosition!.x,
            startZ: creation.ballPosition!.z,
            trajectoryType: creation.ballTrajectory!.trajectoryType,
          }),
        );
      }

      for (let i = 0; i < creation.steps.length; i++) {
        const step = creation.steps[i];

        // 基本ディレイ = セットポジションオフセット + ボールキックから移動までのディレイ + 前ステップの合計時間
        const ballKickOffset = hasBall ? BALL_KICK_TO_MOVEMENT_MS : 0;
        let baseDelay = setPositionOffset + ballKickOffset;
        for (let j = 0; j < i; j++) {
          baseDelay += creation.steps[j].duration;
        }

        // 選手移動
        step.movements.forEach((mov, role) => {
          const individualDelay = creation.movementDelays[step.id]?.[role] ?? 0;
          allMovements.push(
            Movement.create(
              role,
              mov.targetX,
              mov.targetZ,
              baseDelay + individualDelay,
              mov.color,
            ),
          );
        });

        // ボールパス
        for (const bp of step.ballPasses) {
          allBallPasses.push(
            BallPass.create({
              startRole: bp.startRole,
              endRole: bp.endRole,
              delay: baseDelay,
              color: bp.color,
              endX: bp.endX,
              endZ: bp.endZ,
              startX: bp.startX,
              startZ: bp.startZ,
              trajectoryType: bp.trajectoryType,
            }),
          );
        }
      }

      const movementsMap = new Map<string, Movement[]>();
      movementsMap.set(
        creation.formationId || formation.id.value,
        allMovements,
      );

      const ballPassesMap = new Map<string, BallPass[]>();
      ballPassesMap.set(
        creation.formationId || formation.id.value,
        allBallPasses,
      );

      const phaseType = phaseKeyToPhaseType(creation.gamePhase);

      const tacticName: Record<string, string> = {};
      tacticName.ja = creation.nameJa || "";
      tacticName.en = creation.nameEn || "";
      // 名前が両方空の場合はデフォルト名を使用
      if (!tacticName.ja.trim() && !tacticName.en.trim()) {
        tacticName.ja = "新規戦術";
      }

      return Tactic.create({
        name: tacticName,
        icon: creation.icon,
        phase: Phase.fromString(phaseType),
        movements: movementsMap,
        ballPasses: ballPassesMap,
        ballPosition: creation.ballPosition ?? undefined,
      });
    },
    [creation],
  );

  // ----- プレビューヘルパー ----------------------------------------------------

  const getPreviewArrows = useCallback(
    (formation: Formation): ArrowPreview[] => {
      if (!creation) return [];

      const currentStep = creation.steps[creation.currentStepIndex];
      if (!currentStep) return [];

      const arrows: ArrowPreview[] = [];

      currentStep.movements.forEach((mov, role) => {
        const playerIndex = formation.roleMap.get(role);
        if (playerIndex === undefined) return;

        let startPos: { x: number; z: number };

        if (creation.currentStepIndex > 0) {
          // このロールの最後の移動を見つけるため、前のステップを逆順に探索
          let found = false;
          for (let j = creation.currentStepIndex - 1; j >= 0; j--) {
            const prevMov = creation.steps[j].movements.get(role);
            if (prevMov) {
              startPos = { x: prevMov.targetX, z: prevMov.targetZ };
              found = true;
              break;
            }
          }
          if (!found) {
            startPos = getBasePosition(role, formation, creation.setPositions)!;
          }
        } else {
          startPos = getBasePosition(role, formation, creation.setPositions)!;
        }

        arrows.push({
          start: startPos!,
          end: { x: mov.targetX, z: mov.targetZ },
          color: mov.color,
        });
      });

      return arrows;
    },
    [creation],
  );

  const getPreviewBallPasses = useCallback(
    (formation: Formation): BallPassPreview[] => {
      if (!creation) return [];

      const currentStep = creation.steps[creation.currentStepIndex];
      if (!currentStep) return [];

      const result: BallPassPreview[] = [];

      for (const bp of currentStep.ballPasses) {
        // 開始位置を解決
        let startPos: { x: number; z: number } | undefined;
        if (bp.startX !== undefined && bp.startZ !== undefined) {
          startPos = { x: bp.startX, z: bp.startZ };
        } else if (bp.startRole) {
          startPos = getBasePosition(
            bp.startRole,
            formation,
            creation.setPositions,
          );
          if (!startPos) continue;
        } else {
          continue;
        }

        // 終了位置を解決
        let endPos: { x: number; z: number } | undefined;
        if (bp.endX !== undefined && bp.endZ !== undefined) {
          endPos = { x: bp.endX, z: bp.endZ };
        } else if (bp.endRole) {
          endPos = getBasePosition(
            bp.endRole,
            formation,
            creation.setPositions,
          );
        }
        if (!endPos) continue;

        result.push({
          start: startPos,
          end: endPos,
          color: bp.color,
          ...(bp.trajectoryType ? { trajectoryType: bp.trajectoryType } : {}),
        });
      }

      return result;
    },
    [creation],
  );

  const getStepStartPositions = useCallback(
    (
      stepIndex: number,
      formation: Formation,
    ): Record<number, { x: number; z: number }> => {
      if (!creation) return {};

      // フォーメーションから基準位置を構築
      const positions: Record<number, { x: number; z: number }> = {};
      formation.positions.forEach((pos, idx) => {
        positions[idx] = { x: pos.position.x, z: pos.position.z };
      });

      // セットポジションを適用（セットプレー開始位置のオーバーライド）
      if (creation.setPositions.size > 0) {
        creation.setPositions.forEach((pos, role) => {
          const playerIndex = formation.roleMap.get(role);
          if (playerIndex !== undefined) {
            positions[playerIndex] = { x: pos.x, z: pos.z };
          }
        });
      }

      if (stepIndex === 0) {
        return positions;
      }

      // 前のステップの全移動を適用
      for (let j = 0; j < stepIndex && j < creation.steps.length; j++) {
        creation.steps[j].movements.forEach((mov, role) => {
          const playerIndex = formation.roleMap.get(role);
          if (playerIndex !== undefined) {
            positions[playerIndex] = { x: mov.targetX, z: mov.targetZ };
          }
        });
      }

      return positions;
    },
    [creation],
  );

  return {
    buildTactic,
    getPreviewArrows,
    getPreviewBallPasses,
    getStepStartPositions,
  };
}
