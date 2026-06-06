/**
 * ユーザー設定の永続化を抽象化するポートインターフェース。
 *
 * LanguageContext や useBackgroundSettings の設定操作を統一し、
 * テスタビリティとレイヤー整合性を向上させる。
 * 具象実装は IndexedDBPreferencesService（インメモリキャッシュ + write-through）。
 */

import type { SceneBackgroundPreferenceV1 } from "@shared/types";

/** 設定キーと値型のマッピング */
export interface PreferenceMap {
  language: "ja" | "en";
  tacticsViewerGuideDismissed: boolean;
  sceneBackground: SceneBackgroundPreferenceV1;
  sceneBackgroundImageUrl: string;
  sceneBackgroundImageSaturation: number;
  sceneBackgroundImageBrightness: number;
  pitchColor: string;
  pitchOpacity: number;
}

export interface IPreferencesService {
  get<K extends keyof PreferenceMap>(key: K): PreferenceMap[K];
  set<K extends keyof PreferenceMap>(key: K, value: PreferenceMap[K]): void;
  remove(key: keyof PreferenceMap): void;
}
