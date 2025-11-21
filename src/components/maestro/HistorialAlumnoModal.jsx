// src/components/maestro/HistorialAlumnoModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function HistorialAlumnoModal({
  open,
  onClose,
  alumno,
  historial,
  COLORS,
  formatFecha,
}) {
  if (!alumno) return null;

  const dataChart = historial.map((h) => ({
    nombre: h.titulo,
    calificacion: Number(h.calificacion || 0),
  }));

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
            className="bg-white rounded-xl shadow-lg p-6 w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-xl font-semibold text-blue-700">
                  Historial de tareas
                </h3>
                <p className="text-sm text-gray-500">
                  Alumno: <b>{alumno.nombre}</b>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            {/* Gráfica de rendimiento */}
            {historial.length > 0 && (
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">
                  Rendimiento por tarea
                </h4>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataChart}
                      margin={{ top: 10, right: 20, left: -20, bottom: 40 }}
                    >
                      <XAxis
                        dataKey="nombre"
                        angle={-15}
                        textAnchor="end"
                        interval={0}
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="calificacion" fill={COLORS[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Lista de tareas */}
            <div className="space-y-3">
              {historial.length === 0 && (
                <p className="text-sm text-gray-500">
                  Aún no hay tareas registradas para este alumno.
                </p>
              )}

              {historial.map((h, idx) => (
                <div
                  key={h.tarea_id || idx}
                  className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <p className="font-semibold text-blue-700">{h.titulo}</p>
                  <p className="text-sm text-gray-600">
                    Grupo: <b>{h.grupo_nombre}</b>
                    <br />
                    Estado:{" "}
                    {h.completada ? (
                      <span className="text-green-600 font-bold">
                        ✔ Completada
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">
                        ✖ Pendiente
                      </span>
                    )}
                    <br />
                    Calificación:{" "}
                    <b>
                      {h.calificacion != null
                        ? `${h.calificacion} / ${h.puntos}`
                        : "Sin calificar"}
                    </b>
                    <br />
                    {h.fecha_completada && (
                      <>
                        Fecha de entrega:{" "}
                        {formatFecha(h.fecha_completada)}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}