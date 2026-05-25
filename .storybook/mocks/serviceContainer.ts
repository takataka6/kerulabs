import { configureContainer } from "@application/ServiceContainer";
import type { Container } from "@application/ServiceContainer";
import type { IPreferencesService } from "@application/ports/output/services/IPreferencesService";
import type { PreferenceMap } from "@application/ports/output/services/IPreferencesService";

const defaults: PreferenceMap = {
  language: "ja",
  sceneBgColor: "#1e293b",
  sceneBgImages: [],
  sceneBgSelectedIndex: -1,
  pitchColor: "#166534",
  pitchOpacity: 1,
};

const store = new Map<string, unknown>(Object.entries(defaults));

const mockPreferencesService: IPreferencesService = {
  get<K extends keyof PreferenceMap>(key: K): PreferenceMap[K] {
    return (store.get(key) ?? defaults[key]) as PreferenceMap[K];
  },
  set<K extends keyof PreferenceMap>(key: K, value: PreferenceMap[K]): void {
    store.set(key, value);
  },
  remove(key: keyof PreferenceMap): void {
    store.delete(key);
  },
};

const noopAsync = async () => {
  throw new Error("Not implemented in Storybook mock");
};

const mockContainer: Container = {
  teamRepository: {
    findAll: noopAsync,
    findById: noopAsync,
    save: noopAsync,
    delete: noopAsync,
  } as Container["teamRepository"],
  formationRepository: {
    findByGameMode: noopAsync,
    save: noopAsync,
    delete: noopAsync,
  } as Container["formationRepository"],
  tacticRepository: {
    findByFormationId: noopAsync,
    save: noopAsync,
    delete: noopAsync,
  } as Container["tacticRepository"],
  glossaryRepository: {
    findAll: noopAsync,
    findById: noopAsync,
    save: noopAsync,
    delete: noopAsync,
  } as Container["glossaryRepository"],
  fileService: {
    saveJson: noopAsync,
    openJson: noopAsync,
  } as Container["fileService"],
  preferencesService: mockPreferencesService,
  tacticInteractor: {
    getAll: async () => [],
    save: noopAsync,
    delete: noopAsync,
  } as Container["tacticInteractor"],
  teamInteractor: {
    getAll: async () => [],
    getById: async () => null,
    save: noopAsync,
    delete: noopAsync,
  } as Container["teamInteractor"],
  formationInteractor: {
    getAll: async () => [],
    save: noopAsync,
    delete: noopAsync,
  } as Container["formationInteractor"],
  glossaryInteractor: {
    getAll: async () => [],
    getById: async () => null,
    save: noopAsync,
    delete: noopAsync,
  } as Container["glossaryInteractor"],
};

export function setupMockContainer(): void {
  configureContainer(mockContainer);
}
