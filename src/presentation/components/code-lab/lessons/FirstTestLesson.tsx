/**
 * @module FirstTestLesson
 * @description レッスン: 初めてのテスト。expect/toBeから始めて選手のバリデーションテストを学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const BASIC_CODE = `// テストの基本構造
import { describe, it, expect } from "vitest";

describe("足し算", () => {           // テストグループ
  it("1 + 1 は 2 になる", () => {    // 1つのテスト
    expect(1 + 1).toBe(2);           // アサーション（検証）
  });
});

// describe = 「何についてのテストか」
// it       = 「何を確認するか」
// expect   = 「結果はこうなるはず」`;

const PLAYER_CODE = `// 実際のテスト: Player エンティティ
// src/domain/__tests__/entities/Player.test.ts

describe("Player", () => {
  describe("create", () => {
    it("正しいパラメータで選手を作成できる", () => {
      const player = Player.create({
        teamId: new TeamId("team-1"),
        name: "Tanaka",
        number: 10,
        position: "mf",
      });

      expect(player.name).toBe("Tanaka");
      expect(player.number).toBe(10);
      expect(player.position).toBe("mf");
    });

    it("デフォルトのポジションは mf", () => {
      const player = Player.create({
        teamId: new TeamId("team-1"),
        name: "Tanaka",
        number: 10,
        // position を省略
      });

      expect(player.position).toBe("mf");  // デフォルト値
    });
  });
});`;

const VALIDATION_CODE = `// エラーケースのテスト
describe("バリデーション", () => {
  it("背番号が0未満だとエラーになる", () => {
    expect(() =>
      Player.create({
        teamId: new TeamId("team-1"),
        name: "Tanaka",
        number: -1,       // ← 不正な値
      })
    ).toThrow("背番号は0〜99の範囲");
  });

  it("名前が空だとエラーになる", () => {
    expect(() =>
      Player.create({
        teamId: new TeamId("team-1"),
        name: "",          // ← 空文字
        number: 10,
      })
    ).toThrow("名前は空にできない");
  });

  it("背番号99は有効（境界値テスト）", () => {
    const player = Player.create({
      teamId: new TeamId("team-1"),
      name: "Tanaka",
      number: 99,
    });
    expect(player.number).toBe(99);  // OK
  });
});`;

const COLOR_CODE = `// Value Object のテスト
// src/domain/__tests__/value-objects/Color.test.ts

describe("Color", () => {
  it("有効なHEXカラーを作成できる", () => {
    const color = Color.fromHex("#ff0000");
    expect(color.hex).toBe("#ff0000");
  });

  it("大文字を小文字に正規化する", () => {
    const color = Color.fromHex("#FF0000");
    expect(color.hex).toBe("#ff0000");
  });

  it("前後の空白を除去する", () => {
    const color = Color.fromHex("  #ff0000  ");
    expect(color.hex).toBe("#ff0000");
  });

  it("無効な形式はエラーになる", () => {
    expect(() => Color.fromHex("red")).toThrow();
    expect(() => Color.fromHex("#gggggg")).toThrow();
  });

  it("同じ値なら equals は true", () => {
    const a = Color.fromHex("#ff0000");
    const b = Color.fromHex("#ff0000");
    expect(a.equals(b)).toBe(true);
  });
});`;

interface TestResult {
  name: string;
  nameEn: string;
  passed: boolean;
  expected: string;
  actual: string;
}

function runSimulatedTests(
  playerName: string,
  playerNumber: number,
): TestResult[] {
  const trimmed = playerName.trim();

  return [
    {
      name: "名前が空でない",
      nameEn: "name is not empty",
      passed: trimmed.length > 0,
      expected: "1文字以上",
      actual: trimmed.length === 0 ? '""（空文字）' : `"${trimmed}"`,
    },
    {
      name: "名前が12文字以内",
      nameEn: "name ≤ 12 chars",
      passed: trimmed.length <= 12,
      expected: "≤ 12",
      actual: `${trimmed.length}文字`,
    },
    {
      name: "背番号が0以上",
      nameEn: "number ≥ 0",
      passed: playerNumber >= 0,
      expected: "≥ 0",
      actual: String(playerNumber),
    },
    {
      name: "背番号が99以下",
      nameEn: "number ≤ 99",
      passed: playerNumber <= 99,
      expected: "≤ 99",
      actual: String(playerNumber),
    },
    {
      name: "背番号が整数",
      nameEn: "number is integer",
      passed: Number.isInteger(playerNumber),
      expected: "整数",
      actual: Number.isInteger(playerNumber) ? "整数" : "小数",
    },
  ];
}

export function FirstTestLesson() {
  const { language } = useLanguage();
  const [testName, setTestName] = useState("Tanaka");
  const [testNumber, setTestNumber] = useState(10);
  const ja = language === "ja";

  const results = runSimulatedTests(testName, testNumber);
  const allPassed = results.every((r) => r.passed);
  const passCount = results.filter((r) => r.passed).length;

  return (
    <LessonLayout lessonId="first-test">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🧪
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "初めてのテスト" : "Your First Test"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "テストは「コードが正しく動くか自動で確認する仕組み」です。手動で確認する代わりに、テストコードを書けば何度でも一瞬で検証できます。"
            : "Tests are an automated way to verify code works correctly. Instead of manual checking, write test code and verify instantly, as many times as you want."}
        </p>
      </div>

      {/* テストの基本 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "テストの3つの要素" : "Three Elements of a Test"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-blue-400 font-mono text-sm mb-1">describe</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "テストをグループ化する。「何についてのテストか」を宣言。"
                : "Groups tests. Declares 'what this test is about'."}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-emerald-400 font-mono text-sm mb-1">it</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "1つのテストケース。「何を確認するか」を書く。"
                : "One test case. Describes 'what to verify'."}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-amber-400 font-mono text-sm mb-1">expect</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "結果を検証する。「こうなるはず」を書く。"
                : "Verifies the result. Describes 'what should happen'."}
            </div>
          </div>
        </div>
        <CodeBlock code={BASIC_CODE} highlightLines={[4, 5, 6, 7, 8]} />
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "試してみよう: テストを通すデータを入力しよう"
            : "Try It Out: Enter data that passes the tests"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <label className="block text-xs text-slate-400">
              <span className="font-mono text-emerald-400">name</span>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-xs text-slate-400">
              <span className="font-mono text-blue-400">number</span>
              <input
                type="number"
                value={testNumber}
                onChange={(e) => setTestNumber(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>
          </div>

          {/* テスト結果 */}
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 font-mono text-sm">
            <div
              className={`mb-3 pb-2 border-b border-slate-700 font-bold ${allPassed ? "text-green-400" : "text-red-400"}`}
            >
              {allPassed ? "✓" : "✗"} {passCount}/{results.length}{" "}
              {ja ? "テスト通過" : "tests passed"}
            </div>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={r.passed ? "text-green-400" : "text-red-400"}
                    >
                      {r.passed ? "✓ PASS" : "✗ FAIL"}
                    </span>
                    <span className="text-slate-300">
                      {ja ? r.name : r.nameEn}
                    </span>
                  </div>
                  {!r.passed && (
                    <div className="ml-12 mt-0.5 text-xs">
                      <span className="text-slate-500">
                        {ja ? "期待" : "expected"}:{" "}
                      </span>
                      <span className="text-green-400">{r.expected}</span>
                      <span className="text-slate-500 mx-1">|</span>
                      <span className="text-slate-500">
                        {ja ? "実際" : "actual"}:{" "}
                      </span>
                      <span className="text-red-400">{r.actual}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {ja
            ? "ヒント: 名前を空にしたり、背番号を100にするとテストが失敗します"
            : "Hint: Empty the name or set number to 100 to see tests fail"}
        </p>
      </section>

      {/* 3Dデモ: テスト結果の可視化 */}
      <section className="mb-8">
        <DemoCanvas cameraPosition={[0, 8, -6]}>
          <MiniPitch />
          {allPassed ? (
            <PlayerMarker
              position={[0, 0, 0]}
              color="#22c55e"
              number={testNumber}
              name={testName || "?"}
            />
          ) : (
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
              />
            </mesh>
          )}
        </DemoCanvas>
        <div className="mt-2 text-center text-xs text-slate-500">
          {allPassed
            ? ja
              ? "✅ テスト通過 — 選手がピッチに配置された"
              : "✅ Tests passed — player placed on pitch"
            : ja
              ? "❌ テスト失敗 — 選手は作成できない"
              : "❌ Tests failed — player cannot be created"}
        </div>
      </section>

      {/* 実際のテストコード */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "実際のテスト: Player エンティティ"
            : "Real Test: Player Entity"}
        </h2>
        <CodeBlock code={PLAYER_CODE} highlightLines={[14, 15, 16, 27]} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "エラーケースのテスト" : "Testing Error Cases"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "expect(() => ...).toThrow() で「エラーが投げられること」を検証できます。正常ケースだけでなく、不正な入力でちゃんとエラーになることもテストします。"
              : "Use expect(() => ...).toThrow() to verify that errors are thrown. Test not just happy paths, but also that invalid inputs properly cause errors."}
          </p>
        </div>
        <CodeBlock
          code={VALIDATION_CODE}
          highlightLines={[3, 4, 5, 6, 7, 8, 9, 10, 11]}
        />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "Value Object のテスト" : "Value Object Tests"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "入力の正規化（大文字→小文字、空白除去）や境界値のテストも重要です。Color は「不正な色は作れない」ことをテストで保証しています。"
              : "Testing input normalization (uppercase→lowercase, whitespace trimming) and boundary values is important. Color tests guarantee that invalid colors cannot be created."}
          </p>
        </div>
        <CodeBlock code={COLOR_CODE} highlightLines={[7, 12, 17, 21, 22, 28]} />
      </section>
    </LessonLayout>
  );
}
