/**
 * @module FormationEditor コンポーネント
 * @description フォーメーションエディタの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - フォーメーション選択・追加・削除のUIを検証
 * - 戦術割り当て設定のUIを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormationEditor } from "../FormationEditor";
import { Team } from "@domain/entities/Team";
import type { Tactic } from "@domain/entities/Tactic";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    tDynamic: (key: string) => key,
  }),
}));

vi.mock("@presentation/components/ui", () => ({
  AccessibleModal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    ariaLabelledBy?: string;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    fileService: { downloadJson: vi.fn() },
  }),
}));

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createMockTeam(overrides?: {
  availableFormations?: string[];
  defaultFormation?: string;
  availableTactics?: Record<string, string[]>;
}): Team {
  const team = Team.create({
    name: "Test Team",
    subtitle: "Test",
    colors: { gk: "#ff0000", main: "#0000ff" },
    availableFormations: overrides?.availableFormations ?? ["4-3-3", "4-4-2"],
    flagType: "flag",
    headerGradient: "gradient",
    country: "JP",
    defaultFormation: overrides?.defaultFormation ?? "4-3-3",
    manager: "Manager",
  });

  if (overrides?.availableTactics) {
    team.updateAvailableTactics(overrides.availableTactics);
  }

  return team;
}

function createMockTactic(
  id: string,
  phase: string,
  formation: string,
  isCustom = false,
): Tactic {
  return {
    id: { value: id },
    icon: "⚡",
    isCustom,
    phase: { value: phase },
    getDisplayName: () => `カスタム_${id}`,
    supportsFormation: (f: string) => f === formation || f === "4-3-3",
    name: { value: id },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Tactic;
}

interface RenderOptions {
  team?: Team;
  allTactics?: Tactic[];
  onUpdateTeam?: ReturnType<typeof vi.fn>;
  onClose?: ReturnType<typeof vi.fn>;
}

function renderFormationEditor(options: RenderOptions = {}) {
  const {
    team = createMockTeam(),
    allTactics = [
      createMockTactic("t1", "attack", "4-3-3"),
      createMockTactic("t2", "defense", "4-3-3"),
      createMockTactic("t3", "attack", "4-3-3"),
    ],
    onUpdateTeam = vi.fn(),
    onClose = vi.fn(),
  } = options;

  return {
    ...render(
      <FormationEditor
        team={team}
        allTactics={allTactics}
        onUpdateTeam={onUpdateTeam}
        onClose={onClose}
      />,
    ),
    team,
    onUpdateTeam,
    onClose,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("FormationEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── レンダリング ──

  it("ヘッダーとタブを表示する", () => {
    renderFormationEditor();

    expect(
      screen.getByText("tactics.editFormations.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("tactics.editFormations.tabFormations"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("tactics.editFormations.tabTactics"),
    ).toBeInTheDocument();
  });

  it("閉じるボタンをクリックすると onClose が呼ばれる", () => {
    const { onClose } = renderFormationEditor();

    fireEvent.click(screen.getByRole("button", { name: "a11y.closePanel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── フォーメーションタブ ──

  it("利用可能なフォーメーションボタンを表示する", () => {
    renderFormationEditor();

    // football のフォーメーション選択肢が表示される（ボタン + ドロップダウン option で複数ヒットする場合あり）
    expect(screen.getAllByText("4-3-3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4-4-2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("4-2-3-1")).toBeInTheDocument();
  });

  it("選択済みフォーメーションのトグルで選択を解除できる", () => {
    renderFormationEditor({
      team: createMockTeam({ availableFormations: ["4-3-3", "4-4-2"] }),
    });

    // 4-4-2 を解除（2つ選択中なので解除可能）
    const btn442 = screen.getAllByText("4-4-2")[0];
    fireEvent.click(btn442);

    // 保存して確認
    fireEvent.click(screen.getByText("tactics.squadBuilder.save"));
  });

  it("最後の1つは解除できない（disabled）", () => {
    const team = createMockTeam({ availableFormations: ["4-3-3"] });
    renderFormationEditor({ team });

    // 4-3-3 のボタンは disabled のはず
    const btn = screen.getAllByText("4-3-3")[0].closest("button");
    expect(btn).toBeDisabled();
  });

  it("複数フォーメーション選択時にデフォルト選択のドロップダウンを表示する", () => {
    renderFormationEditor({
      team: createMockTeam({ availableFormations: ["4-3-3", "4-4-2"] }),
    });

    expect(
      screen.getByText("tactics.editFormations.default"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "tactics.editFormations.default" }),
    ).toBeInTheDocument();
  });

  // ── 戦術タブ ──

  it("戦術タブに切り替えるとフェーズごとの戦術リストを表示する", () => {
    renderFormationEditor();

    // 戦術タブに切り替え
    fireEvent.click(screen.getByText("tactics.editFormations.tabTactics"));

    // フェーズラベルが表示される
    expect(screen.getByText(/phase\.attack/)).toBeInTheDocument();
    expect(screen.getByText(/phase\.defense/)).toBeInTheDocument();
  });

  it("デフォルトでは全戦術モード表示", () => {
    renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.editFormations.tabTactics"));

    expect(
      screen.getByText(/tactics\.editFormations\.allTactics/),
    ).toBeInTheDocument();
  });

  it("戦術のチェックボックスを外すと明示モードに切り替わる", () => {
    renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.editFormations.tabTactics"));

    // 最初の戦術チェックボックスを外す
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    // "allTactics" ではなく "N/M tacticsSelected" 表示になる
    expect(
      screen.getByText(/tactics\.editFormations\.tacticsSelected/),
    ).toBeInTheDocument();
  });

  // ── フェーズ全選択・全解除 ──

  it("全解除ボタンで該当フェーズの戦術を全解除する", () => {
    renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.editFormations.tabTactics"));

    // attack フェーズの全解除ボタンをクリック
    const deselectButtons = screen.getAllByText(
      "tactics.editFormations.deselectAll",
    );
    fireEvent.click(deselectButtons[0]); // attack phase

    // 明示モード（tacticsSelected）に切り替わる
    expect(
      screen.getByText(/tactics\.editFormations\.tacticsSelected/),
    ).toBeInTheDocument();
  });

  // ── 保存 ──

  it("保存ボタンで onUpdateTeam と onClose が呼ばれる", () => {
    const { onUpdateTeam, onClose, team } = renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.squadBuilder.save"));

    expect(onUpdateTeam).toHaveBeenCalledWith(team);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── インポート ──

  it("テキストインポートエリアの表示・非表示を切り替えられる", () => {
    renderFormationEditor();

    // テキストインポートボタンをクリック
    fireEvent.click(screen.getByText("tactics.editFormations.importText"));

    // テキストエリアが表示される
    expect(
      screen.getByPlaceholderText(/availableFormations/),
    ).toBeInTheDocument();

    // キャンセルで非表示
    fireEvent.click(screen.getByText("tactics.squadBuilder.cancel"));
    expect(
      screen.queryByPlaceholderText(/availableFormations/),
    ).not.toBeInTheDocument();
  });

  it("有効な JSON をインポートすると成功通知を表示する", () => {
    renderFormationEditor();

    // テキストインポートエリアを開く
    fireEvent.click(screen.getByText("tactics.editFormations.importText"));

    const textarea = screen.getByPlaceholderText(/availableFormations/);
    const validJson = JSON.stringify({
      availableFormations: ["4-3-3", "3-5-2"],
      defaultFormation: "4-3-3",
    });

    fireEvent.change(textarea, { target: { value: validJson } });
    fireEvent.click(screen.getByText("tactics.editFormations.import"));

    expect(
      screen.getByText("tactics.editFormations.importSuccess"),
    ).toBeInTheDocument();
  });

  it("無効な JSON をインポートするとエラー通知を表示する", () => {
    renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.editFormations.importText"));

    const textarea = screen.getByPlaceholderText(/availableFormations/);
    fireEvent.change(textarea, { target: { value: "invalid json" } });
    fireEvent.click(screen.getByText("tactics.editFormations.import"));

    expect(
      screen.getByText("tactics.editFormations.importError"),
    ).toBeInTheDocument();
  });

  it("空の availableFormations でインポートするとエラーになる", () => {
    renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.editFormations.importText"));

    const textarea = screen.getByPlaceholderText(/availableFormations/);
    const emptyJson = JSON.stringify({ availableFormations: [] });
    fireEvent.change(textarea, { target: { value: emptyJson } });
    fireEvent.click(screen.getByText("tactics.editFormations.import"));

    expect(
      screen.getByText("tactics.editFormations.importError"),
    ).toBeInTheDocument();
  });

  // ── エクスポート ──

  it("クリップボードにエクスポートすると成功通知を表示する", async () => {
    // clipboard mock
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.editFormations.export"));

    // 非同期で通知が表示される
    await waitFor(() => {
      expect(
        screen.getByText("tactics.editFormations.exportSuccess"),
      ).toBeInTheDocument();
    });
  });

  // ── 対象フォーメーション選択 ──

  it("戦術タブで対象フォーメーションを切り替えられる", () => {
    renderFormationEditor({
      team: createMockTeam({
        availableFormations: ["4-3-3", "4-4-2"],
      }),
      allTactics: [
        createMockTactic("t1", "attack", "4-3-3"),
        createMockTactic("t2", "attack", "4-4-2"),
      ],
    });

    fireEvent.click(screen.getByText("tactics.editFormations.tabTactics"));

    // combobox で 4-4-2 に変更
    const select = screen.getAllByRole("combobox")[0];
    fireEvent.change(select, { target: { value: "4-4-2" } });

    // t2 は 4-4-2 をサポートしているのでリストに表示される
    expect(screen.getByText(/tactics\.name\.t2/)).toBeInTheDocument();
  });
});
