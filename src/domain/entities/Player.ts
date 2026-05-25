/**
 * @module Player
 * @description サッカー選手エンティティの定義。背番号・ポジション・所属情報を管理し、DDDの不変性パターンで保護する
 */

import { PlayerId } from "../value-objects/PlayerId";
import { TeamId } from "../value-objects/TeamId";
import type { PositionCategory } from "@shared/types/PositionCategory";
import type { PlayerStatus } from "@shared/types/PlayerStatus";

/** コンストラクタ引数（DB復元・テスト用） — 全フィールドを明示的に指定 */
export interface PlayerProps {
  id: PlayerId;
  teamId: TeamId;
  name: string;
  number: number;
  position: PositionCategory;
  createdAt: Date;
  updatedAt: Date;
  nationality?: string;
  club?: string;
  leagueCountry?: string;
  imageUrl?: string;
  mainVisualImageUrl?: string;
  note?: string;
  status?: PlayerStatus;
}

/** ファクトリ引数（新規作成用） — id/createdAt/updatedAt は自動生成 */
export interface CreatePlayerInput {
  name: string;
  number: number;
  teamId: TeamId;
  position?: PositionCategory;
  nationality?: string;
  club?: string;
  leagueCountry?: string;
  imageUrl?: string;
  mainVisualImageUrl?: string;
  note?: string;
  status?: PlayerStatus;
}

/**
 * サッカー選手を表すエンティティ
 * 背番号は0〜99の範囲で一意性が求められる
 *
 * フィールドは private で保護し、getter 経由の読み取りと
 * update メソッド経由の変更のみを許可する（DDD の不変性パターン）
 */
export class Player {
  public readonly id: PlayerId;
  public readonly teamId: TeamId;
  public readonly createdAt: Date;

  private _name: string;
  private _number: number;
  private _position: PositionCategory;
  private _updatedAt: Date;
  private _nationality?: string;
  private _club?: string;
  private _leagueCountry?: string;
  private _imageUrl?: string;
  private _mainVisualImageUrl?: string;
  private _note?: string;
  private _status: PlayerStatus;

  constructor(props: PlayerProps) {
    if (props.number < 0 || props.number > 99) {
      throw new Error("Player number must be between 0 and 99");
    }
    if (!props.name.trim()) {
      throw new Error("Player name cannot be empty");
    }
    this.id = props.id;
    this.teamId = props.teamId;
    this._name = props.name;
    this._number = props.number;
    this._position = props.position;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._nationality = props.nationality;
    this._club = props.club;
    this._leagueCountry = props.leagueCountry;
    this._imageUrl = props.imageUrl;
    this._mainVisualImageUrl = props.mainVisualImageUrl;
    this._note = props.note;
    this._status = props.status ?? "available";
  }

  // ── Getters ─────────────────────────────────────────────

  get name(): string {
    return this._name;
  }
  get number(): number {
    return this._number;
  }
  get position(): PositionCategory {
    return this._position;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get nationality(): string | undefined {
    return this._nationality;
  }
  get club(): string | undefined {
    return this._club;
  }
  get leagueCountry(): string | undefined {
    return this._leagueCountry;
  }
  get imageUrl(): string | undefined {
    return this._imageUrl;
  }
  get mainVisualImageUrl(): string | undefined {
    return this._mainVisualImageUrl;
  }
  get note(): string | undefined {
    return this._note;
  }
  get status(): PlayerStatus {
    return this._status;
  }

  // ── Factory ─────────────────────────────────────────────

  /**
   * 新しい選手を作成するファクトリメソッド
   * @param input - 選手作成に必要な情報（name, number, teamId は必須）
   * @returns 新しいPlayerインスタンス
   */
  static create(input: CreatePlayerInput): Player {
    const now = new Date();
    return new Player({
      id: PlayerId.generate(),
      teamId: input.teamId,
      name: input.name,
      number: input.number,
      position: input.position ?? "mf",
      createdAt: now,
      updatedAt: now,
      nationality: input.nationality,
      club: input.club,
      leagueCountry: input.leagueCountry,
      imageUrl: input.imageUrl,
      mainVisualImageUrl: input.mainVisualImageUrl,
      note: input.note,
      status: input.status,
    });
  }

  // ── Mutators（状態変更は必ずメソッド経由） ──────────────

  /**
   * 選手名を更新する
   * @param name - 新しい選手名
   */
  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error("Player name cannot be empty");
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * 背番号を更新する
   * @param number - 新しい背番号（0〜99）
   * @throws 背番号が0〜99の範囲外の場合
   */
  updateNumber(number: number): void {
    if (number < 0 || number > 99) {
      throw new Error("Player number must be between 0 and 99");
    }
    this._number = number;
    this._updatedAt = new Date();
  }

  /**
   * ポジションを更新する
   * @param position - 新しいポジションカテゴリ
   */
  updatePosition(position: PositionCategory): void {
    this._position = position;
    this._updatedAt = new Date();
  }

  /**
   * 国籍を更新する
   * @param nationality - 新しい国籍（undefinedで削除）
   * @throws 空文字の場合（削除するにはundefinedを渡す）
   */
  updateNationality(nationality: string | undefined): void {
    if (nationality !== undefined && !nationality.trim()) {
      throw new Error(
        "Player nationality cannot be empty (use undefined to clear)",
      );
    }
    this._nationality = nationality;
    this._updatedAt = new Date();
  }

  /**
   * 所属クラブを更新する
   * @param club - 新しい所属クラブ名（undefinedで削除）
   * @throws 空文字の場合（削除するにはundefinedを渡す）
   */
  updateClub(club: string | undefined): void {
    if (club !== undefined && !club.trim()) {
      throw new Error("Player club cannot be empty (use undefined to clear)");
    }
    this._club = club;
    this._updatedAt = new Date();
  }

  /**
   * 所属リーグの国を更新する
   * @param leagueCountry - 新しい所属リーグの国（undefinedで削除）
   * @throws 空文字の場合（削除するにはundefinedを渡す）
   */
  updateLeagueCountry(leagueCountry: string | undefined): void {
    if (leagueCountry !== undefined && !leagueCountry.trim()) {
      throw new Error(
        "Player leagueCountry cannot be empty (use undefined to clear)",
      );
    }
    this._leagueCountry = leagueCountry;
    this._updatedAt = new Date();
  }

  /**
   * 選手画像URLを更新する
   * @param imageUrl - 新しい画像URL（undefinedで削除）
   * @throws 空文字の場合（削除するにはundefinedを渡す）
   */
  updateImageUrl(imageUrl: string | undefined): void {
    if (imageUrl !== undefined && !imageUrl.trim()) {
      throw new Error(
        "Player imageUrl cannot be empty (use undefined to clear)",
      );
    }
    this._imageUrl = imageUrl;
    this._updatedAt = new Date();
  }

  /**
   * メインビジュアル画像URLを更新する
   * @param mainVisualImageUrl - 新しいメインビジュアル画像URL（undefinedで削除）
   * @throws 空文字の場合（削除するにはundefinedを渡す）
   */
  updateMainVisualImageUrl(mainVisualImageUrl: string | undefined): void {
    if (mainVisualImageUrl !== undefined && !mainVisualImageUrl.trim()) {
      throw new Error(
        "Player mainVisualImageUrl cannot be empty (use undefined to clear)",
      );
    }
    this._mainVisualImageUrl = mainVisualImageUrl;
    this._updatedAt = new Date();
  }

  /**
   * メモを更新する
   * @param note - 新しいメモ（undefinedで削除）
   */
  updateNote(note: string | undefined): void {
    this._note = note;
    this._updatedAt = new Date();
  }

  /**
   * 起用可否ステータスを更新する
   * @param status - 新しいステータス
   */
  updateStatus(status: PlayerStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }
}
