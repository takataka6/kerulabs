/**
 * @module pluginSchema
 * @description プラグインのZodバリデーションスキーマ。JSONインポート時の検証に使用する。
 */
import { z } from "zod";

const i18nTextSchema = z.object({
  ja: z.string(),
  en: z.string(),
});

const pluginMetadataSchema = z.object({
  id: z.string().min(1),
  name: i18nTextSchema,
  author: z.string().min(1),
  version: z.string().min(1),
  description: i18nTextSchema,
});

const headingSectionSchema = z.object({
  type: z.literal("heading"),
  text: i18nTextSchema,
});

const paragraphSectionSchema = z.object({
  type: z.literal("paragraph"),
  text: i18nTextSchema,
});

const codeBlockSectionSchema = z.object({
  type: z.literal("codeBlock"),
  language: z.string().min(1),
  code: z.string(),
  highlightLines: z.array(z.number().int()).optional(),
});

const playerDefinitionSchema = z.object({
  x: z.number().finite(),
  z: z.number().finite(),
  number: z.number().int().optional(),
  name: z.string().optional(),
  color: z.string().min(1),
});

const miniPitchDemoSectionSchema = z.object({
  type: z.literal("miniPitchDemo"),
  description: i18nTextSchema.optional(),
  cameraPosition: z.tuple([z.number(), z.number(), z.number()]).optional(),
  players: z.array(playerDefinitionSchema),
});

const pitchStepSchema = z.object({
  label: i18nTextSchema,
  players: z.array(playerDefinitionSchema),
});

const miniPitchStepsSectionSchema = z.object({
  type: z.literal("miniPitchSteps"),
  description: i18nTextSchema.optional(),
  cameraPosition: z.tuple([z.number(), z.number(), z.number()]).optional(),
  steps: z.array(pitchStepSchema).min(1),
});

const conditionalValueSchema = z.object({
  if: z.string(),
  then: z.union([z.string(), z.number()]),
  else: z.union([z.string(), z.number()]),
});

const interactivePlayerSchema = z.object({
  x: z.number().finite(),
  z: z.number().finite(),
  number: z.union([z.number().int(), z.string()]).optional(),
  name: z.string().optional(),
  color: z.union([z.string().min(1), conditionalValueSchema]),
});

const stateDefinitionSchema = z.object({
  type: z.enum(["string", "number", "boolean"]),
  default: z.union([z.string(), z.number(), z.boolean()]),
  min: z.number().optional(),
  max: z.number().optional(),
});

const buttonGroupControlSchema = z.object({
  type: z.literal("buttonGroup"),
  bind: z.string().min(1),
  options: z.array(z.object({ value: z.string(), label: i18nTextSchema })),
});

const textInputControlSchema = z.object({
  type: z.literal("textInput"),
  bind: z.string().min(1),
  maxLength: z.number().int().positive().optional(),
  label: i18nTextSchema.optional(),
});

const numberInputControlSchema = z.object({
  type: z.literal("numberInput"),
  bind: z.string().min(1),
  label: i18nTextSchema.optional(),
});

const toggleControlSchema = z.object({
  type: z.literal("toggle"),
  bind: z.string().min(1),
  label: i18nTextSchema.optional(),
});

const sliderControlSchema = z.object({
  type: z.literal("slider"),
  bind: z.string().min(1),
  label: i18nTextSchema.optional(),
});

const interactiveControlSchema = z.discriminatedUnion("type", [
  buttonGroupControlSchema,
  textInputControlSchema,
  numberInputControlSchema,
  toggleControlSchema,
  sliderControlSchema,
]);

const interactiveSceneSchema = z.object({
  players: z.array(interactivePlayerSchema),
});

const interactiveDemoSectionSchema = z.object({
  type: z.literal("interactiveDemo"),
  description: i18nTextSchema.optional(),
  cameraPosition: z.tuple([z.number(), z.number(), z.number()]).optional(),
  state: z.record(z.string(), stateDefinitionSchema),
  controls: z.array(interactiveControlSchema),
  scene: interactiveSceneSchema.optional(),
  scenes: z.record(z.string(), interactiveSceneSchema).optional(),
});

const mermaidDiagramSectionSchema = z.object({
  type: z.literal("mermaidDiagram"),
  description: i18nTextSchema.optional(),
  code: z.string().min(1),
});

const lessonSectionSchema = z.discriminatedUnion("type", [
  headingSectionSchema,
  paragraphSectionSchema,
  codeBlockSectionSchema,
  miniPitchDemoSectionSchema,
  miniPitchStepsSectionSchema,
  interactiveDemoSectionSchema,
  mermaidDiagramSectionSchema,
]);

const lessonCategorySchema = z.enum([
  "programming-basics",
  "file-formats",
  "git",
  "architecture",
  "testing",
  "custom",
]);

const lessonPluginDataSchema = z.object({
  lessonId: z.string().min(1),
  category: lessonCategorySchema,
  title: i18nTextSchema,
  description: i18nTextSchema,
  icon: z.string().min(1),
  gradient: z.string().min(1),
  sections: z.array(lessonSectionSchema).min(1),
});

export const pluginManifestSchema = z.object({
  kerulabs_plugin: z.string().min(1),
  type: z.literal("lesson"),
  metadata: pluginMetadataSchema,
  data: lessonPluginDataSchema,
});

export type PluginManifest = z.infer<typeof pluginManifestSchema>;

/** IndexedDB永続化用のレコードスキーマ */
export const pluginRecordSchema = z.object({
  id: z.string().min(1),
  kerulabs_plugin: z.string().min(1),
  type: z.literal("lesson"),
  metadata: pluginMetadataSchema,
  data: lessonPluginDataSchema,
  installedAt: z.number(),
});

export type PluginRecord = z.infer<typeof pluginRecordSchema>;
