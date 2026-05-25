import type { Plugin } from "@domain/entities/Plugin";
import type { PluginId } from "@domain/value-objects";

export interface IPluginRepository {
  findAll(): Promise<Plugin[]>;
  findById(id: PluginId): Promise<Plugin | null>;
  findByMetadataId(metadataId: string): Promise<Plugin | null>;
  save(plugin: Plugin): Promise<void>;
  delete(id: PluginId): Promise<void>;
}
