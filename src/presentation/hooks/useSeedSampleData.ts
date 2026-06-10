/**
 * @module useSeedSampleData
 * @description サンプルデータ（チーム・用語集・マニュアル）を一括挿入するフック。
 * ホームページのボタンから呼び出し、確認後にデータを投入する。
 * 失敗時は保存済みデータをロールバックしてアトミック性を保証する。
 */
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { Glossary } from "@domain/entities/Glossary";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamId } from "@domain/value-objects/TeamId";
import { GlossaryId } from "@domain/value-objects/GlossaryId";
import { TeamManualId } from "@domain/value-objects/TeamManualId";
import { queryKeys } from "@shared/constants/queryKeys";
import { handleError } from "@shared/errors";
import type { TranslationKey } from "@shared/i18n/translations";
import {
  SAMPLE_TEAM_A,
  SAMPLE_TEAM_B,
  getSamplePlayersA,
  getSamplePlayersB,
  SAMPLE_GLOSSARY,
  SAMPLE_MANUAL,
} from "@infrastructure/seed/sampleData";

export type SeedTargets = {
  teams?: boolean;
  glossary?: boolean;
  manual?: boolean;
};

export function useSeedSampleData(
  showToast: (msg: string, type: "success" | "error") => void,
  t: (key: TranslationKey) => string,
  targets?: SeedTargets,
) {
  const [isSeeding, setIsSeeding] = useState(false);
  const queryClient = useQueryClient();

  // targetsが未指定の場合はすべてを対象にする（後方互換）
  const seedTeams = !targets || targets.teams === true;
  const seedGlossary = !targets || targets.glossary === true;
  const seedManual = !targets || targets.manual === true;

  const handleSeed = useCallback(async () => {
    setIsSeeding(true);

    // ロールバック用に保存済みエンティティのIDを記録
    const savedTeamIds: string[] = [];
    let savedGlossaryId: string | null = null;
    let savedManualId: string | null = null;

    try {
      const { teamInteractor, glossaryInteractor, teamManualInteractor } =
        getContainer();

      // ── 対象エンティティを事前に構築（ID生成・バリデーション） ──
      let teamA: Team | null = null;
      if (seedTeams) {
        teamA = Team.create(SAMPLE_TEAM_A);
        for (const p of getSamplePlayersA(teamA.id)) {
          teamA.addPlayer(Player.create({ ...p, teamId: teamA.id }));
        }

        const teamB = Team.create(SAMPLE_TEAM_B);
        for (const p of getSamplePlayersB(teamB.id)) {
          teamB.addPlayer(Player.create({ ...p, teamId: teamB.id }));
        }

        await teamInteractor.save(teamA);
        savedTeamIds.push(teamA.id.value);
        await teamInteractor.save(teamB);
        savedTeamIds.push(teamB.id.value);
      }

      if (seedGlossary) {
        const glossary = Glossary.create(
          SAMPLE_GLOSSARY.name,
          SAMPLE_GLOSSARY.description,
        );
        for (const term of SAMPLE_GLOSSARY.terms) {
          glossary.addTerm(term);
        }
        await glossaryInteractor.save(glossary);
        savedGlossaryId = glossary.id.value;
      }

      if (seedManual) {
        const manualTeamId = teamA?.id.value ?? "sample";
        const manual = TeamManual.create(
          SAMPLE_MANUAL.name,
          SAMPLE_MANUAL.description,
          manualTeamId,
        );
        for (const section of SAMPLE_MANUAL.sections) {
          manual.addSection({
            title: section.title,
            category: section.category,
            formations: section.formations,
            items: [],
          });
          const addedSection = manual.sections[manual.sections.length - 1];
          for (const item of section.items) {
            manual.addItem(addedSection.id, item);
          }
        }
        await teamManualInteractor.save(manual);
        savedManualId = manual.id.value;
      }

      // ── キャッシュ更新 ──
      const invalidations: Promise<void>[] = [];
      if (seedTeams)
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.all }),
        );
      if (seedGlossary)
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.glossaries.all,
          }),
        );
      if (seedManual)
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.teamManuals.all,
          }),
        );
      await Promise.all(invalidations);

      showToast(t("app.seed.success"), "success");
    } catch (error) {
      // ── ロールバック: 保存済みデータを削除 ──
      try {
        const container = getContainer();
        await rollback(
          container.teamInteractor,
          container.glossaryInteractor,
          container.teamManualInteractor,
          savedTeamIds,
          savedGlossaryId,
          savedManualId,
        );
      } catch {
        // コンテナ未初期化の場合はロールバック不可 — 無視
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.glossaries.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.teamManuals.all }),
      ]);

      handleError(error, "database", "Failed to seed sample data", {
        toast: { show: showToast, message: t("app.seed.error") },
      });
    } finally {
      setIsSeeding(false);
    }
  }, [showToast, t, queryClient, seedTeams, seedGlossary, seedManual]);

  return { handleSeed, isSeeding };
}

/** 部分的に保存されたサンプルデータを削除する */
async function rollback(
  teamInteractor: Pick<
    import("@application/ports/input/ITeamInputPort").ITeamInputPort,
    "delete"
  >,
  glossaryInteractor: Pick<
    import("@application/ports/input/IGlossaryInputPort").IGlossaryInputPort,
    "delete"
  >,
  teamManualInteractor: Pick<
    import("@application/ports/input/ITeamManualInputPort").ITeamManualInputPort,
    "delete"
  >,
  teamIds: string[],
  glossaryId: string | null,
  manualId: string | null,
): Promise<void> {
  const ops: Promise<void>[] = [];
  for (const id of teamIds) {
    ops.push(teamInteractor.delete(new TeamId(id)));
  }
  if (glossaryId) {
    ops.push(glossaryInteractor.delete(new GlossaryId(glossaryId)));
  }
  if (manualId) {
    ops.push(teamManualInteractor.delete(new TeamManualId(manualId)));
  }
  // ロールバック自体のエラーは握りつぶす（元のエラーが優先）
  await Promise.allSettled(ops);
}
