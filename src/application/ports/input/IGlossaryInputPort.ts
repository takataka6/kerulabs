import type { Glossary } from "@domain/entities/Glossary";
import type { GlossaryId } from "@domain/value-objects";

/**
 * 用語集ドメインの Input Port（Driving Port）
 *
 * Presentation 層はこのインターフェースを通じて用語集関連の操作を実行する。
 */
export interface IGlossaryInputPort {
  /** 全用語集を取得する */
  getAll(): Promise<Glossary[]>;

  /** 指定IDの用語集を取得する */
  getById(id: GlossaryId): Promise<Glossary | null>;

  /** 用語集を保存する（新規作成または更新） */
  save(glossary: Glossary): Promise<void>;

  /** 指定IDの用語集を削除する */
  delete(id: GlossaryId): Promise<void>;
}
