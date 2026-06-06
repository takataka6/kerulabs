/**
 * @module schema
 * @description IndexedDBのデータベーススキーマ定義。teams・players・formations・tactics・preferences・glossaries・sketchesの各オブジェクトストアの型を定義する。
 */
import type { DBSchema } from "idb";

/** ポジションカテゴリ（GK/DF/MF/FW） — teams.players と formations.positions で共通使用 */
type PositionCategoryDB = "gk" | "df" | "mf" | "fw";

export interface TacticsDB extends DBSchema {
  teams: {
    key: string;
    value: {
      id: string;
      name: string;
      subtitle: string;
      colors: {
        gk: string;
        main: string;
      };
      availableFormations: string[];
      players?: Array<{
        id: string;
        name: string;
        number: number;
        position?: PositionCategoryDB;
        createdAt: number;
        updatedAt: number;
        nationality?: string;
        club?: string;
        leagueCountry?: string;
        imageUrl?: string;
        mainVisualImageUrl?: string;
      }>;
      flagType: string;
      headerGradient: string;
      createdAt: number;
      updatedAt: number;
      country?: string;
      defaultFormation?: string;
      selectedSquad?: string[];
      manager?: string;
      playerCards?: Record<number, string>;
      managerCard?: string;
    };
    indexes: { "by-name": string; "by-created": number };
  };

  players: {
    key: string;
    value: {
      id: string;
      teamId: string;
      name: string;
      number: number;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { "by-team": string; "by-team-number": [string, number] };
  };

  formations: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      positions: Array<{
        pos: string;
        x: number;
        z: number;
        cat: PositionCategoryDB;
      }>;
      roleMap: Record<string, number>;
      isCustom: boolean;
      gameMode?: "football" | "futsal" | "eight_aside" | "society";
      createdAt: number;
      updatedAt: number;
    };
    indexes: { "by-type": string; "by-custom": number };
  };

  tactics: {
    key: string;
    value: {
      id: string;
      name: Record<string, string>;
      icon: string;
      phase: string;
      movements: Record<
        string,
        Array<{
          role: string;
          targetX: number;
          targetZ: number;
          delay: number;
          arrowColor: string;
        }>
      >;
      ballPasses?: Record<
        string,
        Array<{
          startRole: string;
          endRole: string;
          delay: number;
          color: string;
          endX?: number;
          endZ?: number;
          startX?: number;
          startZ?: number;
          trajectoryType?: "low" | "high" | "curveLeft" | "curveRight";
        }>
      >;
      ballPosition?: { x: number; z: number };
      stepBoundaries?: number[];
      isCustom: boolean;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { "by-phase": string; "by-custom": number };
  };

  preferences: {
    key: string;
    value: {
      key: string;
      value: unknown;
    };
  };

  glossaries: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      gameMode?: string;
      terms: Array<{
        id: string;
        term: string;
        reading?: string;
        description: string;
        keywords: string[];
      }>;
      createdAt: number;
      updatedAt: number;
    };
  };

  teamManuals: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      teamId?: string;
      sections: Array<{
        id: string;
        title: string;
        category:
          | "offense"
          | "defense"
          | "positive_transition"
          | "negative_transition"
          | "set_piece"
          | "position_task"
          | "free_note";
        formations: string[];
        items: Array<{
          id: string;
          title: string;
          content: string;
          diagram?: string;
          linkedTacticIds: string[];
        }>;
      }>;
      createdAt: number;
      updatedAt: number;
    };
  };

  plugins: {
    key: string;
    value: {
      id: string;
      kerulabs_plugin: string;
      type: "lesson";
      metadata: {
        id: string;
        name: { ja: string; en: string };
        author: string;
        version: string;
        description: { ja: string; en: string };
      };
      data: unknown;
      installedAt: number;
    };
    indexes: { "by-metadata-id": string; "by-type": string };
  };

  sketches: {
    key: string;
    value: {
      id: string;
      layers: Array<{
        id: number;
        strokes: Array<{
          id: number;
          tool: "pen" | "line" | "arrow";
          points: Array<{ x: number; y: number }>;
          color: string;
          width: number;
        }>;
        visible: boolean;
        name: string;
      }>;
      activeLayerId: number;
      updatedAt: number;
    };
  };
}
