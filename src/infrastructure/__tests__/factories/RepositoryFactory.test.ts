/**
 * @module RepositoryFactory
 * @description リポジトリファクトリの単体テスト
 *
 * テスト方針:
 * - 各IndexedDBリポジトリ実装クラスをvi.mockでスタブ化
 * - ファクトリメソッドが正しいリポジトリインスタンスを生成することを検証
 * - Team / Formation / Tactic / Glossary の4リポジトリを網羅
 */
import { describe, it, expect, vi } from "vitest";

vi.mock(
  "@infrastructure/repositories/indexeddb/IndexedDBTeamRepository",
  () => ({
    IndexedDBTeamRepository: vi.fn(),
  }),
);
vi.mock(
  "@infrastructure/repositories/indexeddb/IndexedDBFormationRepository",
  () => ({
    IndexedDBFormationRepository: vi.fn(),
  }),
);
vi.mock(
  "@infrastructure/repositories/indexeddb/IndexedDBTacticRepository",
  () => ({
    IndexedDBTacticRepository: vi.fn(),
  }),
);
vi.mock(
  "@infrastructure/repositories/indexeddb/IndexedDBGlossaryRepository",
  () => ({
    IndexedDBGlossaryRepository: vi.fn(),
  }),
);
vi.mock(
  "@infrastructure/repositories/indexeddb/IndexedDBTeamManualRepository",
  () => ({
    IndexedDBTeamManualRepository: vi.fn(),
  }),
);
vi.mock(
  "@infrastructure/repositories/indexeddb/IndexedDBPluginRepository",
  () => ({
    IndexedDBPluginRepository: vi.fn(),
  }),
);

import { RepositoryFactory } from "../../factories/RepositoryFactory";
import { IndexedDBTeamRepository } from "@infrastructure/repositories/indexeddb/IndexedDBTeamRepository";
import { IndexedDBFormationRepository } from "@infrastructure/repositories/indexeddb/IndexedDBFormationRepository";
import { IndexedDBTacticRepository } from "@infrastructure/repositories/indexeddb/IndexedDBTacticRepository";
import { IndexedDBGlossaryRepository } from "@infrastructure/repositories/indexeddb/IndexedDBGlossaryRepository";
import { IndexedDBPluginRepository } from "@infrastructure/repositories/indexeddb/IndexedDBPluginRepository";

describe("RepositoryFactory", () => {
  it("createTeamRepository: IndexedDBTeamRepository のインスタンスを返す", () => {
    const result = RepositoryFactory.createTeamRepository();

    expect(IndexedDBTeamRepository).toHaveBeenCalledOnce();
    expect(result).toBeInstanceOf(IndexedDBTeamRepository);
  });

  it("createFormationRepository: IndexedDBFormationRepository のインスタンスを返す", () => {
    const result = RepositoryFactory.createFormationRepository();

    expect(IndexedDBFormationRepository).toHaveBeenCalledOnce();
    expect(result).toBeInstanceOf(IndexedDBFormationRepository);
  });

  it("createTacticRepository: IndexedDBTacticRepository のインスタンスを返す", () => {
    const result = RepositoryFactory.createTacticRepository();

    expect(IndexedDBTacticRepository).toHaveBeenCalledOnce();
    expect(result).toBeInstanceOf(IndexedDBTacticRepository);
  });

  it("createGlossaryRepository: IndexedDBGlossaryRepository のインスタンスを返す", () => {
    const result = RepositoryFactory.createGlossaryRepository();

    expect(IndexedDBGlossaryRepository).toHaveBeenCalledOnce();
    expect(result).toBeInstanceOf(IndexedDBGlossaryRepository);
  });

  it("createPluginRepository: IndexedDBPluginRepository のインスタンスを返す", () => {
    const result = RepositoryFactory.createPluginRepository();

    expect(IndexedDBPluginRepository).toHaveBeenCalledOnce();
    expect(result).toBeInstanceOf(IndexedDBPluginRepository);
  });
});
