import type { IGlossaryInputPort } from "@application/ports/input";
import type { IGlossaryRepository } from "@application/ports/output/repositories";
import type { Glossary } from "@domain/entities/Glossary";
import type { GlossaryId } from "@domain/value-objects";
import { withErrorHandling } from "@application/utils/withErrorHandling";

/**
 * 用語集ドメインの Interactor（Input Port 実装）
 *
 * IGlossaryInputPort を実装し、IGlossaryRepository（Output Port）に委譲する。
 */
export class GlossaryInteractor implements IGlossaryInputPort {
  constructor(private readonly glossaryRepository: IGlossaryRepository) {}

  async getAll(): Promise<Glossary[]> {
    return withErrorHandling(
      () => this.glossaryRepository.findAll(),
      "GlossaryInteractor.getAll failed",
    );
  }

  async getById(id: GlossaryId): Promise<Glossary | null> {
    return withErrorHandling(
      () => this.glossaryRepository.findById(id),
      "GlossaryInteractor.getById failed",
      { glossaryId: id.value },
    );
  }

  async save(glossary: Glossary): Promise<void> {
    return withErrorHandling(
      () => this.glossaryRepository.save(glossary),
      "GlossaryInteractor.save failed",
      { glossaryId: glossary.id.value },
    );
  }

  async delete(id: GlossaryId): Promise<void> {
    return withErrorHandling(
      () => this.glossaryRepository.delete(id),
      "GlossaryInteractor.delete failed",
      { glossaryId: id.value },
    );
  }
}
