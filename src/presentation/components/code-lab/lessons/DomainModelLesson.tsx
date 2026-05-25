/**
 * @module DomainModelLesson
 * @description レッスン: ドメインモデル。エンティティとValue Objectの設計を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const ENTITY_CODE = `// エンティティ: 一意のIDを持ち、状態が変わっても同一のもの
export class Player {
  private _name: string;
  private _number: number;

  constructor(private readonly _id: PlayerId, props: ...) {
    // ビジネスルールをコンストラクタで強制
    if (props.number < 0 || props.number > 99) {
      throw new Error("背番号は0〜99の範囲");
    }
    if (!props.name.trim()) {
      throw new Error("名前は空にできない");
    }
    this._name = props.name;
    this._number = props.number;
  }

  // Getter: 読み取り専用
  get id(): PlayerId { return this._id; }
  get name(): string { return this._name; }

  // 変更は専用メソッド経由のみ
  updateName(name: string): void {
    if (!name.trim()) throw new Error("名前は空にできない");
    this._name = name;
    this._updatedAt = new Date();  // 自動でタイムスタンプ更新
  }
}`;

const VALUE_OBJECT_CODE = `// 値オブジェクト: 値そのものが重要（IDを持たない）
export class Color {
  // private constructor → 直接 new できない
  private constructor(public readonly hex: string) {}

  // ファクトリメソッドでバリデーション付き生成
  static fromHex(hex: string): Color {
    if (!Color.HEX_PATTERN.test(hex)) {
      throw new Error(\`無効な色: \${hex}\`);
    }
    return new Color(hex);
  }

  // 値で比較する（IDではなく中身が同じなら等しい）
  equals(other: Color): boolean {
    return this.hex === other.hex;
  }
}

// 使い方
const red = Color.fromHex("#ff0000");
const alsoRed = Color.fromHex("#ff0000");
red.equals(alsoRed);  // → true（同じ値だから等しい）`;

const TEAM_ID_CODE = `// 型安全なID（TeamIdとPlayerIdを混同しない）
export abstract class EntityId<T extends EntityId<T>> {
  constructor(public readonly value: string) {
    if (!value.trim()) {
      throw new Error("IDは空にできない");
    }
  }
  equals(other: T): boolean {
    return this.value === other.value;
  }
}

// TeamIdとPlayerIdは別の型
export class TeamId extends EntityId<TeamId> {
  static generate(): TeamId {
    return new TeamId(crypto.randomUUID());
  }
}

export class PlayerId extends EntityId<PlayerId> {
  static generate(): PlayerId {
    return new PlayerId(crypto.randomUUID());
  }
}

// コンパイルエラー！型が違う
// teamId.equals(playerId);  // TS Error!`;

function EntityDemo() {
  const { language } = useLanguage();
  const ja = language === "ja";
  const [name, setName] = useState("Tanaka");
  const [number, setNumber] = useState(10);

  const nameError = name.trim() === "";
  const numberError = number < 0 || number > 99;
  const hasError = nameError || numberError;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-3">
        <label className="block text-xs text-slate-400">
          <span className="font-mono">player.name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none ${nameError ? "border-red-500" : "border-slate-600 focus:border-blue-500"}`}
          />
        </label>
        {nameError && (
          <div className="text-red-400 text-xs font-mono">
            throw new Error(&quot;
            {ja ? "名前は空にできない" : "Name cannot be empty"}&quot;)
          </div>
        )}
        <label className="block text-xs text-slate-400">
          <span className="font-mono">player.number</span>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value) || -1)}
            className={`mt-1 block w-full px-3 py-2 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none ${numberError ? "border-red-500" : "border-slate-600 focus:border-blue-500"}`}
          />
        </label>
        {numberError && (
          <div className="text-red-400 text-xs font-mono">
            throw new Error(&quot;
            {ja ? "背番号は0〜99の範囲" : "Number must be 0-99"}&quot;)
          </div>
        )}
        <div
          className={`p-2 rounded-lg text-xs text-center font-bold ${hasError ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-green-500/10 text-green-400 border border-green-500/30"}`}
        >
          {hasError
            ? ja
              ? "❌ バリデーションエラー — 生成拒否"
              : "❌ Validation error — creation rejected"
            : ja
              ? "✅ Player.create() 成功"
              : "✅ Player.create() success"}
        </div>
      </div>
      <DemoCanvas cameraPosition={[0, 8, -6]}>
        <MiniPitch />
        {!hasError && (
          <PlayerMarker
            position={[0, 0, 0]}
            color="#3b82f6"
            number={number}
            name={name}
          />
        )}
      </DemoCanvas>
    </div>
  );
}

type Tab = "entity" | "value-object" | "id";

export function DomainModelLesson() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("entity");
  const ja = language === "ja";

  const tabs: { key: Tab; label: string; labelEn: string }[] = [
    { key: "entity", label: "エンティティ", labelEn: "Entity" },
    { key: "value-object", label: "値オブジェクト", labelEn: "Value Object" },
    { key: "id", label: "型安全なID", labelEn: "Type-safe ID" },
  ];

  return (
    <LessonLayout lessonId="domain-model">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          📦
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "ドメインモデル" : "Domain Model"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "ドメインモデルは「ビジネスの概念」をコードで表現したものです。エンティティと値オブジェクトの2種類があります。"
            : "A domain model represents business concepts in code. There are two types: Entities and Value Objects."}
        </p>
      </div>

      {/* エンティティ vs 値オブジェクト */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "エンティティ vs 値オブジェクト" : "Entity vs Value Object"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="text-blue-400 font-bold mb-2">
              {ja ? "エンティティ" : "Entity"}
            </div>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>
                {ja ? "• 一意のIDで識別される" : "• Identified by unique ID"}
              </li>
              <li>
                {ja
                  ? "• 状態が変わっても同じもの"
                  : "• Same entity even if state changes"}
              </li>
              <li>
                {ja
                  ? "• 例: 選手（背番号が変わっても同一人物）"
                  : "• Example: Player (same person even if number changes)"}
              </li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold mb-2">
              {ja ? "値オブジェクト" : "Value Object"}
            </div>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>
                {ja
                  ? "• 値そのものが重要（IDなし）"
                  : "• The value itself matters (no ID)"}
              </li>
              <li>
                {ja ? "• 不変（変更不可）" : "• Immutable (cannot be changed)"}
              </li>
              <li>
                {ja
                  ? "• 例: 色（#ff0000 は常に赤）"
                  : "• Example: Color (#ff0000 is always red)"}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* インタラクティブデモ: エンティティのバリデーション */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "試してみよう: エンティティのルールを体験"
            : "Try It Out: Experience entity rules"}
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          {ja
            ? "名前や背番号を変えてみてください。ドメインルールに違反するとエンティティが拒否します。"
            : "Try changing the name or number. The entity rejects values that violate domain rules."}
        </p>
        <EntityDemo />
      </section>

      {/* タブ切り替えコード例 */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "実際のコード" : "Actual Code"}
        </h2>
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ja ? tab.label : tab.labelEn}
            </button>
          ))}
        </div>

        {activeTab === "entity" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "エンティティはprivateフィールドとgetterで状態を保護し、変更は専用メソッドを通じてのみ行えます。コンストラクタでビジネスルールを強制することで、不正な状態のオブジェクトが作られるのを防ぎます。"
                  : "Entities protect state with private fields and getters. Changes only happen through dedicated methods. Business rules in the constructor prevent invalid objects from being created."}
              </p>
            </div>
            <CodeBlock
              code={ENTITY_CODE}
              highlightLines={[7, 8, 9, 10, 11, 12, 13]}
            />
          </>
        )}

        {activeTab === "value-object" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "値オブジェクトはprivate constructorとファクトリメソッドで不正な値の生成を防ぎます。不変なので安全に共有でき、値で比較できます。"
                  : "Value Objects use private constructors and factory methods to prevent invalid values. Being immutable, they can be safely shared and compared by value."}
              </p>
            </div>
            <CodeBlock
              code={VALUE_OBJECT_CODE}
              highlightLines={[3, 6, 7, 8, 9, 10, 11]}
            />
          </>
        )}

        {activeTab === "id" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "EntityIdの自己参照型パターンにより、TeamIdとPlayerIdをコンパイル時に区別できます。IDの取り違えバグをゼロにします。"
                  : "The self-referencing type pattern on EntityId lets the compiler distinguish TeamId from PlayerId. This eliminates ID mix-up bugs at compile time."}
              </p>
            </div>
            <CodeBlock code={TEAM_ID_CODE} highlightLines={[2, 14, 20, 27]} />
          </>
        )}
      </section>
    </LessonLayout>
  );
}
