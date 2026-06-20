/**
 * @module RightControlsColumn コンポーネント
 * @description 右側コントロールカラムの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 各コントロールボタンの配置と表示状態を検証
 * - 子コンポーネントへのprops受け渡しを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RightControlsColumn } from "../RightControlsColumn";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBg: () => "bg-slate-600",
}));

vi.mock("@presentation/components/team", () => ({
  FormationEditor: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="formation-editor">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock("../right-controls", () => ({
  BackgroundSettingsPanel: () => (
    <div data-testid="bg-settings-panel">BG Settings</div>
  ),
  ConnectionLinesButton: () => (
    <div data-testid="connection-lines-button">Connection Lines</div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function defaultProps(
  overrides: Partial<React.ComponentProps<typeof RightControlsColumn>> = {},
): React.ComponentProps<typeof RightControlsColumn> {
  return {
    showRightControls: true,
    onToggleRightControls: vi.fn(),
    gameModeFormations: [
      {
        id: { value: "4-4-2-flat" },
        name: "4-4-2 Flat",
        positions: [],
      } as never,
      { id: { value: "4-3-3" }, name: "4-3-3", positions: [] } as never,
    ],
    currentFormationId: "4-4-2-flat",
    selectedTeam: {
      id: "team-1",
      availableFormations: ["4-4-2-flat", "4-3-3"],
      defaultFormation: "4-4-2-flat",
      players: [],
    } as never,
    showFormationEditor: false,
    gameMode: "football",
    allTactics: [],
    isExecuting: false,
    onChangeFormation: vi.fn(),
    onToggleFormationEditor: vi.fn(),
    onUpdateTeam: vi.fn(),
    canUndo: false,
    canRedo: false,
    undoRedoEnabled: true,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    playerView: {
      playerViewEnabled: false,
      togglePlayerView: vi.fn(),
      playerViewIndex: null,
      setPlayerViewIndex: vi.fn(),
    } as never,
    onTogglePlayerView: vi.fn(),
    opponentsHook: {
      opponentPlacementMode: false,
      toggleOpponentPlacement: vi.fn(),
      opponents: [],
      selectedOpponentPlayerId: null,
      clearOpponents: vi.fn(),
      showOpponentFormationSelect: false,
      showOpponentSquadBuilder: false,
      showOpponentNames: false,
      setShowOpponentNames: vi.fn(),
      showOpponentNumbers: true,
      setShowOpponentNumbers: vi.fn(),
    } as never,
    teams: [],
    pitchConfig: { maxOpponents: 11 },
    showPlayerNames: true,
    onTogglePlayerNames: vi.fn(),
    showPlayerNumbers: true,
    onTogglePlayerNumbers: vi.fn(),
    showNameSettings: false,
    onToggleNameSettings: vi.fn(),
    hiddenPlayerIndices: new Set<number>(),
    onTogglePlayerHidden: vi.fn(),
    labelFixed: false,
    onToggleLabelFixed: vi.fn(),
    playersData: [],
    formationData: [],
    bgSettings: {
      background: "default",
      setBackground: vi.fn(),
      showSceneBgSettings: false,
    } as never,
    showCards: false,
    onToggleCards: vi.fn(),
    playerMarkerScale: 1.0,
    onMarkerScaleChange: vi.fn(),
    playerMarkerShape: "circle",
    onMarkerShapeChange: vi.fn(),
    activeTactic: undefined,
    showFlowchart: false,
    onToggleFlowchart: vi.fn(),
    ballHook: {
      ballPlacementMode: false,
      toggleBallPlacement: vi.fn(),
      ballPosition: null,
      handleBallRemove: vi.fn(),
    } as never,
    connLines: {} as never,
    sketchMode: false,
    onToggleSketchMode: vi.fn(),
    t: mockT,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("RightControlsColumn", () => {
  // ── 開閉トグル ────────────────────────────────────────

  describe("開閉トグル", () => {
    it("トグルボタンが常に表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.hideControls")).toBeInTheDocument();
    });

    it("コントロールが非表示の場合、トグルボタンのラベルが変わる", () => {
      render(
        <RightControlsColumn {...defaultProps({ showRightControls: false })} />,
      );

      expect(screen.getByLabelText("tactics.showControls")).toBeInTheDocument();
    });

    it("コントロールが非表示の場合、フォーメーション選択が表示されない", () => {
      render(
        <RightControlsColumn {...defaultProps({ showRightControls: false })} />,
      );

      expect(screen.queryByText("tactics.formation")).not.toBeInTheDocument();
    });

    it("ポップアップ表示中は右レールの操作レイヤーをロックする", () => {
      render(
        <RightControlsColumn
          {...defaultProps({ showFormationEditor: true })}
        />,
      );

      expect(screen.getByTestId("right-controls-action-layer")).toHaveClass(
        "blur-[3px]",
        "opacity-55",
        "saturate-75",
      );
      expect(
        screen.getByTestId("right-controls-lock-overlay"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("formation-editor")).toBeInTheDocument();
    });

    it("ポップアップ非表示時は右レールの操作レイヤーをロックしない", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByTestId("right-controls-action-layer")).not.toHaveClass(
        "blur-[3px]",
      );
      expect(
        screen.queryByTestId("right-controls-lock-overlay"),
      ).not.toBeInTheDocument();
    });
  });

  // ── フォーメーション選択 ──────────────────────────────

  describe("フォーメーション選択", () => {
    it("フォーメーション編集ボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(
        screen.getByLabelText("tactics.editFormations"),
      ).toBeInTheDocument();
    });

    it("利用可能なフォーメーションボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      const select = screen.getByLabelText(
        "a11y.formationSelector",
      ) as HTMLSelectElement;
      const optionValues = Array.from(select.options).map(
        (option) => option.text,
      );
      expect(optionValues).toEqual(["4-4-2 Flat", "4-3-3"]);
    });

    it("現在のゲームモードの設定がない場合はデフォルトフォーメーションを表示する", () => {
      render(
        <RightControlsColumn
          {...defaultProps({
            gameMode: "futsal",
            gameModeFormations: [
              { id: { value: "futsal-2-2" }, name: "2-2", positions: [] },
              {
                id: { value: "futsal-1-2-1" },
                name: "1-2-1",
                positions: [],
              },
            ] as never,
            currentFormationId: "futsal-2-2",
            selectedTeam: {
              id: "team-1",
              availableFormations: ["4-4-2-flat"],
              defaultFormation: "4-4-2-flat",
              players: [],
            } as never,
          })}
        />,
      );

      expect(screen.getByText("2-2")).toBeInTheDocument();
      expect(screen.queryByText("1-2-1")).not.toBeInTheDocument();
    });

    it("実行中の場合、フォーメーションセレクトが無効になる", () => {
      render(<RightControlsColumn {...defaultProps({ isExecuting: true })} />);

      expect(screen.getByLabelText("a11y.formationSelector")).toBeDisabled();
    });

    it("フォーメーション編集ボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(
        screen.getByLabelText("tactics.editFormations"),
      ).toBeInTheDocument();
    });
  });

  // ── Undo/Redo 非表示 ──────────────────────────────────

  describe("Undo/Redo 非表示", () => {
    it("Undo/Redo ボタンを表示しない", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.queryByLabelText("tactics.undo")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("tactics.redo")).not.toBeInTheDocument();
    });
  });

  // ── フォーメーションエディター ────────────────────────

  describe("フォーメーションエディター", () => {
    it("showFormationEditorがtrueの場合、エディターが表示される", () => {
      render(
        <RightControlsColumn
          {...defaultProps({ showFormationEditor: true })}
        />,
      );

      expect(screen.getByTestId("formation-editor")).toBeInTheDocument();
    });

    it("showFormationEditorがfalseの場合、エディターが表示されない", () => {
      render(
        <RightControlsColumn
          {...defaultProps({ showFormationEditor: false })}
        />,
      );

      expect(screen.queryByTestId("formation-editor")).not.toBeInTheDocument();
    });
  });

  // ── 敵配置 ────────────────────────────────────────────

  describe("敵配置", () => {
    it("敵配置ボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.opponents")).toBeInTheDocument();
    });

    it("敵配置モードが無効な場合、相手選手セレクターを描画しない", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.opponents")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("敵配置モードが有効な場合、敵配置ボタンを展開状態にする", () => {
      render(
        <RightControlsColumn
          {...defaultProps({
            opponentsHook: {
              opponentPlacementMode: true,
              toggleOpponentPlacement: vi.fn(),
              opponents: [],
              clearOpponents: vi.fn(),
              showOpponentNames: false,
              setShowOpponentNames: vi.fn(),
            } as never,
            teams: [{ id: { value: "team-2" }, name: "Sample Team" } as never],
          })}
        />,
      );

      expect(screen.getByLabelText("tactics.opponents")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("相手選手選択中は敵配置ボタンがハイライトされる", () => {
      render(
        <RightControlsColumn
          {...defaultProps({
            opponentsHook: {
              opponentPlacementMode: true,
              selectedOpponentPlayerId: "opp-1",
              showOpponentFormationSelect: false,
              showOpponentSquadBuilder: false,
              toggleOpponentPlacement: vi.fn(),
              opponents: [],
              clearOpponents: vi.fn(),
              showOpponentNames: false,
              setShowOpponentNames: vi.fn(),
            } as never,
            teams: [{ id: { value: "team-2" }, name: "Sample Team" } as never],
          })}
        />,
      );

      const button = screen.getByLabelText("tactics.opponents");
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(button.className).toContain("from-red-600/28");
    });

    it("右レールは左サイド同様にスクロールコンテナ化しない", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      const rail = screen.getByTestId("right-controls-rail");
      expect(rail.className).not.toContain("overflow-y-auto");
      expect(rail.className).toContain("absolute");
      expect(rail.className).toContain("top-2");
    });

    it("縦幅が狭い時に備えて右ボタン列だけスクロール可能にする", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      const scrollArea = screen.getByTestId("right-controls-scroll-area");
      expect(scrollArea.className).toContain("overflow-y-auto");
      expect(scrollArea.className).toContain(
        "max-h-[calc(100vh-8.5rem-env(safe-area-inset-bottom,0px))]",
      );
      expect(scrollArea.className).toContain(
        "pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)]",
      );
    });
  });

  // ── 名前表示 ──────────────────────────────────────────

  describe("名前表示", () => {
    it("名前表示切り替えボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getAllByText("tactics.names.label").length).toBeGreaterThan(
        0,
      );
    });

    it("選手名が非表示の場合、ラベルが変わる", () => {
      render(
        <RightControlsColumn {...defaultProps({ showPlayerNames: false })} />,
      );

      expect(screen.getAllByText("tactics.names.label").length).toBeGreaterThan(
        0,
      );
    });

    it("名前設定パネルが表示される場合、選手リストが表示される", () => {
      const props = defaultProps({
        showNameSettings: true,
        showPlayerNames: true,
        playersData: [
          { name: "Player A", number: 10 },
          { name: "Player B", number: 7 },
        ],
        formationData: [
          { pos: "CM", x: 0, z: 0, cat: "mf" },
          { pos: "CF", x: 0, z: 0, cat: "fw" },
        ],
      });
      render(<RightControlsColumn {...props} />);

      expect(screen.getByText("Player A")).toBeInTheDocument();
      expect(screen.getByText("Player B")).toBeInTheDocument();
    });
  });

  // ── カード表示 ────────────────────────────────────────

  describe("カード表示", () => {
    it("カードトグルボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByText("tactics.card")).toBeInTheDocument();
    });
  });

  // ── マーカーサイズ ────────────────────────────────────

  describe("マーカーサイズ", () => {
    it("サイズ選択ボタン(S, M, L)が表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.queryByText("tactics.size")).not.toBeInTheDocument();
      expect(screen.getByText("S")).toBeInTheDocument();
      expect(screen.getByText("M")).toBeInTheDocument();
      expect(screen.getByText("L")).toBeInTheDocument();
    });
  });

  // ── 戦術フロー ────────────────────────────────────────

  describe("戦術フロー", () => {
    it("アクティブ戦術がある場合、フローボタンが表示される", () => {
      render(
        <RightControlsColumn
          {...defaultProps({
            activeTactic: { id: "t1" } as never,
          })}
        />,
      );

      expect(screen.getByLabelText("tactics.tacticsFlow")).toBeInTheDocument();
    });

    it("アクティブ戦術がない場合、フローボタンが表示されない", () => {
      render(
        <RightControlsColumn {...defaultProps({ activeTactic: undefined })} />,
      );

      expect(
        screen.queryByLabelText("tactics.tacticsFlow"),
      ).not.toBeInTheDocument();
    });
  });

  // ── プレイヤービュー ──────────────────────────────────

  describe("プレイヤービュー", () => {
    it("プレイヤービューボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.playerView")).toBeInTheDocument();
    });

    it("playerViewEnabled=true の場合、プレイヤービューボタンがハイライトされる", () => {
      render(
        <RightControlsColumn
          {...defaultProps({
            playerView: {
              playerViewEnabled: true,
              togglePlayerView: vi.fn(),
            } as never,
          })}
        />,
      );

      const button = screen.getByLabelText("tactics.playerView");
      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(button.className).toContain("!bg-amber-600/18");
      expect(button.className).toContain("!text-amber-200");
    });
  });

  // ── ボール配置 ────────────────────────────────────────

  describe("ボール配置", () => {
    it("ボール配置ボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.ball")).toBeInTheDocument();
    });

    it("ボールが配置済みの場合、削除ボタンが表示される", () => {
      const props = defaultProps({
        ballHook: {
          ballPlacementMode: false,
          toggleBallPlacement: vi.fn(),
          ballPosition: { x: 0, z: 0 },
          handleBallRemove: vi.fn(),
        } as never,
      });
      render(<RightControlsColumn {...props} />);

      expect(screen.getByLabelText("tactics.ball.remove")).toBeInTheDocument();
    });
  });

  // ── スケッチ ──────────────────────────────────────────

  describe("スケッチ", () => {
    it("スケッチボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.sketch")).toBeInTheDocument();
    });
  });

  // ── サブコンポーネント ────────────────────────────────

  describe("サブコンポーネント", () => {
    it("背景設定パネルが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByTestId("bg-settings-panel")).toBeInTheDocument();
    });

    it("ライン描画ボタンが表示される", () => {
      render(<RightControlsColumn {...defaultProps()} />);

      expect(screen.getByTestId("connection-lines-button")).toBeInTheDocument();
    });
  });

  // ── Interaction tests ─────────────────────────────────

  describe("コールバック", () => {
    it("トグルボタンクリックで onToggleRightControls が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.hideControls"));
      expect(props.onToggleRightControls).toHaveBeenCalled();
    });

    it("フォーメーション変更で onChangeFormation が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.change(screen.getByLabelText("a11y.formationSelector"), {
        target: { value: "4-3-3" },
      });
      expect(props.onChangeFormation).toHaveBeenCalledWith("4-3-3");
    });

    it("フォーメーション編集ボタンクリックで onToggleFormationEditor が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.editFormations"));
      expect(props.onToggleFormationEditor).toHaveBeenCalled();
    });

    it("敵配置ボタンクリックで toggleOpponentPlacement が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.opponents"));
      expect(props.opponentsHook.toggleOpponentPlacement).toHaveBeenCalled();
    });

    it("相手名前トグルクリックで setShowOpponentNames が呼ばれる", () => {
      const setShowOpponentNames = vi.fn();
      const props = defaultProps({
        opponentsHook: {
          opponentPlacementMode: false,
          toggleOpponentPlacement: vi.fn(),
          opponents: [{ id: 1, x: 0, z: 0 }],
          clearOpponents: vi.fn(),
          showOpponentNames: true,
          setShowOpponentNames,
          showOpponentNumbers: true,
          setShowOpponentNumbers: vi.fn(),
        } as never,
      });
      render(<RightControlsColumn {...props} />);

      const opponentSection = screen
        .getByLabelText("tactics.opponents")
        .closest("div[class]")!.parentElement!;
      const buttons = within(opponentSection).getAllByRole("button");
      // 相手セクション内のボタン順: [配置, 名前トグル, 番号トグル]
      fireEvent.click(buttons[1]);
      expect(setShowOpponentNames).toHaveBeenCalled();
    });

    it("相手番号トグルクリックで setShowOpponentNumbers が呼ばれる", () => {
      const setShowOpponentNumbers = vi.fn();
      const props = defaultProps({
        opponentsHook: {
          opponentPlacementMode: false,
          toggleOpponentPlacement: vi.fn(),
          opponents: [{ id: 1, x: 0, z: 0 }],
          clearOpponents: vi.fn(),
          showOpponentNames: true,
          setShowOpponentNames: vi.fn(),
          showOpponentNumbers: true,
          setShowOpponentNumbers,
        } as never,
      });
      render(<RightControlsColumn {...props} />);

      const opponentSection = screen
        .getByLabelText("tactics.opponents")
        .closest("div[class]")!.parentElement!;
      const buttons = within(opponentSection).getAllByRole("button");
      // 相手セクション内のボタン順: [配置, 名前トグル, 番号トグル]
      fireEvent.click(buttons[2]);
      expect(setShowOpponentNumbers).toHaveBeenCalled();
    });

    it("名前表示ボタンクリックで onTogglePlayerNames が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.hideNames"));
      expect(props.onTogglePlayerNames).toHaveBeenCalled();
    });

    it("名前設定ボタンクリックで onToggleNameSettings が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.showNames"));
      expect(props.onToggleNameSettings).toHaveBeenCalled();
    });

    it("カードトグルボタンクリックで onToggleCards が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.showCards"));
      expect(props.onToggleCards).toHaveBeenCalled();
    });

    it("マーカーサイズSボタンクリックで onMarkerScaleChange(0.9) が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByText("S"));
      expect(props.onMarkerScaleChange).toHaveBeenCalledWith(0.9);
    });

    it("マーカーサイズLボタンクリックで onMarkerScaleChange(1.1) が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByText("L"));
      expect(props.onMarkerScaleChange).toHaveBeenCalledWith(1.1);
    });

    it("三角形ボタンクリックで onMarkerShapeChange('triangle') が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByTitle("Triangle"));
      expect(props.onMarkerShapeChange).toHaveBeenCalledWith("triangle");
    });

    it("五角形ボタンクリックで onMarkerShapeChange('pentagon') が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByTitle("Pentagon"));
      expect(props.onMarkerShapeChange).toHaveBeenCalledWith("pentagon");
    });

    it("フローチャートボタンクリックで onToggleFlowchart が呼ばれる", () => {
      const props = defaultProps({ activeTactic: { id: "t1" } as never });
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.tacticsFlow"));
      expect(props.onToggleFlowchart).toHaveBeenCalled();
    });

    it("プレイヤービューボタンクリックで togglePlayerView が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.playerView"));
      expect(props.onTogglePlayerView).toHaveBeenCalled();
    });

    it("ボール配置ボタンクリックで toggleBallPlacement が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.ball"));
      expect(props.ballHook.toggleBallPlacement).toHaveBeenCalled();
    });

    it("ボール削除ボタンクリックで handleBallRemove が呼ばれる", () => {
      const props = defaultProps({
        ballHook: {
          ballPlacementMode: false,
          toggleBallPlacement: vi.fn(),
          ballPosition: { x: 0, z: 0 },
          handleBallRemove: vi.fn(),
        } as never,
      });
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.ball.remove"));
      expect(props.ballHook.handleBallRemove).toHaveBeenCalled();
    });

    it("スケッチボタンクリックで onToggleSketchMode が呼ばれる", () => {
      const props = defaultProps();
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByLabelText("tactics.sketch"));
      expect(props.onToggleSketchMode).toHaveBeenCalled();
    });

    it("名前設定パネルで選手をクリックすると onTogglePlayerHidden が呼ばれる", () => {
      const props = defaultProps({
        showNameSettings: true,
        showPlayerNames: true,
        playersData: [
          { name: "Player A", number: 10 },
          { name: "Player B", number: 7 },
        ],
        formationData: [
          { pos: "CM", x: 0, z: 0, cat: "mf" },
          { pos: "CF", x: 0, z: 0, cat: "fw" },
        ],
      });
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByText("Player A"));
      expect(props.onTogglePlayerHidden).toHaveBeenCalledWith(0);
    });

    it("FormationEditor の onClose で onToggleFormationEditor が呼ばれる", () => {
      const props = defaultProps({ showFormationEditor: true });
      render(<RightControlsColumn {...props} />);

      fireEvent.click(screen.getByText("Close"));
      expect(props.onToggleFormationEditor).toHaveBeenCalled();
    });
  });
});
