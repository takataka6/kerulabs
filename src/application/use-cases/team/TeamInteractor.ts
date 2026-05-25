import type { ITeamInputPort } from "@application/ports/input";
import type { ITeamRepository } from "@application/ports/output/repositories";
import type { Team } from "@domain/entities/Team";
import type { TeamId } from "@domain/value-objects";
import { withErrorHandling } from "@application/utils/withErrorHandling";

/**
 * チームドメインの Interactor（Input Port 実装）
 *
 * ITeamInputPort を実装し、ITeamRepository（Output Port）に委譲する。
 */
export class TeamInteractor implements ITeamInputPort {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async getAll(): Promise<Team[]> {
    return withErrorHandling(
      () => this.teamRepository.findAll(),
      "TeamInteractor.getAll failed",
    );
  }

  async getById(id: TeamId): Promise<Team | null> {
    return withErrorHandling(
      () => this.teamRepository.findById(id),
      "TeamInteractor.getById failed",
      { teamId: id.value },
    );
  }

  async save(team: Team): Promise<void> {
    return withErrorHandling(
      () => this.teamRepository.save(team),
      "TeamInteractor.save failed",
      { teamId: team.id.value },
    );
  }

  async delete(id: TeamId): Promise<void> {
    return withErrorHandling(
      () => this.teamRepository.delete(id),
      "TeamInteractor.delete failed",
      { teamId: id.value },
    );
  }
}
