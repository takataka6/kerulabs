/**
 * @module IndexedDBTacticRepository
 * @description IndexedDBを使用した戦術リポジトリの具象実装。戦術の動き（Movement）やボールパス（BallPass）を含むドメインエンティティの永続化を担う。
 */
import type { ITacticRepository } from "@application/ports/output/repositories";
import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import type { TrajectoryType } from "@domain/entities/BallPass";
import { Phase, TacticId } from "@domain/value-objects";
import { IndexedDBClient, TacticsDB } from "./IndexedDBClient";
import {
  tacticRecordSchema,
  type TacticRecord,
  type MovementRecord,
  type BallPassRecord,
} from "@infrastructure/schemas/tacticSchema";
import { z } from "zod";
import { withDB } from "./withDB";

/** TacticsDB["tactics"]["value"] の型エイリアス — mapToPersistence の戻り値型に使用 */
type TacticDBValue = TacticsDB["tactics"]["value"];

export class IndexedDBTacticRepository implements ITacticRepository {
  private client = IndexedDBClient.getInstance();

  async findAll(): Promise<Tactic[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAll("tactics");
        const records = z.array(tacticRecordSchema).parse(raw);
        return records.map(this.mapToDomain);
      },
      "Failed to fetch tactics",
    );
  }

  async findById(id: TacticId): Promise<Tactic | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("tactics", id.value);
        if (!raw) return null;
        const record = tacticRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch tactic by id",
      { id: id.value },
    );
  }

  async findByPhase(phase: Phase): Promise<Tactic[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAllFromIndex(
          "tactics",
          "by-phase",
          phase.value,
        );
        const records = z.array(tacticRecordSchema).parse(raw);
        return records.map(this.mapToDomain);
      },
      "Failed to fetch tactics by phase",
      { phase: phase.value },
    );
  }

  async findByPhaseAndFormation(
    phase: Phase,
    formation: string,
  ): Promise<Tactic[]> {
    // findByPhase が内部で withDB を使用するため、ここでは直接呼び出す
    const allByPhase = await this.findByPhase(phase);
    return allByPhase.filter((tactic) => tactic.supportsFormation(formation));
  }

  async save(tactic: Tactic): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        const record = this.mapToPersistence(tactic);
        await db.put("tactics", record);
      },
      "Failed to save tactic",
      { tacticId: tactic.id.value },
    );
  }

  async delete(id: TacticId): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("tactics", id.value);
      },
      "Failed to delete tactic",
      { id: id.value },
    );
  }

  protected mapToDomain(record: TacticRecord): Tactic {
    const movements = new Map<string, Movement[]>();

    Object.entries(record.movements).forEach(
      ([formationKey, movementArray]) => {
        const movementList = movementArray.map((m: MovementRecord) =>
          Movement.create(m.role, m.targetX, m.targetZ, m.delay, m.arrowColor),
        );
        movements.set(formationKey, movementList);
      },
    );

    // ボールパスの復元（optional）
    const ballPasses = new Map<string, BallPass[]>();
    if (record.ballPasses) {
      Object.entries(record.ballPasses).forEach(([formationKey, passArray]) => {
        const passList = passArray.map((bp: BallPassRecord) =>
          BallPass.create({
            startRole: bp.startRole,
            endRole: bp.endRole,
            delay: bp.delay,
            color: bp.color,
            endX: bp.endX,
            endZ: bp.endZ,
            startX: bp.startX,
            startZ: bp.startZ,
            trajectoryType: bp.trajectoryType as TrajectoryType,
          }),
        );
        ballPasses.set(formationKey, passList);
      });
    }

    return new Tactic({
      id: new TacticId(record.id),
      name: record.name,
      icon: record.icon,
      phase: Phase.fromString(record.phase),
      movements,
      isCustom: record.isCustom,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      ballPasses,
      ballPosition: record.ballPosition,
    });
  }

  protected mapToPersistence(tactic: Tactic): TacticDBValue {
    const movements: TacticDBValue["movements"] = {};

    tactic.movements.forEach((movementList, formationKey) => {
      movements[formationKey] = movementList.map((m) => ({
        role: m.role,
        targetX: m.targetX,
        targetZ: m.targetZ,
        delay: m.delay,
        arrowColor: m.arrowColor,
      }));
    });

    // ボールパスのシリアライズ
    const ballPasses: NonNullable<TacticDBValue["ballPasses"]> = {};
    if (tactic.ballPasses && tactic.ballPasses.size > 0) {
      tactic.ballPasses.forEach((passList, formationKey) => {
        ballPasses[formationKey] = passList.map((bp) => ({
          startRole: bp.startRole,
          endRole: bp.endRole,
          delay: bp.delay,
          color: bp.color,
          endX: bp.endX,
          endZ: bp.endZ,
          startX: bp.startX,
          startZ: bp.startZ,
          trajectoryType: bp.trajectoryType,
        }));
      });
    }

    return {
      id: tactic.id.value,
      name: tactic.name,
      icon: tactic.icon,
      phase: tactic.phase.value,
      movements,
      ballPasses: Object.keys(ballPasses).length > 0 ? ballPasses : undefined,
      ballPosition: tactic.ballPosition,
      isCustom: tactic.isCustom,
      createdAt: tactic.createdAt.getTime(),
      updatedAt: tactic.updatedAt.getTime(),
    };
  }
}
