import { z } from "zod";

const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// ── 各ストアのレコードスキーマ ──────────────────────────────

const teamRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  colors: z.object({ gk: z.string(), main: z.string() }),
  availableFormations: z.array(z.string()),
  players: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        number: z.number(),
        position: z.enum(["gk", "df", "mf", "fw"]).optional(),
        createdAt: z.number(),
        updatedAt: z.number(),
        nationality: z.string().optional(),
        club: z.string().optional(),
        leagueCountry: z.string().optional(),
        imageUrl: z.string().optional(),
        mainVisualImageUrl: z.string().optional(),
        note: z.string().optional(),
        status: z.enum(["available", "suspended", "injured"]).optional(),
      }),
    )
    .optional(),
  flagType: z.string(),
  headerGradient: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  country: z.string().optional(),
  defaultFormation: z.string().optional(),
  selectedSquad: z.array(z.string()).optional(),
  manager: z.string().optional(),
  playerCards: z.record(z.coerce.number(), z.string()).optional(),
  managerCard: z.string().optional(),
  availableTactics: z.record(z.string(), z.array(z.string())).optional(),
});

const playerRecordSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string(),
  number: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const formationRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  positions: z.array(
    z.object({
      pos: z.string(),
      x: z.number(),
      z: z.number(),
      cat: z.enum(["gk", "df", "mf", "fw"]),
    }),
  ),
  roleMap: z.record(z.string(), z.number()),
  isCustom: z.boolean(),
  gameMode: z.enum(["football", "futsal", "eight_aside", "society"]).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const tacticRecordSchema = z.object({
  id: z.string(),
  name: z.record(z.string(), z.string()),
  icon: z.string(),
  phase: z.string(),
  movements: z.record(
    z.string(),
    z.array(
      z.object({
        role: z.string().min(1),
        targetX: z.number().finite(),
        targetZ: z.number().finite(),
        delay: z.number().min(0),
        arrowColor: z.string().regex(hexColorPattern),
      }),
    ),
  ),
  ballPasses: z
    .record(
      z.string(),
      z.array(
        z.object({
          startRole: z.string(),
          endRole: z.string(),
          delay: z.number().min(0),
          color: z.string().regex(hexColorPattern),
          endX: z.number().optional(),
          endZ: z.number().optional(),
          startX: z.number().optional(),
          startZ: z.number().optional(),
          trajectoryType: z
            .enum(["low", "high", "curveLeft", "curveRight"])
            .optional(),
        }),
      ),
    )
    .optional(),
  ballPosition: z.object({ x: z.number(), z: z.number() }).optional(),
  isCustom: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const preferenceRecordSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});

const glossaryRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  gameMode: z.enum(["football", "futsal", "eight_aside", "society"]).optional(),
  terms: z.array(
    z.object({
      id: z.string(),
      term: z.string(),
      reading: z.string().optional(),
      description: z.string(),
      keywords: z.array(z.string()),
    }),
  ),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const teamManualRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  teamId: z.string().optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      category: z.enum([
        "offense",
        "defense",
        "positive_transition",
        "negative_transition",
        "set_piece",
        "position_task",
        "free_note",
      ]),
      formations: z.array(z.string()),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          diagram: z.string().optional(),
          linkedTacticIds: z.array(z.string()),
        }),
      ),
    }),
  ),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const sketchRecordSchema = z.object({
  id: z.string(),
  layers: z.array(
    z.object({
      id: z.number(),
      strokes: z.array(
        z.object({
          id: z.number(),
          tool: z.enum(["pen", "line", "arrow"]),
          points: z.array(z.object({ x: z.number(), y: z.number() })),
          color: z.string(),
          width: z.number(),
        }),
      ),
      visible: z.boolean(),
      name: z.string(),
    }),
  ),
  activeLayerId: z.number(),
  updatedAt: z.number(),
});

// ── indexedDB ペイロード ─────────────────────────────────────

const indexedDBPayloadSchema = z.object({
  teams: z.array(teamRecordSchema).optional().default([]),
  players: z.array(playerRecordSchema).optional().default([]),
  formations: z.array(formationRecordSchema).optional().default([]),
  tactics: z.array(tacticRecordSchema).optional().default([]),
  preferences: z.array(preferenceRecordSchema).optional().default([]),
  sketches: z.array(sketchRecordSchema).optional().default([]),
  glossaries: z.array(glossaryRecordSchema).optional().default([]),
  teamManuals: z.array(teamManualRecordSchema).optional().default([]),
});

// ── AppBackupData トップレベル ────────────────────────────────

export const appBackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  indexedDB: indexedDBPayloadSchema,
});

export type AppBackupData = z.infer<typeof appBackupSchema>;
