import type { IPluginInputPort } from "@application/ports/input";
import type { IPluginRepository } from "@application/ports/output/repositories";
import { Plugin } from "@domain/entities/Plugin";
import type { LessonPluginData } from "@domain/entities/Plugin";
import type { PluginId } from "@domain/value-objects";
import { PluginId as PluginIdClass } from "@domain/value-objects";
import { withErrorHandling } from "@application/utils/withErrorHandling";
import { pluginManifestSchema } from "@infrastructure/schemas/pluginSchema";

/**
 * プラグインドメインの Interactor（Input Port 実装）
 *
 * IPluginInputPort を実装し、IPluginRepository（Output Port）に委譲する。
 * JSONインポート時のバリデーション・重複チェックも担当する。
 */
export class PluginInteractor implements IPluginInputPort {
  constructor(private readonly pluginRepository: IPluginRepository) {}

  async getAll(): Promise<Plugin[]> {
    return withErrorHandling(
      () => this.pluginRepository.findAll(),
      "PluginInteractor.getAll failed",
    );
  }

  async getById(id: PluginId): Promise<Plugin | null> {
    return withErrorHandling(
      () => this.pluginRepository.findById(id),
      "PluginInteractor.getById failed",
      { pluginId: id.value },
    );
  }

  async importFromJson(json: string): Promise<Plugin> {
    const parsed = JSON.parse(json);
    const manifest = pluginManifestSchema.parse(parsed);

    // 重複チェック（同じmetadata.idのプラグインが既にある場合は上書き）
    const existing = await this.pluginRepository.findByMetadataId(
      manifest.metadata.id,
    );

    const plugin = new Plugin({
      id: existing?.id ?? PluginIdClass.generate(),
      kerulabsPlugin: manifest.kerulabs_plugin,
      type: manifest.type,
      metadata: manifest.metadata,
      data: manifest.data as LessonPluginData,
      installedAt: new Date(),
    });

    await this.pluginRepository.save(plugin);
    return plugin;
  }

  async delete(id: PluginId): Promise<void> {
    return withErrorHandling(
      () => this.pluginRepository.delete(id),
      "PluginInteractor.delete failed",
      { pluginId: id.value },
    );
  }
}
