// src/components/maestro/TareasSection.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  Calendar,
  Target,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function TareasSection({
  tareas,
  paginaTareas,
  setPaginaTareas,
  ITEMS_PER_PAGE,
  busquedaTarea,
  setBusquedaTarea,
  tareaEnEdicion,
  setTareaEnEdicion,
  onActualizarTarea,
  onAbrirModalResultados,
  onPedirEliminar,
  formatFecha,
  onAbrirModalNueva,
  onEditar,
  onAbrirModalJuegoInteractivo,
}) {
  // Campos de edición locales
  const [editFields, setEditFields] = useState({
    titulo: "",
    descripcion: "",
    puntos: 10,
    fecha_entrega: "",
  });

  // Iniciar edición
  const handleStartEdit = (t) => {
    setTareaEnEdicion(t.id);
    setEditFields({
      titulo: t.titulo || "",
      descripcion: t.descripcion || "",
      puntos: t.puntos || 10,
      fecha_entrega: t.fecha_entrega ? t.fecha_entrega.slice(0, 10) : "",
    });
  };

  // Guardar cambios
  const guardarEdicion = (id) => {
    onActualizarTarea({
      id,
      titulo: editFields.titulo,
      descripcion: editFields.descripcion,
      puntos: editFields.puntos,
      fecha_entrega: editFields.fecha_entrega,
    });

    setTareaEnEdicion(null);
  };
  // Filtro
  const filtradas = tareas.filter(
    (t) =>
      t.titulo.toLowerCase().includes(busquedaTarea) ||
      (t.descripcion || "").toLowerCase().includes(busquedaTarea)
  );

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE) || 1;
  const start = (paginaTareas - 1) * ITEMS_PER_PAGE;
  const visibles = filtradas.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
          <ClipboardList size={20} />
          Tareas y juegos
        </h2>

        <div className="flex gap-2 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar tarea..."
            onChange={(e) => {
              setBusquedaTarea(e.target.value.toLowerCase());
              setPaginaTareas(1);
            }}
            className="border rounded-md p-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-400"
          />

<button
  onClick={onAbrirModalNueva}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm text-sm"
>
  <Plus size={18} />
  Nueva tarea
</button>

<button
  onClick={onAbrirModalJuegoInteractivo}
  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm text-sm"
>
  <Plus size={18} />
  Juego interactivo
</button>
        </div>
      </div>

      {/* Grid PRINCIPAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibles.map((t) => {
          const isEditing = tareaEnEdicion === t.id;

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md"
            >
              {/* CONTENIDO NORMAL */}
              {!isEditing && (
                <>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-blue-700">{t.titulo}</h3>
                      <p className="text-xs text-gray-500 mb-1">
                        Grupo: <b>{t.grupo_nombre || t.grupo_id}</b> ·{" "}
                        {t.alumno_id ? "Individual" : "Grupal"}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {t.descripcion}
                      </p>
                      {t.asignados && t.asignados.length > 0 && (
                        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-md p-2 text-xs text-blue-700">
                          <b>Asignada a:</b>
                          <ul className="list-disc ml-4 mt-1">
                            {t.asignados.map((al) => (
                              <li key={al.id}>{al.nombre}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onEditar(t)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onPedirEliminar(t)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Entrega: {formatFecha(t.fecha_entrega)}
                    </span>

                    <span className="flex items-center gap-1">
                      <Target size={14} />
                      {t.puntos} pts · {t.completados ?? 0} completadas
                    </span>
                  </div>

                  <button
                    onClick={() => onAbrirModalResultados(t)}
                    className="mt-3 w-full text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded-md py-1 hover:bg-purple-100"
                  >
                    Ver resultados de los alumnos
                  </button>
                </>
              )}

              {/* PANEL DE EDICIÓN — SUPERPUESTO */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl z-20"
                >
                  <input
                    value={editFields.titulo}
                    onChange={(e) =>
                      setEditFields({ ...editFields, titulo: e.target.value })
                    }
                    className="border rounded-md px-2 py-1 w-full mb-2"
                  />

                  <textarea
                    value={editFields.descripcion}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        descripcion: e.target.value,
                      })
                    }
                    className="border rounded-md px-2 py-1 w-full text-sm mb-2"
                    rows={3}
                  />

                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      value={editFields.puntos}
                      onChange={(e) =>
                        setEditFields({
                          ...editFields,
                          puntos: e.target.value,
                        })
                      }
                      className="border rounded-md px-2 py-1 w-24 text-sm"
                    />

                    <input
                      type="date"
                      value={editFields.fecha_entrega}
                      onChange={(e) =>
                        setEditFields({
                          ...editFields,
                          fecha_entrega: e.target.value,
                        })
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => guardarEdicion(t.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Guardar
                    </button>

                    <button
                      onClick={() => setTareaEnEdicion(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPaginaTareas(n)}
              className={`px-3 py-1 rounded text-sm ${
                paginaTareas === n
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-blue-100 text-gray-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}