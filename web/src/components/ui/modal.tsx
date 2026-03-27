"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-lvl-carbon rounded-xl shadow-2xl border border-lvl-slate",
          "animate-in fade-in zoom-in-95 duration-200",
          className,
        )}
      >
        {(title || true) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            {title && (
              <h2 className="font-display text-xl font-bold uppercase text-lvl-white">
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-lg p-1.5 text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

export { Modal, type ModalProps };
