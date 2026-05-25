import type { Plugin } from "@domain/entities/Plugin";
import type { PluginId } from "@domain/value-objects";

/**
 * プラグインドメインの Input Port（Driving Port）
 *
 * Presentation 層はこのインターフェースを通じてプラグイン関連の操作を実行する。
 */
export interface IPluginInputPort {
  /** 全プラグインを取得する */
  getAll(): Promise<Plugin[]>;

  /** 指定IDのプラグインを取得する */
  getById(id: PluginId): Promise<Plugin | null>;

  /** JSONからプラグインをインポートする */
  importFromJson(json: string): Promise<Plugin>;

  /** 指定IDのプラグインを削除する */
  delete(id: PluginId): Promise<void>;
}
