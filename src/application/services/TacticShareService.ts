/**
 * @module TacticShareService
 * @description 戦術のエクスポート・インポート共有サービス。JSON形式でのファイル入出力とZodスキーマによるバリデーションを提供する
 */

import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import { Phase } from "@domain/value-objects/Phase";
import { tacticExportDataSchema } from "@application/schemas/tacticExportSchema";
import { handleError } from "@shared/errors/handleError";
import { ValidationError } from "@shared/errors/AppError";
import { ZodError } from "zod";

const EXPORT_VERSION = 1;

/** 戦術のシリアライズ形式（エクスポート用） */
interface TacticRecord {
  name: Record<string, string>;
  icon: string;
  phase: string;
  movements: Record<
    string,
    Array<{
      role: string;
      targetX: number;
      targetZ: number;
      delay: number;
      arrowColor: string;
    }>
  >;
  ballPasses?: Record<
    string,
    Array<{
      startRole: string;
      endRole: string;
      delay: number;
      color: string;
      endX?: number;
      endZ?: number;
      startX?: number;
      startZ?: number;
      trajectoryType?: string;
    }>
  >;
  stepBoundaries?: number[];
}

/**
 * 戦術のエクスポート・インポートを行う共有サービス
 * JSON形式でのファイル入出力をサポートする
 */
export class TacticShareService {
  /**
   * 戦術をJSON文字列にエクスポートする
   * @param tactics - エクスポートする戦術の配列
   * @returns JSON文字列
   */
  static export(tactics: Tactic[]): string {
    const records: TacticRecord[] = tactics.map((tactic) => {
      const movements: TacticRecord["movements"] = {};
      tactic.movements.forEach((movementList, formationKey) => {
        movements[formationKey] = movementList.map((m) => ({
          role: m.role,
          targetX: m.targetX,
          targetZ: m.targetZ,
          delay: m.delay,
          arrowColor: m.arrowColor,
        }));
      });

      const ballPasses: NonNullable<TacticRecord["ballPasses"]> = {};
      if (tactic.ballPasses && tactic.ballPasses.size > 0) {
        tactic.ballPasses.forEach((passList, formationKey) => {
          ballPasses[formationKey] = passList.map((bp) => ({
            startRole: bp.startRole,
            endRole: bp.endRole,
            delay: bp.delay,
            color: bp.color,
            ...(bp.endX !== undefined ? { endX: bp.endX } : {}),
            ...(bp.endZ !== undefined ? { endZ: bp.endZ } : {}),
            ...(bp.startX !== undefined ? { startX: bp.startX } : {}),
            ...(bp.startZ !== undefined ? { startZ: bp.startZ } : {}),
            ...(bp.trajectoryType ? { trajectoryType: bp.trajectoryType } : {}),
          }));
        });
      }

      return {
        name: tactic.name,
        icon: tactic.icon,
        phase: tactic.phase.value,
        movements,
        ...(Object.keys(ballPasses).length > 0 ? { ballPasses } : {}),
        ...(tactic.stepBoundaries
          ? { stepBoundaries: [...tactic.stepBoundaries] }
          : {}),
      };
    });

    return JSON.stringify(
      { version: EXPORT_VERSION, tactics: records },
      null,
      2,
    );
  }

  /**
   * JSON文字列から戦術をインポートする（新しいIDが自動生成される）
   * @param json - インポートするJSON文字列
   * @returns インポートされた戦術の配列
   * @throws 無効なフォーマットの場合
   */
  static import(json: string): Tactic[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (error) {
      const parseError = new ValidationError("Invalid JSON format", {
        cause: error,
      });
      handleError(parseError, "Failed to parse tactic import JSON", {
        meta: { json: json.slice(0, 200) },
      });
      throw parseError;
    }
    let data;
    try {
      data = tacticExportDataSchema.parse(parsed);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        const validationError = new ValidationError(
          `Invalid tactic data format: ${error.issues.map((i) => i.message).join(", ")}`,
          { cause: error, details },
        );
        handleError(validationError, "Tactic import data validation failed", {
          meta: { issues: error.issues },
        });
        throw validationError;
      }
      throw error;
    }

    return data.tactics.map((record) => {
      const movements = new Map<string, Movement[]>();
      Object.entries(record.movements).forEach(
        ([formationKey, movementArray]) => {
          const movementList = movementArray.map((m) =>
            Movement.create(
              m.role,
              m.targetX,
              m.targetZ,
              m.delay,
              m.arrowColor,
            ),
          );
          movements.set(formationKey, movementList);
        },
      );

      const ballPasses = new Map<string, BallPass[]>();
      if (record.ballPasses) {
        Object.entries(record.ballPasses).forEach(
          ([formationKey, passArray]) => {
            const passList = passArray.map((bp) =>
              BallPass.create({
                startRole: bp.startRole,
                endRole: bp.endRole,
                delay: bp.delay,
                color: bp.color,
                endX: bp.endX,
                endZ: bp.endZ,
                startX: bp.startX,
                startZ: bp.startZ,
                trajectoryType: bp.trajectoryType,
              }),
            );
            ballPasses.set(formationKey, passList);
          },
        );
      }

      // インポートされた戦術には新しいIDを自動生成する
      return Tactic.create({
        name: record.name,
        icon: record.icon,
        phase: Phase.fromString(record.phase),
        movements,
        ballPasses,
        stepBoundaries: record.stepBoundaries,
      });
    });
  }
}
