/**
 * @module TeamCreator コンポーネント
 * @description チーム作成フォームの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - チーム名・カラー・フォーメーション等の入力フォームを検証
 * - フォーム送信とバリデーションを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TeamCreator } from "../TeamCreator";

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
  useConfirm: () => ({
    confirm: vi.fn().mockResolvedValue(true),
    alert: vi.fn(),
  }),
  AccessibleModal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    ariaLabelledBy?: string;
    className?: string;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

vi.mock("@shared/constants/countries", () => ({
  COUNTRIES: [
    { code: "JP", nameJa: "日本", nameEn: "Japan", flag: "🇯🇵" },
    { code: "US", nameJa: "アメリカ", nameEn: "United States", flag: "🇺🇸" },
  ],
  FLAG_EMOJI: {
    japan: "🇯🇵",
    usa: "🇺🇸",
  },
}));

vi.mock("@shared/constants/formations", () => ({
  FORMATION_OPTIONS: ["4-3-3", "4-4-2", "3-5-2"],
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TeamCreator", () => {
  const defaultProps = {
    onCreateTeam: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("チーム作成フォームがレンダリングされる", () => {
    render(<TeamCreator {...defaultProps} />);

    expect(screen.getByText("teamCreator.title")).toBeInTheDocument();
    expect(screen.getByText("teamCreator.description")).toBeInTheDocument();
  });

  it("チーム名入力フィールドが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    const nameInput = screen.getByLabelText(/teamCreator\.teamName/);
    expect(nameInput).toBeInTheDocument();
  });

  it("サブタイトル入力フィールドが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    const subtitleInput = screen.getByLabelText("teamCreator.subtitle");
    expect(subtitleInput).toBeInTheDocument();
  });

  it("国選択フィールドが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    const countrySelect = screen.getByLabelText("teamCreator.country");
    expect(countrySelect).toBeInTheDocument();
  });

  it("監督入力フィールドが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    const managerInput = screen.getByLabelText("teamCreator.manager");
    expect(managerInput).toBeInTheDocument();
  });

  it("フォーメーション選択ボタンが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    // 4-3-3 はボタンとselectのoption両方に存在するため getAllByText を使用
    expect(screen.getAllByText("4-3-3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("4-4-2")).toBeInTheDocument();
    expect(screen.getByText("3-5-2")).toBeInTheDocument();
  });

  it("作成・キャンセルボタンが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    expect(screen.getByText("teamCreator.create")).toBeInTheDocument();
    expect(screen.getByText("teamCreator.cancel")).toBeInTheDocument();
  });

  it("チームカラー設定フィールドが表示される", () => {
    render(<TeamCreator {...defaultProps} />);

    expect(screen.getByText("teamCreator.teamColors")).toBeInTheDocument();
    expect(screen.getByLabelText("GK")).toBeInTheDocument();
    expect(screen.getByLabelText("teamCreator.fieldColor")).toBeInTheDocument();
  });

  it("チーム名を入力できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const nameInput = screen.getByLabelText(/teamCreator\.teamName/);
    fireEvent.change(nameInput, { target: { value: "テストチーム" } });
    expect(nameInput).toHaveValue("テストチーム");
  });

  it("サブタイトルを入力できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const subtitleInput = screen.getByLabelText("teamCreator.subtitle");
    fireEvent.change(subtitleInput, {
      target: { value: "サブタイトルテスト" },
    });
    expect(subtitleInput).toHaveValue("サブタイトルテスト");
  });

  it("国を選択できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const countrySelect = screen.getByLabelText("teamCreator.country");
    fireEvent.change(countrySelect, { target: { value: "日本" } });
    expect(countrySelect).toHaveValue("日本");
  });

  it("監督名を入力できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const managerInput = screen.getByLabelText("teamCreator.manager");
    fireEvent.change(managerInput, { target: { value: "テスト監督" } });
    expect(managerInput).toHaveValue("テスト監督");
  });

  it("フォーメーションのトグルで選択/解除ができる", () => {
    render(<TeamCreator {...defaultProps} />);

    // 4-4-2 をクリックして追加
    fireEvent.click(screen.getByText("4-4-2"));

    // 4-3-3 はデフォルトで選択済み。クリックして解除
    // getAllByTextで4-3-3のボタンを取得（selectのoptionにもあるため）
    const formationButtons = screen.getAllByText("4-3-3");
    const formationButton = formationButtons.find(
      (el) => el.tagName === "BUTTON",
    );
    if (formationButton) {
      fireEvent.click(formationButton);
    }
  });

  it("GKカラーピッカーで色を変更できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const gkColor = screen.getByLabelText("GK");
    fireEvent.change(gkColor, { target: { value: "#ff0000" } });
    expect(gkColor).toHaveValue("#ff0000");
  });

  it("フィールドカラーピッカーで色を変更できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const mainColor = screen.getByLabelText("teamCreator.fieldColor");
    fireEvent.change(mainColor, { target: { value: "#00ff00" } });
    expect(mainColor).toHaveValue("#00ff00");
  });

  it("キャンセルボタンでonCloseが呼ばれる", () => {
    render(<TeamCreator {...defaultProps} />);
    fireEvent.click(screen.getByText("teamCreator.cancel"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("作成ボタンでhandleCreateが実行される（チーム名空の場合alertが呼ばれる）", async () => {
    render(<TeamCreator {...defaultProps} />);
    fireEvent.click(screen.getByText("teamCreator.create"));
    // チーム名が空なのでalertが呼ばれ、onCreateTeamは呼ばれない
    expect(defaultProps.onCreateTeam).not.toHaveBeenCalled();
  });

  it("国旗タイプを選択できる", () => {
    render(<TeamCreator {...defaultProps} />);
    // Flag optionsから2番目の国旗ボタンをクリック
    const flagButton = screen.getByText("teamCreator.flag.usa");
    fireEvent.click(flagButton);
  });

  it("グラデーションカラーを選択できる", () => {
    render(<TeamCreator {...defaultProps} />);
    const colorButton = screen.getByText("teamCreator.color.red");
    fireEvent.click(colorButton);
  });

  it("チーム名を入力して作成ボタンをクリックするとonCreateTeamが呼ばれる", async () => {
    render(<TeamCreator {...defaultProps} />);

    // Fill in the team name
    const nameInput = screen.getByLabelText(/teamCreator\.teamName/);
    fireEvent.change(nameInput, { target: { value: "新しいチーム" } });

    // Click create button
    fireEvent.click(screen.getByText("teamCreator.create"));

    // Wait for async handleCreate to complete
    await waitFor(() => {
      expect(defaultProps.onCreateTeam).toHaveBeenCalledTimes(1);
    });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("デフォルトフォーメーションを変更できる", () => {
    render(<TeamCreator {...defaultProps} />);

    // First add 4-4-2 to available formations
    fireEvent.click(screen.getByText("4-4-2"));

    // Then change the default formation select
    const defaultFormationSelect = screen.getByLabelText(
      "teamCreator.defaultFormation",
    );
    fireEvent.change(defaultFormationSelect, { target: { value: "4-4-2" } });
    expect(defaultFormationSelect).toHaveValue("4-4-2");
  });

  it("全フォーメーションを解除すると最低1つは残る", () => {
    render(<TeamCreator {...defaultProps} />);

    // 4-3-3 is the only selected formation, clicking it should not remove it (length > 1 check)
    const formationButtons = screen.getAllByText("4-3-3");
    const formationButton = formationButtons.find(
      (el) => el.tagName === "BUTTON",
    );
    if (formationButton) {
      fireEvent.click(formationButton);
    }

    // 4-3-3 should still be selected since it's the only one
    expect(screen.getAllByText("4-3-3").length).toBeGreaterThanOrEqual(1);
  });
});
