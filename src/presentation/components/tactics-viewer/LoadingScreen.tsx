/**
 * @module LoadingScreen
 * @description データ読み込み中のローディング画面コンポーネント。スピナーと進捗メッセージを表示する。
 */
import { memo } from "react";

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen = memo(function LoadingScreen({
  message,
}: LoadingScreenProps) {
  return (
    <div
      className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center"
      role="status"
      aria-busy="true"
      aria-label={message}
    >
      <div className="text-center">
        <div className="relative">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 mx-auto mb-6 shadow-lg shadow-blue-500/20"
            aria-hidden="true"
          ></div>
          <div
            className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-500 opacity-20 mx-auto"
            aria-hidden="true"
          ></div>
        </div>
        <p className="text-slate-400 text-lg font-light tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
});
