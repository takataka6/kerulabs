import type {
  ITeamRepository,
  IFormationRepository,
  ITacticRepository,
  IGlossaryRepository,
  ITeamManualRepository,
  IPluginRepository,
} from "@application/ports/output/repositories";
import { IndexedDBTeamRepository } from "../repositories/indexeddb/IndexedDBTeamRepository";
import { IndexedDBFormationRepository } from "../repositories/indexeddb/IndexedDBFormationRepository";
import { IndexedDBTacticRepository } from "../repositories/indexeddb/IndexedDBTacticRepository";
import { IndexedDBGlossaryRepository } from "../repositories/indexeddb/IndexedDBGlossaryRepository";
import { IndexedDBTeamManualRepository } from "../repositories/indexeddb/IndexedDBTeamManualRepository";
import { IndexedDBPluginRepository } from "../repositories/indexeddb/IndexedDBPluginRepository";

export class RepositoryFactory {
  static createTeamRepository(): ITeamRepository {
    return new IndexedDBTeamRepository();
  }

  static createFormationRepository(): IFormationRepository {
    return new IndexedDBFormationRepository();
  }

  static createTacticRepository(): ITacticRepository {
    return new IndexedDBTacticRepository();
  }

  static createGlossaryRepository(): IGlossaryRepository {
    return new IndexedDBGlossaryRepository();
  }

  static createTeamManualRepository(): ITeamManualRepository {
    return new IndexedDBTeamManualRepository();
  }

  static createPluginRepository(): IPluginRepository {
    return new IndexedDBPluginRepository();
  }
}
