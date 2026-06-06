import { z } from "zod";

const positionCategory = z.enum(["gk", "df", "mf", "fw"]);

/** IndexedDB に保存される選手レコードのスキーマ */
export const playerRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number().int().min(0).max(99),
  position: positionCategory.optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  nationality: z.string().optional(),
  club: z.string().optional(),
  leagueCountry: z.string().optional(),
  imageUrl: z.string().optional(),
  mainVisualImageUrl: z.string().optional(),
  note: z.string().optional(),
  status: z.enum(["available", "suspended", "injured"]).optional(),
});

/** IndexedDB に保存されるチームレコードのスキーマ */
export const teamRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  colors: z.object({
    gk: z.string(),
    main: z.string(),
  }),
  availableFormations: z.array(z.string()),
  players: z.array(playerRecordSchema).optional(),
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
});

export type PlayerRecord = z.infer<typeof playerRecordSchema>;
export type TeamRecord = z.infer<typeof teamRecordSchema>;
