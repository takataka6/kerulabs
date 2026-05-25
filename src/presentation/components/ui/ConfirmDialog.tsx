/**
 * @module ConfirmDialog
 * @description 確認ダイアログコンポーネントとContext Provider。Promise ベースの confirm() フックを提供する。
 */
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { AccessibleModal } from "./AccessibleModal";

// ── 型定義 ──────────────────────────────────────────────────

interface ConfirmOptions {
  /** ダイアログのタイトル */
  title?: string;
  /** 本文メッセージ（改行は <br/> に変換） */
  message: string;
  /** 確認ボタンのラベル（デフォルト: "OK"） */
  confirmLabel?: string;
  /** キャンセルボタンのラベル（デフォルト: "キャンセル"）。null でキャンセルボタン非表示（alert モード） */
  cancelLabel?: string | null;
  /** 確認ボタンの色（デフォルト: "blue"） */
  variant?: "blue" | "red";
}

interface ConfirmContextValue {
  /** confirm() の代替。Promise<boolean> を返す。 */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** alert() の代替。OK ボタンのみの情報ダイアログ。 */
  alert: (options: Omit<ConfirmOptions, "cancelLabel">) => Promise<void>;
}

// ── Context ─────────────────────────────────────────────────

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- Context・Provider・Hookの意図的なコロケーション
export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}

// ── Provider ────────────────────────────────────────────────

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    message: "",
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setDialog({ ...options, isOpen: true });
    });
  }, []);

  const alert = useCallback(
    (options: Omit<ConfirmOptions, "cancelLabel">): Promise<void> => {
      return new Promise<void>((resolve) => {
        resolveRef.current = () => resolve();
        setDialog({ ...options, cancelLabel: null, isOpen: true });
      });
    },
    [],
  );

  const handleClose = useCallback((result: boolean) => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  // アンマウント時に保留中の Promise を false で解決してメモリリークを防止
  useEffect(() => {
    return () => {
      resolveRef.current?.(false);
      resolveRef.current = null;
    };
  }, []);

  const variant = dialog.variant ?? "blue";
  const confirmBtnClass =
    variant === "red"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      <AccessibleModal
        isOpen={dialog.isOpen}
        onClose={() => handleClose(false)}
        ariaLabel={dialog.title ?? "確認ダイアログ"}
        className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-700"
      >
        <div className="p-6">
          {dialog.title && (
            <h2 className="text-lg font-bold text-white mb-3">
              {dialog.title}
            </h2>
          )}
          <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
            {dialog.message}
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          {dialog.cancelLabel !== null && (
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
            >
              {dialog.cancelLabel ?? "キャンセル"}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleClose(true)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${confirmBtnClass}`}
          >
            {dialog.confirmLabel ?? "OK"}
          </button>
        </div>
      </AccessibleModal>
    </ConfirmContext.Provider>
  );
}
