import type { IFormationInputPort } from "@application/ports/input";
import type { IFormationRepository } from "@application/ports/output/repositories";
import type { Formation } from "@domain/entities/Formation";
import type { FormationId } from "@domain/value-objects/FormationId";
import { withErrorHandling } from "@application/utils/withErrorHandling";

/**
 * フォーメーションドメインの Interactor（Input Port 実装）
 *
 * IFormationInputPort を実装し、IFormationRepository（Output Port）に委譲する。
 */
export class FormationInteractor implements IFormationInputPort {
  constructor(private readonly formationRepository: IFormationRepository) {}

  async getAll(): Promise<Formation[]> {
    return withErrorHandling(
      () => this.formationRepository.findAll(),
      "FormationInteractor.getAll failed",
    );
  }

  async getById(id: FormationId): Promise<Formation | null> {
    return withErrorHandling(
      () => this.formationRepository.findById(id),
      "FormationInteractor.getById failed",
      { formationId: id.value },
    );
  }

  async save(formation: Formation): Promise<void> {
    return withErrorHandling(
      () => this.formationRepository.save(formation),
      "FormationInteractor.save failed",
      { formationId: formation.id.value },
    );
  }

  async delete(id: FormationId): Promise<void> {
    return withErrorHandling(
      () => this.formationRepository.delete(id),
      "FormationInteractor.delete failed",
      { formationId: id.value },
    );
  }
}
