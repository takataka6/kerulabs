import { Formation } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { FormationId } from "@domain/value-objects/FormationId";
import type { PositionCategory } from "@shared/types/PositionCategory";

interface PositionDef {
  pos: string;
  x: number;
  z: number;
  category: PositionCategory;
}

function buildFormation(name: string, positions: PositionDef[]): Formation {
  const formationPositions = positions.map((p) => ({
    pos: p.pos,
    position: Position.create(p.x, p.z),
    category: p.category,
  }));
  const roleMap = new Map(positions.map((p, i) => [p.pos, i]));
  return new Formation({
    id: new FormationId(name),
    name,
    type: "standard",
    positions: formationPositions,
    roleMap,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    gameMode: "football",
  });
}

export function createMock433(): Formation {
  return buildFormation("4-3-3", [
    { pos: "GK", x: 0, z: 0.9, category: "gk" },
    { pos: "LB", x: -0.35, z: 0.6, category: "df" },
    { pos: "CB1", x: -0.12, z: 0.65, category: "df" },
    { pos: "CB2", x: 0.12, z: 0.65, category: "df" },
    { pos: "RB", x: 0.35, z: 0.6, category: "df" },
    { pos: "CM1", x: -0.2, z: 0.35, category: "mf" },
    { pos: "CM2", x: 0, z: 0.4, category: "mf" },
    { pos: "CM3", x: 0.2, z: 0.35, category: "mf" },
    { pos: "LW", x: -0.35, z: 0.1, category: "fw" },
    { pos: "ST", x: 0, z: 0.05, category: "fw" },
    { pos: "RW", x: 0.35, z: 0.1, category: "fw" },
  ]);
}

export function createMock442(): Formation {
  return buildFormation("4-4-2", [
    { pos: "GK", x: 0, z: 0.9, category: "gk" },
    { pos: "LB", x: -0.35, z: 0.6, category: "df" },
    { pos: "CB1", x: -0.12, z: 0.65, category: "df" },
    { pos: "CB2", x: 0.12, z: 0.65, category: "df" },
    { pos: "RB", x: 0.35, z: 0.6, category: "df" },
    { pos: "LM", x: -0.35, z: 0.35, category: "mf" },
    { pos: "CM1", x: -0.12, z: 0.4, category: "mf" },
    { pos: "CM2", x: 0.12, z: 0.4, category: "mf" },
    { pos: "RM", x: 0.35, z: 0.35, category: "mf" },
    { pos: "ST1", x: -0.12, z: 0.1, category: "fw" },
    { pos: "ST2", x: 0.12, z: 0.1, category: "fw" },
  ]);
}
