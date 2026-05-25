/**
 * @module PluginLessonPageRoute
 * @description プラグインレッスンのルートコンポーネント。URLパラメータからレッスンIDを取得して表示する。
 */
import { useParams, Navigate } from "react-router-dom";
import { PluginLessonPage } from "@presentation/components/code-lab/plugin/PluginLessonPage";

export function PluginLessonPageRoute() {
  const { lessonId } = useParams<{ lessonId: string }>();

  if (!lessonId) {
    return <Navigate to="/code-lab" replace />;
  }

  return <PluginLessonPage lessonId={lessonId} />;
}
