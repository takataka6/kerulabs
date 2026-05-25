/**
 * @module FactoryLesson
 * @description レッスン: Factory パターン。リポジトリ生成を一箇所に集約して変更に強い設計を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const PROBLEM_CODE = `// ❌ 問題: 生成コードが散らばっている
// App.tsx
const teamRepo = new IndexedDBTeamRepository();

// SomeService.ts
const teamRepo = new IndexedDBTeamRepository();

// AnotherPage.tsx
const teamRepo = new IndexedDBTeamRepository();

// DB を REST API に変えたい！
// → 全ファイルを修正する必要がある... 😱`;

const FACTORY_CODE = `// ✅ 解決: Factory パターン
// src/infrastructure/factories/RepositoryFactory.ts

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
}`;

const USAGE_CODE = `// 使う側は具象クラスを知らない
// App.tsx

const teamRepo = RepositoryFactory.createTeamRepository();
const tacticRepo = RepositoryFactory.createTacticRepository();
const formationRepo = RepositoryFactory.createFormationRepository();

configureContainer({
  teamRepository: teamRepo,
  tacticRepository: tacticRepo,
  formationRepository: formationRepo,
});

// IndexedDB → REST API に変えるとき:
// RepositoryFactory の中身を1箇所変えるだけ！`;

const CHANGE_CODE = `// DB を変更する場合: Factory の中身だけ変える

export class RepositoryFactory {
  static createTeamRepository(): ITeamRepository {
    // Before:
    // return new IndexedDBTeamRepository();

    // After:
    return new RestApiTeamRepository();
    // ← この1行だけ変更すれば全アプリに反映！
  }
}

// App.tsx は変更不要
// TeamInteractor も変更不要
// テストコードも変更不要`;

const ENTITY_FACTORY_CODE = `// Factory パターンは Entity の create にも使われている

export class Team {
  // private constructor → 直接 new しない
  private constructor(props: TeamProps) { ... }

  // Factory method: 生成ロジックを集約
  static create(input: CreateTeamInput): Team {
    const now = new Date();
    const id = TeamId.generate();
    return new Team({
      id,
      name: input.name,
      createdAt: now,
      updatedAt: now,
      ...
    });
  }
}

// Team.create({ name: "My Team", ... })
// → ID生成・タイムスタンプ設定を自動化`;

type DbType = "indexeddb" | "restapi" | "memory";

const DB_OPTIONS: {
  key: DbType;
  label: string;
  labelEn: string;
  color: string;
  icon: string;
}[] = [
  {
    key: "indexeddb",
    label: "IndexedDB（現在）",
    labelEn: "IndexedDB (current)",
    color: "text-blue-400",
    icon: "💾",
  },
  {
    key: "restapi",
    label: "REST API",
    labelEn: "REST API",
    color: "text-amber-400",
    icon: "🔥",
  },
  {
    key: "memory",
    label: "InMemory（テスト用）",
    labelEn: "InMemory (for tests)",
    color: "text-emerald-400",
    icon: "🧪",
  },
];

const REPO_NAMES = ["Team", "Formation", "Tactic", "Glossary"];

export function FactoryLesson() {
  const { language } = useLanguage();
  const [selectedDb, setSelectedDb] = useState<DbType>("indexeddb");
  const ja = language === "ja";

  const dbLabel = DB_OPTIONS.find((o) => o.key === selectedDb)!;

  const implName = (repo: string) => {
    const prefix =
      selectedDb === "indexeddb"
        ? "IndexedDB"
        : selectedDb === "restapi"
          ? "RestApi" // class prefix
          : "InMemory";
    return `${prefix}${repo}Repository`;
  };

  return (
    <LessonLayout lessonId="factory">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🏭
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "Factory パターン" : "Factory Pattern"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "Factory パターンは「オブジェクトの生成を一箇所に集約する」設計です。生成方法が変わっても、使う側のコードを変更する必要がなくなります。"
            : "The Factory pattern centralizes object creation in one place. Even if the creation logic changes, the code that uses the objects doesn't need to change."}
        </p>
      </div>

      {/* 問題 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "問題: 生成コードが散らばる"
            : "Problem: Creation Code Scattered Everywhere"}
        </h2>
        <CodeBlock code={PROBLEM_CODE} highlightLines={[3, 6, 9, 11, 12]} />
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "試してみよう: DBを切り替えてみよう"
            : "Try It Out: Switch the database"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* DB選択 */}
          <div>
            <div className="text-xs text-slate-400 mb-2 font-bold">
              {ja
                ? "RepositoryFactory の実装を切り替え"
                : "Switch RepositoryFactory implementation"}
            </div>
            <div className="space-y-2">
              {DB_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedDb(opt.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selectedDb === opt.key
                      ? `bg-slate-700 ring-2 ring-white`
                      : "bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50"
                  }`}
                >
                  <span className="mr-2">{opt.icon}</span>
                  <span className={opt.color}>
                    {ja ? opt.label : opt.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 生成結果 */}
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 font-mono text-sm">
            <div className="text-xs text-slate-500 mb-3">
              {ja
                ? "// Factory が返すインスタンス"
                : "// Instances returned by Factory"}
            </div>
            {REPO_NAMES.map((repo) => (
              <div key={repo} className="mb-2">
                <div className="text-slate-400 text-xs">
                  create{repo}Repository()
                </div>
                <div className={`ml-2 ${dbLabel.color}`}>
                  → new {implName(repo)}()
                </div>
              </div>
            ))}
            <div className="mt-4 p-2 rounded bg-green-500/10 text-green-400 text-xs text-center">
              {ja
                ? "✓ 使う側のコードは変更不要！"
                : "✓ No changes needed in consumer code!"}
            </div>
          </div>
        </div>
      </section>

      {/* 3Dデモ: Factory の出力 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "Factory が生成するオブジェクト" : "Objects Created by Factory"}
        </h2>
        <DemoCanvas cameraPosition={[0, 10, -7]}>
          <MiniPitch />
          {/* DB type ごとに異なるスタイルの選手マーカー */}
          {selectedDb === "indexeddb" && (
            <>
              <PlayerMarker
                position={[-3, 0, -3]}
                color="#3b82f6"
                number={1}
                name="Team"
              />
              <PlayerMarker
                position={[0, 0, -3]}
                color="#3b82f6"
                number={2}
                name="Formation"
              />
              <PlayerMarker
                position={[3, 0, -3]}
                color="#3b82f6"
                number={3}
                name="Tactic"
              />
              <PlayerMarker
                position={[0, 0, 0]}
                color="#3b82f6"
                number={4}
                name="Glossary"
              />
            </>
          )}
          {selectedDb === "restapi" && (
            <>
              <PlayerMarker
                position={[-3, 0, -3]}
                color="#f59e0b"
                number={1}
                name="Team"
              />
              <PlayerMarker
                position={[0, 0, -3]}
                color="#f59e0b"
                number={2}
                name="Formation"
              />
              <PlayerMarker
                position={[3, 0, -3]}
                color="#f59e0b"
                number={3}
                name="Tactic"
              />
              <PlayerMarker
                position={[0, 0, 0]}
                color="#f59e0b"
                number={4}
                name="Glossary"
              />
            </>
          )}
          {selectedDb === "memory" && (
            <>
              <PlayerMarker
                position={[-3, 0, -3]}
                color="#22c55e"
                number={1}
                name="Team"
              />
              <PlayerMarker
                position={[0, 0, -3]}
                color="#22c55e"
                number={2}
                name="Formation"
              />
              <PlayerMarker
                position={[3, 0, -3]}
                color="#22c55e"
                number={3}
                name="Tactic"
              />
              <PlayerMarker
                position={[0, 0, 0]}
                color="#22c55e"
                number={4}
                name="Glossary"
              />
            </>
          )}
        </DemoCanvas>
        <div className="mt-2 text-center text-xs text-slate-500">
          {ja
            ? `選手の色が実装を表す — Factory を切り替えると全て変わる`
            : `Marker color represents implementation — switching Factory changes all`}
        </div>
      </section>

      {/* 実際のコード */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "実際のコード: RepositoryFactory"
            : "Actual Code: RepositoryFactory"}
        </h2>
        <CodeBlock
          code={FACTORY_CODE}
          highlightLines={[5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19]}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "使う側のコード" : "Consumer Code"}
        </h2>
        <CodeBlock code={USAGE_CODE} highlightLines={[4, 5, 6, 14, 15]} />
      </section>

      {/* 変更時の影響範囲 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "DBを変更するとき" : "When Changing the Database"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="text-red-400 font-bold text-sm mb-2">
              {ja ? "❌ Factory なし" : "❌ Without Factory"}
            </div>
            <p className="text-slate-300 text-xs">
              {ja
                ? "new IndexedDBTeamRepository() を書いた全ファイルを修正する必要がある"
                : "Must modify every file that has new IndexedDBTeamRepository()"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="text-green-400 font-bold text-sm mb-2">
              {ja ? "✅ Factory あり" : "✅ With Factory"}
            </div>
            <p className="text-slate-300 text-xs">
              {ja
                ? "RepositoryFactory.ts の1ファイルだけ変更すればOK"
                : "Only need to change RepositoryFactory.ts — one file"}
            </p>
          </div>
        </div>
        <CodeBlock code={CHANGE_CODE} highlightLines={[9, 10]} />
      </section>

      {/* Entity の Factory Method */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "もう一つの例: Entity の create メソッド"
            : "Another Example: Entity create Method"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "Team.create() も Factory Method パターンです。ID生成やタイムスタンプ設定など、生成時の複雑な処理を集約しています。"
              : "Team.create() is also the Factory Method pattern. It centralizes complex creation logic like ID generation and timestamp setting."}
          </p>
        </div>
        <CodeBlock
          code={ENTITY_FACTORY_CODE}
          highlightLines={[5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]}
        />
      </section>
    </LessonLayout>
  );
}
