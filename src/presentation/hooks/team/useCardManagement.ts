/**
 * @module useCardManagement
 * @description 選手・監督のカード（イエロー/レッド）状態管理フック。カード状態のサイクル切替と表示ON/OFFを提供する。
 */
import { useState, useCallback } from "react";
import type { CardStatus } from "../../components/three/SceneTypes";

/**
 * 選手・監督のカード (イエロー/レッド) 状態管理。
 *
 * カード状態のサイクル切替 (`none → yellow → double_yellow → red → none`) と
 * 表示 ON/OFF を提供する。
 *
 * @returns 選手インデックスごとのカード状態、監督カード状態、表示切替、および `cycleCard` ヘルパー。
 */
export function useCardManagement() {
  const [playerCards, setPlayerCards] = useState<Record<number, CardStatus>>(
    {},
  );
  const [managerCard, setManagerCard] = useState<CardStatus>("none");
  const [showCards, setShowCards] = useState(true);

  const cycleCard = useCallback((current: CardStatus): CardStatus => {
    const order: CardStatus[] = ["none", "yellow", "double_yellow", "red"];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  }, []);

  return {
    playerCards,
    setPlayerCards,
    managerCard,
    setManagerCard,
    showCards,
    setShowCards,
    cycleCard,
  };
}
