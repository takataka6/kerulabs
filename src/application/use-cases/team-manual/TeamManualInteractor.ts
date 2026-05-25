import type { ITeamManualInputPort } from "@application/ports/input";
import type { ITeamManualRepository } from "@application/ports/output/repositories";
import type { TeamManual } from "@domain/entities/TeamManual";
import type { TeamManualId } from "@domain/value-objects";
import { withErrorHandling } from "@application/utils/withErrorHandling";

/**
 * チームマニュアルドメインの Interactor（Input Port 実装）
 *
 * ITeamManualInputPort を実装し、ITeamManualRepository（Output Port）に委譲する。
 */
export class TeamManualInteractor implements ITeamManualInputPort {
  constructor(private readonly teamManualRepository: ITeamManualRepository) {}

  async getAll(): Promise<TeamManual[]> {
    return withErrorHandling(
      () => this.teamManualRepository.findAll(),
      "TeamManualInteractor.getAll failed",
    );
  }

  async getById(id: TeamManualId): Promise<TeamManual | null> {
    return withErrorHandling(
      () => this.teamManualRepository.findById(id),
      "TeamManualInteractor.getById failed",
      { teamManualId: id.value },
    );
  }

  async save(manual: TeamManual): Promise<void> {
    return withErrorHandling(
      () => this.teamManualRepository.save(manual),
      "TeamManualInteractor.save failed",
      { teamManualId: manual.id.value },
    );
  }

  async delete(id: TeamManualId): Promise<void> {
    return withErrorHandling(
      () => this.teamManualRepository.delete(id),
      "TeamManualInteractor.delete failed",
      { teamManualId: id.value },
    );
  }
}
