// ---------------------------------------------
// ResultadosModal.jsx
// Modal para mostrar los resultados de los alumnos
// ---------------------------------------------

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ResultadosModal({
  open,
  onClose,
  tarea,
  resultados,
  busqueda,
  setBusqueda,
  onCalificar,
  onVerHistorial,
}) {

  if (!open) return null;

  const filtrados = resultados.filter((r) =>
    r.alumno.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* MODAL */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>

            {/* Título */}
            <h2 className="text-xl font-semibold text-blue-700 mb-1">
              Resultados – {tarea?.titulo}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Grupo: <b>{tarea?.grupo_nombre}</b> · Puntos:{" "}
              <b>{tarea?.puntos}</b>
            </p>

            {/* Buscador */}
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border rounded-md p-2 mb-4 text-sm focus:ring-2 focus:ring-blue-400"
            />

            {/* Si no hay resultados */}
            {resultados.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                <p className="font-medium">
                  Aún no hay resultados para esta tarea.
                </p>
                <p className="text-sm">
                  Los alumnos no han completado esta actividad.
                </p>
              </div>
            )}

            {/* Gráfica */}
            {resultados.length > 0 && (
              <div className="h-60 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Calificaciones por alumno
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filtrados.map((r) => ({
                      nombre: r.alumno,
                      calificacion: Number(r.calificacion || 0),
                    }))}
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
                    <Bar dataKey="calificacion" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Lista de resultados */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {filtrados.map((r, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <p className="font-semibold text-blue-700">{r.alumno}</p>

                  <p className="text-sm">
                    Estado:{" "}
                    {r.completada ? (
                      <span className="text-green-600 font-bold">
                        ✔ Completada
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">
                        ✖ Pendiente
                      </span>
                    )}
                  </p>

                  {r.completada && (
                    <>
                      <p className="text-sm">
                        Calificación:{" "}
                        <b>{r.calificacion ?? "Sin calificar"}</b> /{" "}
                        {tarea?.puntos}
                      </p>

                      <p className="text-sm">
                        Comentario del maestro:{" "}
                        <i>{r.comentario_maestro || "Sin comentarios"}</i>
                      </p>
                    </>
                  )}

                  {r.completada && !r.calificacion && (
                    <div className="mt-2 p-2 bg-white border rounded-md">
                      <label className="text-sm font-semibold text-gray-700">
                        Calificar alumno:
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="border rounded-md p-1 w-20 ml-2"
                        onChange={(e) => {
                          r._califTemp = {
                            ...(r._califTemp || {}),
                            calificacion: e.target.value,
                          };
                        }}
                      />

                      <textarea
                        placeholder="Comentario del maestro..."
                        className="border rounded-md p-2 w-full text-sm mt-2"
                        rows={2}
                        onChange={(e) => {
                          r._califTemp = {
                            ...(r._califTemp || {}),
                            comentario: e.target.value,
                          };
                        }}
                      />

                      <button
                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                        onClick={() => {
  console.log("📌 Guardando calificación:", r._califTemp);

  if (!r._califTemp?.calificacion) {
    alert("Ingresa una calificación");
    return;
  }

  onCalificar({
    tarea_id: tarea.id,
    alumno_id: r.alumno_id,
    calificacion: Number(r._califTemp.calificacion),
    comentario: r._califTemp.comentario || "",
  });
  onClose();
}}
                      >
                        Guardar
                      </button>

                      <button
  className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
  onClick={() => onVerHistorial(r)}
>
  🗂 Ver historial
</button>
                    </div>
                  )}
                </div>
              ))}

              {filtrados.length === 0 && resultados.length > 0 && (
                <p className="text-gray-500 text-sm text-center pt-2">
                  No hay coincidencias con la búsqueda.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}