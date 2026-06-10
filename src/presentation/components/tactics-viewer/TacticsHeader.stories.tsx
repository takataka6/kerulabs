/**
 * @module TacticsHeader.stories
 * @description TacticsHeaderコンポーネントのStorybookストーリー定義。
 * TacticsHeader は分割済みContext（UI / Team / Execution）から値を読むため、
 * デコレータで各Providerをラップする。
 */
import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TacticsHeader } from "./TacticsHeader";
import { createMockTeam } from "@sb/mocks/teams";
import { createMock433 } from "@sb/mocks/formations";
import {
  TacticsUIProvider,
  type TacticsUIContextType,
} from "@presentation/contexts/TacticsUIContext";
import {
  TacticsTeamProvider,
  type TacticsTeamContextType,
} from "@presentation/contexts/TacticsTeamContext";
import {
  TacticsExecutionProvider,
  type TacticsExecutionContextType,
} from "@presentation/contexts/TacticsExecutionContext";
import { LanguageProvider } from "@presentation/contexts/LanguageContext";

/* ------------------------------------------------------------------ */
/*  モック値                                                            */
/* ------------------------------------------------------------------ */

const mockTeam = createMockTeam();
const mockFormation = createMock433();

/**
 * UI Context のモック値を生成する。
 * overrides.ui で UI表示状態の個別プロパティを上書きできる。
 */
function createMockUIValue(
  overrides: { ui?: Partial<TacticsUIContextType["ui"]> } = {},
): TacticsUIContextType {
  return {
    ui: {
      captureMode: false,
      headerVisible: true,
      showPlayerManagement: false,
      showSquadBuilder: false,
      setShowPlayerManagement: fn(),
      setShowSquadBuilder: fn(),
      setCaptureMode: fn(),
      setHeaderVisible: fn(),
      ...overrides.ui,
    } as TacticsUIContextType["ui"],
    canUndo: false,
    canRedo: false,
    handleUndo: fn(),
    handleRedo: fn(),
  };
}

/** Team Context のモック値を生成する。 */
function createMockTeamValue(): TacticsTeamContextType {
  return {
    selectedTeam: mockTeam,
    currentFormation: mockFormation,
    teams: [mockTeam],
    teamMgmt: {
      setShowTeamSelection: fn(),
    } as unknown as TacticsTeamContextType["teamMgmt"],
    formationMgmt: {
      gameModeFormations: [mockFormation],
    } as unknown as TacticsTeamContextType["formationMgmt"],
    displayData: {
      playersData: [],
      colorsData: {
        gk: "#ffcc00",
        df: "#0055ff",
        mf: "#0055ff",
        fw: "#0055ff",
      },
      lineupPlayers: [],
      lineupTeamInfo: {
        teamName: mockTeam.name,
        formationName: "4-3-3",
        colors: { gk: "#ffcc00", df: "#0055ff", mf: "#0055ff", fw: "#0055ff" },
      },
    },
    cardMgmt: {
      playerCards: {},
      managerCard: "none",
      showCards: false,
      setShowCards: fn(),
    } as unknown as TacticsTeamContextType["cardMgmt"],
    managerEditor: {
      editingManager: false,
      managerInput: "",
      startEditing: fn(),
      setManagerInput: fn(),
      cancelEditing: fn(),
    } as TacticsTeamContextType["managerEditor"],
    handleSquadCardCycle: fn(),
    handleSaveManager: fn(),
    handleCycleManagerCard: fn(),
  };
}

/**
 * Execution Context のモック値を生成する。
 * overrides.playModePhase でプレーモードの個別プロパティを上書きできる。
 */
function createMockExecutionValue(
  overrides: {
    playModePhase?: Partial<TacticsExecutionContextType["playModePhase"]>;
  } = {},
): TacticsExecutionContextType {
  return {
    playModePhase: {
      playMode: "field" as const,
      handlePlayModeChange: fn(),
      ...overrides.playModePhase,
    } as TacticsExecutionContextType["playModePhase"],
    tOrch: {} as TacticsExecutionContextType["tOrch"],
    opponentsHook: {} as TacticsExecutionContextType["opponentsHook"],
    ballHook: {} as TacticsExecutionContextType["ballHook"],
    connLines: {} as TacticsExecutionContextType["connLines"],
    playerView: {} as TacticsExecutionContextType["playerView"],
    multiSelect: {} as TacticsExecutionContextType["multiSelect"],
    bgSettings: {} as TacticsExecutionContextType["bgSettings"],
    lineupAnimation: {
      isActive: false,
    } as TacticsExecutionContextType["lineupAnimation"],
    sketch: {} as TacticsExecutionContextType["sketch"],
    canvasMemo: {} as TacticsExecutionContextType["canvasMemo"],
    canvasCallbacks: {} as TacticsExecutionContextType["canvasCallbacks"],
    handlePlayerClick: fn(),
    handleOpponentClick: fn(),
    generateFlowchart: () => "",
    tacticsLoading: false,
  };
}

/* ------------------------------------------------------------------ */
/*  共通デコレータ                                                       */
/* ------------------------------------------------------------------ */

/**
 * 全Context Providerをラップする共通デコレータを生成する。
 * ストーリーごとに異なるモック値を渡したい場合は引数でオーバーライドする。
 */
function withTacticsProviders(
  uiOverrides?: { ui?: Partial<TacticsUIContextType["ui"]> },
  execOverrides?: {
    playModePhase?: Partial<TacticsExecutionContextType["playModePhase"]>;
  },
) {
  return (Story: StoryFn) => (
    <LanguageProvider>
      <TacticsUIProvider value={createMockUIValue(uiOverrides)}>
        <TacticsTeamProvider value={createMockTeamValue()}>
          <TacticsExecutionProvider
            value={createMockExecutionValue(execOverrides)}
          >
            <Story />
          </TacticsExecutionProvider>
        </TacticsTeamProvider>
      </TacticsUIProvider>
    </LanguageProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Meta                                                               */
/* ------------------------------------------------------------------ */

const meta = {
  title: "TacticsViewer/TacticsHeader",
  component: TacticsHeader,
  decorators: [withTacticsProviders()],
} satisfies Meta<typeof TacticsHeader>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SetPlayMode: Story = {
  decorators: [
    withTacticsProviders(undefined, {
      playModePhase: { playMode: "setPlay" },
    }),
  ],
};

export const CaptureMode: Story = {
  decorators: [withTacticsProviders({ ui: { captureMode: true } })],
};
