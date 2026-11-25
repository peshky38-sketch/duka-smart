import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(() => {});

// wrap the app in <ToastProvider>, then call useToast()("Saved") or useToast()("Oops", "error")
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((text, kind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))), 3300);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3650);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={"toast " + t.kind + (t.leaving ? " leaving" : "")}>
            <i>{t.kind === "error" ? "!" : "✓"}</i>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
