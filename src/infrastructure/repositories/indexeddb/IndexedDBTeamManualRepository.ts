import type { ITeamManualRepository } from "@application/ports/output/repositories";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects";
import { IndexedDBClient } from "./IndexedDBClient";
import { teamManualRecordSchema } from "@infrastructure/schemas/teamManualSchema";
import { z } from "zod";
import { withDB } from "./withDB";

/**
 * IndexedDB を使った ITeamManualRepository の具象実装。
 *
 * withDB パターンで DB 取得・エラーハンドリングを共通化し、
 * Zod スキーマでレコードのバリデーションを行う。
 */
export class IndexedDBTeamManualRepository implements ITeamManualRepository {
  private client = IndexedDBClient.getInstance();

  async findAll(): Promise<TeamManual[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAll("teamManuals");
        const records = z.array(teamManualRecordSchema).parse(raw);
        return records.map(this.mapToDomain);
      },
      "Failed to fetch team manuals",
    );
  }

  async findById(id: TeamManualId): Promise<TeamManual | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("teamManuals", id.value);
        if (!raw) return null;
        const record = teamManualRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch team manual by id",
      { id: id.value },
    );
  }

  async save(manual: TeamManual): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.put("teamManuals", this.mapToPersistence(manual));
      },
      "Failed to save team manual",
      { teamManualId: manual.id.value },
    );
  }

  async delete(id: TeamManualId): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("teamManuals", id.value);
      },
      "Failed to delete team manual",
      { id: id.value },
    );
  }

  protected mapToDomain(
    record: z.infer<typeof teamManualRecordSchema>,
  ): TeamManual {
    return new TeamManual({
      id: new TeamManualId(record.id),
      name: record.name,
      description: record.description,
      teamId: record.teamId,
      sections: record.sections || [],
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    });
  }

  protected mapToPersistence(manual: TeamManual) {
    return {
      id: manual.id.value,
      name: manual.name,
      description: manual.description,
      teamId: manual.teamId,
      sections: manual.sections.map((s) => ({
        ...s,
        items: [...s.items],
      })),
      createdAt: manual.createdAt.getTime(),
      updatedAt: manual.updatedAt.getTime(),
    };
  }
}
