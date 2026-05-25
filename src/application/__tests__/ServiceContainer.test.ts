/**
 * @module ServiceContainer
 * @description DIコンテナ（ServiceContainer）の初期化と取得の単体テスト
 *
 * テスト方針:
 * - vi.resetModules() でモジュール状態をテスト間で分離
 * - configureContainer() 未呼び出し時のエラーハンドリング
 * - 設定後のコンテナ取得と参照同一性の検証
 * - 実際のリポジトリ等は空オブジェクトのモックで代用
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Container } from "../ServiceContainer";

describe("ServiceContainer", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("configureContainer() が呼ばれていない場合、getContainer() はエラーをスローする", async () => {
    const { getContainer } = await import("../ServiceContainer");

    expect(() => getContainer()).toThrowError(
      "ServiceContainer not configured. Call configureContainer() at app startup.",
    );
  });

  it("configureContainer() で設定後、getContainer() はコンテナを返す", async () => {
    const { configureContainer, getContainer } =
      await import("../ServiceContainer");
    const mockContainer = createMockContainer();

    configureContainer(mockContainer);
    const result = getContainer();

    expect(result).toBeDefined();
    expect(result).toBe(mockContainer);
  });

  it("getContainer() は設定されたコンテナと同じ参照を返す", async () => {
    const { configureContainer, getContainer } =
      await import("../ServiceContainer");
    const mockContainer = createMockContainer();

    configureContainer(mockContainer);
    const first = getContainer();
    const second = getContainer();

    expect(first).toBe(second);
    expect(first).toBe(mockContainer);
  });
});

function createMockContainer(): Container {
  return {
    teamRepository: {} as Container["teamRepository"],
    formationRepository: {} as Container["formationRepository"],
    tacticRepository: {} as Container["tacticRepository"],
    glossaryRepository: {} as Container["glossaryRepository"],
    teamManualRepository: {} as Container["teamManualRepository"],
    pluginRepository: {} as Container["pluginRepository"],
    backupService: {} as Container["backupService"],
    fileService: {} as Container["fileService"],
    preferencesService: {} as Container["preferencesService"],
    tacticInteractor: {} as Container["tacticInteractor"],
    teamInteractor: {} as Container["teamInteractor"],
    formationInteractor: {} as Container["formationInteractor"],
    glossaryInteractor: {} as Container["glossaryInteractor"],
    teamManualInteractor: {} as Container["teamManualInteractor"],
    pluginInteractor: {} as Container["pluginInteractor"],
    appBackupService: {} as Container["appBackupService"],
  };
}
