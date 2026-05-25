import type { IPluginRepository } from "@application/ports/output/repositories";
import { Plugin } from "@domain/entities/Plugin";
import type { LessonPluginData } from "@domain/entities/Plugin";
import { PluginId } from "@domain/value-objects";
import { IndexedDBClient } from "./IndexedDBClient";
import { pluginRecordSchema } from "@infrastructure/schemas/pluginSchema";
import { z } from "zod";
import { withDB } from "./withDB";

/**
 * IndexedDB を使っ��� IPluginRepository の具象実装。
 */
export class IndexedDBPluginRepository implements IPluginRepository {
  private client = IndexedDBClient.getInstance();

  async findAll(): Promise<Plugin[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAll("plugins");
        const records = z.array(pluginRecordSchema).parse(raw);
        return records.map(this.mapToDomain);
      },
      "Failed to fetch plugins",
    );
  }

  async findById(id: PluginId): Promise<Plugin | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("plugins", id.value);
        if (!raw) return null;
        const record = pluginRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch plugin by id",
      { id: id.value },
    );
  }

  async findByMetadataId(metadataId: string): Promise<Plugin | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getFromIndex(
          "plugins",
          "by-metadata-id",
          metadataId,
        );
        if (!raw) return null;
        const record = pluginRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch plugin by metadata id",
      { metadataId },
    );
  }

  async save(plugin: Plugin): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.put("plugins", this.mapToPersistence(plugin));
      },
      "Failed to save plugin",
      { pluginId: plugin.id.value },
    );
  }

  async delete(id: PluginId): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("plugins", id.value);
      },
      "Failed to delete plugin",
      { id: id.value },
    );
  }

  private mapToDomain(record: z.infer<typeof pluginRecordSchema>): Plugin {
    return new Plugin({
      id: new PluginId(record.id),
      kerulabsPlugin: record.kerulabs_plugin,
      type: record.type,
      metadata: record.metadata,
      data: record.data as LessonPluginData,
      installedAt: new Date(record.installedAt),
    });
  }

  private mapToPersistence(plugin: Plugin) {
    return {
      id: plugin.id.value,
      kerulabs_plugin: plugin.kerulabsPlugin,
      type: plugin.type as "lesson",
      metadata: plugin.metadata,
      data: plugin.data,
      installedAt: plugin.installedAt.getTime(),
    };
  }
}
