import type { Glossary } from "@domain/entities/Glossary";
import type { GlossaryId } from "@domain/value-objects/GlossaryId";

/** 用語集リポジトリのポートインターフェース */
export interface IGlossaryRepository {
  findAll(): Promise<Glossary[]>;
  findById(id: GlossaryId): Promise<Glossary | null>;
  save(glossary: Glossary): Promise<void>;
  delete(id: GlossaryId): Promise<void>;
}
