import { motion, AnimatePresence } from "framer-motion";

export default function ModalEditarTarea({
  open,
  onClose,
  tarea,
  editFields,
  setEditFields,
  onGuardar,
}) {
  if (!open || !tarea) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg"
        >
          <h2 className="text-lg font-semibold text-blue-700 mb-3">
            Editar tarea
          </h2>

          {/* Título */}
          <label className="text-sm text-gray-700">Título</label>
          <input
            className="border rounded-md px-3 py-2 w-full mb-3"
            value={editFields.titulo}
            onChange={(e) =>
              setEditFields({ ...editFields, titulo: e.target.value })
            }
          />

          {/* Descripción */}
          <label className="text-sm text-gray-700">Descripción</label>
          <textarea
            className="border rounded-md px-3 py-2 w-full mb-3"
            rows={3}
            value={editFields.descripcion}
            onChange={(e) =>
              setEditFields({ ...editFields, descripcion: e.target.value })
            }
          />

          {/* Puntos + Fecha */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-sm text-gray-700">Puntos</label>
              <input
                type="number"
                className="border rounded-md px-3 py-2 w-full"
                value={editFields.puntos}
                onChange={(e) =>
                  setEditFields({ ...editFields, puntos: e.target.value })
                }
              />
            </div>

            <div className="flex-1">
              <label className="text-sm text-gray-700">Fecha entrega</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 w-full"
                value={editFields.fecha_entrega}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    fecha_entrega: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={onGuardar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Guardar cambios
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}