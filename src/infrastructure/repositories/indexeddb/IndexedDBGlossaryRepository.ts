import type { IGlossaryRepository } from "@application/ports/output/repositories";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects";
import { IndexedDBClient } from "./IndexedDBClient";
import { glossaryRecordSchema } from "@infrastructure/schemas/glossarySchema";
import { z } from "zod";
import { withDB } from "./withDB";

/**
 * IndexedDB を使った IGlossaryRepository の具象実装。
 *
 * withDB パターンで DB 取得・エラーハンドリングを共通化し、
 * Zod スキーマでレコードのバリデーションを行う。
 */
export class IndexedDBGlossaryRepository implements IGlossaryRepository {
  private client = IndexedDBClient.getInstance();

  async findAll(): Promise<Glossary[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAll("glossaries");
        const records = z.array(glossaryRecordSchema).parse(raw);
        return records.map(this.mapToDomain);
      },
      "Failed to fetch glossaries",
    );
  }

  async findById(id: GlossaryId): Promise<Glossary | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("glossaries", id.value);
        if (!raw) return null;
        const record = glossaryRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch glossary by id",
      { id: id.value },
    );
  }

  async save(glossary: Glossary): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.put("glossaries", this.mapToPersistence(glossary));
      },
      "Failed to save glossary",
      { glossaryId: glossary.id.value },
    );
  }

  async delete(id: GlossaryId): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("glossaries", id.value);
      },
      "Failed to delete glossary",
      { id: id.value },
    );
  }

  private mapToDomain(record: z.infer<typeof glossaryRecordSchema>): Glossary {
    return new Glossary({
      id: new GlossaryId(record.id),
      name: record.name,
      description: record.description,
      terms: record.terms,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    });
  }

  private mapToPersistence(glossary: Glossary) {
    return {
      id: glossary.id.value,
      name: glossary.name,
      description: glossary.description,
      terms: [...glossary.terms],
      createdAt: glossary.createdAt.getTime(),
      updatedAt: glossary.updatedAt.getTime(),
    };
  }
}
