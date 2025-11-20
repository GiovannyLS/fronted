import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Plus,
  LogOut,
  Calendar,
  Target,
  X,
  Pencil,
  Trash2,
  GraduationCap,
} from "lucide-react";
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

const ITEMS_PER_PAGE = 9;

export default function PanelMaestro() {
  // ---------- Auth / contexto ----------
  const token = localStorage.getItem("token");
  const rol = Number(localStorage.getItem("rol"));
  const nombreMaestro = localStorage.getItem("nombre") || "Maestro(a)";

  const headers = { Authorization: `Bearer ${token}` };

  // Si no hay token o rol ≠ 3, lo sacamos
  useEffect(() => {
    if (!token || rol !== 3) {
      window.location.href = "/";
    }
  }, [token, rol]);

  // ---------- Estado principal ----------
  const [vista, setVista] = useState("grupos"); // "grupos" | "tareas" | "resultados"

  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [alumnosGrupo, setAlumnosGrupo] = useState([]);

  const [tareas, setTareas] = useState([]);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [resultadosTarea, setResultadosTarea] = useState([]);

  const [tareasResultados, setTareasResultados] = useState([]);
const [busquedaResultados, setBusquedaResultados] = useState("");

  // Formularios
  const [nuevoJuego, setNuevoJuego] = useState({
    grupo_id: "",
    alumno_id: "",
    titulo: "",
    descripcion: "",
    puntos: 10,
    fecha_entrega: "",
  });

  const [tareaEnEdicion, setTareaEnEdicion] = useState(null);

  // Modales
  const [mostrarModalJuego, setMostrarModalJuego] = useState(false);
  const [mostrarModalResultados, setMostrarModalResultados] = useState(false);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [tareaAEliminar, setTareaAEliminar] = useState(null);

  // Paginación
  const [paginaGrupos, setPaginaGrupos] = useState(1);
  const [paginaTareas, setPaginaTareas] = useState(1);

  // Filtros / buscadores
  const [busquedaGrupo, setBusquedaGrupo] = useState("");
  const [busquedaTarea, setBusquedaTarea] = useState("");
  

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Colores para las gráficas
const COLORS = ["#2563EB", "#22C55E", "#F97316", "#EC4899", "#A855F7"];

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const ok = (msg) => showToast(msg, "success");
  const fail = (msg) => showToast(msg, "error");

  // ---------- Carga inicial ----------
  useEffect(() => {
    if (!token || rol !== 3) return;
    cargarGrupos();
    cargarTareas();
  }, []);

  // Al cambiar de vista, reseteamos ediciones / paginación
  useEffect(() => {
    setTareaEnEdicion(null);
    setMostrarModalResultados(false);
    setMostrarModalJuego(false);
    setMostrarConfirmEliminar(false);
    setPaginaGrupos(1);
    setPaginaTareas(1);
  }, [vista]);

  useEffect(() => {
  if (vista === "resultados") {
    cargarTareasResultados();
  }
}, [vista]);

  // ---------- Llamadas a la API ----------
  const cargarGrupos = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/maestro/grupos",
        { headers }
      );
      setGrupos(data);
      if (data.length > 0 && !grupoSeleccionado) {
        seleccionarGrupo(data[0]);
      }
    } catch (e) {
      console.error(e);
      fail("Error al cargar grupos");
    }
  };

const seleccionarGrupo = async (grupo) => {
  setGrupoSeleccionado(grupo);
  try {
    const { data } = await axios.get(
      `http://localhost:4000/api/maestro/grupo/${grupo.id}/alumnos`,
      { headers }
    );
    setAlumnosGrupo(data);
  } catch (e) {
    console.error(e);
    fail("Error al cargar alumnos del grupo");
  }
};

  const cargarTareas = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/maestro/tareas",
        { headers }
      );
      setTareas(data);
    } catch (e) {
      console.error(e);
      fail("Error al cargar tareas");
    }
  };

  const crearTarea = async () => {
    if (!nuevoJuego.grupo_id || !nuevoJuego.titulo || !nuevoJuego.descripcion) {
      fail("Completa al menos grupo, título y descripción");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/maestro/tareas",
        {
          grupo_id: Number(nuevoJuego.grupo_id),
          alumno_id: nuevoJuego.alumno_id
            ? Number(nuevoJuego.alumno_id)
            : null,
          titulo: nuevoJuego.titulo,
          descripcion: nuevoJuego.descripcion,
          puntos: Number(nuevoJuego.puntos) || 10,
          fecha_entrega: nuevoJuego.fecha_entrega || null,
        },
        { headers }
      );

      ok("Tarea / juego creado correctamente");
      setMostrarModalJuego(false);
      setNuevoJuego({
        grupo_id: "",
        alumno_id: "",
        titulo: "",
        descripcion: "",
        puntos: 10,
        fecha_entrega: "",
      });
      cargarTareas();
    } catch (e) {
      console.error(e);
      fail("Error al crear tarea");
    }
  };

  const actualizarTarea = async (t) => {
    try {
      await axios.put(
        `http://localhost:4000/api/maestro/tarea/${t.id}`,
        {
          titulo: t._titulo ?? t.titulo,
          descripcion: t._descripcion ?? t.descripcion,
          puntos: t._puntos ?? t.puntos,
          fecha_entrega: t._fecha_entrega ?? t.fecha_entrega,
        },
        { headers }
      );
      ok("Tarea actualizada");
      setTareaEnEdicion(null);
      cargarTareas();
    } catch (e) {
      console.error(e);
      fail("Error al actualizar tarea");
    }
  };

  const eliminarTarea = async () => {
    if (!tareaAEliminar) return;
    try {
      await axios.delete(
        `http://localhost:4000/api/maestro/tarea/${tareaAEliminar.id}`,
        { headers }
      );
      ok("Tarea eliminada");
      setMostrarConfirmEliminar(false);
      setTareaAEliminar(null);
      cargarTareas();
    } catch (e) {
      console.error(e);
      fail("No se pudo eliminar la tarea");
    }
  };

  const abrirResultados = async (tarea) => {
    setTareaSeleccionada(tarea);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/maestro/tarea/${tarea.id}/resultados`,
        { headers }
      );
      setResultadosTarea(data);
      setMostrarModalResultados(true);
    } catch (e) {
      console.error(e);
      fail("Error al cargar resultados");
    }
  };

  const calificarAlumno = async (fila) => {
    try {
      await axios.put(
        `http://localhost:4000/api/maestro/tarea/${tareaSeleccionada.id}/calificar`,
        {
          alumno_id: fila.alumno_id,
          calificacion: Number((fila._calificacion ?? fila.calificacion) || 0),
          comentario_maestro: (fila._comentario ?? fila.comentario_maestro) || "",
        },
        { headers }
      );
      ok("Calificación guardada");
      abrirResultados(tareaSeleccionada); // refresca
    } catch (e) {
      console.error(e);
      fail("Error al calificar");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

const cargarTareasResultados = async () => {
  try {
    const { data } = await axios.get("http://localhost:4000/api/maestro/tareas", { headers });
    setTareasResultados(data);
  } catch (e) {
    console.error(e);
    fail("Error al cargar tareas para resultados");
  }
};

const verResultadosDeTarea = async (tarea) => {
  setTareaSeleccionada(tarea);
  try {
    const { data } = await axios.get(
      `http://localhost:4000/api/maestro/tarea/${tarea.id}/resultados`,
      { headers }
    );
    setResultadosTarea(data);
  } catch (e) {
    console.error(e);
    fail("Error al cargar resultados");
  }
};

  // ---------- Helpers de formato ----------
  const formatFecha = (f) => {
    if (!f) return "Sin fecha";
    const d = new Date(f);
    if (Number.isNaN(d.getTime())) return f;
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ===================== RENDER =====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-blue-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Panel del Maestro
            </h1>
            <p className="text-sm text-gray-500">
              Bienvenido, <span className="font-semibold">{nombreMaestro}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow-sm"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </header>

      {/* Tabs de navegación */}
      <div className="px-8 pt-4 flex gap-3">
        <button
          onClick={() => setVista("grupos")}
          className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
            vista === "grupos"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-700 border border-blue-100"
          }`}
        >
          <Users size={18} />
          Grupos
        </button>
        <button
          onClick={() => setVista("tareas")}
          className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
            vista === "tareas"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-700 border border-blue-100"
          }`}
        >
          <ClipboardList size={18} />
          Tareas / Juegos
        </button>
        <button
          onClick={() => setVista("resultados")}
          className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
            vista === "resultados"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-700 border border-blue-100"
          }`}
        >
          <CheckCircle2 size={18} />
          Resultados
        </button>
                          <input
      onChange={(e) => setBusquedaAlumnos(e.target.value.toLowerCase())}
      placeholder="Buscar alumno..."
      className="border rounded-md p-2 w-full sm:w-64"
    />
      </div>

      {/* Contenido principal */}
      <main className="px-8 pb-10 pt-4">
        {/* ---------- VISTA GRUPOS ---------- */}
        {vista === "grupos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de grupos */}
            <section className="lg:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <Users size={20} />
                  Mis grupos
                </h2>
              </div>

              {(() => {
                const filtrados = grupos.filter(
                  (g) =>
                    g.nombre.toLowerCase().includes(busquedaGrupo) ||
                    (g.grado || "").toLowerCase().includes(busquedaGrupo)
                );

                const totalPages = Math.ceil(
                  filtrados.length / ITEMS_PER_PAGE
                );
                const start = (paginaGrupos - 1) * ITEMS_PER_PAGE;
                const visibles = filtrados.slice(
                  start,
                  start + ITEMS_PER_PAGE
                );

                return (
                  <>
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <AnimatePresence>
                        {visibles.map((g) => (
                          <motion.button
                            key={g.id}
                            layout
                            onClick={() => seleccionarGrupo(g)}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`text-left p-4 rounded-xl border shadow-sm hover:shadow-md ${
                              grupoSeleccionado?.id === g.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-100 bg-white"
                            }`}
                          >
                            <h3 className="font-semibold text-blue-700">
                              {g.nombre}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Grado: <b>{g.grado || "N/A"}</b>
                              <br />
                              Alumnos: {g.total_alumnos ?? 0}
                            </p>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {totalPages > 1 && (
                      <div className="flex justify-center mt-4 gap-2">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((n) => (
                          <button
                            key={n}
                            onClick={() => setPaginaGrupos(n)}
                            className={`px-3 py-1 rounded text-sm ${
                              paginaGrupos === n
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-blue-100 text-gray-700"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>
            

            {/* Alumnos del grupo seleccionado */}
            <section className="bg-white rounded-2xl shadow-sm p-4 border border-blue-50">
              <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-2">
                <Users size={20} />
                Alumnos del grupo
              </h2>
              {grupoSeleccionado ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Grupo seleccionado:{" "}
                    <b>{grupoSeleccionado.nombre}</b>
                  </p>
                  {alumnosGrupo.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Aún no hay alumnos asignados a este grupo.
                    </p>
                  ) : (
                    <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
                      {alumnosGrupo.map((a) => (
                        <li
                          key={a.id}
                          className="text-sm text-gray-700 flex justify-between"
                        >
                          <span>{a.nombre}</span>
                          <span className="text-xs text-gray-400">
                            ID: {a.id}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Selecciona un grupo para ver sus alumnos.
                </p>
              )}
            </section>
          </div>
        )}

        {/* ---------- VISTA TAREAS / JUEGOS ---------- */}
        {vista === "tareas" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <ClipboardList size={20} />
                Tareas y juegos
              </h2>

              <div className="flex gap-2 items-center w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar tarea..."
                  onChange={(e) =>
                    setBusquedaTarea(e.target.value.toLowerCase())
                  }
                  className="border rounded-md p-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => setMostrarModalJuego(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm text-sm"
                >
                  <Plus size={18} />
                  Nueva tarea
                </button>
              </div>
            </div>

            {(() => {
              const filtradas = tareas.filter(
                (t) =>
                  t.titulo.toLowerCase().includes(busquedaTarea) ||
                  (t.descripcion || "")
                    .toLowerCase()
                    .includes(busquedaTarea)
              );

              const totalPages = Math.ceil(
                filtradas.length / ITEMS_PER_PAGE
              );
              const start = (paginaTareas - 1) * ITEMS_PER_PAGE;
              const visibles = filtradas.slice(start, start + ITEMS_PER_PAGE);

              return (
                <>
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    <AnimatePresence>
                      {visibles.map((t) => (
                        <motion.div
                          key={t.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md flex flex-col justify-between"
                         >
                          {/* Cabecera */}
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <h3 className="font-semibold text-blue-700">
                                {t.titulo}
                              </h3>
                              <p className="text-xs text-gray-500 mb-1">
                                Grupo:{" "}
                                <b>{t.grupo_nombre || t.grupo_id}</b> ·
                                {t.alumno_id
                                  ? " Individual"
                                  : " Para todo el grupo"}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {t.descripcion}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() =>
                                  setTareaEnEdicion(
                                    tareaEnEdicion === t.id ? null : t.id
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setTareaAEliminar(t);
                                  setMostrarConfirmEliminar(true);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Info extra */}
                          <div className="mt-3 flex justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Entrega: {formatFecha(t.fecha_entrega)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target size={14} />
                              {t.puntos} pts ·{" "}
                              {(t.completados ?? 0) + " completados"}
                            </span>
                          </div>

                          {/* Panel de edición */}
                          <AnimatePresence>
                            {tareaEnEdicion === t.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-3 border-t pt-3 space-y-2 text-sm overflow-hidden"
                              >
                                <input
                                  defaultValue={t.titulo}
                                  onChange={(e) =>
                                    (t._titulo = e.target.value)
                                  }
                                  className="border rounded-md px-2 py-1 w-full"
                                />
                                <textarea
                                  defaultValue={t.descripcion}
                                  onChange={(e) =>
                                    (t._descripcion = e.target.value)
                                  }
                                  className="border rounded-md px-2 py-1 w-full text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    defaultValue={t.puntos}
                                    onChange={(e) =>
                                      (t._puntos = e.target.value)
                                    }
                                    className="border rounded-md px-2 py-1 w-24 text-sm"
                                  />
                                  <input
                                    type="date"
                                    defaultValue={
                                      t.fecha_entrega
                                        ? t.fecha_entrega.slice(0, 10)
                                        : ""
                                    }
                                    onChange={(e) =>
                                      (t._fecha_entrega = e.target.value)
                                    }
                                    className="border rounded-md px-2 py-1 text-sm"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => actualizarTarea(t)}
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
                          </AnimatePresence>

                          {/* Botón resultados */}
                          <button
                            onClick={() => abrirResultados(t)}
                            className="mt-3 w-full text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded-md py-1 hover:bg-purple-100"
                          >
                            Ver resultados de los alumnos
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                      ).map((n) => (
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
                </>
              );
            })()}
          </div>
        )}

        {/* ---------- VISTA RESULTADOS (atajo rápido) ---------- */}
{vista === "resultados" && (
  <div className="space-y-6">
    {/* Título */}
    <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
      <span className="text-blue-600">📊</span>
      Resumen de resultados
    </h2>

    {/* Buscador arriba a la derecha */}
    <div className="flex justify-end mb-2">
      <input
        type="text"
        placeholder="Buscar alumno..."
        value={busquedaResultados}
        onChange={(e) => setBusquedaResultados(e.target.value.toLowerCase())}
        className="border rounded-md p-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
      />
    </div>

    {/* === 1. GRÁFICAS GLOBALES POR TAREA (izquierda) Y RESUMEN DE ESTADO (derecha) === */}
    {tareasResultados.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📈 Gráfico de barras: tareas vs completadas */}
        <div className="bg-white rounded-xl shadow-md p-4 border">
          <h3 className="font-semibold text-blue-700 mb-3">
            Vista general de tareas
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={tareasResultados.map((t) => ({
                nombre: t.titulo,
                completadas: Number(t.completados || 0),
                total: Number(t.total_alumnos || 0),
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
              <Legend />
              <Bar dataKey="total" name="Total alumnos" fill="#CBD5F5" />
              <Bar dataKey="completadas" name="Completadas" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🧩 Pie: completadas vs pendientes de una tarea seleccionada o la primera */}
        <div className="bg-white rounded-xl shadow-md p-4 border">
          <h3 className="font-semibold text-blue-700 mb-3">
            Estado general de tareas
          </h3>

          {(() => {
            const t = tareaSeleccionada || tareasResultados[0];
            const total = Number(t.total_alumnos || 0);
            const comp = Number(t.completados || 0);
            const pend = total - comp >= 0 ? total - comp : 0;

            const pieData = [
              { name: "Completadas", value: comp },
              { name: "Pendientes", value: pend },
            ];

            return (
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">
                  Tarea seleccionada:{" "}
                  <b className="text-blue-700">{t.titulo}</b>
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
                              ? "#22C55E" // completadas
                              : "#F97316" // pendientes
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <p className="text-xs text-gray-500 mt-1">
                  Total alumnos: {total}, completadas: {comp}, pendientes: {pend}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    )}

    {/* === 2. TARJETAS DE TAREAS CON BOTÓN "VER RESULTADOS" === */}
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">
        Tareas creadas
      </h3>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {tareasResultados.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100"
            >
              <h4 className="font-semibold text-blue-700 text-lg">
                {t.titulo}
              </h4>
              <p className="text-sm text-gray-600">
                Grupo: <b>{t.grupo_nombre}</b>
                <br />
                Puntos: <b>{t.puntos}</b>
                <br />
                Completadas: {t.completados} / {t.total_alumnos || "?"}
              </p>

              <button
                onClick={() => verResultadosDeTarea(t)}
                className="mt-3 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 w-full"
              >
                Ver resultados
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>

    {/* === 3. TABLA / LISTA DETALLADA DE RESULTADOS DE LA TAREA SELECCIONADA === */}
    {tareaSeleccionada && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-white p-6 rounded-xl shadow-md border"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-blue-700">
            Resultados de: {tareaSeleccionada.titulo}
          </h3>
          <p className="text-sm text-gray-500">
            Grupo: <b>{tareaSeleccionada.grupo_nombre}</b> · Puntos:{" "}
            <b>{tareaSeleccionada.puntos}</b>
          </p>
        </div>

        {/* Gráfico de barras de calificaciones por alumno */}
        {resultadosTarea.length > 0 && (
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
                  <Bar dataKey="calificacion" name="Calificación" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lista de resultados por alumno */}
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
                    <span className="text-red-600 font-bold">✖ Pendiente</span>
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
      </motion.div>
    )}

    {/* Mensaje si no hay tareas */}
    {tareasResultados.length === 0 && (
      <p className="text-gray-500 text-sm">
        Aún no hay tareas creadas. Puedes crear una desde la pestaña{" "}
        <b>"Tareas / Juegos"</b>.
      </p>
    )}
  </div>
)}
      </main>

      {/* ---------- MODAL: Nueva tarea / juego ---------- */}
      <AnimatePresence>
        {mostrarModalJuego && (
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
              className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                  <Plus size={20} />
                  Nueva tarea / juego
                </h3>
                <button
                  onClick={() => setMostrarModalJuego(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <label className="block">
                  <span className="text-gray-700">Grupo</span>
                  <select
                    value={nuevoJuego.grupo_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNuevoJuego({ ...nuevoJuego, grupo_id: value });
                      const g = grupos.find((gr) => String(gr.id) === value);
                      if (g) seleccionarGrupo(g);
                    }}
                    className="w-full border rounded-md p-2 mt-1"
                  >
                    <option value="">Selecciona un grupo...</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-gray-700">
                    Alumno (opcional – vacío = todo el grupo)
                  </span>
                  <select
                    value={nuevoJuego.alumno_id}
                    onChange={(e) =>
                      setNuevoJuego({
                        ...nuevoJuego,
                        alumno_id: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2 mt-1"
                  >
                    <option value="">Todos los alumnos del grupo</option>
                    {alumnosGrupo.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-gray-700">Título</span>
                  <input
                    value={nuevoJuego.titulo}
                    onChange={(e) =>
                      setNuevoJuego({
                        ...nuevoJuego,
                        titulo: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2 mt-1"
                    placeholder="Ej. Rompecabezas de atención"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700">
                    Descripción / tipo de juego
                  </span>
                  <textarea
                    value={nuevoJuego.descripcion}
                    onChange={(e) =>
                      setNuevoJuego({
                        ...nuevoJuego,
                        descripcion: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2 mt-1 text-sm"
                    rows={3}
                    placeholder="Ej. Arrastrar y soltar piezas en el orden correcto..."
                  />
                </label>

                <div className="flex gap-3">
                  <label className="block flex-1">
                    <span className="text-gray-700">Puntos</span>
                    <input
                      type="number"
                      min={1}
                      value={nuevoJuego.puntos}
                      onChange={(e) =>
                        setNuevoJuego({
                          ...nuevoJuego,
                          puntos: e.target.value,
                        })
                      }
                      className="w-full border rounded-md p-2 mt-1"
                    />
                  </label>

                  <label className="block flex-1">
                    <span className="text-gray-700">Fecha de entrega</span>
                    <input
                      type="date"
                      value={nuevoJuego.fecha_entrega}
                      onChange={(e) =>
                        setNuevoJuego({
                          ...nuevoJuego,
                          fecha_entrega: e.target.value,
                        })
                      }
                      className="w-full border rounded-md p-2 mt-1"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={crearTarea}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-2"
              >
                Guardar tarea
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- MODAL: Resultados de tarea ---------- */}
      <AnimatePresence>
        {mostrarModalResultados && tareaSeleccionada && (
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
              className="bg-white rounded-2xl shadow-lg p-6 w-[95%] max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-blue-700">
                    Resultados: {tareaSeleccionada.titulo}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Grupo: {tareaSeleccionada.grupo_nombre || "N/A"} · Puntos:{" "}
                    {tareaSeleccionada.puntos}
                  </p>
                </div>
                <button
                  onClick={() => setMostrarModalResultados(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={22} />
                </button>
              </div>

              {resultadosTarea.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Ningún alumno ha completado esta actividad todavía.
                </p>
              ) : (
                <div className="space-y-2">
                  {resultadosTarea.map((r) => (
                    <div
                      key={r.id}
                      className="border rounded-lg p-3 flex flex-col md:flex-row justify-between gap-2 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {r.alumno}
                        </p>
                        <p className="text-xs text-gray-500">
                          Estado:{" "}
                          <span
                            className={
                              r.completada ? "text-green-600" : "text-orange-500"
                            }
                          >
                            {r.completada ? "Completada" : "Pendiente"}
                          </span>{" "}
                          · Fecha:{" "}
                          {r.fecha_completada
                            ? formatFecha(r.fecha_completada)
                            : "—"}
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <input
                          type="number"
                          min={0}
                          max={tareaSeleccionada.puntos}
                          defaultValue={r.calificacion ?? ""}
                          onChange={(e) =>
                            (r._calificacion = e.target.value)
                          }
                          className="border rounded-md px-2 py-1 w-24 text-sm"
                          placeholder="Pts"
                        />
                        <input
                          type="text"
                          defaultValue={r.comentario_maestro || ""}
                          onChange={(e) => (r._comentario = e.target.value)}
                          className="border rounded-md px-2 py-1 text-sm flex-1"
                          placeholder="Comentario breve"
                        />
                        <button
                          onClick={() => calificarAlumno(r)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- MODAL: Confirmar eliminación tarea ---------- */}
      <AnimatePresence>
        {mostrarConfirmEliminar && tareaAEliminar && (
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
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <Trash2 size={20} />
                  Eliminar tarea
                </h3>
                <button
                  onClick={() => setMostrarConfirmEliminar(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-700">
                ¿Seguro que deseas eliminar la tarea{" "}
                <span className="font-semibold">
                  “{tareaAEliminar.titulo}”
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setMostrarConfirmEliminar(false)}
                  className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarTarea}
                  className="px-3 py-1 rounded-md text-sm bg-red-600 text-white"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- TOASTS ---------- */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`px-4 py-2 rounded-lg shadow text-sm text-white ${
                t.type === "success"
                  ? "bg-green-500"
                  : t.type === "error"
                  ? "bg-red-500"
                  : "bg-slate-600"
              }`}
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}