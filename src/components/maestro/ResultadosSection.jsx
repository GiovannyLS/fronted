// src/components/maestro/ResultadosSection.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import { useState } from "react";

export default function ResultadosSection({
  tareasResultados,
  tareaSeleccionada,
  setTareaSeleccionada,
  resultadosTarea,
  busquedaResultados,
  setBusquedaResultados,
  COLORS,
  onVerResultadosDeTarea,
  onAbrirHistorialAlumno,
}) {
  // agrupar tareas por grupo
  const tareasPorGrupo = tareasResultados.reduce((acc, t) => {
    const key = t.grupo_nombre || "Sin grupo";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const tareasParaGraficas = tareasResultados.map((t) => ({
    nombre: t.titulo,
    completadas: Number(t.completados || 0),
    total: Number(t.total_alumnos || 0),
  }));

  const tareaParaPie = tareaSeleccionada || tareasResultados[0];

  const [openModal, setOpenModal] = useState(false);
  const [modalTarea, setModalTarea] = useState(null);
  const [modalResultados, setModalResultados] = useState([]);
  const handleOpenModal = async (t) => {
    setModalTarea(t);
    try {
      const res = await onVerResultadosDeTarea(t);
      setModalResultados(res || []);
    } catch {
      setModalResultados([]);
    }
    setOpenModal(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
        <span className="text-blue-600">📊</span>
        Resumen de resultados
      </h2>

      {/* Buscador por alumno */}
      <div className="flex justify-end mb-2">
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={busquedaResultados}
          onChange={(e) =>
            setBusquedaResultados(e.target.value.toLowerCase())
          }
          className="border rounded-md p-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Gráficas globales */}
      {tareasResultados.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barras: tareas vs completadas */}
          <div className="bg-white rounded-xl shadow-md p-4 border">
            <h3 className="font-semibold text-blue-700 mb-3">
              Vista general de tareas
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={tareasParaGraficas}
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
                <Legend />
                <Bar dataKey="total" name="Total alumnos" fill="#CBD5F5" />
                <Bar
                  dataKey="completadas"
                  name="Completadas"
                  fill="#2563EB"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie: completadas vs pendientes */}
          {tareaParaPie && (
            <div className="bg-white rounded-xl shadow-md p-4 border">
              <h3 className="font-semibold text-blue-700 mb-3">
                Estado general de tareas
              </h3>
              {(() => {
                const total = Number(tareaParaPie.total_alumnos || 0);
                const comp = Number(tareaParaPie.completados || 0);
                const pend = total - comp >= 0 ? total - comp : 0;

                const pieData = [
                  { name: "Completadas", value: comp },
                  { name: "Pendientes", value: pend },
                ];

                return (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Tarea seleccionada:{" "}
                      <b className="text-blue-700">{tareaParaPie.titulo}</b>
                    </p>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === 0
                                  ? "#22C55E"
                                  : "#F97316"
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 mt-1">
                      Total alumnos: {total}, completadas: {comp}, pendientes:{" "}
                      {pend}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tareas por grupo */}
      <div className="mt-4 space-y-4">
        <h3 className="text-lg font-semibold text-blue-700">
          Tareas por grupo
        </h3>

        {Object.keys(tareasPorGrupo).length === 0 && (
          <p className="text-gray-500 text-sm">
            Aún no hay tareas creadas. Puedes crear una desde{" "}
            <b>"Tareas / Juegos"</b>.
          </p>
        )}

        {Object.entries(tareasPorGrupo).map(([grupo, tareasGrupo]) => (
          <section key={grupo} className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">
              Grupo: <span className="text-blue-700">{grupo}</span>
            </h4>

            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {tareasGrupo.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className={`bg-white p-4 rounded-xl shadow-sm border ${
                      tareaSeleccionada?.id === t.id
                        ? "border-blue-500"
                        : "border-gray-100"
                    } hover:shadow-md`}
                  >
                    <h5 className="font-semibold text-blue-700 text-md">
                      {t.titulo}
                    </h5>
                    <p className="text-sm text-gray-600">
                      Puntos: <b>{t.puntos}</b>
                      <br />
                      Completadas: {t.completados} /{" "}
                      {t.total_alumnos || "?"}
                    </p>

                    <button
                      onClick={() => handleOpenModal(t)}
                      className="mt-3 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 w-full"
                    >
                      Ver resultados
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        ))}
      </div>

      {/* Detalle de resultados de la tarea seleccionada */}
{/* === 3. DETALLE DE RESULTADOS DE LA TAREA SELECCIONADA === */}
{tareaSeleccionada ? (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-8 bg-white p-6 rounded-xl shadow-md border"
  >
    {/* Encabezado */}
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-semibold text-blue-700">
        Resultados de: {tareaSeleccionada.titulo}
      </h3>

      <p className="text-sm text-gray-500">
        Grupo: <b>{tareaSeleccionada.grupo_nombre}</b> · Puntos:{" "}
        <b>{tareaSeleccionada.puntos}</b>
      </p>
    </div>

    {/* Caso: NO HAY RESULTADOS */}
    {resultadosTarea.length === 0 && (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md border border-yellow-200 mt-4">
        <p className="font-medium">Aún no hay resultados para esta tarea.</p>
        <p className="text-sm mt-1">
          Los alumnos todavía no han completado esta actividad.
        </p>
      </div>
    )}

    {/* Si NO hay resultados, no mostramos gráficas */}
    {resultadosTarea.length > 0 && (
      <>
        {/* === GRÁFICA DE CALIFICACIONES === */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Calificaciones por alumno
          </h4>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={resultadosTarea.map((r) => ({
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
                <Bar
                  dataKey="calificacion"
                  name="Calificación"
                  fill="#2563EB"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === LISTA DE RESULTADOS === */}
        <div className="space-y-3">
          {resultadosTarea
            .filter((r) =>
              r.alumno.toLowerCase().includes(busquedaResultados)
            )
            .map((r, idx) => (
              <div
                key={r.id || idx}
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
                      {tareaSeleccionada.puntos}
                    </p>

                    <p className="text-sm">
                      Comentario del maestro:{" "}
                      <i>{r.comentario_maestro || "Sin comentarios"}</i>
                    </p>
                  </>
                )}
              </div>
            ))}
        </div>
      </>
    )}
  </motion.div>
) : (
  /* === Caso: ninguna tarea seleccionada === */
  <div className="text-gray-500 text-sm bg-white p-6 mt-6 rounded-xl border shadow-sm">
    <p className="text-center">
      Selecciona una tarea de arriba para ver su detalle de resultados.
    </p>
  </div>
)}
      <ModalVerResultados
        open={openModal}
        onClose={() => setOpenModal(false)}
        tarea={modalTarea}
        resultados={modalResultados}
      />
    </div>
  );
}

/* === MODAL PARA VER RESULTADOS === */
function ModalVerResultados({ open, onClose, tarea, resultados }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-blue-700 mb-2">
          Resultados de: {tarea?.titulo}
        </h2>

        {(!resultados || resultados.length === 0) ? (
          <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 border border-yellow-200">
            Aún no hay resultados para esta tarea.
          </div>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {resultados.map((r, idx) => (
              <li
                key={r.id || idx}
                className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100"
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
                      Calificación: <b>{r.calificacion ?? "Sin calificar"}</b>
                    </p>
                    <p className="text-sm">
                      Comentario: <i>{r.comentario_maestro || "Sin comentarios"}</i>
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { ModalVerResultados };