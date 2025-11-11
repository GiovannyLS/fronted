import { useState, useEffect } from "react";
import axios from "axios";
import { Users, GraduationCap, Layers, Plus, LogOut, UserPlus } from "lucide-react";

export default function PanelDirectivo() {
  const [vista, setVista] = useState("maestros");
  const [usuarios, setUsuarios] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [nuevoMaestro, setNuevoMaestro] = useState({ nombre: "", email: "", password: "" });
  const [seleccion, setSeleccion] = useState({ maestro: "", alumno: "", grupo: "" });
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [u, m, a, g] = await Promise.all([
      axios.get("http://localhost:4000/api/directivo/usuarios", { headers }),
      axios.get("http://localhost:4000/api/directivo/maestros", { headers }),
      axios.get("http://localhost:4000/api/directivo/alumnos", { headers }),
      axios.get("http://localhost:4000/api/directivo/grupos", { headers }),
    ]);
    setUsuarios(u.data);
    setMaestros(m.data);
    setAlumnos(a.data);
    setGrupos(g.data);
  };

  console.log({ u: usuarios, m: maestros, a: alumnos, g: grupos });

  const crearMaestro = async () => {
    try {
      await axios.post("http://localhost:4000/api/directivo/crear-maestro", nuevoMaestro, { headers });
      setMensaje("✅ Maestro creado correctamente");
      setNuevoMaestro({ nombre: "", email: "", password: "" });
      cargarDatos();
    } catch (error) {
      setMensaje("❌ " + error.response?.data?.message);
    }
  };

  const crearGrupos = async () => {
    await axios.post("http://localhost:4000/api/directivo/crear-grupos", {}, { headers });
    setMensaje("✅ Grupos creados o actualizados correctamente");
    cargarDatos();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <GraduationCap size={30} /> Panel del Directivo
        </h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        {["maestros", "alumnos", "grupos"].map((tab) => (
          <button
            key={tab}
            onClick={() => setVista(tab)}
            className={`px-4 py-2 rounded-md ${
              vista === tab ? "bg-blue-600 text-white" : "bg-white text-blue-700 border"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {mensaje && <p className="text-center text-green-600 mb-4">{mensaje}</p>}

      {vista === "maestros" && (
        <>
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <UserPlus size={20} /> Crear nuevo maestro
          </h2>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input placeholder="Nombre" value={nuevoMaestro.nombre} onChange={(e) => setNuevoMaestro({ ...nuevoMaestro, nombre: e.target.value })} className="p-2 border rounded-md flex-1" />
            <input placeholder="Email" value={nuevoMaestro.email} onChange={(e) => setNuevoMaestro({ ...nuevoMaestro, email: e.target.value })} className="p-2 border rounded-md flex-1" />
            <input placeholder="Contraseña" type="password" value={nuevoMaestro.password} onChange={(e) => setNuevoMaestro({ ...nuevoMaestro, password: e.target.value })} className="p-2 border rounded-md flex-1" />
            <button onClick={crearMaestro} className="bg-green-600 text-white px-4 py-2 rounded-md">Crear</button>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 mb-2">Maestros registrados</h3>
          <ul className="space-y-2">
            {maestros.map((m) => (
              <li key={m.maestro_id} className="bg-white p-3 rounded-md shadow-sm">
                {m.nombre} - {m.email} ({m.total_grupos} grupos)
              </li>
            ))}
          </ul>
        </>
      )}

      {vista === "alumnos" && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Lista de alumnos</h3>
          <ul className="space-y-2">
            {alumnos.map((a) => (
              <li key={a.alumno_id} className="bg-white p-3 rounded-md shadow-sm">
                {a.nombre} - {a.email} ({a.grupo_nombre || "Sin grupo"})
              </li>
            ))}
          </ul>
        </div>
      )}

      {vista === "grupos" && (
        <div className="text-center">
          <button onClick={crearGrupos} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto">
            <Plus size={18} /> Crear / Actualizar grupos
          </button>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupos.map((g) => (
              <div key={g.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="font-bold text-blue-700">{g.nombre}</h3>
                <p className="text-sm text-gray-600">
                  Grado: {g.grado} <br />
                  Alumnos: {g.total_alumnos}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}