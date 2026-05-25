/**
 * @module CleanArchitectureLesson
 * @description レッスン: Clean Architecture 入門。4層構造の役割と依存の方向を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { PlayerMarker } from "../PlayerMarker";

interface Layer {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  descriptionEn: string;
  examples: string[];
  examplesEn: string[];
}

const LAYERS: Layer[] = [
  {
    id: "domain",
    name: "Domain（ドメイン層）",
    nameEn: "Domain Layer",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description:
      "ビジネスルールの中心。外部に一切依存しない。「選手の背番号は1〜99」「チーム名は空にできない」といったルールをここで守る。",
    descriptionEn:
      "The heart of business rules. Has zero external dependencies. Rules like 'player number must be 1-99' and 'team name cannot be empty' are enforced here.",
    examples: [
      "Team, Player（エンティティ）",
      "Color, Position（値オブジェクト）",
      "EventBus（ドメインイベント）",
    ],
    examplesEn: [
      "Team, Player (Entities)",
      "Color, Position (Value Objects)",
      "EventBus (Domain Events)",
    ],
  },
  {
    id: "application",
    name: "Application（アプリケーション層）",
    nameEn: "Application Layer",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description:
      "ユースケース（やりたいこと）を定義する。「チームを作成する」「戦術を保存する」など。Domain層だけに依存する。",
    descriptionEn:
      "Defines use cases (what we want to do). 'Create a team', 'Save a tactic', etc. Depends only on the Domain layer.",
    examples: [
      "TeamInteractor（ユースケース）",
      "ITeamRepository（出力ポート）",
      "ServiceContainer（DI）",
    ],
    examplesEn: [
      "TeamInteractor (Use Cases)",
      "ITeamRepository (Output Port)",
      "ServiceContainer (DI)",
    ],
  },
  {
    id: "infrastructure",
    name: "Infrastructure（インフラ層）",
    nameEn: "Infrastructure Layer",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description:
      "データベースやファイルシステムなど外部との接続を担当。Application層のインターフェースを実装する。",
    descriptionEn:
      "Handles connections to external systems like databases and file systems. Implements Application layer interfaces.",
    examples: [
      "IndexedDBTeamRepository（DB実装）",
      "BrowserFileService（ファイル操作）",
      "Zodスキーマ（バリデーション）",
    ],
    examplesEn: [
      "IndexedDBTeamRepository (DB impl)",
      "BrowserFileService (File operations)",
      "Zod schemas (Validation)",
    ],
  },
  {
    id: "presentation",
    name: "Presentation（プレゼンテーション層）",
    nameEn: "Presentation Layer",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    description:
      "ユーザーが見る画面。ReactコンポーネントやThree.jsの3D描画を担当。Application層を通じてデータにアクセスする。",
    descriptionEn:
      "What users see. React components and Three.js 3D rendering. Accesses data through the Application layer.",
    examples: [
      "CodeLabPage（ページ）",
      "Scene（3Dシーン）",
      "useLanguage（カスタムフック）",
    ],
    examplesEn: [
      "CodeLabPage (Pages)",
      "Scene (3D Scene)",
      "useLanguage (Custom Hooks)",
    ],
  },
];

const DEPENDENCY_CODE = `// ❌ 悪い例: Domain が Infrastructure に依存
// domain/entities/Team.ts
import { IndexedDB } from "infrastructure/db";  // NG!

// ✅ 良い例: Application がインターフェースを定義
// application/ports/output/ITeamRepository.ts
export interface ITeamRepository {
  findAll(): Promise<Team[]>;
  save(team: Team): Promise<void>;
}

// infrastructure/repositories/IndexedDBTeamRepository.ts
// Infrastructure がインターフェースを実装する
export class IndexedDBTeamRepository
  implements ITeamRepository {
  async findAll(): Promise<Team[]> { /* ... */ }
  async save(team: Team): Promise<void> { /* ... */ }
}`;

const FOLDER_CODE = `src/
├── domain/              # ビジネスルール（依存なし）
│   ├── entities/        # Team, Player, Tactic ...
│   ├── value-objects/   # Color, Position, TeamId ...
│   └── events/          # EventBus, TacticEvent
│
├── application/         # ユースケース
│   ├── use-cases/       # TeamInteractor, TacticInteractor
│   ├── ports/           # インターフェース定義
│   └── ServiceContainer.ts
│
├── infrastructure/      # 外部接続の実装
│   ├── repositories/    # IndexedDB実装
│   └── services/        # ファイル操作など
│
└── presentation/        # UI
    ├── pages/           # ページコンポーネント
    ├── components/      # UIコンポーネント
    └── hooks/           # カスタムフック`;

export function CleanArchitectureLesson() {
  const { language } = useLanguage();
  const [selectedLayer, setSelectedLayer] = useState<string>("domain");
  const ja = language === "ja";

  const selected = LAYERS.find((l) => l.id === selectedLayer)!;

  return (
    <LessonLayout lessonId="clean-architecture">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🏗️
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "Clean Architecture 入門" : "Clean Architecture"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "Clean Architecture は、コードを「役割」ごとに4つの層に分ける設計手法です。層を分けることで、変更に強く、テストしやすいコードになります。"
            : "Clean Architecture organizes code into 4 layers by 'role'. This separation makes code resilient to change and easy to test."}
        </p>
      </div>

      {/* 4層の図 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "4つの層" : "The 4 Layers"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* 層選択 */}
          <div className="space-y-2">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setSelectedLayer(layer.id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                  selectedLayer === layer.id
                    ? `${layer.bgColor} ${layer.borderColor} border`
                    : "bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50"
                }`}
              >
                <span
                  className={`font-bold ${selectedLayer === layer.id ? layer.color : "text-white"}`}
                >
                  {ja ? layer.name : layer.nameEn}
                </span>
              </button>
            ))}
          </div>

          {/* 詳細表示 */}
          <div
            className={`p-5 rounded-xl border ${selected.borderColor} ${selected.bgColor}`}
          >
            <h3 className={`font-bold mb-3 ${selected.color}`}>
              {ja ? selected.name : selected.nameEn}
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              {ja ? selected.description : selected.descriptionEn}
            </p>
            <div className="space-y-1.5">
              <div className="text-xs text-slate-500 font-bold uppercase">
                {ja ? "このアプリでの例" : "Examples in this app"}
              </div>
              {(ja ? selected.examples : selected.examplesEn).map((ex, i) => (
                <div key={i} className="text-sm text-slate-300 font-mono">
                  {ex}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 依存の方向 */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6">
          <div className="text-white font-bold text-sm mb-2">
            {ja
              ? "依存の方向（最も重要なルール）"
              : "Dependency Direction (The Most Important Rule)"}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm py-3">
            <span className="text-violet-400 font-bold">Presentation</span>
            <span className="text-slate-500">→</span>
            <span className="text-blue-400 font-bold">Application</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-400 font-bold">Domain</span>
            <span className="text-slate-500">←</span>
            <span className="text-amber-400 font-bold">Infrastructure</span>
          </div>
          <p className="text-slate-400 text-xs text-center">
            {ja
              ? "外側の層は内側の層に依存できるが、内側は外側を知らない。Infrastructure は Domain に依存する（逆ではない）。"
              : "Outer layers can depend on inner layers, but inner layers don't know about outer ones. Infrastructure depends on Domain (not the other way around)."}
          </p>
        </div>
      </section>

      {/* 3Dデモ: 4層を俯瞰 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "4層を俯瞰する" : "Bird's Eye View of 4 Layers"}
        </h2>
        <DemoCanvas cameraPosition={[0, 10, -8]} enableRotate>
          {/* Domain（中心・最も内側） */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.2, 32]} />
            <meshStandardMaterial
              color={selectedLayer === "domain" ? "#10b981" : "#064e3b"}
              emissive="#10b981"
              emissiveIntensity={selectedLayer === "domain" ? 0.5 : 0.1}
            />
          </mesh>
          {/* Application */}
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 2.5, 32]} />
            <meshStandardMaterial
              color={selectedLayer === "application" ? "#3b82f6" : "#1e3a5f"}
              emissive="#3b82f6"
              emissiveIntensity={selectedLayer === "application" ? 0.5 : 0.1}
            />
          </mesh>
          {/* Infrastructure */}
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.6, 3.8, 32]} />
            <meshStandardMaterial
              color={selectedLayer === "infrastructure" ? "#f59e0b" : "#5c3d0e"}
              emissive="#f59e0b"
              emissiveIntensity={selectedLayer === "infrastructure" ? 0.5 : 0.1}
            />
          </mesh>
          {/* Presentation */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.9, 5, 32]} />
            <meshStandardMaterial
              color={selectedLayer === "presentation" ? "#8b5cf6" : "#3b1f6e"}
              emissive="#8b5cf6"
              emissiveIntensity={selectedLayer === "presentation" ? 0.5 : 0.1}
            />
          </mesh>
          {/* 各層にサンプルマーカー */}
          {selectedLayer === "domain" && (
            <>
              <PlayerMarker
                position={[-0.5, 0, 0.3]}
                color="#10b981"
                number={1}
                name="Team"
              />
              <PlayerMarker
                position={[0.5, 0, -0.3]}
                color="#10b981"
                number={2}
                name="Color"
              />
            </>
          )}
          {selectedLayer === "application" && (
            <>
              <PlayerMarker
                position={[-1.5, 0, 0.8]}
                color="#3b82f6"
                number={1}
                name="Interactor"
              />
              <PlayerMarker
                position={[1.5, 0, -0.8]}
                color="#3b82f6"
                number={2}
                name="Port"
              />
            </>
          )}
          {selectedLayer === "infrastructure" && (
            <>
              <PlayerMarker
                position={[-2.8, 0, 1.2]}
                color="#f59e0b"
                number={1}
                name="IndexedDB"
              />
              <PlayerMarker
                position={[2.8, 0, -1.2]}
                color="#f59e0b"
                number={2}
                name="Zod"
              />
            </>
          )}
          {selectedLayer === "presentation" && (
            <>
              <PlayerMarker
                position={[-4, 0, 1.5]}
                color="#8b5cf6"
                number={1}
                name="React"
              />
              <PlayerMarker
                position={[4, 0, -1.5]}
                color="#8b5cf6"
                number={2}
                name="Three.js"
              />
            </>
          )}
        </DemoCanvas>
        <div className="mt-2 text-center text-xs text-slate-500">
          {ja
            ? "← 左のカテゴリをクリックすると対応する層が光ります"
            : "← Click a category on the left to highlight the corresponding layer"}
        </div>
      </section>

      {/* コード例 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "依存性逆転の原則" : "Dependency Inversion Principle"}
        </h2>
        <CodeBlock code={DEPENDENCY_CODE} highlightLines={[7, 8, 9, 10]} />
      </section>

      {/* フォルダ構成 */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "このアプリのフォルダ構成" : "This App's Folder Structure"}
        </h2>
        <CodeBlock code={FOLDER_CODE} />
      </section>
    </LessonLayout>
  );
}
