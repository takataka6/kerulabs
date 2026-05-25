/**
 * @module AccessibleModal
 * @description アクセシブルなモーダルダイアログコンポーネント。フォーカストラップ・ESCキー閉じ・ARIA属性を提供する。
 */
import { useEffect, useRef, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { IS_ELECTRON } from "@shared/constants";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
}

export function AccessibleModal({
  isOpen,
  onClose,
  ariaLabelledBy,
  ariaLabel,
  children,
  className = "",
  overlayClassName = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
  overlayStyle,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    }
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!isOpen) return null;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- modal backdrop dismissal; keyboard close handled via Escape key
    <div
      className={overlayClassName}
      style={
        {
          ...overlayStyle,
          ...(IS_ELECTRON && { WebkitAppRegion: "no-drag" }),
        } as React.CSSProperties
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- focus trap requires onKeyDown on dialog element */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={className}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
