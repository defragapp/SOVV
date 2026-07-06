"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...toast, id }])
    const duration = toast.duration ?? 4000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto"
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 border backdrop-blur-md shadow-lg max-w-sm ${
                  toast.type === "success" ? "border-[#e0743a]/30 bg-[#08070a]/95" :
                  toast.type === "error" ? "border-red-400/30 bg-[#08070a]/95" :
                  toast.type === "warning" ? "border-yellow-400/30 bg-[#08070a]/95" :
                  "border-white/[0.1] bg-[#08070a]/95"
                }`}
                style={{ borderRadius: "var(--radius-container)" }}
              >
                <span className={`w-1.5 h-1.5 rounded-sm shrink-0 ${
                  toast.type === "success" ? "bg-[#e0743a]/60" :
                  toast.type === "error" ? "bg-red-400/60" :
                  toast.type === "warning" ? "bg-yellow-400/60" :
                  "bg-white/30"
                }`} />
                <p className="text-[13px] text-[#f4efe9] leading-snug flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-[#4f4b47] hover:text-[#76716b] transition-colors text-[10px] shrink-0"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
