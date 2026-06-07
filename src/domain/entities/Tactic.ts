/**
 * @module Tactic
 * @description 戦術エンティティの定義。フォーメーションごとの選手移動・ボールパスを管理し、試合フェーズに紐づける
 */

import { Movement } from "./Movement";
import { BallPass } from "./BallPass";
import { Phase } from "../value-objects/Phase";
import { TacticId } from "../value-objects/TacticId";
import { normalizeFormationKey } from "@shared/constants/formations";
import { SET_POSITION_ARROW_COLOR } from "@shared/constants";

/** 戦術名の多言語マップ（例: { ja: '戦術1', en: 'Tactic 1' }） */
export type TacticName = Record<string, string>;

/** コンストラクタ引数（DB復元・テスト用） — 全フィールドを明示的に指定 */
export interface TacticProps {
  id: TacticId;
  name: TacticName;
  icon: string;
  phase: Phase;
  movements: Map<string, Movement[]>;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  ballPasses?: Map<string, BallPass[]>;
  ballPosition?: { x: number; z: number };
  stepBoundaries?: number[];
}

/** ファクトリ引数（新規作成用） — id/isCustom/createdAt/updatedAt は自動生成 */
export interface CreateTacticInput {
  name: TacticName;
  icon: string;
  phase: Phase;
  movements: Map<string, Movement[]>;
  ballPasses?: Map<string, BallPass[]>;
  ballPosition?: { x: number; z: number };
  stepBoundaries?: number[];
}

/**
 * 戦術を表すエンティティ
 * フォーメーションごとの選手移動とボールパスを定義し、試合フェーズに紐づく
 *
 * フィールドは private で保護し、getter 経由の読み取りと
 * update メソッド経由の変更のみを許可する（DDD の不変性パターン）
 */
export class Tactic {
  public readonly id: TacticId;
  public readonly isCustom: boolean;
  public readonly createdAt: Date;

  private _name: TacticName;
  private _icon: string;
  private _phase: Phase;
  private _movements: Map<string, Movement[]>;
  private _updatedAt: Date;
  private _ballPasses: Map<string, BallPass[]>;
  private _ballPosition?: { x: number; z: number };
  private _stepBoundaries?: number[];

  constructor(props: TacticProps) {
    this.id = props.id;
    this._name = { ...props.name };
    this._icon = props.icon;
    this._phase = props.phase;
    this._movements = new Map(
      [...props.movements].map(([k, v]) => [normalizeFormationKey(k), [...v]]),
    );
    this.isCustom = props.isCustom;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._ballPasses = props.ballPasses
      ? new Map(
          [...props.ballPasses].map(([k, v]) => [
            normalizeFormationKey(k),
            [...v],
          ]),
        )
      : new Map();
    this._ballPosition = props.ballPosition
      ? { ...props.ballPosition }
      : undefined;
    this._stepBoundaries = props.stepBoundaries
      ? [...props.stepBoundaries]
      : undefined;
  }

  // ── Getters ─────────────────────────────────────────────

  get name(): Readonly<TacticName> {
    return this._name;
  }
  get icon(): string {
    return this._icon;
  }
  get phase(): Phase {
    return this._phase;
  }
  get movements(): ReadonlyMap<string, readonly Movement[]> {
    return this._movements;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get ballPasses(): ReadonlyMap<string, readonly BallPass[]> {
    return this._ballPasses;
  }
  get ballPosition(): Readonly<{ x: number; z: number }> | undefined {
    return this._ballPosition;
  }
  get stepBoundaries(): readonly number[] | undefined {
    return this._stepBoundaries;
  }
  get totalSteps(): number {
    return this._stepBoundaries ? this._stepBoundaries.length : 1;
  }
  get supportsStepExecution(): boolean {
    return this.totalSteps > 1;
  }
  get hasSetupStepExecution(): boolean {
    if (this._ballPosition) return true;

    for (const movementList of this._movements.values()) {
      if (
        movementList.some(
          (movement) => movement.arrowColor === SET_POSITION_ARROW_COLOR,
        )
      ) {
        return true;
      }
    }

    return false;
  }

  // ── Query ───────────────────────────────────────────────

  /**
   * 指定言語の表示名を取得する（フォールバック: en → ja → 最初の値）
   * @param language - 言語コード（例: "ja", "en"）
   * @returns 表示名の文字列
   */
  getDisplayName(language: string): string {
    return (
      this._name[language] ||
      this._name["en"] ||
      this._name["ja"] ||
      Object.values(this._name)[0] ||
      ""
    );
  }

  // ── Factory ─────────────────────────────────────────────

  /**
   * カスタム戦術を作成するファクトリメソッド
   * @param input - 戦術作成に必要な情報（name, icon, phase, movements は必須）
   * @returns 新しいTacticインスタンス
   * @throws nameが空の場合
   */
  static create(input: CreateTacticInput): Tactic {
    if (Object.keys(input.name).length === 0) {
      throw new Error("Tactic name must have at least one language entry");
    }
    if (!Object.values(input.name).some((v) => v.trim())) {
      throw new Error(
        "Tactic name must have at least one non-empty language entry",
      );
    }
    const now = new Date();
    return new Tactic({
      id: TacticId.generate(),
      name: input.name,
      icon: input.icon,
      phase: input.phase,
      movements: input.movements,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
      ballPasses: input.ballPasses,
      ballPosition: input.ballPosition,
      stepBoundaries: input.stepBoundaries,
    });
  }

  /**
   * デフォルト（組み込み）戦術を作成するファクトリメソッド
   * @param id - 戦術ID
   * @param input - 戦術作成に必要な情報
   * @returns 新しいTacticインスタンス
   */
  static createDefault(id: TacticId, input: CreateTacticInput): Tactic {
    const now = new Date();
    return new Tactic({
      id,
      name: input.name,
      icon: input.icon,
      phase: input.phase,
      movements: input.movements,
      isCustom: false,
      createdAt: now,
      updatedAt: now,
      ballPasses: input.ballPasses,
      ballPosition: input.ballPosition,
      stepBoundaries: input.stepBoundaries,
    });
  }

  // ── Query (Formation) ──────────────────────────────────

  /**
   * 指定フォーメーションに対応する選手移動を取得する
   * @param formationName - フォーメーション名
   * @returns 選手移動の配列（該当なしの場合は空配列）
   */
  getMovementsForFormation(formationName: string): readonly Movement[] {
    return this._movements.get(normalizeFormationKey(formationName)) ?? [];
  }

  /**
   * 指定フォーメーションに対応するボールパスを取得する
   * @param formationName - フォーメーション名
   * @returns ボールパスの配列（該当なしの場合は空配列）
   */
  getBallPassesForFormation(formationName: string): readonly BallPass[] {
    return this._ballPasses.get(normalizeFormationKey(formationName)) ?? [];
  }

  /**
   * 指定フォーメーションをサポートしているか判定する
   * @param formationName - フォーメーション名
   * @returns サポートしている場合true
   */
  supportsFormation(formationName: string): boolean {
    return this._movements.has(normalizeFormationKey(formationName));
  }

  // ── Mutators（状態変更は必ずメソッド経由） ──────────────

  /**
   * 戦術名を更新する
   * @param name - 新しい多言語戦術名
   */
  updateName(name: TacticName): void {
    if (Object.keys(name).length === 0) {
      throw new Error("Tactic name must have at least one language entry");
    }
    if (!Object.values(name).some((v) => v.trim())) {
      throw new Error(
        "Tactic name must have at least one non-empty language entry",
      );
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * アイコンを更新する
   * @param icon - 新しいアイコン文字列
   */
  updateIcon(icon: string): void {
    if (!icon.trim()) {
      throw new Error("Tactic icon cannot be empty");
    }
    this._icon = icon;
    this._updatedAt = new Date();
  }

  /**
   * フェーズを更新する
   * @param phase - 新しいフェーズ
   */
  updatePhase(phase: Phase): void {
    this._phase = phase;
    this._updatedAt = new Date();
  }

  /**
   * 選手移動を更新する
   * @param movements - 新しい選手移動マップ
   */
  updateMovements(movements: Map<string, Movement[]>): void {
    this._movements = new Map(
      [...movements].map(([k, v]) => [normalizeFormationKey(k), [...v]]),
    );
    this._updatedAt = new Date();
  }

  /**
   * ボールパスを更新する
   * @param ballPasses - 新しいボールパスマップ
   */
  updateBallPasses(ballPasses: Map<string, BallPass[]>): void {
    this._ballPasses = new Map(
      [...ballPasses].map(([k, v]) => [normalizeFormationKey(k), [...v]]),
    );
    this._updatedAt = new Date();
  }

  /**
   * ボール初期位置を更新する
   * @param ballPosition - 新しいボール位置（undefinedで削除）
   */
  updateBallPosition(ballPosition: { x: number; z: number } | undefined): void {
    this._ballPosition = ballPosition ? { ...ballPosition } : undefined;
    this._updatedAt = new Date();
  }

  updateStepBoundaries(stepBoundaries: number[] | undefined): void {
    this._stepBoundaries = stepBoundaries ? [...stepBoundaries] : undefined;
    this._updatedAt = new Date();
  }
}
