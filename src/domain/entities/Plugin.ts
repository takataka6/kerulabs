/**
 * @module Plugin
 * @description プラグインエンティティの定義。レッスンプラグインのメタデータと内容を管理する。
 */
import { PluginId } from "../value-objects/PluginId";

/** 多言語テキスト */
export interface I18nText {
  ja: string;
  en: string;
}

/** プラグインの種別 */
export type PluginType = "lesson";

/** プラグインメタデータ */
export interface PluginMetadata {
  id: string;
  name: I18nText;
  author: string;
  version: string;
  description: I18nText;
}

/* ------------------------------------------------------------------ */
/*  レッスンセクション定義                                                */
/* ------------------------------------------------------------------ */

/** 見出しセクション */
export interface HeadingSection {
  type: "heading";
  text: I18nText;
}

/** 段落セクション */
export interface ParagraphSection {
  type: "paragraph";
  text: I18nText;
}

/** コードブロックセクション */
export interface CodeBlockSection {
  type: "codeBlock";
  language: string;
  code: string;
  highlightLines?: number[];
}

/** 3Dピッチ上の選手定義 */
export interface PlayerDefinition {
  x: number;
  z: number;
  number?: number;
  name?: string;
  color: string;
}

/** 3Dデモセクション */
export interface MiniPitchDemoSection {
  type: "miniPitchDemo";
  description?: I18nText;
  cameraPosition?: [number, number, number];
  players: PlayerDefinition[];
}

/** ステップ切替式3Dデモの各ステップ */
export interface PitchStep {
  label: I18nText;
  players: PlayerDefinition[];
}

/** ステップ切替式3Dデモセクション */
export interface MiniPitchStepsSection {
  type: "miniPitchSteps";
  description?: I18nText;
  cameraPosition?: [number, number, number];
  steps: PitchStep[];
}

/** インタラクティブデモの状態定義 */
export interface StateDefinition {
  type: "string" | "number" | "boolean";
  default: string | number | boolean;
  min?: number;
  max?: number;
}

/** UIコントロール: ボタングループ */
export interface ButtonGroupControl {
  type: "buttonGroup";
  bind: string;
  options: Array<{ value: string; label: I18nText }>;
}

/** UIコントロール: テキスト入力 */
export interface TextInputControl {
  type: "textInput";
  bind: string;
  maxLength?: number;
  label?: I18nText;
}

/** UIコントロール: 数値入力 */
export interface NumberInputControl {
  type: "numberInput";
  bind: string;
  label?: I18nText;
}

/** UIコントロール: トグル */
export interface ToggleControl {
  type: "toggle";
  bind: string;
  label?: I18nText;
}

/** UIコントロール: スライダー */
export interface SliderControl {
  type: "slider";
  bind: string;
  label?: I18nText;
}

export type InteractiveControl =
  | ButtonGroupControl
  | TextInputControl
  | NumberInputControl
  | ToggleControl
  | SliderControl;

/** 条件式: 値の動的決定に使用 */
export interface ConditionalValue {
  if: string;
  then: string | number;
  else: string | number;
}

/** インタラクティブデモの選手定義（バインディング対応） */
export interface InteractivePlayerDefinition {
  x: number;
  z: number;
  number?: number | string;
  name?: string;
  color: string | ConditionalValue;
}

/** シーン定義: 状態値によるシーン切替 */
export type SceneMap = Record<
  string,
  { players: InteractivePlayerDefinition[] }
>;

/** インタラクティブデモセクション */
export interface InteractiveDemoSection {
  type: "interactiveDemo";
  description?: I18nText;
  cameraPosition?: [number, number, number];
  state: Record<string, StateDefinition>;
  controls: InteractiveControl[];
  scene?: { players: InteractivePlayerDefinition[] };
  scenes?: SceneMap;
}

/** Mermaidダイアグラムセクション */
export interface MermaidDiagramSection {
  type: "mermaidDiagram";
  description?: I18nText;
  code: string;
}

/** レッスンセクションの共用体型 */
export type LessonSection =
  | HeadingSection
  | ParagraphSection
  | CodeBlockSection
  | MiniPitchDemoSection
  | MiniPitchStepsSection
  | InteractiveDemoSection
  | MermaidDiagramSection;

/** レッスンカテゴリ */
export type LessonCategory =
  | "programming-basics"
  | "file-formats"
  | "git"
  | "architecture"
  | "testing"
  | "custom";

/** レッスンプラグインのデータ部分 */
export interface LessonPluginData {
  lessonId: string;
  category: LessonCategory;
  title: I18nText;
  description: I18nText;
  icon: string;
  gradient: string;
  sections: LessonSection[];
}

/* ------------------------------------------------------------------ */
/*  Plugin エンティティ                                                  */
/* ------------------------------------------------------------------ */

export interface PluginProps {
  id: PluginId;
  kerulabsPlugin: string;
  type: PluginType;
  metadata: PluginMetadata;
  data: LessonPluginData;
  installedAt: Date;
}

export class Plugin {
  public readonly id: PluginId;
  public readonly kerulabsPlugin: string;
  public readonly type: PluginType;
  public readonly metadata: PluginMetadata;
  public readonly data: LessonPluginData;
  public readonly installedAt: Date;

  constructor(props: PluginProps) {
    this.id = props.id;
    this.kerulabsPlugin = props.kerulabsPlugin;
    this.type = props.type;
    this.metadata = props.metadata;
    this.data = props.data;
    this.installedAt = props.installedAt;
  }

  /** プラグインのメタデータIDを取得 */
  get metadataId(): string {
    return this.metadata.id;
  }

  /** レッスンIDを取得 */
  get lessonId(): string {
    return this.data.lessonId;
  }
}
