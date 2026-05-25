import type { TeamManual } from "@domain/entities/TeamManual";
import type { TeamManualId } from "@domain/value-objects/TeamManualId";

/** チームマニュアルリポジトリのポートインターフェース */
export interface ITeamManualRepository {
  findAll(): Promise<TeamManual[]>;
  findById(id: TeamManualId): Promise<TeamManual | null>;
  save(manual: TeamManual): Promise<void>;
  delete(id: TeamManualId): Promise<void>;
}
