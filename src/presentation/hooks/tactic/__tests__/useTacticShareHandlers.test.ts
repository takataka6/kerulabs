/**
 * @module useTacticShareHandlers フック
 * @description 戦術エクスポート・インポートハンドラの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Tactic } from "@domain/entities/Tactic";
import { TacticId } from "@domain/value-objects/TacticId";
import { Phase } from "@domain/value-objects/Phase";
import { Movement } from "@domain/entities/Movement";
import { useTacticShareHandlers } from "../useTacticShareHandlers";

// ── Mocks ──

const mockDownloadJson = vi.fn();
const mockOpenFilePicker = vi.fn();

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    fileService: {
      downloadJson: mockDownloadJson,
      openFilePicker: mockOpenFilePicker,
    },
  }),
}));

vi.mock("@shared/utils", () => ({
  getDateStamp: () => "2025-01-01",
}));

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

vi.mock("@application/services/TacticShareService", () => ({
  TacticShareService: {
    export: vi.fn((tactics: Tactic[]) =>
      JSON.stringify(tactics.map((t) => ({ name: t.getDisplayName("ja") }))),
    ),
    import: vi.fn((json: string) => {
      const data = JSON.parse(json);
      return data.map((d: { name: string }) =>
        Tactic.create({
          name: { ja: d.name, en: d.name },
          icon: "⚽",
          phase: Phase.fromString("attack"),
          movements: new Map(),
          ballPasses: new Map(),
        }),
      );
    }),
  },
}));

// ── Helpers ──

function createCustomTactic(name: string): Tactic {
  const movements = new Map<string, Movement[]>();
  movements.set("4-3-3", [Movement.create("CB1", 3, 4, 0, "#3b82f6")]);
  return Tactic.create({
    name: { ja: name, en: name },
    icon: "⚽",
    phase: Phase.fromString("attack"),
    movements,
    ballPasses: new Map(),
  });
}

function createDefaultTactic(name: string): Tactic {
  return Tactic.createDefault(new TacticId(`default-${name}`), {
    name: { ja: name, en: name },
    icon: "⚽",
    phase: Phase.fromString("attack"),
    movements: new Map(),
    ballPasses: new Map(),
  });
}

describe("useTacticShareHandlers", () => {
  let mockMutateAsync: ReturnType<typeof vi.fn>;
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockT: (key: string) => string;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockShowToast = vi.fn();
    mockT = (key: string) => key;
  });

  function renderShareHandlers(tactics: Tactic[] = []) {
    return renderHook(() =>
      useTacticShareHandlers({
        tactics,
        saveTacticMutation: { mutateAsync: mockMutateAsync } as never,
        showToast: mockShowToast,
        t: mockT,
      }),
    );
  }

  // ── hasCustomTactics ──

  describe("hasCustomTactics", () => {
    it("カスタム戦術がある場合 true", () => {
      const { result } = renderShareHandlers([createCustomTactic("Custom1")]);
      expect(result.current.hasCustomTactics).toBe(true);
    });

    it("カスタム戦術がない場合 false", () => {
      const { result } = renderShareHandlers([createDefaultTactic("Default1")]);
      expect(result.current.hasCustomTactics).toBe(false);
    });

    it("空配列の場合 false", () => {
      const { result } = renderShareHandlers([]);
      expect(result.current.hasCustomTactics).toBe(false);
    });

    it("customTactics にはカスタム戦術だけが含まれる", () => {
      const custom = createCustomTactic("Custom1");
      const defaultTactic = createDefaultTactic("Default1");
      const { result } = renderShareHandlers([custom, defaultTactic]);

      expect(result.current.customTactics).toEqual([custom]);
    });
  });

  // ── handleExportTactics ──

  describe("handleExportTactics", () => {
    it("カスタム戦術をJSON形式でダウンロードする", () => {
      const { result } = renderShareHandlers([
        createCustomTactic("Custom1"),
        createDefaultTactic("Default1"),
      ]);

      act(() => {
        result.current.handleExportTactics();
      });

      expect(mockDownloadJson).toHaveBeenCalledWith(
        expect.any(String),
        "tactics-2025-01-01.json",
      );
    });

    it("カスタム戦術が0件の場合はダウンロードしない", () => {
      const { result } = renderShareHandlers([createDefaultTactic("Default1")]);

      act(() => {
        result.current.handleExportTactics();
      });

      expect(mockDownloadJson).not.toHaveBeenCalled();
    });
  });

  describe("exportTacticsToJson", () => {
    it("選択した戦術だけをJSON化する", () => {
      const custom1 = createCustomTactic("Custom1");
      const custom2 = createCustomTactic("Custom2");
      const { result } = renderShareHandlers([custom1, custom2]);

      const json = result.current.exportTacticsToJson([custom2]);

      expect(json).toContain("Custom2");
      expect(json).not.toContain("Custom1");
    });
  });

  // ── handleImportTactics ──

  describe("handleImportTactics", () => {
    it("ファイルピッカーからインポートしてsaveTacticMutationを呼ぶ", async () => {
      mockOpenFilePicker.mockResolvedValue(
        JSON.stringify([{ name: "Imported1" }]),
      );

      const { result } = renderShareHandlers();

      await act(async () => {
        await result.current.handleImportTactics();
      });

      expect(mockOpenFilePicker).toHaveBeenCalledWith(".json");
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining("tactics.importSuccess"),
        "success",
      );
    });

    it("空のインポートの場合エラートーストを表示", async () => {
      mockOpenFilePicker.mockResolvedValue(JSON.stringify([]));
      const { TacticShareService } =
        await import("@application/services/TacticShareService");
      (
        TacticShareService.import as ReturnType<typeof vi.fn>
      ).mockReturnValueOnce([]);

      const { result } = renderShareHandlers();

      await act(async () => {
        await result.current.handleImportTactics();
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "tactics.importEmpty",
        "error",
      );
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});
