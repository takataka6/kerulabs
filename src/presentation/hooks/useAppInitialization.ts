import { useEffect, useState } from "react";
import { initializeApp } from "@infrastructure/bootstrap";
import { handleError } from "@shared/errors/handleError";

/**
 * アプリケーションの初期化を行うカスタムフック（薄いラッパー）。
 *
 * 実際の初期化処理（DBオープン、DIコンテナ組み立て、シードデータ投入）は
 * @infrastructure/bootstrap の initializeApp に委譲する。
 * これにより Presentation 層が Infrastructure 層の具象に直接依存するのを防ぐ。
 *
 * @returns isInitialized - 初期化完了フラグ
 * @returns initError - 初期化失敗時のエラー（null なら正常）
 */
export function useAppInitialization(): {
  isInitialized: boolean;
  initError: Error | null;
} {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        await initializeApp();
        setIsInitialized(true);
      } catch (error) {
        handleError(error, "database", "Failed to initialize database");
        setInitError(
          error instanceof Error
            ? error
            : new Error("Failed to initialize database"),
        );
      }
    };

    run();
  }, []);

  return { isInitialized, initError };
}
