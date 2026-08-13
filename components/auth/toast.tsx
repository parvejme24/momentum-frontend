"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { easeOut } from "@/components/home/motion";

type ToastItem = {
  id: number;
  message: string;
};

type ToastContextValue = {
  pushToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();

  const pushToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="toast"
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: easeOut }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
