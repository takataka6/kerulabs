/**
 * @module useCanvasCallbacks
 * @description Canvas操作に対する安定したコールバック群を提供するフック。refベースのパターンで参照安定性を保証する。
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { DEFAULT_BALL_PASS_COLOR } from "@shared/constants";
import { rafThrottle } from "@shared/utils/rafThrottle";
import type { useTacticsOrchestration } from "../tactic";
import type { useBallPlacement, useConnectionLines } from "../field";
import type { useOpponents } from "../field";
import type { useUIVisibility } from "../ui";

interface CanvasDeps {
  tOrch: ReturnType<typeof useTacticsOrchestration>;
  ballHook: ReturnType<typeof useBallPlacement>;
  connLines: ReturnType<typeof useConnectionLines>;
  opponentsHook: ReturnType<typeof useOpponents>;
  ui: ReturnType<typeof useUIVisibility>;
  pushCurrentSnapshot: () => void;
}

/**
 * Canvas 向けの安定したコールバック群を提供するフック。
 *
 * ref ベースのパターンにより、依存フックが変わっても
 * コールバックの参照は安定し、Canvas の不要な再レンダリングを防ぐ。
 */
export function useCanvasCallbacks(deps: CanvasDeps) {
  const depsRef = useRef(deps);
  useEffect(() => {
    depsRef.current = deps;
  });

  const handleFieldClick = useCallback((pos: { x: number; z: number }) => {
    const { opponentsHook: opp, ui: u } = depsRef.current;
    opp.handleFieldClick(pos, u.isDraggingObject);
  }, []);

  const handleBallPlace = useCallback((pos: { x: number; z: number }) => {
    const { tOrch: t, ballHook: b } = depsRef.current;
    if (t.ballPassCreationMode) {
      if (t.ballPassStartPos === null) {
        t.setBallPassStartPos(pos);
      } else {
        t.tacticCreation.addBallPassByCoords(
          t.ballPassStartPos.x,
          t.ballPassStartPos.z,
          pos.x,
          pos.z,
          DEFAULT_BALL_PASS_COLOR,
          t.ballPassTrajectoryType,
        );
        t.setBallPassStartPos(null);
        t.setBallPassPendingEndPos(null);
      }
    } else if (t.isCreationBallPositionStep) {
      t.tacticCreation.setBallPosition(pos);
    } else if (t.isCreationBallTrajectoryStep) {
      t.tacticCreation.setBallTrajectory({
        endX: pos.x,
        endZ: pos.z,
        color: DEFAULT_BALL_PASS_COLOR,
        trajectoryType:
          t.tacticCreation.creation?.ballTrajectory?.trajectoryType ?? "high",
      });
    } else {
      b.handleBallPlace(pos);
    }
  }, []);

  // RAF スロットル: ボールドラッグは毎フレーム setState を呼ぶため、
  // 同一フレーム内の複数呼び出しを最後の1回に集約する
  /* eslint-disable react-hooks/refs -- depsRef はイベントハンドラー内でのみ読み取られ、レンダリング中には読み取られない */
  const throttledBallDrag = useMemo(
    () =>
      rafThrottle((pos: { x: number; z: number }) => {
        const { tOrch: t, ballHook: b } = depsRef.current;
        if (t.isCreationBallPositionStep) {
          t.tacticCreation.setBallPosition(pos);
        } else {
          b.handleBallDrag(pos);
        }
      }),
    [],
  );
  /* eslint-enable react-hooks/refs */
  useEffect(() => () => throttledBallDrag.cancel(), [throttledBallDrag]);

  const handleBallDrag = useCallback(
    (pos: { x: number; z: number }) => {
      throttledBallDrag(pos);
    },
    [throttledBallDrag],
  );

  const handleBallRemove = useCallback(() => {
    const { tOrch: t, ballHook: b } = depsRef.current;
    if (t.isCreationBallPositionStep) {
      t.tacticCreation.setBallPosition(null);
    } else {
      b.handleBallRemove();
    }
  }, []);

  const handleDragStart = useCallback(() => {
    depsRef.current.ui.setIsDraggingObject(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    const { ui: u, pushCurrentSnapshot: push } = depsRef.current;
    u.setIsDraggingObject(false);
    requestAnimationFrame(() => push());
  }, []);

  // RAF スロットル: ポインター移動イベントは毎ピクセルで発火するため、
  // プレビューライン描画の更新を1フレームに1回に抑制する
  /* eslint-disable react-hooks/refs -- depsRef はイベントハンドラー内でのみ読み取られ、レンダリング中には読み取られない */
  const throttledLinePointerMove = useMemo(
    () =>
      rafThrottle((pos: { x: number; z: number }) => {
        const { connLines: cl, tOrch: t } = depsRef.current;
        if (cl.lineDrawingMode) {
          cl.setPendingLineEndPos(pos);
        }
        if (t.ballPassCreationMode && t.ballPassStartPos !== null) {
          t.setBallPassPendingEndPos(pos);
        }
      }),
    [],
  );
  /* eslint-enable react-hooks/refs */
  useEffect(
    () => () => throttledLinePointerMove.cancel(),
    [throttledLinePointerMove],
  );

  const handleLinePointerMove = useCallback(
    (pos: { x: number; z: number }) => {
      throttledLinePointerMove(pos);
    },
    [throttledLinePointerMove],
  );

  const handlePlayerDragEnd = useCallback(
    (index: number, pos: { x: number; z: number }) => {
      const { tOrch: t, ui: u } = depsRef.current;
      u.setIsDraggingObject(false);
      t.handlePlayerDragEnd(index, pos);
    },
    [],
  );

  const handleGroupDragEnd = useCallback(
    (
      positions: Array<{
        type: "player" | "opponent";
        id: number;
        pos: { x: number; z: number };
      }>,
    ) => {
      const {
        tOrch: t,
        opponentsHook: opp,
        ui: u,
        pushCurrentSnapshot: push,
      } = depsRef.current;
      u.setIsDraggingObject(false);

      // プレイヤーの位置を一括コミット
      const playerUpdates = positions.filter((p) => p.type === "player");
      if (playerUpdates.length > 0) {
        t.setManualPlayerPositions(
          (prev: Record<number, { x: number; z: number }>) => {
            const next = { ...prev };
            for (const u of playerUpdates) {
              next[u.id] = u.pos;
            }
            return next;
          },
        );
      }

      // 相手マーカーの位置を一括コミット
      const opponentUpdates = positions.filter((p) => p.type === "opponent");
      if (opponentUpdates.length > 0) {
        opp.setOpponents(
          (
            prev: Array<{
              id: number;
              x: number;
              z: number;
              playerNumber?: number;
              playerName?: string;
              color?: string;
            }>,
          ) =>
            prev.map((o) => {
              const update = opponentUpdates.find((u) => u.id === o.id);
              return update ? { ...o, x: update.pos.x, z: update.pos.z } : o;
            }),
        );
      }

      requestAnimationFrame(() => push());
    },
    [],
  );

  const handleCameraActionDone = useCallback(() => {
    depsRef.current.ui.setCameraAction(null);
  }, []);

  return {
    handleFieldClick,
    handleBallPlace,
    handleBallDrag,
    handleBallRemove,
    handleDragStart,
    handleDragEnd,
    handlePlayerDragEnd,
    handleGroupDragEnd,
    handleLinePointerMove,
    handleCameraActionDone,
  };
}
