/**
 * @module IndexedDBTeamRepository
 * @description IndexedDBを使用したチームリポジトリの具象実装。チーム情報と所属選手の永続化・復元を担う。
 */
import type { ITeamRepository } from "@application/ports/output/repositories";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId, PlayerId } from "@domain/value-objects";
import { Color } from "@domain/value-objects/Color";
import { IndexedDBClient, TacticsDB } from "./IndexedDBClient";
import {
  teamRecordSchema,
  type TeamRecord,
  type PlayerRecord,
} from "@infrastructure/schemas/teamSchema";
import { z } from "zod";
import { withDB } from "./withDB";

/** TacticsDB["teams"]["value"] の型エイリアス — mapToPersistence の戻り値型に使用 */
type TeamDBValue = TacticsDB["teams"]["value"];

export class IndexedDBTeamRepository implements ITeamRepository {
  private client = IndexedDBClient.getInstance();

  async findAll(): Promise<Team[]> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.getAll("teams");
        const records = z.array(teamRecordSchema).parse(raw);
        return records.map(this.mapToDomain);
      },
      "Failed to fetch teams",
    );
  }

  async findById(id: TeamId): Promise<Team | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("teams", id.value);
        if (!raw) return null;
        const record = teamRecordSchema.parse(raw);
        return this.mapToDomain(record);
      },
      "Failed to fetch team by id",
      { id: id.value },
    );
  }

  async save(team: Team): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        const record = this.mapToPersistence(team);
        await db.put("teams", record);
      },
      "Failed to save team",
      { teamId: team.id.value },
    );
  }

  async delete(id: TeamId): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("teams", id.value);
      },
      "Failed to delete team",
      { id: id.value },
    );
  }

  protected mapToDomain(record: TeamRecord): Team {
    const players = (record.players || []).map(
      (p: PlayerRecord) =>
        new Player({
          id: new PlayerId(p.id),
          teamId: new TeamId(record.id),
          name: p.name,
          number: p.number,
          position: p.position || "mf",
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          nationality: p.nationality,
          club: p.club,
          leagueCountry: p.leagueCountry,
          imageUrl: p.imageUrl,
          mainVisualImageUrl: p.mainVisualImageUrl,
          note: p.note,
          status: p.status || "available",
        }),
    );

    return new Team({
      id: new TeamId(record.id),
      name: record.name,
      subtitle: record.subtitle,
      colors: {
        gk: Color.fromHex(record.colors.gk),
        main: Color.fromHex(record.colors.main),
      },
      availableFormations: record.availableFormations,
      players,
      flagType: record.flagType,
      headerGradient: record.headerGradient,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      country: record.country,
      defaultFormation: record.defaultFormation,
      selectedSquad: record.selectedSquad,
      manager: record.manager,
      playerCards: record.playerCards,
      managerCard: record.managerCard,
      availableTactics: record.availableTactics,
    });
  }

  protected mapToPersistence(team: Team): TeamDBValue {
    return {
      id: team.id.value,
      name: team.name,
      subtitle: team.subtitle,
      colors: {
        gk: team.colors.gk.toHex(),
        main: team.colors.main.toHex(),
      },
      availableFormations: [...team.availableFormations],
      players: team.players.map((p) => ({
        id: p.id.value,
        name: p.name,
        number: p.number,
        position: p.position,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
        nationality: p.nationality,
        club: p.club,
        leagueCountry: p.leagueCountry,
        imageUrl: p.imageUrl,
        mainVisualImageUrl: p.mainVisualImageUrl,
        note: p.note,
        status: p.status,
      })),
      flagType: team.flagType,
      headerGradient: team.headerGradient,
      country: team.country,
      defaultFormation: team.defaultFormation,
      selectedSquad: team.selectedSquad ? [...team.selectedSquad] : undefined,
      manager: team.manager,
      playerCards: team.playerCards ? { ...team.playerCards } : undefined,
      managerCard: team.managerCard,
      availableTactics: team.availableTactics
        ? Object.fromEntries(
            Object.entries(team.availableTactics).map(([k, v]) => [k, [...v]]),
          )
        : undefined,
      createdAt: team.createdAt.getTime(),
      updatedAt: team.updatedAt.getTime(),
    };
  }
}
