/**
 * @module UITestLesson
 * @description レッスン: UIテスト。Reactコンポーネントのレンダーとユーザー操作の検証を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const RENDER_CODE = `// UIテストの基本: コンポーネントをレンダーして検証
import { render, screen } from "@testing-library/react";

it("ページタイトルが表示される", () => {
  // 1. コンポーネントをレンダー
  render(
    <MemoryRouter>
      <CodeLabPage />
    </MemoryRouter>
  );

  // 2. 画面上の要素を探す
  const title = screen.getByText("コードラボ");

  // 3. 要素が存在することを検証
  expect(title).toBeInTheDocument();
});`;

const QUERY_CODE = `// 要素の探し方（クエリ）

// ✅ 推奨: アクセシブルなクエリ
screen.getByRole("button", { name: "ホームに戻る" });
screen.getByText("コードラボ");
screen.getByLabelText("選手名");

// 使い分け:
// getByRole  → ボタン、リンクなどのUI要素
// getByText  → 表示テキストで探す
// getByLabelText → フォーム入力欄をラベルで探す

// getAllBy〜 → 複数の要素を取得
const badges = screen.getAllByText("Ready");
expect(badges).toHaveLength(11);`;

const INTERACTION_CODE = `// ユーザー操作のテスト
import { fireEvent } from "@testing-library/react";

it("ボタンをクリックするとホームに遷移する", () => {
  const mockNavigate = vi.fn();
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
  });

  render(
    <MemoryRouter>
      <CodeLabPage />
    </MemoryRouter>
  );

  // ボタンを探してクリック
  const button = screen.getByRole("button", {
    name: "ホームに戻る"
  });
  fireEvent.click(button);

  // navigate が正しいパスで呼ばれたか検証
  expect(mockNavigate).toHaveBeenCalledWith("/");
});`;

const MOCK_MODULE_CODE = `// モジュールモック: 外部依存を差し替える

// useNavigate をモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// useLanguage をモック（翻訳をキーのまま返す）
vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    t: (key: string) => key,  // 翻訳せずキーを返す
  }),
}));

// なぜモックするのか？
// - ルーティングやDB接続なしでUIだけテストしたい
// - 翻訳キーで検証した方がテストが壊れにくい`;

const A11Y_CODE = `// アクセシビリティのテスト

it("main 要素に id='main-content' がある", () => {
  render(<MemoryRouter><CodeLabPage /></MemoryRouter>);
  const main = screen.getByRole("main");
  expect(main).toHaveAttribute("id", "main-content");
});

it("装飾アイコンに aria-hidden が設定されている", () => {
  const { container } = render(
    <MemoryRouter><CodeLabPage /></MemoryRouter>
  );
  const hidden = container.querySelectorAll(
    '[aria-hidden="true"]'
  );
  expect(hidden.length).toBeGreaterThanOrEqual(1);
});

// なぜ a11y テストが大切？
// - スクリーンリーダーが正しく読み上げるか
// - キーボード操作でアクセスできるか
// - WCAG AA 基準を満たしているか`;

type Tab = "render" | "query" | "interaction" | "mock" | "a11y";

export function UITestLesson() {
  const { language } = useLanguage();
  const [tab, setTab] = useState<Tab>("render");
  const ja = language === "ja";

  const tabs: { key: Tab; label: string; labelEn: string }[] = [
    { key: "render", label: "レンダー", labelEn: "Render" },
    { key: "query", label: "要素の探し方", labelEn: "Queries" },
    { key: "interaction", label: "操作テスト", labelEn: "Interactions" },
    { key: "mock", label: "モジュールモック", labelEn: "Module Mock" },
    { key: "a11y", label: "アクセシビリティ", labelEn: "Accessibility" },
  ];

  return (
    <LessonLayout lessonId="ui-test">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🖥️
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "UIテスト" : "UI Testing"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "UIテストではReactコンポーネントを仮想的にレンダーし、「画面に正しく表示されるか」「ボタンを押すと正しく動作するか」を検証します。"
            : "UI tests render React components virtually and verify 'does it display correctly?' and 'does clicking a button work properly?'."}
        </p>
      </div>

      {/* テストの流れ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "UIテストの流れ" : "UI Testing Flow"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center text-sm py-2">
            <div className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold">
              render()
            </div>
            <span className="text-slate-500">→</span>
            <div className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
              screen.getBy...()
            </div>
            <span className="text-slate-500">→</span>
            <div className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold">
              fireEvent / expect
            </div>
          </div>
          <p className="text-slate-400 text-xs text-center mt-2">
            {ja
              ? "レンダー → 要素を探す → 検証 or 操作"
              : "Render → Find element → Assert or Interact"}
          </p>
        </div>
      </section>

      {/* 3Dデモ: render → find → assert */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "UIテストのイメージ" : "UI Test Visualization"}
        </h2>
        <DemoCanvas cameraPosition={[0, 10, -7]}>
          <MiniPitch />
          {/* render: コンポーネントがピッチに展開される */}
          <PlayerMarker
            position={[-3, 0, -3]}
            color="#8b5cf6"
            number={1}
            name="Header"
          />
          <PlayerMarker
            position={[0, 0, -3]}
            color="#8b5cf6"
            number={2}
            name="Title"
          />
          <PlayerMarker
            position={[3, 0, -3]}
            color="#8b5cf6"
            number={3}
            name="Button"
          />
          {/* screen.getBy: 特定の要素を探す */}
          <mesh position={[0, 0.2, -3]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 24]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
          </mesh>
          {/* expect: 検証OK */}
          <PlayerMarker
            position={[0, 0, 2]}
            color="#22c55e"
            number={0}
            name="PASS"
          />
        </DemoCanvas>
        <div className="flex justify-between text-xs text-slate-500 mt-2 px-4">
          <span className="text-violet-400">render()</span>
          <span className="text-amber-400">screen.getByText()</span>
          <span className="text-green-400">expect().toBeInTheDocument()</span>
        </div>
      </section>

      {/* ツールの説明 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "使用するライブラリ" : "Libraries Used"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-blue-400 font-bold text-sm mb-1">
              @testing-library/react
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "render(), screen で要素を探す"
                : "render(), screen to find elements"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-emerald-400 font-bold text-sm mb-1">jsdom</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "Node.jsでブラウザ環境をシミュレート"
                : "Simulates browser environment in Node.js"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-amber-400 font-bold text-sm mb-1">
              MemoryRouter
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "テスト用のルーティング環境"
                : "Routing environment for tests"}
            </div>
          </div>
        </div>
      </section>

      {/* タブ切り替えコード例 */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "実際のコード" : "Actual Code"}
        </h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ja ? t.label : t.labelEn}
            </button>
          ))}
        </div>

        {tab === "render" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "render() でコンポーネントを仮想DOMにレンダーし、screen.getByText() で表示内容を検証します。MemoryRouter はルーティングコンテキストを提供します。"
                  : "render() renders the component to virtual DOM, and screen.getByText() verifies the displayed content. MemoryRouter provides routing context."}
              </p>
            </div>
            <CodeBlock
              code={RENDER_CODE}
              highlightLines={[6, 7, 8, 9, 10, 13, 16]}
            />
          </>
        )}
        {tab === "query" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "getByRole が最も推奨されます。ユーザーと同じ視点で要素を探すため、アクセシビリティの確認にもなります。"
                  : "getByRole is most recommended. It finds elements from the user's perspective, doubling as an accessibility check."}
              </p>
            </div>
            <CodeBlock code={QUERY_CODE} highlightLines={[4, 5, 6, 15]} />
          </>
        )}
        {tab === "interaction" && (
          <CodeBlock
            code={INTERACTION_CODE}
            highlightLines={[18, 19, 20, 21, 24]}
          />
        )}
        {tab === "mock" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "vi.mock() でモジュール全体を差し替えます。vi.importActual() で本物のモジュールを取得し、必要な部分だけ上書きできます。"
                  : "vi.mock() replaces an entire module. vi.importActual() gets the real module so you can override only what you need."}
              </p>
            </div>
            <CodeBlock
              code={MOCK_MODULE_CODE}
              highlightLines={[5, 6, 7, 8, 11, 12, 13, 14, 15, 16]}
            />
          </>
        )}
        {tab === "a11y" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "アクセシビリティテストは「すべてのユーザーが使えるか」を検証します。このアプリでは WCAG AA 基準を満たすことを目指しています。"
                  : "Accessibility tests verify 'can all users use this?'. This app aims to meet WCAG AA standards."}
              </p>
            </div>
            <CodeBlock code={A11Y_CODE} highlightLines={[6, 16]} />
          </>
        )}
      </section>
    </LessonLayout>
  );
}
