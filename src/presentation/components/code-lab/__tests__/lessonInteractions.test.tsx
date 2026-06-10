/**
 * @module Lessons インタラクションテスト
 * @description 全レッスンコンポーネントのインタラクティブ要素（useState, onClick, onChange）を検証する
 */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({ t: (key: string) => key, language: "ja" }),
}));

vi.mock("@shared/constants", () => ({
  IS_ELECTRON: false,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => null,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("../DemoCanvas", () => ({
  DemoCanvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-demo-canvas">{stripThreeElements(children)}</div>
  ),
}));

vi.mock("../MiniPitch", () => ({
  MiniPitch: () => <div data-testid="mock-mini-pitch" />,
}));

vi.mock("../PlayerMarker", () => ({
  PlayerMarker: () => <div data-testid="mock-player-marker" />,
}));

vi.mock("@presentation/components/ui", () => ({
  MermaidFlowchart: ({ chart }: { chart: string }) => (
    <div data-testid="mock-mermaid">{chart}</div>
  ),
}));

const THREE_INTRINSICS = new Set([
  "bufferAttribute",
  "bufferGeometry",
  "circleGeometry",
  "line",
  "mesh",
  "meshBasicMaterial",
  "meshStandardMaterial",
  "ringGeometry",
]);

function stripThreeElements(node: React.ReactNode): React.ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child;
    if (typeof child.type === "string" && THREE_INTRINSICS.has(child.type)) {
      return null;
    }
    return React.cloneElement(
      child,
      undefined,
      stripThreeElements(child.props.children),
    );
  });
}

import { VariablesLesson } from "../lessons/VariablesLesson";
import { ArraysLesson } from "../lessons/ArraysLesson";
import { ConditionalsLesson } from "../lessons/ConditionalsLesson";
import { FunctionsLesson } from "../lessons/FunctionsLesson";
import { ObjectsLesson } from "../lessons/ObjectsLesson";
import { JSONLesson } from "../lessons/JSONLesson";
import { MarkdownLesson } from "../lessons/MarkdownLesson";
import { MermaidLesson } from "../lessons/MermaidLesson";
import { GitBasicsLesson } from "../lessons/GitBasicsLesson";
import { GitBranchLesson } from "../lessons/GitBranchLesson";
import { CleanArchitectureLesson } from "../lessons/CleanArchitectureLesson";
import { DomainModelLesson } from "../lessons/DomainModelLesson";
import { SingletonLesson } from "../lessons/SingletonLesson";
import { FactoryLesson } from "../lessons/FactoryLesson";
import { FirstTestLesson } from "../lessons/FirstTestLesson";
import { MockTestLesson } from "../lessons/MockTestLesson";

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// VariablesLesson
// ---------------------------------------------------------------------------
describe("VariablesLesson interactions", () => {
  it("should update player name on input change", () => {
    render(<VariablesLesson />);
    const nameInput = screen.getByDisplayValue("Tanaka");
    fireEvent.change(nameInput, { target: { value: "Yamada" } });
    expect(screen.getByDisplayValue("Yamada")).toBeInTheDocument();
  });

  it("should update player number on input change", () => {
    render(<VariablesLesson />);
    const numberInput = screen.getByDisplayValue("10");
    fireEvent.change(numberInput, { target: { value: "7" } });
    expect(screen.getByDisplayValue("7")).toBeInTheDocument();
  });

  it("should toggle isStarter on button click", () => {
    render(<VariablesLesson />);
    const toggleButton = screen.getByText("true");
    fireEvent.click(toggleButton);
    expect(screen.getByText("false")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ArraysLesson
// ---------------------------------------------------------------------------
describe("ArraysLesson interactions", () => {
  it("should filter by position when clicking filter buttons", () => {
    render(<ArraysLesson />);
    const markers = screen.getAllByTestId("mock-player-marker");
    expect(markers.length).toBe(11);

    fireEvent.click(screen.getByText("GK"));
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(1);
  });

  it("should change visible count with range slider", () => {
    render(<ArraysLesson />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "5" } });
    expect(screen.getByText("5 / 11")).toBeInTheDocument();
  });

  it("should filter by DF position", () => {
    render(<ArraysLesson />);
    fireEvent.click(screen.getByText("DF"));
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(5);
  });

  it("should filter by MF position", () => {
    render(<ArraysLesson />);
    fireEvent.click(screen.getByText("MF"));
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(2);
  });

  it("should filter by FW position", () => {
    render(<ArraysLesson />);
    fireEvent.click(screen.getByText("FW"));
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// ConditionalsLesson
// ---------------------------------------------------------------------------
describe("ConditionalsLesson interactions", () => {
  it("should update attacker position with range slider", () => {
    render(<ConditionalsLesson />);
    const slider = screen.getByRole("slider");
    // Default attackerZ = 2.0, defenseLineZ = 3.0 → onside
    expect(screen.getAllByText(/オンサイド/).length).toBeGreaterThanOrEqual(1);

    // Move attacker past defense line
    fireEvent.change(slider, { target: { value: "4.0" } });
    expect(screen.getAllByText(/オフサイド/).length).toBeGreaterThanOrEqual(1);
  });

  it("should show onside when attacker is behind defense line", () => {
    render(<ConditionalsLesson />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "1.0" } });
    expect(screen.getAllByText(/オンサイド/).length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// FunctionsLesson
// ---------------------------------------------------------------------------
describe("FunctionsLesson interactions", () => {
  it("should switch to 4-4-2 formation on button click", () => {
    render(<FunctionsLesson />);
    const button = screen.getByRole("button", { name: "4-4-2" });
    fireEvent.click(button);
    expect(screen.getAllByText(/4-4-2/).length).toBeGreaterThanOrEqual(1);
  });

  it("should switch to 3-5-2 formation on button click", () => {
    render(<FunctionsLesson />);
    const button = screen.getByRole("button", { name: "3-5-2" });
    fireEvent.click(button);
    expect(screen.getAllByText(/3-5-2/).length).toBeGreaterThanOrEqual(1);
  });

  it("should render 11 player markers for each formation", () => {
    render(<FunctionsLesson />);
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(11);

    fireEvent.click(screen.getByRole("button", { name: "4-4-2" }));
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(11);

    fireEvent.click(screen.getByRole("button", { name: "3-5-2" }));
    expect(screen.getAllByTestId("mock-player-marker").length).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// ObjectsLesson
// ---------------------------------------------------------------------------
describe("ObjectsLesson interactions", () => {
  it("should display player properties when a player button is clicked", () => {
    render(<ObjectsLesson />);
    // Initially no player is selected
    expect(screen.getByText(/選手を選択/)).toBeInTheDocument();

    // Click Tanaka button
    const buttons = screen.getAllByRole("button");
    const tanakaButton = buttons.find((b) => b.textContent?.includes("Tanaka"));
    expect(tanakaButton).toBeDefined();
    fireEvent.click(tanakaButton!);
    // Properties panel should now show player data
    expect(screen.queryByText(/選手を選択/)).not.toBeInTheDocument();
  });

  it("should switch selected player when clicking a different player", () => {
    render(<ObjectsLesson />);
    const buttons = screen.getAllByRole("button");
    const suzukiButton = buttons.find((b) => b.textContent?.includes("Suzuki"));
    fireEvent.click(suzukiButton!);
    expect(screen.getAllByText(/"Suzuki"/).length).toBeGreaterThanOrEqual(1);

    const yamadaButton = buttons.find((b) => b.textContent?.includes("Yamada"));
    fireEvent.click(yamadaButton!);
    expect(screen.getAllByText(/"Yamada"/).length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// JSONLesson
// ---------------------------------------------------------------------------
describe("JSONLesson interactions", () => {
  it("should update textarea content on change", () => {
    render(<JSONLesson />);
    const textarea = screen.getByRole("textbox");
    const newJson = '[{ "name": "Sato", "number": 7, "position": "mf" }]';
    fireEvent.change(textarea, { target: { value: newJson } });
    expect(textarea).toHaveValue(newJson);
  });

  it("should parse valid JSON and update player markers on parse button click", () => {
    render(<JSONLesson />);
    const textarea = screen.getByRole("textbox");
    const newJson = '[{ "name": "Sato", "number": 7, "position": "mf" }]';
    fireEvent.change(textarea, { target: { value: newJson } });
    fireEvent.click(screen.getByText("パースして配置"));
    expect(screen.getAllByText(/Sato/).length).toBeGreaterThanOrEqual(1);
  });

  it("should show error on invalid JSON", () => {
    render(<JSONLesson />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "not valid json" } });
    fireEvent.click(screen.getByText("パースして配置"));
    expect(screen.getByText("JSON の構文エラーです")).toBeInTheDocument();
  });

  it("should show error when JSON is not an array", () => {
    render(<JSONLesson />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: '{ "name": "Sato" }' } });
    fireEvent.click(screen.getByText("パースして配置"));
    expect(screen.getByText("配列形式で入力してください")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MarkdownLesson
// ---------------------------------------------------------------------------
describe("MarkdownLesson interactions", () => {
  it("should switch to Lists section when clicking tab button", () => {
    render(<MarkdownLesson />);
    fireEvent.click(screen.getByRole("button", { name: "リスト" }));
    expect(screen.getByText("攻撃")).toBeInTheDocument();
  });

  it("should switch to Code section", () => {
    render(<MarkdownLesson />);
    fireEvent.click(screen.getByRole("button", { name: "コード" }));
    expect(
      screen.getAllByText(/インラインコード/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("should switch to Tables section", () => {
    render(<MarkdownLesson />);
    fireEvent.click(screen.getByRole("button", { name: "テーブル" }));
    expect(screen.getByText("Tanaka")).toBeInTheDocument();
  });

  it("should switch to Links section", () => {
    render(<MarkdownLesson />);
    fireEvent.click(screen.getByRole("button", { name: "リンク・引用" }));
    expect(screen.getByText("リンクテキスト →")).toBeInTheDocument();
  });

  it("should switch to README example section", () => {
    render(<MarkdownLesson />);
    fireEvent.click(screen.getByRole("button", { name: "README例" }));
    expect(screen.getByText("KeruLabs")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MermaidLesson
// ---------------------------------------------------------------------------
describe("MermaidLesson interactions", () => {
  it("should switch to Sequence Diagram tab", () => {
    render(<MermaidLesson />);
    fireEvent.click(screen.getByRole("button", { name: "シーケンス図" }));
    // The mock MermaidFlowchart renders the chart text in a data-testid div
    const mermaidDivs = screen.getAllByTestId("mock-mermaid");
    const hasSequence = mermaidDivs.some((div) =>
      div.textContent?.includes("sequenceDiagram"),
    );
    expect(hasSequence).toBe(true);
  });

  it("should switch to custom diagram tab and show textarea", () => {
    render(<MermaidLesson />);
    fireEvent.click(screen.getByRole("button", { name: "自由に書く" }));
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("should allow editing custom diagram text", () => {
    render(<MermaidLesson />);
    fireEvent.click(screen.getByRole("button", { name: "自由に書く" }));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "graph LR\n  A --> B" } });
    expect(textarea).toHaveValue("graph LR\n  A --> B");
  });
});

// ---------------------------------------------------------------------------
// GitBasicsLesson
// ---------------------------------------------------------------------------
describe("GitBasicsLesson interactions", () => {
  it("should switch to Stage step", () => {
    render(<GitBasicsLesson />);
    // The step buttons contain "2. 追加" text
    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find((b) => b.textContent?.includes("追加"));
    expect(addButton).toBeDefined();
    fireEvent.click(addButton!);
    // The add step shows explanation text about staging
    expect(screen.getByText(/ステージングエリア/)).toBeInTheDocument();
  });

  it("should switch to Commit step", () => {
    render(<GitBasicsLesson />);
    const buttons = screen.getAllByRole("button");
    const commitButton = buttons.find((b) => b.textContent?.includes("記録"));
    fireEvent.click(commitButton!);
    expect(
      screen.getByText(/ステージングした変更を「履歴」として/),
    ).toBeInTheDocument();
  });

  it("should switch to Push step", () => {
    render(<GitBasicsLesson />);
    const buttons = screen.getAllByRole("button");
    const pushButton = buttons.find((b) => b.textContent?.includes("送信"));
    fireEvent.click(pushButton!);
    expect(
      screen.getByText(/ローカルのコミットをリモートリポジトリに/),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// GitBranchLesson
// ---------------------------------------------------------------------------
describe("GitBranchLesson interactions", () => {
  it("should switch to Create & Switch view", () => {
    render(<GitBranchLesson />);
    fireEvent.click(screen.getByRole("button", { name: "作成と切り替え" }));
    expect(
      screen.getByText(/checkout -b で新しいブランチを/),
    ).toBeInTheDocument();
  });

  it("should switch to Pull Request view", () => {
    render(<GitBranchLesson />);
    fireEvent.click(screen.getByRole("button", { name: "Pull Request" }));
    expect(
      screen.getByText(/このブランチの変更を main に取り込んでほしい/),
    ).toBeInTheDocument();
  });

  it("should switch to Conflicts view", () => {
    render(<GitBranchLesson />);
    fireEvent.click(screen.getByRole("button", { name: "コンフリクト" }));
    expect(
      screen.getByText(/2人が同じファイルの同じ場所を変更すると/),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CleanArchitectureLesson
// ---------------------------------------------------------------------------
describe("CleanArchitectureLesson interactions", () => {
  it("should select Application layer on button click", () => {
    render(<CleanArchitectureLesson />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Application（アプリケーション層）",
      }),
    );
    expect(
      screen.getByText(/ユースケース（やりたいこと）を定義する/),
    ).toBeInTheDocument();
  });

  it("should select Infrastructure layer on button click", () => {
    render(<CleanArchitectureLesson />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Infrastructure（インフラ層）",
      }),
    );
    expect(
      screen.getByText(/データベースやファイルシステムなど外部との接続/),
    ).toBeInTheDocument();
  });

  it("should select Presentation layer on button click", () => {
    render(<CleanArchitectureLesson />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Presentation（プレゼンテーション層）",
      }),
    );
    expect(screen.getByText(/ユーザーが見る画面/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DomainModelLesson
// ---------------------------------------------------------------------------
describe("DomainModelLesson interactions", () => {
  it("should switch to Value Object tab", () => {
    render(<DomainModelLesson />);
    // There are multiple elements with "値オブジェクト" text
    const buttons = screen.getAllByRole("button");
    const voTab = buttons.find((b) => b.textContent === "値オブジェクト");
    fireEvent.click(voTab!);
    expect(
      screen.getByText(/private constructorとファクトリメソッド/),
    ).toBeInTheDocument();
  });

  it("should switch to Type-safe ID tab", () => {
    render(<DomainModelLesson />);
    fireEvent.click(screen.getByRole("button", { name: "型安全なID" }));
    expect(
      screen.getByText(/EntityIdの自己参照型パターン/),
    ).toBeInTheDocument();
  });

  it("should show validation error when name is empty in EntityDemo", () => {
    render(<DomainModelLesson />);
    const nameInput = screen.getByDisplayValue("Tanaka");
    fireEvent.change(nameInput, { target: { value: "" } });
    expect(
      screen.getAllByText(/名前は空にできない/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("should show validation error when number is out of range in EntityDemo", () => {
    render(<DomainModelLesson />);
    const numberInput = screen.getByDisplayValue("10");
    fireEvent.change(numberInput, { target: { value: "100" } });
    expect(
      screen.getAllByText(/背番号は0〜99の範囲/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("should show success when valid values are entered in EntityDemo", () => {
    render(<DomainModelLesson />);
    expect(screen.getByText(/Player.create\(\) 成功/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SingletonLesson
// ---------------------------------------------------------------------------
describe("SingletonLesson interactions", () => {
  it("should create one instance in singleton mode when clicking caller buttons", () => {
    render(<SingletonLesson />);
    fireEvent.click(screen.getByText("TeamRepository"));
    expect(screen.getByText(/IndexedDBClient #1/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("TacticRepository"));
    expect(screen.getByText(/常に同じインスタンス/)).toBeInTheDocument();
  });

  it("should create multiple instances in new mode", () => {
    render(<SingletonLesson />);
    fireEvent.click(screen.getByText(/毎回生成/));

    fireEvent.click(screen.getByText("TeamRepository"));
    fireEvent.click(screen.getByText("TacticRepository"));
    expect(screen.getByText(/2個のインスタンスが存在/)).toBeInTheDocument();
  });

  it("should reset instances when clicking reset button", () => {
    render(<SingletonLesson />);
    fireEvent.click(screen.getByText("TeamRepository"));
    expect(screen.getByText(/IndexedDBClient #1/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("リセット"));
    expect(screen.getByText(/ボタンを押してみよう/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// FactoryLesson
// ---------------------------------------------------------------------------
describe("FactoryLesson interactions", () => {
  it("should switch to REST API implementation", () => {
    render(<FactoryLesson />);
    // The REST API button contains icon + label text
    const buttons = screen.getAllByRole("button");
    const restButton = buttons.find((b) => b.textContent?.includes("REST API"));
    fireEvent.click(restButton!);
    expect(
      screen.getAllByText(/RestApiTeamRepository/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("should switch to InMemory implementation", () => {
    render(<FactoryLesson />);
    const buttons = screen.getAllByRole("button");
    const memButton = buttons.find((b) => b.textContent?.includes("InMemory"));
    fireEvent.click(memButton!);
    expect(
      screen.getAllByText(/InMemoryTeamRepository/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("should default to IndexedDB implementation", () => {
    render(<FactoryLesson />);
    expect(
      screen.getAllByText(/IndexedDBTeamRepository/).length,
    ).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// FirstTestLesson
// ---------------------------------------------------------------------------
describe("FirstTestLesson interactions", () => {
  it("should update test name input and re-run simulated tests", () => {
    render(<FirstTestLesson />);
    const nameInput = screen.getByDisplayValue("Tanaka");
    fireEvent.change(nameInput, { target: { value: "" } });
    expect(screen.getAllByText(/FAIL/).length).toBeGreaterThanOrEqual(1);
  });

  it("should update test number input and show failure for out-of-range", () => {
    render(<FirstTestLesson />);
    const numberInput = screen.getByDisplayValue("10");
    fireEvent.change(numberInput, { target: { value: "100" } });
    expect(screen.getAllByText(/FAIL/).length).toBeGreaterThanOrEqual(1);
  });

  it("should show all tests passing with valid input", () => {
    render(<FirstTestLesson />);
    expect(screen.getByText(/5\/5/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MockTestLesson
// ---------------------------------------------------------------------------
describe("MockTestLesson interactions", () => {
  it("should switch to Create Mock step", () => {
    render(<MockTestLesson />);
    const buttons = screen.getAllByRole("button");
    const mockButton = buttons.find((b) =>
      b.textContent?.includes("モックを作る"),
    );
    fireEvent.click(mockButton!);
    expect(
      screen.getByText(/ダミー関数を作り、インターフェースの全メソッド/),
    ).toBeInTheDocument();
  });

  it("should switch to Use in Test step", () => {
    render(<MockTestLesson />);
    const buttons = screen.getAllByRole("button");
    const useButton = buttons.find((b) =>
      b.textContent?.includes("テストで使う"),
    );
    fireEvent.click(useButton!);
    expect(
      screen.getByText(/Arrange（準備）→ Act（実行）→ Assert（検証）/),
    ).toBeInTheDocument();
  });

  it("should switch to Why It Works step", () => {
    render(<MockTestLesson />);
    const buttons = screen.getAllByRole("button");
    const whyButton = buttons.find((b) =>
      b.textContent?.includes("なぜ可能か"),
    );
    fireEvent.click(whyButton!);
    expect(
      screen.getByText(/インターフェース経由でアクセスしている/),
    ).toBeInTheDocument();
  });
});
