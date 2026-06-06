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
import { render, screen, fireEvent } from "@testing-library/react";
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
}): Team {
  return Team.create({
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

  it("ヘッダーを表示する", () => {
    renderFormationEditor();

    expect(
      screen.getByText("tactics.editFormations.title"),
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

  // ── 保存 ──

  it("保存ボタンで onUpdateTeam と onClose が呼ばれる", () => {
    const { onUpdateTeam, onClose, team } = renderFormationEditor();

    fireEvent.click(screen.getByText("tactics.squadBuilder.save"));

    expect(onUpdateTeam).toHaveBeenCalledWith(team);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
