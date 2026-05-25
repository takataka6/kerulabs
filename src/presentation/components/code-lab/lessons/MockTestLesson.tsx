/**
 * @module MockTestLesson
 * @description レッスン: モックとスタブ。DBを使わずにユースケースをテストする方法を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { PlayerMarker } from "../PlayerMarker";

const PROBLEM_CODE = `// ❌ 問題: テスト中にDBにアクセスしたくない
class TeamInteractor {
  constructor(private repo: ITeamRepository) {}

  async getAllTeams(): Promise<Team[]> {
    return this.repo.findAll();  // ← DBアクセス
  }
}

// テストでは本物のDBは使いたくない。なぜ？
// - テストが遅くなる
// - DBの状態に依存してテストが不安定になる
// - テスト用のDBを用意するのが面倒`;

const MOCK_CODE = `// ✅ 解決: モック（偽物）を作る
import { vi } from "vitest";

// モックファクトリ関数
function createMockRepository(
  overrides?: Partial<ITeamRepository>
): ITeamRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,  // テストごとに上書き可能
  };
}

// vi.fn()   → 呼ばれたことを記録するダミー関数
// .mockResolvedValue([]) → Promiseで []を返す`;

const USAGE_CODE = `// テストで使う
describe("TeamInteractor", () => {
  it("findAll をリポジトリに委譲する", async () => {
    // 1. 準備 (Arrange)
    const mockRepo = createMockRepository();
    const interactor = new TeamInteractor(mockRepo);

    // 2. 実行 (Act)
    await interactor.getAllTeams();

    // 3. 検証 (Assert)
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it("特定のデータを返すモック", async () => {
    const fakeTeam = Team.create({ name: "My Team", ... });
    const mockRepo = createMockRepository({
      findAll: vi.fn().mockResolvedValue([fakeTeam]),
    });
    const interactor = new TeamInteractor(mockRepo);

    const teams = await interactor.getAllTeams();

    expect(teams).toHaveLength(1);
    expect(teams[0].name).toBe("My Team");
  });
});`;

const DI_CODE = `// なぜこれができるのか？→ 依存性の注入 (DI)

// Application層: インターフェースに依存
class TeamInteractor {
  constructor(private repo: ITeamRepository) {}
  //                        ↑ インターフェース型
}

// 本番: 本物のDB実装を注入
new TeamInteractor(new IndexedDBTeamRepository());

// テスト: モックを注入
new TeamInteractor(createMockRepository());

// Repository パターンのおかげで差し替え可能！`;

type Step = "problem" | "mock" | "usage" | "di";

export function MockTestLesson() {
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>("problem");
  const ja = language === "ja";

  const steps: { key: Step; label: string; labelEn: string }[] = [
    { key: "problem", label: "問題", labelEn: "Problem" },
    { key: "mock", label: "モックを作る", labelEn: "Create Mock" },
    { key: "usage", label: "テストで使う", labelEn: "Use in Test" },
    { key: "di", label: "なぜ可能か", labelEn: "Why It Works" },
  ];

  return (
    <LessonLayout lessonId="mock-test">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🎭
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "モックとスタブ" : "Mocks & Stubs"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "モックは「本物の代わりに使う偽物」です。データベースやAPIなど外部依存を偽物に差し替えることで、ロジックだけを高速にテストできます。"
            : "A mock is a 'fake substitute for the real thing'. By replacing external dependencies like databases and APIs with fakes, you can test logic quickly in isolation."}
        </p>
      </div>

      {/* AAA パターン */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "テストの3ステップ (AAA)" : "3-Step Testing (AAA)"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="text-blue-400 font-bold text-sm mb-1">
              Arrange ({ja ? "準備" : "Setup"})
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "モックを作り、テスト対象を初期化する"
                : "Create mocks and initialize the test subject"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold text-sm mb-1">
              Act ({ja ? "実行" : "Execute"})
            </div>
            <div className="text-slate-400 text-xs">
              {ja ? "テスト対象のメソッドを呼ぶ" : "Call the method under test"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-amber-400 font-bold text-sm mb-1">
              Assert ({ja ? "検証" : "Verify"})
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "結果やモックの呼び出しを検証する"
                : "Verify results and mock calls"}
            </div>
          </div>
        </div>
      </section>

      {/* vi.fn() の説明 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "主要なモック関数" : "Key Mock Functions"}
        </h2>
        <div className="space-y-2 mb-6">
          {[
            {
              fn: "vi.fn()",
              desc: ja
                ? "呼び出しを記録するダミー関数を作る"
                : "Creates a dummy function that records calls",
            },
            {
              fn: ".mockResolvedValue(data)",
              desc: ja
                ? "Promiseでdataを返すように設定"
                : "Configure to return data as a Promise",
            },
            {
              fn: ".toHaveBeenCalledOnce()",
              desc: ja
                ? "1回だけ呼ばれたことを検証"
                : "Verify called exactly once",
            },
            {
              fn: ".toHaveBeenCalledWith(arg)",
              desc: ja
                ? "特定の引数で呼ばれたことを検証"
                : "Verify called with specific arguments",
            },
          ].map((item) => (
            <div
              key={item.fn}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <code className="text-blue-400 text-xs font-mono whitespace-nowrap">
                {item.fn}
              </code>
              <span className="text-slate-400 text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3Dデモ: 本物 vs モック */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "本物 vs モック" : "Real vs Mock"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-center text-xs text-slate-400 mb-2 font-bold">
              {ja ? "本番環境" : "Production"}
            </div>
            <DemoCanvas cameraPosition={[0, 8, -5]}>
              <mesh position={[0, 0.1, -3]}>
                <cylinderGeometry args={[0.6, 0.6, 0.15, 32]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#f59e0b"
                  emissiveIntensity={0.3}
                />
              </mesh>
              <PlayerMarker
                position={[-1.5, 0, 0]}
                color="#3b82f6"
                number={10}
                name="Team"
              />
              <PlayerMarker
                position={[1.5, 0, 0]}
                color="#3b82f6"
                number={9}
                name="Team"
              />
            </DemoCanvas>
            <div className="text-center text-xs text-amber-400 mt-1">
              IndexedDB ({ja ? "実際のDB" : "Real DB"})
            </div>
          </div>
          <div>
            <div className="text-center text-xs text-slate-400 mb-2 font-bold">
              {ja ? "テスト環境" : "Test Environment"}
            </div>
            <DemoCanvas cameraPosition={[0, 8, -5]}>
              <mesh position={[0, 0.1, -3]}>
                <cylinderGeometry args={[0.6, 0.6, 0.15, 32]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={0.3}
                />
              </mesh>
              <PlayerMarker
                position={[-1.5, 0, 0]}
                color="#22c55e"
                number={10}
                name="Mock"
              />
              <PlayerMarker
                position={[1.5, 0, 0]}
                color="#22c55e"
                number={9}
                name="Mock"
              />
            </DemoCanvas>
            <div className="text-center text-xs text-green-400 mt-1">
              vi.fn() ({ja ? "偽物のDB" : "Fake DB"})
            </div>
          </div>
        </div>
      </section>

      {/* ステップバイステップ */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "ステップバイステップ" : "Step by Step"}
        </h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {steps.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(s.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                step === s.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {i + 1}. {ja ? s.label : s.labelEn}
            </button>
          ))}
        </div>

        {step === "problem" && (
          <>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "TeamInteractor は ITeamRepository を使ってDBにアクセスします。テスト中に本物のDBを使うと遅くて不安定です。"
                  : "TeamInteractor uses ITeamRepository to access the DB. Using a real DB in tests is slow and unstable."}
              </p>
            </div>
            <CodeBlock code={PROBLEM_CODE} highlightLines={[6]} />
          </>
        )}
        {step === "mock" && (
          <>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "vi.fn() でダミー関数を作り、インターフェースの全メソッドを偽物に置き換えます。overrides で特定のメソッドだけ上書きできます。"
                  : "Create dummy functions with vi.fn() and replace all interface methods with fakes. Use overrides to customize specific methods per test."}
              </p>
            </div>
            <CodeBlock
              code={MOCK_CODE}
              highlightLines={[5, 6, 7, 8, 9, 10, 11, 12, 13]}
            />
          </>
        )}
        {step === "usage" && (
          <>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "Arrange（準備）→ Act（実行）→ Assert（検証）の3ステップで書きます。2つ目のテストでは、モックが特定のデータを返すようにカスタマイズしています。"
                  : "Write in 3 steps: Arrange → Act → Assert. The second test customizes the mock to return specific data."}
              </p>
            </div>
            <CodeBlock code={USAGE_CODE} highlightLines={[5, 6, 9, 12]} />
          </>
        )}
        {step === "di" && (
          <>
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "Repository パターン（前のレッスン）のおかげで、インターフェース経由でアクセスしているため、本番とテストで実装を差し替えられます。"
                  : "Thanks to the Repository pattern (previous lesson), access goes through interfaces, so implementations can be swapped between production and tests."}
              </p>
            </div>
            <CodeBlock code={DI_CODE} highlightLines={[4, 10, 13]} />
          </>
        )}
      </section>
    </LessonLayout>
  );
}
