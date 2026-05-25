/**
 * @module Toast
 * @description トースト通知コンポーネントとContext Provider。成功/エラーメッセージの一時表示を提供する。
 */
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import type { ReactNode } from "react";
import { Z_INDEX } from "@shared/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- Context・Provider・Hookの意図的なコロケーション
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — 画面上部中央に固定 */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: Z_INDEX.TOAST }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDone={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Single toast item                                                  */
/* ------------------------------------------------------------------ */
const DURATION_MS = 3500;

const STYLE_MAP: Record<ToastType, string> = {
  success: "bg-emerald-600/90 border-emerald-400/50 text-white",
  error: "bg-red-600/90 border-red-400/50 text-white",
  info: "bg-slate-700/90 border-slate-500/50 text-white",
};

const ICON_MAP: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

function ToastItem({
  toast,
  onDone,
}: {
  toast: ToastMessage;
  onDone: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 開始アニメーション
    requestAnimationFrame(() => setVisible(true));
    let fadeOutTimer: ReturnType<typeof setTimeout> | null = null;
    const timer = setTimeout(() => {
      setVisible(false);
      fadeOutTimer = setTimeout(() => onDone(toast.id), 300);
    }, DURATION_MS);
    return () => {
      clearTimeout(timer);
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
    };
  }, [toast.id, onDone]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-2xl text-sm font-medium transition-all duration-300 ${
        STYLE_MAP[toast.type]
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {ICON_MAP[toast.type]}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
