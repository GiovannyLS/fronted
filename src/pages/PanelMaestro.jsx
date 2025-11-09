import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, ClipboardList, Users } from "lucide-react";

export default function PanelMaestro() {
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [tarea, setTarea] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sinGrupos, setSinGrupos] = useState(false);

  const token = localStorage.getItem("token");
  const maestro_id = localStorage.getItem("maestro_id");

  useEffect(() => {
    obtenerGrupos();
  }, []);

  const obtenerGrupos = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/maestro/${maestro_id}/grupos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Si el backend devuelve "no_grupos"
      if (data.message === "no_grupos" || data.length === 0) {
        setSinGrupos(true);
      } else {
        setGrupos(data);
      }
    } catch (error) {
      console.error("Error al cargar grupos:", error);
    }
  };

  const obtenerAlumnos = async (grupo_id) => {
    setGrupoSeleccionado(grupo_id);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/maestro/grupo/${grupo_id}/alumnos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlumnos(data);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    }
  };

  const asignarTarea = async () => {
    if (!tarea.trim() || !grupoSeleccionado) return;
    try {
      await axios.post(
        "http://localhost:4000/api/maestro/tarea",
        { descripcion: tarea, grupo_id: grupoSeleccionado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje("✅ ¡Tarea asignada correctamente!");
      setTarea("");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al asignar tarea:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Users size={28} /> Panel del Maestro
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      {/* 🦊 Mensaje si no hay grupos */}
      {sinGrupos ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="Tobi"
            className="w-28 mb-4"
          />
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">
            ¡Hola Maestro!
          </h2>
          <p className="text-gray-600 max-w-md leading-relaxed">
            🦊 Tobi dice: Aún no tienes grupos asignados.<br />
            Comunícate con el directivo para que te asigne un grupo y puedas comenzar a trabajar con tus alumnos.
          </p>
        </div>
      ) : (
        <>
          {/* Lista de grupos */}
          <div className="w-full max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Tus grupos asignados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {grupos.map((grupo) => (
                <button
                  key={grupo.id}
                  onClick={() => obtenerAlumnos(grupo.id)}
                  className={`p-4 rounded-xl shadow-md transition-all ${
                    grupoSeleccionado === grupo.id
                      ? "bg-blue-700 text-white"
                      : "bg-white hover:bg-blue-50 text-blue-700"
                  }`}
                >
                  {grupo.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de alumnos */}
          {alumnos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-4xl mb-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Alumnos del grupo seleccionado
              </h3>
              <div className="space-y-2">
                {alumnos.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"
                  >
                    <span>
                      {a.nombre} —{" "}
                      <span className="text-sm text-gray-500">
                        {a.tema_preferido}
                      </span>
                    </span>
                    <span className="font-semibold text-blue-700">
                      {a.progreso}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Asignar tarea */}
          {grupoSeleccionado && (
            <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-4xl">
              <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                <ClipboardList size={20} /> Asignar nueva tarea
              </h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={tarea}
                  onChange={(e) => setTarea(e.target.value)}
                  placeholder="Ej. Actividad de atención visual"
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  onClick={asignarTarea}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Asignar tarea
                </button>
              </div>
              {mensaje && <p className="text-green-600 mt-3">{mensaje}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}