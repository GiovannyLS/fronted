// src/components/maestro/ToastsContainer.jsx
import { AnimatePresence, motion } from "framer-motion";

export default function ToastsContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
            className={`px-3 py-2 rounded-lg shadow text-sm text-white ${
              t.type === "success"
                ? "bg-emerald-500"
                : t.type === "error"
                ? "bg-red-500"
                : "bg-slate-600"
            }`}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}