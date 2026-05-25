/**
 * @module queryKeys
 * @description TanStack React Queryのクエリキー定数。teams・formations・tactics・preferences・glossariesの各クエリキーを一元管理する。
 */
export const queryKeys = {
  teams: {
    all: ["teams"] as const,
    detail: (id: string) => ["teams", id] as const,
  },
  formations: {
    all: ["formations"] as const,
    detail: (id: string) => ["formations", id] as const,
    byType: (type: string) => ["formations", "type", type] as const,
  },
  tactics: {
    all: ["tactics"] as const,
    detail: (id: string) => ["tactics", id] as const,
    byPhase: (phase: string) => ["tactics", "phase", phase] as const,
    byPhaseAndFormation: (phase: string, formation: string) =>
      ["tactics", "phase", phase, "formation", formation] as const,
  },
  preferences: {
    current: ["preferences"] as const,
  },
  glossaries: {
    all: ["glossaries"] as const,
    detail: (id: string) => ["glossaries", id] as const,
  },
  teamManuals: {
    all: ["teamManuals"] as const,
    detail: (id: string) => ["teamManuals", id] as const,
  },
  plugins: {
    all: ["plugins"] as const,
    detail: (id: string) => ["plugins", id] as const,
  },
} as const;
