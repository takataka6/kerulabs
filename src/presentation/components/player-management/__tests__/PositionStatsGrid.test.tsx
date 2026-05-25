/**
 * @module PositionStatsGrid コンポーネント
 * @description ポジション別統計グリッドの単体テスト
 *
 * テスト方針:
 * - 翻訳関数をvi.fnでモック化
 * - 各ポジション（GK/DF/MF/FW）の選手数表示を検証
 * - 選手データなしの場合のフォールバックを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PositionStatsGrid } from "../PositionStatsGrid";
import type { Player } from "@domain/entities/Player";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBgDark: () => "bg-slate-700",
  getPositionBorderDark: () => "border-slate-600",
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createPlayer(position: string): Player {
  return {
    id: `p-${position}-${Math.random()}`,
    name: `Player ${position}`,
    number: 1,
    position,
  } as unknown as Player;
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("PositionStatsGrid", () => {
  it("4 ポジション（GK, DF, MF, FW）のカードを表示する", () => {
    render(<PositionStatsGrid players={[]} t={mockT} />);

    expect(screen.getByText("GK")).toBeInTheDocument();
    expect(screen.getByText("DF")).toBeInTheDocument();
    expect(screen.getByText("MF")).toBeInTheDocument();
    expect(screen.getByText("FW")).toBeInTheDocument();
  });

  it("各ポジションの人数をカウントして表示する", () => {
    const players = [
      createPlayer("gk"),
      createPlayer("df"),
      createPlayer("df"),
      createPlayer("mf"),
      createPlayer("mf"),
      createPlayer("mf"),
      createPlayer("fw"),
    ];

    render(<PositionStatsGrid players={players} t={mockT} />);

    const counts = screen.getAllByText(/^\d+$/);
    const countValues = counts.map((el) => el.textContent);
    expect(countValues).toContain("1"); // GK
    expect(countValues).toContain("2"); // DF
    expect(countValues).toContain("3"); // MF
  });

  it("選手がいない場合は全て 0 を表示する", () => {
    render(<PositionStatsGrid players={[]} t={mockT} />);

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(4);
  });

  it("ポジション別のアイコンを表示する", () => {
    render(<PositionStatsGrid players={[]} t={mockT} />);

    expect(screen.getByText("🧤")).toBeInTheDocument();
    expect(screen.getByText("🛡️")).toBeInTheDocument();
    expect(screen.getByText("⚡")).toBeInTheDocument();
    expect(screen.getByText("⚽")).toBeInTheDocument();
  });
});
