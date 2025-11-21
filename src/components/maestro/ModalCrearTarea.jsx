// src/components/maestro/ModalCrearTarea.jsx
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function ModalCrearTarea({
  open,
  onClose,
  nuevoJuego,
  setNuevoJuego,
  grupos,
  onSubmit,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold text-blue-700">
                Nueva tarea / juego
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <input
              placeholder="Título de la tarea"
              value={nuevoJuego.titulo}
              onChange={(e) =>
                setNuevoJuego({ ...nuevoJuego, titulo: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />

            <textarea
              placeholder="Descripción o instrucciones"
              value={nuevoJuego.descripcion}
              onChange={(e) =>
                setNuevoJuego({ ...nuevoJuego, descripcion: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
            />

            <select
              value={nuevoJuego.grupo_id}
              onChange={(e) =>
                setNuevoJuego({ ...nuevoJuego, grupo_id: e.target.value })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="">Seleccionar grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                placeholder="Puntos"
                value={nuevoJuego.puntos}
                onChange={(e) =>
                  setNuevoJuego({ ...nuevoJuego, puntos: e.target.value })
                }
                className="border rounded-md p-2 w-28"
              />
              <input
                type="date"
                value={nuevoJuego.fecha_entrega}
                onChange={(e) =>
                  setNuevoJuego({
                    ...nuevoJuego,
                    fecha_entrega: e.target.value,
                  })
                }
                className="border rounded-md p-2 flex-1"
              />
            </div>

            <p className="text-xs text-gray-500">
              Por ahora las tareas se asignan al grupo completo. Más adelante
              puedes extenderlo para tareas individuales por alumno.
            </p>

            <button
              onClick={onSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Guardar tarea
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}