import { useEffect, useState } from "react";
import axios from "axios";
import Tobi from "../components/Tobi";

export default function PanelAlumno() {
  const [nombre, setNombre] = useState("");
  const [tema, setTema] = useState("default");
  const [progreso, setProgreso] = useState(0);
  const [tareas, setTareas] = useState([]);
  const token = localStorage.getItem("token");
  const alumno_id = localStorage.getItem("alumno_id");
  

  // Temas visuales
  const temas = {
    default: "from-blue-100 to-blue-50 text-blue-700",
    activo: "from-yellow-100 to-yellow-50 text-yellow-700",
    tranquilo: "from-sky-100 to-sky-50 text-sky-700",
    creativo: "from-purple-100 to-purple-50 text-purple-700",
    auditivo: "from-orange-100 to-orange-50 text-orange-700",
  };

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
    setTema(localStorage.getItem("tema") || "default");

    // Cargar progreso y tareas
    obtenerProgresoYTareas();
  }, []);

  const obtenerProgresoYTareas = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/alumnos/${alumno_id}/panel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgreso(data.progreso);
      setTareas(data.tareas);
    } catch (error) {
      console.error("Error cargando datos del panel:", error);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${temas[tema]} flex flex-col items-center`}
    >
      <div className="w-full bg-white shadow-md py-4 text-center">
        <h1 className="text-3xl font-bold text-blue-700">
          ¡Hola, {nombre}! 👋
        </h1>
        <p className="text-gray-600">Bienvenido a tu panel de aprendizaje</p>
      </div>

      <div className="w-full max-w-3xl mt-6 p-6">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Tu progreso general 📈
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-5">
            <div
              className="bg-green-500 h-5 rounded-full transition-all duration-700"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {progreso}% completado
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              🧩 Tareas del día
            </h3>
            {tareas.length > 0 ? (
              <ul className="text-left space-y-2">
                {tareas.map((tarea, i) => (
                  <li
                    key={i}
                    className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                  >
                    {tarea.descripcion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                No tienes tareas asignadas por ahora 🎉
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              🎁 Recompensas
            </h3>
            <ul className="text-left space-y-2">
              <li className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                ¡Excelente concentración hoy! ⭐
              </li>
              <li className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                Has mantenido tu constancia 3 días seguidos 🎯
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Tobi nombre={nombre} tema={tema} />
    </div>
  );
}