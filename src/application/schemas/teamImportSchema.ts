import { z } from "zod";
import { DEFAULT_TEAM_GK_COLOR } from "@shared/constants";
import {
  normalizeFormationKey,
  normalizeFormationKeys,
} from "@shared/constants/formations";

/** 一括インポート用の選手スキーマ（id/timestamps 不要） */
const playerImportSchema = z.object({
  name: z.string(),
  number: z.number().int().min(0).max(99),
  position: z.enum(["gk", "df", "mf", "fw"]).optional().default("mf"),
  nationality: z.string().optional(),
  club: z.string().optional(),
  leagueCountry: z.string().optional(),
  note: z.string().optional(),
  status: z
    .enum(["available", "suspended", "injured"])
    .optional()
    .default("available"),
});

/** 一括インポート用のチームスキーマ（ゆるめのバリデーション） */
export const teamImportDataSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().optional().default(""),
  country: z.string().optional(),
  colors: z
    .object({
      gk: z.string().optional().default(DEFAULT_TEAM_GK_COLOR),
      main: z.string().optional(),
    })
    .optional()
    .default({ gk: DEFAULT_TEAM_GK_COLOR }),
  availableFormations: z
    .array(z.string())
    .optional()
    .default(["4-3-3"])
    .transform((formations) => normalizeFormationKeys(formations)),
  defaultFormation: z
    .string()
    .optional()
    .transform((formation) =>
      formation ? normalizeFormationKey(formation) : undefined,
    ),
  flagType: z.string().optional().default("japan"),
  headerGradient: z
    .string()
    .optional()
    .default("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
  manager: z.string().optional(),
  players: z.array(playerImportSchema).optional(),
});

export type TeamImportData = z.infer<typeof teamImportDataSchema>;
