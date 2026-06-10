/**
 * @module sampleData
 * @description サンプルデータ定義。チーム・用語集・マニュアルの初期データを提供する。
 * 固有名詞は使用せず、サンプルデータであることが明確にわかる汎用的な名称を使用。
 */
import type { CreateTeamInput } from "@domain/entities/Team";
import type { CreatePlayerInput } from "@domain/entities/Player";
import type { ManualCategory } from "@domain/entities/TeamManual";
import type { PositionCategory } from "@shared/types/PositionCategory";
import type { TeamId } from "@domain/value-objects/TeamId";

// ────────────────────────────────────────────────────────────
// サンプルチーム
// ────────────────────────────────────────────────────────────

export const SAMPLE_TEAM_A: CreateTeamInput = {
  name: "[Sample] Team 01",
  subtitle: "サンプルチーム 01",
  colors: { gk: "#FFD700", main: "#1E90FF" },
  availableFormations: ["4-3-3", "4-2-3-1"],
  defaultFormation: "4-3-3",
  flagType: "none",
  headerGradient: "from-blue-600 to-cyan-500",
  manager: "Sample Coach 01",
};

export const SAMPLE_TEAM_B: CreateTeamInput = {
  name: "[Sample] Team 02",
  subtitle: "サンプルチーム 02",
  colors: { gk: "#32CD32", main: "#DC143C" },
  availableFormations: ["4-4-2-flat", "4-2-3-1"],
  defaultFormation: "4-4-2-flat",
  flagType: "none",
  headerGradient: "from-red-600 to-orange-500",
  manager: "Sample Coach 02",
};

/** チームAの選手データ（teamIdは実行時に差し込む） */
export function getSamplePlayersA(
  teamId: TeamId,
): Omit<CreatePlayerInput, "teamId">[] {
  const players: Array<{
    name: string;
    number: number;
    position: PositionCategory;
  }> = [
    { name: "Sample A01", number: 1, position: "gk" },
    { name: "Sample A02", number: 2, position: "df" },
    { name: "Sample A03", number: 3, position: "df" },
    { name: "Sample A04", number: 4, position: "df" },
    { name: "Sample A05", number: 5, position: "df" },
    { name: "Sample A06", number: 6, position: "mf" },
    { name: "Sample A07", number: 7, position: "mf" },
    { name: "Sample A08", number: 8, position: "mf" },
    { name: "Sample A09", number: 9, position: "fw" },
    { name: "Sample A10", number: 10, position: "fw" },
    { name: "Sample A11", number: 11, position: "fw" },
    { name: "Sample A12", number: 12, position: "gk" },
    { name: "Sample A13", number: 13, position: "df" },
    { name: "Sample A14", number: 14, position: "mf" },
    { name: "Sample A15", number: 15, position: "fw" },
  ];
  // teamId は呼び出し側で付与するため省略
  void teamId;
  return players;
}

/** チームBの選手データ */
export function getSamplePlayersB(
  teamId: TeamId,
): Omit<CreatePlayerInput, "teamId">[] {
  const players: Array<{
    name: string;
    number: number;
    position: PositionCategory;
  }> = [
    { name: "Sample B01", number: 1, position: "gk" },
    { name: "Sample B02", number: 2, position: "df" },
    { name: "Sample B03", number: 3, position: "df" },
    { name: "Sample B04", number: 4, position: "df" },
    { name: "Sample B05", number: 5, position: "df" },
    { name: "Sample B06", number: 6, position: "mf" },
    { name: "Sample B07", number: 7, position: "mf" },
    { name: "Sample B08", number: 8, position: "mf" },
    { name: "Sample B09", number: 9, position: "mf" },
    { name: "Sample B10", number: 10, position: "fw" },
    { name: "Sample B11", number: 11, position: "fw" },
    { name: "Sample B12", number: 12, position: "gk" },
    { name: "Sample B13", number: 13, position: "df" },
    { name: "Sample B14", number: 14, position: "mf" },
    { name: "Sample B15", number: 15, position: "fw" },
  ];
  void teamId;
  return players;
}

// ────────────────────────────────────────────────────────────
// サンプル用語集
// ────────────────────────────────────────────────────────────

export interface SampleGlossaryDef {
  name: string;
  description: string;
  terms: Array<{
    term: string;
    reading?: string;
    description: string;
    keywords: string[];
  }>;
}

export const SAMPLE_GLOSSARY: SampleGlossaryDef = {
  name: "[Sample] 戦術用語集",
  description: "サンプルデータ: 戦術共有で使う基本用語をまとめた用語集です。",
  terms: [
    {
      term: "ビルドアップ",
      reading: "びるどあっぷ",
      description:
        "自陣からボールを繋いで前進する攻撃の組み立て。GKやDFラインからのパスワークを含む。",
      keywords: ["攻撃", "ポゼッション", "パス"],
    },
    {
      term: "プレッシング",
      reading: "ぷれっしんぐ",
      description:
        "相手のボール保持者に積極的にプレスをかけてボールを奪う守備戦術。ハイプレス・ミドルプレス・ローブロックなどの種類がある。",
      keywords: ["守備", "プレス", "ボール奪取"],
    },
    {
      term: "トランジション",
      reading: "とらんじしょん",
      description:
        "攻守の切り替え局面。ポジティブトランジション（守→攻）とネガティブトランジション（攻→守）がある。",
      keywords: ["切り替え", "攻守転換"],
    },
    {
      term: "オフサイドトラップ",
      reading: "おふさいどとらっぷ",
      description:
        "DFラインを意図的に上げて相手FWをオフサイドポジションに置く守備戦術。",
      keywords: ["守備", "DF", "ライン"],
    },
    {
      term: "ポゼッション",
      reading: "ぽぜっしょん",
      description:
        "ボールを保持し続けることで試合のコントロールを図る戦術的アプローチ。",
      keywords: ["攻撃", "保持", "支配率"],
    },
    {
      term: "カウンターアタック",
      reading: "かうんたーあたっく",
      description:
        "ボールを奪った直後に素早く相手ゴールを目指す攻撃。相手の守備が整う前に数的優位を作る。",
      keywords: ["攻撃", "速攻", "トランジション"],
    },
    {
      term: "アンカー",
      reading: "あんかー",
      description:
        "中盤の底に位置し、守備的な役割を担うMF。ビルドアップの起点にもなる。",
      keywords: ["ポジション", "MF", "守備的"],
    },
    {
      term: "ウイングバック",
      reading: "ういんぐばっく",
      description:
        "3バック（5バック）のシステムで、サイドの攻守両面を担当するポジション。",
      keywords: ["ポジション", "サイド", "3バック"],
    },
    {
      term: "ゲーゲンプレス",
      reading: "げーげんぷれす",
      description:
        "ボールを失った直後に即座にプレスをかけてボールを奪い返す戦術。カウンタープレスとも呼ばれる。",
      keywords: ["守備", "プレス", "ネガトラ"],
    },
    {
      term: "偽9番",
      reading: "にせきゅうばん",
      description:
        "CFが中盤に降りてプレーすることで相手DFラインを混乱させる戦術的な動き。",
      keywords: ["攻撃", "FW", "ポジション"],
    },
  ],
};

// ────────────────────────────────────────────────────────────
// サンプルマニュアル
// ────────────────────────────────────────────────────────────

export interface SampleManualSectionDef {
  title: string;
  category: ManualCategory;
  formations: string[];
  items: Array<{
    title: string;
    content: string;
    diagram?: string;
    linkedTacticIds: string[];
  }>;
}

export interface SampleManualDef {
  name: string;
  description: string;
  sections: SampleManualSectionDef[];
}

export const SAMPLE_MANUAL: SampleManualDef = {
  name: "[Sample] 戦術マニュアル",
  description: "サンプルデータ: 基本戦術と共有ルールをまとめたマニュアルです。",
  sections: [
    {
      title: "ビルドアップの原則",
      category: "offense",
      formations: ["4-3-3"],
      items: [
        {
          title: "GKからのビルドアップ",
          content:
            "## 基本方針\n\n- GKは常に2つ以上のパスコースを確保する\n- CBが開いてGKからのパスを受ける\n- アンカーがCB間に降りてサポート\n\n## 注意点\n\n相手のプレス強度に応じてロングボールも選択肢に入れる。",
          linkedTacticIds: [],
        },
        {
          title: "中盤での前進",
          content:
            "## ライン間のポジショニング\n\n- インサイドハーフが相手MF-DFライン間でボールを受ける\n- ウイングがタッチライン際で幅を取る\n- CFがDFラインを牽制して裏のスペースを作る",
          linkedTacticIds: [],
        },
      ],
    },
    {
      title: "守備ブロックの構築",
      category: "defense",
      formations: [],
      items: [
        {
          title: "4-4-2ミドルブロック",
          content:
            "## コンパクトな守備\n\n- FW2枚でパスコースを限定\n- MFラインとDFラインの距離を10m以内に保つ\n- サイドに追い込んでボールを奪取する",
          linkedTacticIds: [],
        },
      ],
    },
    {
      title: "ポジティブトランジション",
      category: "positive_transition",
      formations: [],
      items: [
        {
          title: "ボール奪取後のカウンター",
          content:
            "## 即座の切り替え\n\n1. ボールを奪ったら最初のパスを素早く前方へ\n2. ウイングとCFが縦に走る\n3. 逆サイドのウイングもゴール前に合流\n\n**目標**: 5秒以内にシュートまで持ち込む",
          linkedTacticIds: [],
        },
      ],
    },
    {
      title: "ネガティブトランジション",
      category: "negative_transition",
      formations: [],
      items: [
        {
          title: "ゲーゲンプレスの実行",
          content:
            "## ボールロスト直後の対応\n\n- ボールロスト地点の周囲3人が即座にプレス\n- 残りの選手は守備ポジションへ戻る\n- 5秒以内に奪い返せなければ撤退守備に切り替え",
          linkedTacticIds: [],
        },
      ],
    },
    {
      title: "セットプレー",
      category: "set_piece",
      formations: [],
      items: [
        {
          title: "CKの攻撃パターン",
          content:
            "## パターンA: ニアポスト\n\n- キッカーはインスイングで蹴る\n- ニアに1人がフリック\n- ファーに2人が詰める\n\n## パターンB: ショートコーナー\n\n- 近くの選手にショートパス\n- クロスまたはシュートの選択",
          linkedTacticIds: [],
        },
      ],
    },
  ],
};
