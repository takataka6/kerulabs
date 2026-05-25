/**
 * @module IndexedDBFormationRepository
 * @description IndexedDBを使用したフォーメーションリポジトリの具象実装。ドメインエンティティとDB永続化レコード間のマッピングを行う。
 */
import type { IFormationRepository } from "@application/ports/output/repositories";
import { Formation } from "@domain/entities/Formation";
import type { FormationPosition } from "@domain/entities/Formation";
import { FormationId, Position } from "@domain/value-objects";
import { IndexedDBClient, TacticsDB } from "./IndexedDBClient";
import {
  formationRecordSchema,
  type FormationRecord,
  type PositionRecord,
} from "@infrastructure/schemas/formationSchema";
import { z } from "zod";
import { withDB } from "./withDB";

/** TacticsDB["formations"]["value"] の型エイリアス — mapToPersistence の戻り値型に使用 */
type FormationDBValue = TacticsDB["formations"]["value"];

export class IndexedDBFormationRepository implements IFormationRepository {
  private client = IndexedDBClient.getInstance();

  async findAll(): Promise<Formation[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAll("formations");
        const records = z.array(formationRecordSchema).parse(raw);
        return records.map((record) => this.mapToDomain(record));
      },
      "Failed to fetch formations",
    );
  }

  async findById(id: FormationId): Promise<Formation | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("formations", id.value);
        if (!raw) return null;
        const record = formationRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch formation by id",
      { id: id.value },
    );
  }

  async findByType(type: string): Promise<Formation[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAllFromIndex("formations", "by-type", type);
        const records = z.array(formationRecordSchema).parse(raw);
        return records.map((record) => this.mapToDomain(record));
      },
      "Failed to fetch formations by type",
      { type },
    );
  }

  async save(formation: Formation): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        const record = this.mapToPersistence(formation);
        await db.put("formations", record);
      },
      "Failed to save formation",
      { formationId: formation.id.value },
    );
  }

  async delete(id: FormationId): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("formations", id.value);
      },
      "Failed to delete formation",
      { id: id.value },
    );
  }

  protected mapToDomain(record: FormationRecord): Formation {
    const rawPositions: FormationPosition[] = record.positions.map(
      (p: PositionRecord) => ({
        pos: p.pos,
        position: Position.create(p.x, p.z),
        category: p.cat,
      }),
    );

    const roleMap = new Map<string, number>(
      Object.entries(record.roleMap).map(([k, v]) => [k, Number(v)]),
    );

    return new Formation({
      id: new FormationId(record.id),
      name: record.name,
      type: record.type,
      positions: rawPositions,
      roleMap,
      isCustom: record.isCustom,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      gameMode: record.gameMode || "football",
    });
  }

  protected mapToPersistence(formation: Formation): FormationDBValue {
    const positions: PositionRecord[] = formation.positions.map((p) => ({
      pos: p.pos,
      x: p.position.x,
      z: p.position.z,
      cat: p.category,
    }));

    const roleMap: Record<string, number> = {};
    formation.roleMap.forEach((value, key) => {
      roleMap[key] = value;
    });

    return {
      id: formation.id.value,
      name: formation.name,
      type: formation.type,
      positions,
      roleMap,
      isCustom: formation.isCustom,
      gameMode: formation.gameMode,
      createdAt: formation.createdAt.getTime(),
      updatedAt: formation.updatedAt.getTime(),
    };
  }
}
