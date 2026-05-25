import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";

const teamId = TeamId.generate();

export function createMockPlayers(tid: TeamId = teamId): Player[] {
  const data: [string, number, "gk" | "df" | "mf" | "fw", string?, string?][] =
    [
      ["田中 太郎", 1, "gk", "Japan", "FC Alpha"],
      ["佐藤 二郎", 2, "df", "Japan", "FC Bravo"],
      ["鈴木 三郎", 3, "df", "Japan", "FC Charlie"],
      ["高橋 四郎", 4, "df", "Brazil", "FC Delta"],
      ["伊藤 五郎", 5, "df", "Japan", "FC Echo"],
      ["渡辺 六郎", 6, "mf", "Spain", "FC Foxtrot"],
      ["山本 七郎", 7, "mf", "Japan", "FC Golf"],
      ["中村 八郎", 8, "mf", "Argentina", "FC Hotel"],
      ["小林 九郎", 9, "fw", "Japan", "FC India"],
      ["加藤 十郎", 10, "mf", "Japan", "FC Juliet"],
      ["吉田 十一", 11, "fw", "France", "FC Kilo"],
    ];
  return data.map(([name, number, pos, nat, club]) =>
    Player.create({
      name,
      number,
      teamId: tid,
      position: pos,
      nationality: nat,
      club,
    }),
  );
}

export function createMockTeam(): Team {
  const team = Team.create({
    name: "サンプルFC",
    subtitle: "サンプルリーグ",
    colors: { gk: "#ffcc00", main: "#0055ff" },
    availableFormations: ["4-3-3", "4-4-2", "3-5-2"],
    flagType: "japan",
    headerGradient: "from-blue-900 to-blue-700",
    country: "Japan",
    defaultFormation: "4-3-3",
    manager: "山田 監督",
  });
  for (const p of createMockPlayers(team.id)) {
    team.addPlayer(p);
  }
  return team;
}
