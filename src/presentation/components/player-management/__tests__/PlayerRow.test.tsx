/**
 * @module PlayerRow コンポーネント
 * @description 選手一覧行コンポーネントの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 選手情報（名前・番号・ポジション）の表示を検証
 * - 編集・削除ボタンのクリックイベントを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerRow } from "../PlayerRow";
import { Player } from "@domain/entities/Player";
import { PlayerId } from "@domain/value-objects/PlayerId";
import { TeamId } from "@domain/value-objects/TeamId";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/countries", () => ({
  getCountryInfo: (code: string) => ({
    flag: `flag-${code}`,
    name: `country-${code}`,
  }),
}));

vi.mock("@presentation/components/ui", () => ({
  ImageCropModal: () => <div data-testid="image-crop-modal" />,
}));

vi.mock("../PlayerFormFields", () => ({
  PlayerFormFields: () => <div data-testid="player-form-fields" />,
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createPlayer(
  overrides: Partial<{
    id: string;
    name: string;
    number: number;
    position: "gk" | "df" | "mf" | "fw";
    nationality: string;
    club: string;
    note: string;
    status: "available" | "suspended" | "injured";
  }> = {},
): Player {
  return new Player({
    id: new PlayerId(overrides.id ?? "player-1"),
    teamId: new TeamId("team-1"),
    name: overrides.name ?? "Test Player",
    number: overrides.number ?? 10,
    position: overrides.position ?? "mf",
    createdAt: new Date(),
    updatedAt: new Date(),
    nationality: overrides.nationality,
    club: overrides.club,
    note: overrides.note,
    status: overrides.status ?? "available",
  });
}

function renderPlayerRow(
  overrides: Partial<React.ComponentProps<typeof PlayerRow>> = {},
) {
  const props = {
    player: createPlayer(),
    isEditing: false,
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
    language: "ja" as const,
    t: mockT,
    ...overrides,
  };
  return { ...render(<PlayerRow {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("PlayerRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 表示モード ────────────────────────────────────────────

  describe("表示モード", () => {
    it("選手名が表示される", () => {
      renderPlayerRow({ player: createPlayer({ name: "田中太郎" }) });

      expect(screen.getByText("田中太郎")).toBeInTheDocument();
    });

    it("背番号が表示される", () => {
      renderPlayerRow({ player: createPlayer({ number: 7 }) });

      expect(screen.getByText("#7")).toBeInTheDocument();
    });

    it("ポジションが表示される", () => {
      renderPlayerRow({ player: createPlayer({ position: "fw" }) });

      expect(screen.getByText(/FW/)).toBeInTheDocument();
    });

    it("編集ボタンが表示される", () => {
      renderPlayerRow();

      expect(screen.getByText("player.edit")).toBeInTheDocument();
    });

    it("削除ボタンが表示される", () => {
      renderPlayerRow();

      expect(screen.getByText("player.delete")).toBeInTheDocument();
    });

    it("国籍が設定されている場合、国旗が表示される", () => {
      renderPlayerRow({
        player: createPlayer({ nationality: "JP" }),
      });

      expect(screen.getByText(/country-JP/)).toBeInTheDocument();
    });

    it("所属クラブが設定されている場合、クラブ名が表示される", () => {
      renderPlayerRow({
        player: createPlayer({ club: "FC Test" }),
      });

      expect(screen.getByText(/FC Test/)).toBeInTheDocument();
    });

    it("メモが設定されている場合、メモが表示される", () => {
      renderPlayerRow({
        player: createPlayer({ note: "怪我に注意" }),
      });

      expect(screen.getByText("怪我に注意")).toBeInTheDocument();
    });

    it("ステータスが suspended の場合、ステータスが表示される", () => {
      renderPlayerRow({
        player: createPlayer({ status: "suspended" }),
      });

      expect(screen.getByText("player.status.suspended")).toBeInTheDocument();
    });
  });

  // ── インタラクション ────────────────────────────────────────

  describe("インタラクション", () => {
    it("編集ボタンでonStartEditが呼ばれる", () => {
      const { onStartEdit } = renderPlayerRow();

      fireEvent.click(screen.getByText("player.edit"));
      expect(onStartEdit).toHaveBeenCalledWith("player-1");
    });

    it("削除ボタンでonRemoveが呼ばれる", () => {
      const { onRemove } = renderPlayerRow();

      fireEvent.click(screen.getByText("player.delete"));
      expect(onRemove).toHaveBeenCalledWith("player-1");
    });
  });

  // ── 編集モード ────────────────────────────────────────────

  describe("編集モード", () => {
    it("編集モードでフォームフィールドが表示される", () => {
      renderPlayerRow({ isEditing: true });

      expect(screen.getByTestId("player-form-fields")).toBeInTheDocument();
    });

    it("編集モードで保存・キャンセルボタンが表示される", () => {
      renderPlayerRow({ isEditing: true });

      expect(screen.getByText("player.save")).toBeInTheDocument();
      expect(screen.getByText("player.cancel")).toBeInTheDocument();
    });

    it("保存ボタンでonUpdateとonCancelEditが呼ばれる", () => {
      const { onUpdate, onCancelEdit } = renderPlayerRow({ isEditing: true });

      fireEvent.click(screen.getByText("player.save"));

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(
        "player-1",
        "Test Player",
        10,
        "mf",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "available",
      );
      expect(onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it("キャンセルボタンでonCancelEditが呼ばれる", () => {
      const { onCancelEdit } = renderPlayerRow({ isEditing: true });

      fireEvent.click(screen.getByText("player.cancel"));
      expect(onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it("マーカー画像設定ボタンでImageCropModalが表示される", () => {
      renderPlayerRow({ isEditing: true });

      // Click the marker image upload button
      fireEvent.click(screen.getByText("player.markerImage"));
      expect(screen.getByTestId("image-crop-modal")).toBeInTheDocument();
    });

    it("メインビジュアル画像設定ボタンでImageCropModalが表示される", () => {
      renderPlayerRow({ isEditing: true });

      // Click the main visual image upload button
      fireEvent.click(screen.getByText("player.mainVisual"));
      expect(screen.getByTestId("image-crop-modal")).toBeInTheDocument();
    });

    it("マーカー画像が設定済みの場合、変更・削除ボタンが表示される", () => {
      const player = createPlayer();
      // Set imageUrl via Object.defineProperty since Player may be immutable
      Object.defineProperty(player, "imageUrl", {
        value: "data:image/png;base64,marker",
        writable: true,
      });

      renderPlayerRow({ isEditing: true, player });

      // Should show change and delete buttons for marker image
      const changeButtons = screen.getAllByText("player.change");
      const deleteButtons = screen.getAllByText("player.delete");
      expect(changeButtons.length).toBeGreaterThanOrEqual(1);
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("メインビジュアル画像が設定済みの場合、変更・削除ボタンが表示される", () => {
      const player = createPlayer();
      Object.defineProperty(player, "mainVisualImageUrl", {
        value: "data:image/png;base64,mainvisual",
        writable: true,
      });

      renderPlayerRow({ isEditing: true, player });

      // Should show change and delete buttons for main visual image
      const changeButtons = screen.getAllByText("player.change");
      expect(changeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
