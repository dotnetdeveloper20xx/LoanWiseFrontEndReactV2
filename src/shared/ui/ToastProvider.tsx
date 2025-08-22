import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from "react";

type Toast = { id: string; kind: "success" | "error" | "info"; msg: string };
type ToastCtx = { push: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[280px] max-w-sm rounded shadow-lg p-3 text-sm ${
              t.kind === "success"
                ? "bg-green-600 text-white"
                : t.kind === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-white"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
