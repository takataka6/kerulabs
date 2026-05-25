import type { ITacticInputPort } from "@application/ports/input";
import type { ITacticRepository } from "@application/ports/output/repositories";
import type { Tactic } from "@domain/entities/Tactic";
import type { Phase, TacticId } from "@domain/value-objects";
import { withErrorHandling } from "@application/utils/withErrorHandling";

/**
 * 戦術ドメインの Interactor（Input Port 実装）
 *
 * ITacticInputPort を実装し、ITacticRepository（Output Port）に委譲する。
 */
export class TacticInteractor implements ITacticInputPort {
  constructor(private readonly tacticRepository: ITacticRepository) {}

  async getAll(): Promise<Tactic[]> {
    return withErrorHandling(
      () => this.tacticRepository.findAll(),
      "TacticInteractor.getAll failed",
    );
  }

  async getByPhase(phase: Phase): Promise<Tactic[]> {
    return withErrorHandling(
      () => this.tacticRepository.findByPhase(phase),
      "TacticInteractor.getByPhase failed",
      { phase: phase.value },
    );
  }

  async save(tactic: Tactic): Promise<void> {
    return withErrorHandling(
      () => this.tacticRepository.save(tactic),
      "TacticInteractor.save failed",
      { tacticId: tactic.id.value },
    );
  }

  async delete(id: TacticId): Promise<void> {
    return withErrorHandling(
      () => this.tacticRepository.delete(id),
      "TacticInteractor.delete failed",
      { tacticId: id.value },
    );
  }
}
