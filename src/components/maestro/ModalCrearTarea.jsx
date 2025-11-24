import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function ModalCrearTarea({
  open,
  onClose,
  nuevoJuego,
  setNuevoJuego,
  grupos,
  onSubmit,
}) {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [alumnosGrupo, setAlumnosGrupo] = useState([]);
  const [asignarATodos, setAsignarATodos] = useState(true);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

  // 🔥 Cuando se elige un grupo → cargar alumnos
  useEffect(() => {
    if (!nuevoJuego.grupo_id) return;

    axios
      .get(
        `http://localhost:4000/api/maestro/grupo/${nuevoJuego.grupo_id}/alumnos`,
        { headers }
      )
      .then((res) => {
        setAlumnosGrupo(res.data);
        setAlumnosSeleccionados([]); // reset
      })
      .catch(() => {
        setAlumnosGrupo([]);
      });
  }, [nuevoJuego.grupo_id]);

  const toggleAlumno = (id) => {
    if (alumnosSeleccionados.includes(id)) {
      setAlumnosSeleccionados(alumnosSeleccionados.filter((i) => i !== id));
    } else {
      setAlumnosSeleccionados([...alumnosSeleccionados, id]);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...nuevoJuego,
      alumnos: asignarATodos ? "grupo" : alumnosSeleccionados,
    });

    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      >
        <motion.div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-lg space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xl font-semibold text-blue-700">
              Nueva tarea / juego
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            placeholder="Descripción"
            value={nuevoJuego.descripcion}
            onChange={(e) =>
              setNuevoJuego({ ...nuevoJuego, descripcion: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
            rows={3}
          />

          {/* Seleccionar Grupo */}
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

          {/* Seleccionar alumnos */}
          {nuevoJuego.grupo_id && (
            <div className="border rounded-md p-3 bg-gray-50">
              <label className="font-semibold text-sm">
                Asignar tarea a:
              </label>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={asignarATodos}
                  onChange={() => {
                    setAsignarATodos(!asignarATodos);
                    setAlumnosSeleccionados([]);
                  }}
                />
                <span className="text-sm">Todo el grupo</span>
              </div>

              {!asignarATodos && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
                  {alumnosGrupo.map((a) => (
                    <label key={a.alumno_id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={alumnosSeleccionados.includes(a.alumno_id)}
                        onChange={() => toggleAlumno(a.alumno_id)}
                      />
                      {a.nombre}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botón Guardar */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Guardar tarea
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}