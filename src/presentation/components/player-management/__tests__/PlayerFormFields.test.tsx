/**
 * @module PlayerFormFields コンポーネント
 * @description 選手フォーム共通フィールドの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 各入力フィールド（名前・番号・ポジション・国籍等）の表示と値変更を検証
 * - フィールドのデフォルト値とオプショナル項目を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerFormFields } from "../PlayerFormFields";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/countries", () => ({
  COUNTRIES: [
    { code: "JP", nameJa: "日本", nameEn: "Japan", flag: "🇯🇵" },
    { code: "BR", nameJa: "ブラジル", nameEn: "Brazil", flag: "🇧🇷" },
  ],
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof PlayerFormFields>> = {},
) {
  const defaultProps = {
    name: "",
    onNameChange: vi.fn(),
    number: "",
    onNumberChange: vi.fn(),
    position: "mf" as const,
    onPositionChange: vi.fn(),
    nationality: "",
    onNationalityChange: vi.fn(),
    club: "",
    onClubChange: vi.fn(),
    leagueCountry: "",
    onLeagueCountryChange: vi.fn(),
    note: "",
    onNoteChange: vi.fn(),
    status: "available" as const,
    onStatusChange: vi.fn(),
    language: "ja" as const,
    t: mockT,
    ...overrides,
  };
  return { ...render(<PlayerFormFields {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("PlayerFormFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──

  describe("基本レンダリング", () => {
    it("名前入力フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.name")).toBeInTheDocument();
    });

    it("背番号入力フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.number")).toBeInTheDocument();
    });

    it("ポジション選択フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.position")).toBeInTheDocument();
    });

    it("国籍選択フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.nationality")).toBeInTheDocument();
    });

    it("クラブ入力フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.club")).toBeInTheDocument();
    });

    it("リーグ国選択フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.leagueCountry")).toBeInTheDocument();
    });

    it("メモ入力フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.note")).toBeInTheDocument();
    });

    it("ステータス選択フィールドが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("player.status")).toBeInTheDocument();
    });
  });

  // ── ポジションオプション ──

  describe("ポジションオプション", () => {
    it("GK/DF/MF/FWの4つのポジションオプションが表示される", () => {
      renderComponent();

      const positionSelect = screen.getByLabelText("player.position");
      const options = positionSelect.querySelectorAll("option");
      expect(options).toHaveLength(4);
    });
  });

  // ── ステータスオプション ──

  describe("ステータスオプション", () => {
    it("3つのステータスオプションが表示される", () => {
      renderComponent();

      expect(screen.getByText("player.status.available")).toBeInTheDocument();
      expect(screen.getByText("player.status.suspended")).toBeInTheDocument();
      expect(screen.getByText("player.status.injured")).toBeInTheDocument();
    });
  });

  // ── 国籍選択 ──

  describe("国籍選択", () => {
    it("日本語モードで日本語の国名が表示される", () => {
      renderComponent({ language: "ja" });

      expect(screen.getAllByText(/日本/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/ブラジル/).length).toBeGreaterThanOrEqual(1);
    });

    it("英語モードで英語の国名が表示される", () => {
      renderComponent({ language: "en" });

      expect(screen.getAllByText(/Japan/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Brazil/).length).toBeGreaterThanOrEqual(1);
    });

    it("空の国籍オプションが表示される", () => {
      renderComponent();

      expect(screen.getByText("player.selectNationality")).toBeInTheDocument();
    });

    it("空のリーグ国オプションが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("player.selectLeagueCountry"),
      ).toBeInTheDocument();
    });
  });

  // ── 入力操作 ──

  describe("入力操作", () => {
    it("名前入力でonNameChangeが呼ばれる", () => {
      const onNameChange = vi.fn();
      renderComponent({ onNameChange });

      fireEvent.change(screen.getByLabelText("player.name"), {
        target: { value: "田中太郎" },
      });

      expect(onNameChange).toHaveBeenCalledWith("田中太郎");
    });

    it("背番号入力でonNumberChangeが呼ばれる", () => {
      const onNumberChange = vi.fn();
      renderComponent({ onNumberChange });

      fireEvent.change(screen.getByLabelText("player.number"), {
        target: { value: "10" },
      });

      expect(onNumberChange).toHaveBeenCalledWith("10");
    });

    it("ポジション変更でonPositionChangeが呼ばれる", () => {
      const onPositionChange = vi.fn();
      renderComponent({ onPositionChange });

      fireEvent.change(screen.getByLabelText("player.position"), {
        target: { value: "fw" },
      });

      expect(onPositionChange).toHaveBeenCalledWith("fw");
    });

    it("国籍変更でonNationalityChangeが呼ばれる", () => {
      const onNationalityChange = vi.fn();
      renderComponent({ onNationalityChange });

      fireEvent.change(screen.getByLabelText("player.nationality"), {
        target: { value: "日本" },
      });

      expect(onNationalityChange).toHaveBeenCalledWith("日本");
    });

    it("クラブ入力でonClubChangeが呼ばれる", () => {
      const onClubChange = vi.fn();
      renderComponent({ onClubChange });

      fireEvent.change(screen.getByLabelText("player.club"), {
        target: { value: "FC Test" },
      });

      expect(onClubChange).toHaveBeenCalledWith("FC Test");
    });

    it("リーグ国変更でonLeagueCountryChangeが呼ばれる", () => {
      const onLeagueCountryChange = vi.fn();
      renderComponent({ onLeagueCountryChange });

      fireEvent.change(screen.getByLabelText("player.leagueCountry"), {
        target: { value: "日本" },
      });

      expect(onLeagueCountryChange).toHaveBeenCalledWith("日本");
    });

    it("メモ入力でonNoteChangeが呼ばれる", () => {
      const onNoteChange = vi.fn();
      renderComponent({ onNoteChange });

      fireEvent.change(screen.getByLabelText("player.note"), {
        target: { value: "テストメモ" },
      });

      expect(onNoteChange).toHaveBeenCalledWith("テストメモ");
    });

    it("ステータス変更でonStatusChangeが呼ばれる", () => {
      const onStatusChange = vi.fn();
      renderComponent({ onStatusChange });

      fireEvent.change(screen.getByLabelText("player.status"), {
        target: { value: "injured" },
      });

      expect(onStatusChange).toHaveBeenCalledWith("injured");
    });
  });

  // ── 初期値 ──

  describe("初期値", () => {
    it("指定された名前が初期値として表示される", () => {
      renderComponent({ name: "テスト選手" });

      expect(screen.getByLabelText("player.name")).toHaveValue("テスト選手");
    });

    it("指定された背番号が初期値として表示される", () => {
      renderComponent({ number: "7" });

      expect(screen.getByLabelText("player.number")).toHaveValue(7);
    });

    it("指定されたポジションが選択されている", () => {
      renderComponent({ position: "gk" });

      expect(screen.getByLabelText("player.position")).toHaveValue("gk");
    });

    it("指定されたクラブが初期値として表示される", () => {
      renderComponent({ club: "FC Test" });

      expect(screen.getByLabelText("player.club")).toHaveValue("FC Test");
    });

    it("指定されたステータスが選択されている", () => {
      renderComponent({ status: "suspended" });

      expect(screen.getByLabelText("player.status")).toHaveValue("suspended");
    });
  });

  // ── カスタムプレースホルダー ──

  describe("カスタムプレースホルダー", () => {
    it("カスタム国籍プレースホルダーが使用される", () => {
      renderComponent({
        nationalityPlaceholder: "player.customNationality" as never,
      });

      expect(screen.getByText("player.customNationality")).toBeInTheDocument();
    });

    it("カスタムリーグ国プレースホルダーが使用される", () => {
      renderComponent({
        leagueCountryPlaceholder: "player.customLeague" as never,
      });

      expect(screen.getByText("player.customLeague")).toBeInTheDocument();
    });
  });
});
