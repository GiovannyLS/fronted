// ---------------------------------------------
// PanelMaestro.jsx (VERSIÓN FINAL CORREGIDA)
// ---------------------------------------------
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  LogOut,
  GraduationCap,
} from "lucide-react";

import GruposSection from "../components/maestro/GruposSection";
import TareasSection from "../components/maestro/TareasSection";
import ResultadosSection from "../components/maestro/ResultadosSection";
import ModalCrearTarea from "../components/maestro/ModalCrearTarea";
import ModalConfirmacion from "../components/maestro/ModalConfirmacion";
import HistorialAlumnoModal from "../components/maestro/HistorialAlumnoModal";
import ToastsContainer from "../components/maestro/ToastsContainer";
import ModalEditarTarea from "../components/maestro/ModalEditarTarea";
import ResultadosModal from "../components/maestro/ResultadosModal";
import ModalCrearJuego from "../components/maestro/ModalCrearJuego";

const ITEMS_PER_PAGE = 9;

export default function PanelMaestro() {
  const token = localStorage.getItem("token");
  const rol = Number(localStorage.getItem("rol"));
  const nombreMaestro = localStorage.getItem("nombre") || "Maestro(a)";
  const headers = { Authorization: `Bearer ${token}` };

  const [vista, setVista] = useState("grupos");

  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [alumnosGrupo, setAlumnosGrupo] = useState([]);

  const [tareas, setTareas] = useState([]);
  const [tareaEnEdicion, setTareaEnEdicion] = useState(null);

  // 🔥 EDITOR INDEPENDIENTE POR TAREA
  const [editFields, setEditFields] = useState({
    id: null,
    titulo: "",
    descripcion: "",
    puntos: 10,
    fecha_entrega: "",
  });

  // Resultados
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [resultadosTarea, setResultadosTarea] = useState([]);
  const [tareasResultados, setTareasResultados] = useState([]);

  const [modalJuegoInteractivo, setModalJuegoInteractivo] = useState(false);

  const [nuevoJuegoInteractivo, setNuevoJuegoInteractivo] = useState({
    grupo_id: "",
    titulo: "",
    tipo: "visual",
    instrucciones: "",
    contenido: {},
  });

  // Formularios
const [nuevoJuego, setNuevoJuego] = useState({
    grupo_id: "",
    titulo: "",
    descripcion: "",
    puntos: 10,
    fecha_entrega: "",
});

  const [mostrarModalJuego, setMostrarModalJuego] = useState(false);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [modalResultadosOpen, setModalResultadosOpen] = useState(false);
  const [busquedaModalResultados, setBusquedaModalResultados] = useState("");

  // Historial alumno
  const [mostrarHistorialAlumno, setMostrarHistorialAlumno] = useState(false);
  const [alumnoHistorial, setAlumnoHistorial] = useState(null);
  const [historialAlumno, setHistorialAlumno] = useState([]);

  // Paginación
  const [paginaGrupos, setPaginaGrupos] = useState(1);
  const [paginaTareas, setPaginaTareas] = useState(1);

  // Búsquedas
  const [busquedaGrupo, setBusquedaGrupo] = useState("");
  const [busquedaTarea, setBusquedaTarea] = useState("");
  const [busquedaResultados, setBusquedaResultados] = useState("");

  const [toasts, setToasts] = useState([]);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const ok = (m) => showToast(m, "success");
  const fail = (m) => showToast(m, "error");

  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  // Seguridad
  useEffect(() => {
    if (!token || rol !== 3) window.location.href = "/";
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (rol === 3) {
      cargarGrupos();
      cargarTareas();
    }
  }, []);

  // Reset al cambiar vista
  useEffect(() => {
    setTareaEnEdicion(null);
    setPaginaGrupos(1);
    setPaginaTareas(1);
    setBusquedaGrupo("");
    setBusquedaTarea("");
    setBusquedaResultados("");
  }, [vista]);

  // ---------------------------------------------
  // API
  // ---------------------------------------------

  const cargarGrupos = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/maestro/grupos",
        { headers }
      );
      setGrupos(data);
      if (data.length && !grupoSeleccionado) seleccionarGrupo(data[0]);
    } catch {
      fail("Error al cargar grupos");
    }
  };

  const seleccionarGrupo = async (g) => {
    setGrupoSeleccionado(g);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/maestro/grupo/${g.id}/alumnos`,
        { headers }
      );
      setAlumnosGrupo(data);
    } catch {
      fail("Error al obtener alumnos");
    }
  };

  const cargarTareas = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/maestro/tareas",
        { headers }
      );
      setTareas(data);
      setTareasResultados(data);
    } catch {
      fail("Error al cargar tareas");
    }
  };

const crearTarea = async (data) => {
  try {
    console.log("📨 ENVIANDO TAREA:", data);

    await axios.post(
      "http://localhost:4000/api/maestro/tareas",
      data,
      { headers }
    );

    ok("Tarea creada correctamente");
    setMostrarModalJuego(false);
    cargarTareas();
  } catch (e) {
    console.error("❌ Error al crear tarea:", e.response?.data || e);
    fail("No se pudo crear la tarea");
  }
};

const guardarEdicionTarea = async () => {
  try {
    await axios.put(
      `http://localhost:4000/api/maestro/tarea/${editFields.id}`,
      {
        titulo: editFields.titulo,
        descripcion: editFields.descripcion,
        puntos: Number(editFields.puntos),
        fecha_entrega: editFields.fecha_entrega,
      },
      { headers }
    );

    ok("Tarea actualizada correctamente");
    setMostrarModalEditar(false);
    cargarTareas(); // 🔥 refresca lista
  } catch (e) {
    console.error(e);
    fail("Error al actualizar la tarea");
  }
};

  const verResultadosDeTarea = async (t) => {
    setTareaSeleccionada(t);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/maestro/tarea/${t.id}/resultados`,
        { headers }
      );
      setResultadosTarea(data);
    } catch {
      fail("Error al cargar resultados");
    }
  };

  const handleEliminar = async () => {
    try {
      await axios.delete(
        `http://localhost:4000/api/maestro/tarea/${tareaAEliminar.id}`,
        { headers }
      );
      ok("Tarea eliminada");
      setMostrarConfirmEliminar(false);
      cargarTareas();
    } catch {
      fail("No se pudo eliminar");
    }
  };

  const formatFecha = (f) => {
    if (!f) return "Sin fecha";
    const d = new Date(f);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const abrirModalEditarTarea = (t) => {
  setTareaEnEdicion(t); 

  setEditFields({
    id: t.id,
    titulo: t.titulo,
    descripcion: t.descripcion,
    puntos: t.puntos,
    fecha_entrega: t.fecha_entrega ? t.fecha_entrega.slice(0, 10) : "",
  });

  setMostrarModalEditar(true);
  };

  const onAbrirResultados = async (tarea) => {
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
    setResultadosTarea([]);
  }

  setModalResultadosOpen(true);
  };
  const onAbrirModalResultados = async (tarea) => {
  setTareaSeleccionada(tarea);
  try {
    const { data } = await axios.get(
      `http://localhost:4000/api/maestro/tarea/${tarea.id}/resultados`,
      { headers }
    );
    setResultadosTarea(data);
    setMostrarModalResultados(true);
  } catch (error) {
    console.error(error);
    fail("Error al cargar los resultados");
  }
};

const crearTareaJuego = async (formData) => {
  console.log("📩 RECIBIDO DESDE MODAL:", formData);

  try {
    const response = await axios.post(
      "http://localhost:4000/api/maestro/juegos-interactivos",
      formData,
      { headers }
    );

    console.log("📦 RESPUESTA SERVIDOR:", response.data);

    ok("Juego creado correctamente");
    cargarTareas();
  } catch (error) {
    console.log("❌ ERROR backend:", error.response?.data || error);
    fail("Error al crear el juego interactivo");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50">
      <ToastsContainer toasts={toasts} />

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-700">
              <GraduationCap />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-blue-800">Panel del maestro</h1>
              <p className="text-xs">Bienvenido, {nombreMaestro}</p>
            </div>
          </div>

          <button
            className="bg-red-50 px-3 py-1.5 rounded-full text-red-600"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        <nav className="bg-sky-50/50 border-t border-blue-50">
          <div className="max-w-6xl mx-auto flex gap-3 px-6 py-2">
            <button
              className={`px-4 py-1.5 rounded-full ${
                vista === "grupos" ? "bg-blue-600 text-white" : "hover:bg-blue-100"
              }`}
              onClick={() => setVista("grupos")}
            >
              <Users size={16} /> Grupos
            </button>

            <button
              className={`px-4 py-1.5 rounded-full ${
                vista === "tareas" ? "bg-blue-600 text-white" : "hover:bg-blue-100"
              }`}
              onClick={() => setVista("tareas")}
            >
              <ClipboardList size={16} /> Tareas / Juegos
            </button>

            <button
              className={`px-4 py-1.5 rounded-full ${
                vista === "resultados"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100"
              }`}
              onClick={() => setVista("resultados")}
            >
              <CheckCircle2 size={16} /> Resultados
            </button>
          </div>
        </nav>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {vista === "grupos" && (
          <GruposSection
            grupos={grupos}
            grupoSeleccionado={grupoSeleccionado}
            alumnosGrupo={alumnosGrupo}
            onSelectGrupo={seleccionarGrupo}
            busquedaGrupo={busquedaGrupo}
            setBusquedaGrupo={setBusquedaGrupo}
            paginaGrupos={paginaGrupos}
            setPaginaGrupos={setPaginaGrupos}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          />
        )}

        {vista === "tareas" && (
          <TareasSection
            tareas={tareas}
            tareaEnEdicion={tareaEnEdicion}
            setTareaEnEdicion={(id) => {
              if (id) {
                const t = tareas.find((x) => x.id === id);
                setEditFields({
                  [id]: {
                    titulo: t.titulo,
                    descripcion: t.descripcion,
                    puntos: t.puntos,
                    fecha_entrega: t.fecha_entrega
                      ? t.fecha_entrega.slice(0, 10)
                      : "",
                  },
                });
              }
              setTareaEnEdicion(id);
            }}
            editFields={editFields}
            setEditFields={setEditFields}
            guardarEdicionTarea={guardarEdicionTarea}
            paginaTareas={paginaTareas}
            setPaginaTareas={setPaginaTareas}
            busquedaTarea={busquedaTarea}
            setBusquedaTarea={setBusquedaTarea}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            formatFecha={formatFecha}
            onAbrirResultados={verResultadosDeTarea}
            onPedirEliminar={(t) => {
              setTareaAEliminar(t);
              setMostrarConfirmEliminar(true);
            }}
            onAbrirModalNueva={() => setMostrarModalJuego(true)}
            onEditar={abrirModalEditarTarea}
            onAbrirModalResultados={onAbrirResultados}
            onAbrirModalJuegoInteractivo={() => setModalJuegoInteractivo(true)}
          />
        )}

        {vista === "resultados" && (
          <ResultadosSection
            tareasResultados={tareasResultados}
            tareaSeleccionada={tareaSeleccionada}
            resultadosTarea={resultadosTarea}
            setTareaSeleccionada={setTareaSeleccionada}
            busquedaResultados={busquedaResultados}
            setBusquedaResultados={setBusquedaResultados}
            onVerResultadosDeTarea={verResultadosDeTarea}
            formatFecha={formatFecha}
          />
        )}
      </main>

      {/* MODALES */}
      <ModalCrearTarea
        open={mostrarModalJuego}
        onClose={() => setMostrarModalJuego(false)}
        nuevoJuego={nuevoJuego}
        setNuevoJuego={setNuevoJuego}
        grupos={grupos}
        onSubmit={(data) => crearTarea(data)}
      />

      <ModalConfirmacion
        open={mostrarConfirmEliminar}
        title="Eliminar tarea"
        description="Esta acción no se puede deshacer."
        onCancel={() => setMostrarConfirmEliminar(false)}
        onConfirm={handleEliminar}
      />

      <ModalEditarTarea
        open={mostrarModalEditar}
        onClose={() => setMostrarModalEditar(false)}
        tarea={tareaEnEdicion}
        editFields={editFields}
        setEditFields={setEditFields}
        onGuardar={guardarEdicionTarea}
      />

      <ResultadosModal
        open={modalResultadosOpen}
        onClose={() => setModalResultadosOpen(false)}
        tarea={tareaSeleccionada}
        resultados={resultadosTarea}
        busqueda={busquedaModalResultados}
        setBusqueda={setBusquedaModalResultados}
      />

      <ModalCrearJuego
        open={modalJuegoInteractivo}
        onClose={() => setModalJuegoInteractivo(false)}
        grupos={grupos}
        nuevoJuego={nuevoJuegoInteractivo}
        setNuevoJuego={setNuevoJuegoInteractivo}
        onSubmit={(formData) => crearTareaJuego(formData)}
      />

      <HistorialAlumnoModal
        open={mostrarHistorialAlumno}
        onClose={() => setMostrarHistorialAlumno(false)}
        alumno={alumnoHistorial}
        historial={historialAlumno}
        formatFecha={formatFecha}
      />
    </div>
  );
}