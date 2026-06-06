/**
 * @module Team
 * @description チームエンティティの定義。フォーメーション・選手一覧・スカッド選択・戦術設定を包括的に管理する
 */

import { TeamId } from "../value-objects/TeamId";
import { PlayerId } from "../value-objects/PlayerId";
import { Color } from "../value-objects/Color";
import { Player } from "./Player";
import {
  normalizeFormationKey,
  normalizeFormationKeys,
} from "@shared/constants/formations";

/** チームのユニフォームカラー（GKとフィールドプレイヤー） */
export interface TeamColors {
  /** GKのユニフォームカラー */
  gk: Color;
  /** フィールドプレイヤーのユニフォームカラー */
  main: Color;
}

/** ファクトリ引数（新規作成用） — id/players/createdAt/updatedAt は自動生成 */
export interface CreateTeamInput {
  name: string;
  subtitle: string;
  colors: { gk: string; main: string };
  availableFormations: string[];
  flagType: string;
  headerGradient: string;
  country?: string;
  defaultFormation?: string;
  manager?: string;
}

/** コンストラクタ引数（DB復元・テスト用） — 全フィールドを明示的に指定 */
export interface TeamProps {
  id: TeamId;
  name: string;
  subtitle: string;
  colors: TeamColors;
  availableFormations: string[];
  players: Player[];
  flagType: string;
  headerGradient: string;
  createdAt: Date;
  updatedAt: Date;
  country?: string;
  defaultFormation?: string;
  selectedSquad?: string[];
  manager?: string;
  playerCards?: Record<number, string>;
  managerCard?: string;
}

/**
 * チームを表すエンティティ
 * フォーメーション、選手一覧、スカッド選択、戦術設定を管理する
 *
 * フィールドは private で保護し、getter 経由の読み取りと
 * update メソッド経由の変更のみを許可する（DDD のカプセル化パターン）
 */
export class Team {
  public readonly id: TeamId;
  public readonly createdAt: Date;

  private _name: string;
  private _subtitle: string;
  private _colors: TeamColors;
  private _availableFormations: string[];
  private _players: Player[];
  private _flagType: string;
  private _headerGradient: string;
  private _updatedAt: Date;
  private _country?: string;
  private _defaultFormation?: string;
  private _selectedSquad?: string[];
  private _manager?: string;
  private _playerCards?: Record<number, string>;
  private _managerCard?: string;

  constructor(props: TeamProps) {
    if (!props.name.trim()) {
      throw new Error("Team name cannot be empty");
    }
    this.id = props.id;
    this._name = props.name;
    this._subtitle = props.subtitle;
    this._colors = { gk: props.colors.gk, main: props.colors.main };
    this._availableFormations = normalizeFormationKeys(
      props.availableFormations,
    );
    this._players = [...props.players];
    this._flagType = props.flagType;
    this._headerGradient = props.headerGradient;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._country = props.country;
    this._defaultFormation = props.defaultFormation
      ? normalizeFormationKey(props.defaultFormation)
      : undefined;
    this._selectedSquad = props.selectedSquad
      ? [...props.selectedSquad]
      : undefined;
    this._manager = props.manager;
    this._playerCards = props.playerCards
      ? { ...props.playerCards }
      : undefined;
    this._managerCard = props.managerCard;
  }

  // ── Getters ─────────────────────────────────────────────

  get name(): string {
    return this._name;
  }
  get subtitle(): string {
    return this._subtitle;
  }
  get colors(): Readonly<TeamColors> {
    return this._colors;
  }
  get availableFormations(): readonly string[] {
    return this._availableFormations;
  }
  get players(): readonly Player[] {
    return this._players;
  }
  get flagType(): string {
    return this._flagType;
  }
  get headerGradient(): string {
    return this._headerGradient;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get country(): string | undefined {
    return this._country;
  }
  get defaultFormation(): string | undefined {
    return this._defaultFormation;
  }
  get selectedSquad(): readonly string[] | undefined {
    return this._selectedSquad;
  }
  get manager(): string | undefined {
    return this._manager;
  }
  get playerCards(): Readonly<Record<number, string>> | undefined {
    return this._playerCards;
  }
  get managerCard(): string | undefined {
    return this._managerCard;
  }

  // ── Factory ─────────────────────────────────────────────

  /**
   * 新しいチームを作成するファクトリメソッド
   * @param input - チーム作成に必要な情報（name, subtitle, colors, availableFormations, flagType, headerGradient は必須）
   * @returns 新しいTeamインスタンス
   * @throws デフォルトフォーメーションがavailableFormationsに含まれていない場合
   */
  static create(input: CreateTeamInput): Team {
    const now = new Date();
    // デフォルトフォーメーションが指定されていない場合は最初のフォーメーションを使用
    const availableFormations = normalizeFormationKeys(
      input.availableFormations,
    );
    const defaultFm = normalizeFormationKey(
      input.defaultFormation || availableFormations[0],
    );

    // デフォルトフォーメーションがavailableFormationsに含まれているか確認
    if (defaultFm && !availableFormations.includes(defaultFm)) {
      throw new Error(
        `Default formation "${defaultFm}" must be included in available formations`,
      );
    }

    return new Team({
      id: TeamId.generate(),
      name: input.name,
      subtitle: input.subtitle,
      colors: {
        gk: Color.fromHex(input.colors.gk),
        main: Color.fromHex(input.colors.main),
      },
      availableFormations,
      players: [],
      flagType: input.flagType,
      headerGradient: input.headerGradient,
      createdAt: now,
      updatedAt: now,
      country: input.country,
      defaultFormation: defaultFm,
      manager: input.manager,
    });
  }

  // ── Mutators（状態変更は必ずメソッド経由） ──────────────

  /**
   * チームに選手を追加する
   * @param player - 追加する選手
   * @throws 背番号が重複している場合
   */
  addPlayer(player: Player): void {
    if (this._players.some((p) => p.number === player.number)) {
      throw new Error(
        `Player with number ${player.number} already exists in team`,
      );
    }
    this._players = [...this._players, player];
    this._updatedAt = new Date();
  }

  /**
   * チームから選手を削除する
   * @param playerId - 削除する選手のID
   */
  removePlayer(playerId: PlayerId): void {
    const initialLength = this._players.length;
    this._players = this._players.filter((p) => !p.id.equals(playerId));

    if (this._players.length < initialLength) {
      this._updatedAt = new Date();
    }
  }

  /**
   * ユニフォームカラーを更新する
   * @param colors - GKとフィールドプレイヤーのHEXカラー
   */
  updateColors(colors: { gk: string; main: string }): void {
    this._colors = {
      gk: Color.fromHex(colors.gk),
      main: Color.fromHex(colors.main),
    };
    this._updatedAt = new Date();
  }

  /**
   * チーム名とサブタイトルを更新する
   * @param name - 新しいチーム名
   * @param subtitle - 新しいサブタイトル
   */
  updateName(name: string, subtitle: string): void {
    if (!name.trim()) {
      throw new Error("Team name cannot be empty");
    }
    if (!subtitle.trim()) {
      throw new Error("Team subtitle cannot be empty");
    }
    this._name = name;
    this._subtitle = subtitle;
    this._updatedAt = new Date();
  }

  /**
   * スカッド（出場選手リスト）を更新する
   * @param playerIds - 選手IDの配列（先頭11人がスタメン、残りがサブ）
   */
  updateSelectedSquad(playerIds: string[]): void {
    this._selectedSquad = playerIds;
    this._updatedAt = new Date();
  }

  /**
   * 監督名を更新する
   * @param manager - 新しい監督名（空文字列でundefinedに設定）
   */
  updateManager(manager: string | undefined): void {
    if (manager !== undefined && !manager.trim()) {
      throw new Error("Team manager cannot be empty (use undefined to clear)");
    }
    this._manager = manager;
    this._updatedAt = new Date();
  }

  /**
   * 国旗タイプを更新する
   * @param flagType - 新しい国旗タイプ
   */
  updateFlagType(flagType: string): void {
    this._flagType = flagType;
    this._updatedAt = new Date();
  }

  /**
   * ヘッダーグラデーションを更新する
   * @param headerGradient - 新しいグラデーションクラス
   */
  updateHeaderGradient(headerGradient: string): void {
    this._headerGradient = headerGradient;
    this._updatedAt = new Date();
  }

  /**
   * 国を更新する
   * @param country - 新しい国名（空文字列でundefinedに設定）
   */
  updateCountry(country: string | undefined): void {
    if (country !== undefined && !country.trim()) {
      throw new Error("Team country cannot be empty (use undefined to clear)");
    }
    this._country = country;
    this._updatedAt = new Date();
  }

  /**
   * 選手のカード状態を更新する
   * @param cards - インデックスごとのカード状態（'none'|'yellow'|'double_yellow'|'red'）
   */
  updatePlayerCards(cards: Record<number, string>): void {
    this._playerCards = cards;
    this._updatedAt = new Date();
  }

  /**
   * 監督のカード状態を更新する
   * @param card - カード状態（空文字列でundefinedに設定）
   */
  updateManagerCard(card: string | undefined): void {
    this._managerCard = card ?? undefined;
    this._updatedAt = new Date();
  }

  /**
   * 利用可能なフォーメーション一覧を更新する
   * 削除されたフォーメーションに紐づく戦術設定も自動的にクリーンアップされる
   * @param formations - 新しいフォーメーション名の配列（1つ以上必要）
   * @param defaultFormation - 新しいデフォルトフォーメーション
   * @throws フォーメーションが空の場合
   */
  updateFormations(formations: string[], defaultFormation?: string): void {
    const normalizedFormations = normalizeFormationKeys(formations);

    if (normalizedFormations.length === 0) {
      throw new Error("At least one formation must be selected");
    }

    this._availableFormations = normalizedFormations;

    const normalizedDefaultFormation = defaultFormation
      ? normalizeFormationKey(defaultFormation)
      : undefined;

    if (
      normalizedDefaultFormation &&
      normalizedFormations.includes(normalizedDefaultFormation)
    ) {
      this._defaultFormation = normalizedDefaultFormation;
    } else if (
      this._defaultFormation &&
      !normalizedFormations.includes(this._defaultFormation)
    ) {
      this._defaultFormation = normalizedFormations[0];
    }

    this._updatedAt = new Date();
  }
}
