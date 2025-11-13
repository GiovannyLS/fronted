import { useState, useEffect } from "react";
import axios from "axios";
import { Users, GraduationCap, Layers, Plus, LogOut, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

export default function PanelDirectivo() {
  const [vista, setVista] = useState("maestros");
  const [usuarios, setUsuarios] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [nuevoMaestro, setNuevoMaestro] = useState({ nombre: "", email: "", password: "" });
  const [seleccion, setSeleccion] = useState({ maestro: "", alumno: "", grupo: "", tdh: "0", editando: null, editandoMaestro: null, editandoGrupo: null });
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const [nuevoAlumno, setNuevoAlumno] = useState({ nombre: "", email: "", password: "", grupo_id: "", tiene_tdah: false, tipo_tdah:"" });
  const [busqueda, setBusqueda] = useState("");
const ITEMS_PER_PAGE = 12;
const [filtroGrupo, setFiltroGrupo] = useState("");
const [filtroTDAH, setFiltroTDAH] = useState("");
const [toasts, setToasts] = useState([]);
const [mostrarModal, setMostrarModal] = useState(false);
const [mostrarModalAlumno, setMostrarModalAlumno] = useState(false);
const [mostrarModalGrupo, setMostrarModalGrupo] = useState(false);
const [nuevoGrupo, setNuevoGrupo] = useState({
  nombre: "",
  grado: "",
  maestro_id: "", 
});

const [paginaGrupos, setPaginaGrupos] = useState(1);
const [paginaAlumnos, setPaginaAlumnos] = useState(1);
const [paginaMaestros, setPaginaMaestros] = useState(1);

const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
const [maestroAEliminar, setMaestroAEliminar] = useState(null);
const [mostrarModalEliminarAlumno, setMostrarModalEliminarAlumno] = useState(false);
const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);
const [mostrarModalEliminarGrupo, setMostrarModalEliminarGrupo] = useState(false);
const [grupoAEliminar, setGrupoAEliminar] = useState(null);


const [busquedaGrupos, setBusquedaGrupos] = useState("");
const [busquedaMaestros, setBusquedaMaestros] = useState("");
const [busquedaAlumnos, setBusquedaAlumnos] = useState("");

const cambiarVista = (nuevaVista) => {
  setVista(nuevaVista);

  // 🔄 Limpia búsquedas
  setBusquedaGrupos("");
  setBusquedaMaestros("");
  setBusquedaAlumnos("");

  // 🔄 Resetea paginación
  setPaginaGrupos(1);
  setPaginaMaestros(1);
  setPaginaAlumnos(1);
};



  const showToast = (msg, type = "info") => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, msg, type }]);
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3000); 
};

const ok = (msg) => showToast(msg, "success");
const fail = (msg) => showToast(msg, "error");

const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

useEffect(() => {
  // 🔹 Cerrar cualquier sección de edición
  setSeleccion((prev) => ({
    ...prev,
    editando: null,
    editandoGrupo: null,
    editandoMaestro: null,
  }));

  // 🔹 Cerrar modales
  setMostrarModalAlumno(false);
  setMostrarModalGrupo(false);
  setMostrarModal(false);
  setMostrarModalEliminarAlumno(false);
  setMostrarModalEliminarGrupo(false);

  // 🔹 Resetear paginación
  setPaginaAlumnos(1);
  setPaginaGrupos(1);
  setPaginaMaestros(1);
}, [vista]);

const cargarDatos = async () => {
  try {
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
  } catch (e) {
    console.error("Error al cargar datos:", e);
    fail("Error al cargar datos");
  }
};

  //console.log({ u: usuarios, m: maestros, a: alumnos, g: grupos });

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
        <button onClick={handleLogout} className="bg-blue-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        {["maestros", "alumnos", "grupos"].map((tab) => (
          <button
            key={tab}
            onClick={() => cambiarVista(tab)}
            className={`px-4 py-2 rounded-md ${
              vista === tab ? "bg-blue-600 text-white" : "bg-white text-blue-700 border"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        {/* 🧃 Contenedor global de notificaciones */}
<AnimatePresence>
  {toasts.map((t) => (
    <motion.div
      key={t.id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white backdrop-blur-sm border flex items-center gap-2
  ${
    t.type === "success"
      ? "bg-green-600/90 border-green-400/30"
      : t.type === "error"
      ? "bg-red-600/90 border-red-400/30"
      : "bg-blue-600/90 border-blue-400/30"
  }`}
    >
      {t.type === "success" && <span></span>}
      {t.type === "error" && <span></span>}
      <span>{t.msg}</span>
    </motion.div>
  ))}
</AnimatePresence>
      </div>

      {mensaje && <p className="text-center text-green-600 mb-4">{mensaje}</p>}

{vista === "maestros" && (
  <div className="space-y-6">
    {/* 🔹 Header principal */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
      <h2 className="text-2xl font-semibold text-blue-700">
        👩‍🏫 Gestión de Maestros
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
        {/*  Buscador */}
        <input
          type="text"
          placeholder="Buscar maestro..."
          onChange={(e) => setBusquedaMaestros(e.target.value.toLowerCase())}
          className="border rounded-md p-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-400"
        />

        {/* ➕ Botón nuevo maestro */}
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus size={18} /> Nuevo maestro
        </button>
      </div>
    </div>

    {/*  Lista de maestros */}
    {(() => {
      const filtrados = maestros.filter(
  (m) =>
    m.nombre.toLowerCase().includes(busquedaMaestros) ||
    m.email.toLowerCase().includes(busquedaMaestros)
);

const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
const start = (paginaMaestros - 1) * ITEMS_PER_PAGE;
const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

      return (
        <>
          {/* Grid de tarjetas */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {visibles.map((m) => (
                <motion.div
                  key={m.maestro_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-blue-700 text-lg">
                        {m.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {m.email} <br />
                        Grupos asignados: <b>{m.total_grupos}</b>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                    {/*  <button
  onClick={() => setSeleccion({ ...seleccion, editandoGrupo: g.id })}
  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center gap-1"
>
  <Pencil size={16} /> Editar
</button>*/} 
  <button
    onClick={() =>
      setSeleccion({ ...seleccion, editandoMaestro: m.maestro_id })
    }
    className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
  >
    <Pencil size={18} />
  </button>
  <button
    onClick={() => {
      setMaestroAEliminar(m);
      setMostrarModalEliminarMaestro(true);
    }}
    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
  >
    <Trash2 size={18} />
  </button>
{/*  Modal de confirmación de eliminación */}
<AnimatePresence>
  {mostrarModalEliminar && maestroAEliminar && (
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
        className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm space-y-4"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            ¿Eliminar maestro?
          </h3>
          <p className="text-gray-600">
            Estás a punto de eliminar a{" "}
            <span className="font-semibold text-gray-800">
              {maestroAEliminar.nombre}
            </span>. <br />
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-3">
          <button
            onClick={async () => {
              try {
                await axios.delete(
                  `http://localhost:4000/api/directivo/eliminar-maestro/${maestroAEliminar.maestro_id}`,
                  { headers }
                );
                ok("Maestro eliminado correctamente");
                setMostrarModalEliminar(false);
                setMaestroAEliminar(null);
                cargarDatos();
              } catch (e) {
                fail(e, "No se pudo eliminar el maestro (quizá tiene grupos asignados)");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Sí, eliminar
          </button>

          <button
            onClick={() => {
              setMostrarModalEliminar(false);
              setMaestroAEliminar(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
                    </div>
                  </div>

                  {/* Panel de edición animado */}
                  <AnimatePresence>
                    {seleccion.editandoMaestro === m.maestro_id && (
                      <motion.div
                        key={`edit-m-${m.maestro_id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="mt-4 border-t pt-3 space-y-2 overflow-hidden"
                      >
                        <input
                          defaultValue={m.nombre}
                          onChange={(e) => (m._nombre = e.target.value)}
                          className="border rounded-md px-2 py-1 w-full"
                        />
                        <input
                          defaultValue={m.email}
                          onChange={(e) => (m._email = e.target.value)}
                          className="border rounded-md px-2 py-1 w-full"
                        />

                        <select
                          onChange={(e) => (m._grupoAsignado = e.target.value)}
                          className="border p-1 rounded-md text-sm w-full"
                          defaultValue=""
                        >
                          <option value="">Asignar grupo...</option>
                          {grupos.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.nombre}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2 justify-end mt-2">
                          <button
                            onClick={async () => {
                              try {
                                await axios.put(
                                  `http://localhost:4000/api/directivo/actualizar-maestro/${m.maestro_id}`,
                                  {
                                    nombre: m._nombre ?? m.nombre,
                                    email: m._email ?? m.email,
                                    grupo_id: m._grupoAsignado || null,
                                  },
                                  { headers }
                                );
                                ok("Maestro actualizado correctamente");
                                setSeleccion({
                                  ...seleccion,
                                  editandoMaestro: null,
                                });
                                cargarDatos();
                              } catch (e) {
                                fail(e, "Error al actualizar maestro");
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Guardar
                          </button>

                          <button
                            onClick={() =>
                              setSeleccion({
                                ...seleccion,
                                editandoMaestro: null,
                              })
                            }
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Paginación */}
          <div className="flex justify-center mt-6 gap-2">
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button
    key={n}
    onClick={() => setPaginaMaestros(n)}
    className={`px-3 py-1 rounded ${
      paginaMaestros === n
        ? "bg-blue-600 text-white"
        : "bg-gray-100 hover:bg-blue-100 text-gray-700"
    }`}
  >
    {n}
  </button>
))}
          </div>
        </>
      );
    })()}

    {/* 🪄 Modal para crear nuevo maestro */}
    <AnimatePresence>
      {mostrarModal && (
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
                Nuevo maestro
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <input
              placeholder="Nombre"
              value={nuevoMaestro.nombre}
              onChange={(e) =>
                setNuevoMaestro({ ...nuevoMaestro, nombre: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
            <input
              placeholder="Correo electrónico"
              type="email"
              value={nuevoMaestro.email}
              onChange={(e) =>
                setNuevoMaestro({ ...nuevoMaestro, email: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
            <input
              placeholder="Contraseña"
              type="password"
              value={nuevoMaestro.password}
              onChange={(e) =>
                setNuevoMaestro({ ...nuevoMaestro, password: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />

            <button
              onClick={async () => {
                if (
                  !nuevoMaestro.nombre ||
                  !nuevoMaestro.email ||
                  !nuevoMaestro.password
                ) {
                  fail("⚠️ Todos los campos son obligatorios");
                  return;
                }

                try {
                  await axios.post(
                    "http://localhost:4000/api/directivo/crear-maestro",
                    nuevoMaestro,
                    { headers }
                  );
                  ok("✅ Maestro creado correctamente");
                  setNuevoMaestro({ nombre: "", email: "", password: "" });
                  setMostrarModal(false);
                  cargarDatos();
                } catch (error) {
                  fail("❌ " + error.response?.data?.message);
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Guardar maestro
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}

{vista === "alumnos" && (
  <div className="space-y-6">
    {/*  Controles superiores */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-wrap gap-2">
        <select
          onChange={(e) => setFiltroGrupo(e.target.value)}
          className="border rounded-md p-2 text-sm"
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setFiltroTDAH(e.target.value)}
          className="border rounded-md p-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="1">Con TDAH</option>
          <option value="0">Sin TDAH</option>
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="🔍 Buscar alumno..."
          onChange={(e) => setBusquedaAlumnos(e.target.value.toLowerCase())}
          className="border rounded-md p-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setMostrarModalAlumno(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} /> Nuevo alumno
        </button>
      </div>
    </div>

    {/* Lista de alumnos */}
    <div>
      <h3 className="text-lg font-semibold text-blue-700 mb-3">
        Lista de alumnos
      </h3>

{(() => {
  const filtrados = alumnos
    .filter((a) =>
  a.nombre?.toLowerCase().includes(busquedaAlumnos.toLowerCase())
)
    .filter((a) =>
      filtroGrupo ? String(a.grupo_id) === String(filtroGrupo) : true
    )
    .filter((a) =>
      filtroTDAH === ""
        ? true
        : filtroTDAH === "1"
        ? a.tiene_tdah
        : !a.tiene_tdah
    );

const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
const start = (paginaAlumnos - 1) * ITEMS_PER_PAGE;
const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

  return (
    <>
      {/*  Grid de tarjetas */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {visibles.map((a) => (
            <motion.div
              key={a.alumno_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100"
            >
              {/*  Info principal */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-blue-700 text-lg">
                    {a.nombre}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {a.email}
                    <br />
                    Grupo: <b>{a.grupo_nombre || "Sin grupo"}</b>
                    <br />
                    TDAH:{" "}
<span
  className={`font-bold ${
    a.tiene_tdah ? "text-red-500" : "text-green-600"
  }`}
>
  {a.tiene_tdah ? "Sí" : "No"}
</span>
{a.tiene_tdah && a.tipo_tdah && (
  <span className="ml-1 text-blue-700 font-medium">
    ({a.tipo_tdah})
  </span>
)}
                  </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-1">
                    <button
    onClick={() =>
      setSeleccion({ ...seleccion, editando: a.alumno_id })
    }
    className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
  >
    <Pencil size={18} />
  </button>

  {/* Eliminar */}
  <button
    onClick={() => {
      setAlumnoAEliminar(m);
      setMostrarModalEliminarAlumno(true);
    }}
    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
  >
    <Trash2 size={18} />
  </button>
                </div>
              </div>

              {/*  Panel de edición */}
              <AnimatePresence>
                {seleccion.editando === a.alumno_id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mt-4 border-t pt-3 space-y-2 overflow-hidden"
                  >
                    <input
                      defaultValue={a.nombre}
                      onChange={(e) => (a._nombre = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full"
                    />
                    <input
                      defaultValue={a.email}
                      onChange={(e) => (a._email = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full"
                    />

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        defaultValue={a.grupo_id || ""}
                        onChange={(e) => (a._grupo = e.target.value)}
                        className="border p-1 rounded-md text-sm flex-1"
                      >
                        <option value="">Grupo...</option>
                        {grupos.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        defaultValue={a.tiene_tdah ? "1" : "0"}
                        onChange={(e) => (a._tdah = e.target.value)}
                        className="border p-1 rounded-md text-sm flex-1"
                      >
                        <option value="0">Sin TDAH</option>
                        <option value="1">Con TDAH</option>
                      </select>
                    </div>

                    {(a._tdah === "1" || a.tiene_tdah) && (
                      <input
                        placeholder="Tipo de TDAH"
                        defaultValue={a.tipo_tdah || ""}
                        onChange={(e) => (a._tipo = e.target.value)}
                        className="border rounded-md px-2 py-1 w-full text-sm"
                      />
                    )}

                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        onClick={async () => {
                          try {
                            await axios.put(
                              "http://localhost:4000/api/directivo/actualizar-alumno",
                              {
                                alumno_id: a.alumno_id,
                                nombre: a._nombre ?? a.nombre,
                                email: a._email ?? a.email,
                                grupo_id:
                                  a._grupo !== undefined
                                    ? a._grupo
                                    : a.grupo_id,
                                tiene_tdah:
                                  (a._tdah ??
                                    (a.tiene_tdah ? "1" : "0")) === "1",
                                tipo_tdah:
                                  a._tipo ??
                                  (a._tdah === "1" ? a.tipo_tdah : null),
                              },
                              { headers }
                            );
                            ok(" Alumno actualizado correctamente");
                            setSeleccion({ ...seleccion, editando: null });
                            cargarDatos();
                          } catch (e) {
                            fail("Error al actualizar alumno");
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Guardar
                      </button>

                      <button
                        onClick={() =>
                          setSeleccion({ ...seleccion, editando: null })
                        }
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/*  Paginación */}
      <div className="flex justify-center mt-6 gap-2">
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button
    key={n}
    onClick={() => setPaginaAlumnos(n)}
    className={`px-3 py-1 rounded ${
      paginaAlumnos === n
        ? "bg-blue-600 text-white"
        : "bg-gray-100 hover:bg-blue-100 text-gray-700"
    }`}
  >
    {n}
  </button>
))}
      </div>
    </>
  );
})()}
    </div>

    {/* 🪄 Modal para crear alumno */}
    <AnimatePresence>
      {mostrarModalAlumno && (
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
                Nuevo alumno
              </h3>
              <button
                onClick={() => setMostrarModalAlumno(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <input
              placeholder="Nombre completo"
              value={nuevoAlumno.nombre}
              onChange={(e) =>
                setNuevoAlumno({ ...nuevoAlumno, nombre: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
            <input
              placeholder="Correo electrónico"
              type="email"
              value={nuevoAlumno.email}
              onChange={(e) =>
                setNuevoAlumno({ ...nuevoAlumno, email: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
            <input
              placeholder="Contraseña"
              type="password"
              value={nuevoAlumno.password}
              onChange={(e) =>
                setNuevoAlumno({ ...nuevoAlumno, password: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />

            <select
              value={nuevoAlumno.grupo_id}
              onChange={(e) =>
                setNuevoAlumno({ ...nuevoAlumno, grupo_id: e.target.value })
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

            <select
              value={nuevoAlumno.tiene_tdah ? "1" : "0"}
              onChange={(e) =>
                setNuevoAlumno({
                  ...nuevoAlumno,
                  tiene_tdah: e.target.value === "1",
                })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="0">Sin TDAH</option>
              <option value="1">Con TDAH</option>
            </select>

            {nuevoAlumno.tiene_tdah && (
              <input
                placeholder="Tipo de TDAH"
                value={nuevoAlumno.tipo_tdah}
                onChange={(e) =>
                  setNuevoAlumno({ ...nuevoAlumno, tipo_tdah: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
            )}

            <button
              onClick={async () => {
                if (
                  !nuevoAlumno.nombre ||
                  !nuevoAlumno.email ||
                  !nuevoAlumno.password ||
                  !nuevoAlumno.grupo_id
                ) {
                  fail(" Todos los campos son obligatorios");
                  return;
                }

                try {
                  await axios.post(
                    "http://localhost:4000/api/directivo/crear-alumno",
                    nuevoAlumno,
                    { headers }
                  );
                  ok(" Alumno creado correctamente");
                  setNuevoAlumno({
                    nombre: "",
                    email: "",
                    password: "",
                    grupo_id: "",
                    tiene_tdah: false,
                    tipo_tdah: "",
                  });
                  setMostrarModalAlumno(false);
                  cargarDatos();
                } catch (error) {
                  fail(" Error al crear alumno");
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Guardar alumno
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🗑️ Modal para confirmar eliminación de alumno */}
<AnimatePresence>
  {mostrarModalEliminarAlumno && alumnoAEliminar && (
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
        className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm space-y-4"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            ¿Eliminar alumno?
          </h3>
          <p className="text-gray-600">
            Estás a punto de eliminar a{" "}
            <span className="font-semibold text-gray-800">
              {alumnoAEliminar.nombre}
            </span>. <br />
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-3">
          <button
            onClick={async () => {
              try {
                await axios.delete(
                  `http://localhost:4000/api/directivo/eliminar-alumno/${alumnoAEliminar.alumno_id}`,
                  { headers }
                );
                ok("✅ Alumno eliminado correctamente");
                setMostrarModalEliminarAlumno(false);
                setAlumnoAEliminar(null);
                cargarDatos();
              } catch (e) {
                fail("❌ No se pudo eliminar el alumno");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Sí, eliminar
          </button>

          <button
            onClick={() => {
              setMostrarModalEliminarAlumno(false);
              setAlumnoAEliminar(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  </div>
)}

{vista === "grupos" && (
  <div className="space-y-6">
    {/* 🔹 Header con buscador y botón */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
      <h2 className="text-2xl font-semibold text-blue-700">
        🏫 Gestión de Grupos
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
        {/* 🔍 Buscador */}
        <input
          type="text"
          placeholder="Buscar grupo..."
          onChange={(e) => setBusquedaGrupos(e.target.value.toLowerCase())}
          className="border rounded-md p-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-400"
        />

        {/* ➕ Botón nuevo grupo */}
        <button
          onClick={() => setMostrarModalGrupo(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Nuevo grupo
        </button>
      </div>
    </div>

    {/* 🔹 Lista de grupos */}
    <div className="text-left">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">
        Lista de grupos
      </h3>

      {(() => {
        const filtrados = grupos.filter(
          (g) =>
            g.nombre.toLowerCase().includes(busquedaGrupos) ||
            g.grado.toLowerCase().includes(busquedaGrupos)
        );

const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
const start = (paginaGrupos - 1) * ITEMS_PER_PAGE;
const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

        return (
          <>
            {/* 🔹 Grid de tarjetas */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {visibles.map((g) => (
                  <motion.div
                    key={g.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-blue-700 text-lg">
                          {g.nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Grado: <b>{g.grado}</b>
                          <br />
                          Alumnos: {g.total_alumnos ?? 0}
                          <br />
                          Maestro:{" "}
                          <span className="font-medium text-gray-700">
                            {g.maestro || "Sin maestro"}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
  <button
    onClick={() =>
      setSeleccion({ ...seleccion, editandoGrupo: g.id })
    }
    className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
  >
    <Pencil size={18} />
  </button>

  {/* Eliminar */}
  <button
    onClick={() => {
      setGrupoAEliminar(m);
      setMostrarModalEliminarGrupo(true);
    }}
    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
  >
    <Trash2 size={18} />
  </button>
                      </div>
                    </div>

                    {/* ✏️ Panel de edición animado */}
                    <AnimatePresence>
                      {seleccion.editandoGrupo === g.id && (
                        <motion.div
                          key={`edit-g-${g.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="mt-4 border-t pt-3 space-y-2 overflow-hidden"
                        >
                          <input
                            defaultValue={g.nombre}
                            onChange={(e) => (g._nombre = e.target.value)}
                            className="border rounded-md px-2 py-1 w-full"
                          />
                          <input
                            defaultValue={g.grado}
                            onChange={(e) => (g._grado = e.target.value)}
                            className="border rounded-md px-2 py-1 w-full"
                          />

                          <select
                            defaultValue={g.maestro_id || ""}
                            onChange={(e) => (g._maestro = e.target.value)}
                            className="border p-1 rounded-md text-sm w-full"
                          >
                            <option value="">Asignar maestro...</option>
                            {maestros.map((m) => (
                              <option key={m.maestro_id} value={m.maestro_id}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>

                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              onClick={async () => {
                                try {
                                  await axios.put(
                                    `http://localhost:4000/api/directivo/actualizar-grupo/${g.id}`,
                                    {
                                      nombre: g._nombre ?? g.nombre,
                                      grado: g._grado ?? g.grado,
                                      maestro_id: g._maestro || null,
                                    },
                                    { headers }
                                  );
                                  ok(" Grupo actualizado correctamente");
                                  setSeleccion({
                                    ...seleccion,
                                    editandoGrupo: null,
                                  });
                                  cargarDatos();
                                } catch (e) {
                                  fail(e, "Error al actualizar grupo");
                                }
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Guardar
                            </button>

                            <button
                              onClick={() =>
                                setSeleccion({
                                  ...seleccion,
                                  editandoGrupo: null,
                                })
                              }
                              className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* 🔹 Paginación */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button
    key={n}
    onClick={() => setPaginaGrupos(n)}
    className={`px-3 py-1 rounded ${
      paginaGrupos === n
        ? "bg-blue-600 text-white"
        : "bg-gray-100 hover:bg-blue-100 text-gray-700"
    }`}
  >
    {n}
  </button>
))}
            </div>
          </>
        );
      })()}
    </div>

    {/* 🪄 Modal para crear grupo */}
    <AnimatePresence>
      {mostrarModalGrupo && (
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
                Nuevo grupo
              </h3>
              <button
                onClick={() => setMostrarModalGrupo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <input
              placeholder="Nombre (p. ej. Primero A)"
              value={nuevoGrupo.nombre}
              onChange={(e) =>
                setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
            <input
              placeholder="Grado (p. ej. Primero)"
              value={nuevoGrupo.grado}
              onChange={(e) =>
                setNuevoGrupo({ ...nuevoGrupo, grado: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />

            <select
              value={nuevoGrupo.maestro_id}
              onChange={(e) =>
                setNuevoGrupo({ ...nuevoGrupo, maestro_id: e.target.value })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="">Asignar maestro...</option>
              {maestros.map((m) => (
                <option key={m.maestro_id} value={m.maestro_id}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <button
  onClick={async () => {
    if (!nuevoGrupo.nombre || !nuevoGrupo.grado) {
      fail("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/directivo/crear-grupo",
        {
          ...nuevoGrupo,
          maestro_id: nuevoGrupo.maestro_id
            ? Number(nuevoGrupo.maestro_id)
            : null, //
        },
        { headers }
      );
      ok("✅ Grupo creado correctamente");
      setNuevoGrupo({ nombre: "", grado: "", maestro_id: "" });
      setMostrarModalGrupo(false);
      cargarDatos();
    } catch (error) {
      fail("❌ Error al crear grupo");
    }
  }}
  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
>
  Guardar grupo
</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🗑️ Modal para confirmar eliminación de grupo */}
<AnimatePresence>
  {mostrarModalEliminarGrupo && grupoAEliminar && (
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
        className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm space-y-4"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            ¿Eliminar grupo?
          </h3>
          <p className="text-gray-600">
            Estás a punto de eliminar el grupo <br />
            <span className="font-semibold text-gray-800">
              {grupoAEliminar.nombre}
            </span>.
            <br />
            <span className="text-red-500 font-medium">
              Esta acción no se puede deshacer.
            </span>
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-3">
          <button
            onClick={async () => {
              try {
                await axios.delete(
                  `http://localhost:4000/api/directivo/eliminar-grupo/${grupoAEliminar.id}`,
                  { headers }
                );
                ok("✓ Grupo eliminado correctamente");
                setMostrarModalEliminarGrupo(false);
                setGrupoAEliminar(null);
                cargarDatos();
              } catch (e) {
                fail("❌ No se pudo eliminar, verifica que no tenga alumnos");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Sí, eliminar
          </button>

          <button
            onClick={() => {
              setMostrarModalEliminarGrupo(false);
              setGrupoAEliminar(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  </div>
)}
    </div>
  );
}