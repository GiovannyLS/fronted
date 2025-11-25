import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import TobiMensaje from "../components/TobiMensaje";
import Tobi from "../components/Tobi"; // (aún no se usa, pero puedes quitarlo si quieres)

// 🔹 Componentes de actividades (tipo de tarea)
function ActividadTexto({ tarea, onTerminar }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-700">{tarea.descripcion}</p>
      <button
        onClick={() => onTerminar(10)} // 10/10 por defecto
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Marcar como realizada
      </button>
    </div>
  );
}

function ActividadPreguntas({ tarea, onTerminar }) {
  const preguntas = tarea.contenido?.preguntas || [];
  const [respuestas, setRespuestas] = useState({});

  const responder = (idx, opcion) => {
    setRespuestas((prev) => ({ ...prev, [idx]: opcion }));
  };

  const enviar = () => {
    if (preguntas.length === 0) {
      onTerminar(10);
      return;
    }
    let aciertos = 0;
    preguntas.forEach((p, idx) => {
      if (respuestas[idx] === p.correcta) aciertos++;
    });
    const calif = Math.round((aciertos / preguntas.length) * 10);
    onTerminar(calif);
  };

  return (
    <div className="space-y-4">
      {preguntas.map((p, idx) => (
        <div key={idx} className="border rounded-md p-3">
          <p className="font-medium text-gray-700 mb-2">
            {idx + 1}. {p.pregunta}
          </p>
          <div className="space-y-1">
            {p.opciones.map((op, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`preg-${idx}`}
                  onChange={() => responder(idx, i)}
                  checked={respuestas[idx] === i}
                />
                {op}
              </label>
            ))}
          </div>
        </div>
      ))}

<div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 items-center">
  {!todasConectadas && (
    <p className="text-xs text-red-500 mr-auto sm:mr-0">
      Conecta todas las imágenes con una respuesta antes de enviar. 🙂
    </p>
  )}

  <button
    onClick={onClose}
    className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700"
  >
    Cancelar
  </button>

  <button
    onClick={handleEnviar}
    disabled={!todasConectadas}
    className={`px-4 py-2 rounded-md text-sm text-white transition ${
      todasConectadas
        ? "bg-green-600 hover:bg-green-700"
        : "bg-gray-300 cursor-not-allowed"
    }`}
  >
    {todasConectadas ? "Enviar respuestas" : "Conecta todo primero"}
  </button>
</div>
    </div>
  );
}

// 🔹 Por ahora estos son placeholders; se pueden volver juegos después
function ActividadConectarLineas({ tarea, onTerminar }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-700">
        (Aquí irá el juego de conectar líneas para: <b>{tarea.titulo}</b>)
      </p>
      <button
        onClick={() => onTerminar(10)}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Terminé correctamente
      </button>
    </div>
  );
}

function ActividadArrastrar({ tarea, onTerminar }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-700">
        (Aquí irá el juego de arrastrar piezas para: <b>{tarea.titulo}</b>)
      </p>
      <button
        onClick={() => onTerminar(10)}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Terminé correctamente
      </button>
    </div>
  );
}

function ActividadRompecabezas({ tarea, onTerminar }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-700">
        (Aquí irá el rompecabezas para: <b>{tarea.titulo}</b>)
      </p>
      <button
        onClick={() => onTerminar(10)}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Terminé correctamente
      </button>
    </div>
  );
}

// 🔹 Modal genérico para mostrar la actividad de la tarea
function ModalTarea({ open, onClose, tarea, onTerminar }) {
  if (!open || !tarea) return null;

  const renderActividad = () => {
    switch (tarea.tipo) {
      case "preguntas":
        return <ActividadPreguntas tarea={tarea} onTerminar={onTerminar} />;
      case "conectar_lineas":
        return <ActividadConectarLineas tarea={tarea} onTerminar={onTerminar} />;
      case "arrastrar":
        return <ActividadArrastrar tarea={tarea} onTerminar={onTerminar} />;
      case "rompecabezas":
        return <ActividadRompecabezas tarea={tarea} onTerminar={onTerminar} />;
      default:
        return <ActividadTexto tarea={tarea} onTerminar={onTerminar} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-blue-700">
            {tarea.titulo || "Tarea"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cerrar ✖
          </button>
        </div>

        {renderActividad()}
      </div>
    </div>
  );
}

/* =========================================================
   🔹 Helpers para el juego de CONECTAR LÍNEAS
   ========================================================= */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 🔹 Modal / juego de conectar líneas
function JuegoConectarLineas({
  tarea,
  respuestasJuego,
  setRespuestasJuego,
  onClose,
  onEnviar,
}) {
  const pares = tarea.pares || tarea.contenido?.pares || [];

  // Opciones de la derecha: usamos la respuesta correcta de cada par, mezclada
  const opcionesDerecha = useMemo(() => {
    const base = pares.map((p, index) => ({
      label: p.correcta,
      parIndex: index,
    }));
    return shuffleArray(base);
  }, [tarea.id, pares]);

  const [conexiones, setConexiones] = useState([]); // { leftIndex, rightIndex }
  const [selectedLeft, setSelectedLeft] = useState(null);

  const rowHeight = 90;
  const paddingY = 40;
  const svgHeight =
    paddingY * 2 + rowHeight * Math.max(pares.length, opcionesDerecha.length);

  const handleClickLeft = (leftIndex) => {
    setSelectedLeft(leftIndex);
  };

  const handleClickRight = (rightIndex) => {
    if (selectedLeft === null) return;

    setConexiones((prev) => {
      // Quitamos conexiones que usen este left o este right
      const filtradas = prev.filter(
        (c) => c.leftIndex !== selectedLeft && c.rightIndex !== rightIndex
      );
      return [...filtradas, { leftIndex: selectedLeft, rightIndex }];
    });

    // Actualizar respuestasJuego con el texto elegido
    const opcion = opcionesDerecha[rightIndex];
    setRespuestasJuego((prev) => {
      const copia = [...prev];
      copia[selectedLeft] = opcion.label;
      return copia;
    });

    setSelectedLeft(null);
  };

  const handleEnviar = () => {
    onEnviar();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[95%] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-blue-700">{tarea.titulo}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cerrar ✖
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Une cada imagen de la izquierda con su respuesta correcta. 💡
        </p>

        <div className="relative flex-1 overflow-auto border rounded-xl p-4">
          {/* SVG de líneas */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 600 ${svgHeight}`}
            preserveAspectRatio="none"
          >
            {conexiones.map((c, idx) => {
              const x1 = 100;
              const x2 = 500;
              const y1 = paddingY + rowHeight * c.leftIndex + rowHeight / 2;
              const y2 = paddingY + rowHeight * c.rightIndex + rowHeight / 2;
              const midX = (x1 + x2) / 2;

              return (
                <path
                  key={idx}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              );
            })}
          </svg>

          {/* Columnas */}
          <div className="relative grid grid-cols-2 gap-6">
            {/* Izquierda: imágenes */}
            <div className="space-y-4">
              {pares.map((par, index) => {
                const estaSeleccionada = selectedLeft === index;
                const tieneConexion = conexiones.some(
                  (c) => c.leftIndex === index
                );
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 border rounded-lg p-3 bg-white cursor-pointer shadow-sm transition ${
                      estaSeleccionada
                        ? "ring-2 ring-indigo-500"
                        : tieneConexion
                        ? "border-indigo-400"
                        : "hover:border-indigo-300"
                    }`}
                    style={{ minHeight: rowHeight - 20 }}
                    onClick={() => handleClickLeft(index)}
                  >
                    <img
                      src={par.imagen}
                      alt={`Par ${index + 1}`}
                      className="w-20 h-20 object-contain border rounded-md bg-gray-50"
                    />
                    <span className="text-sm text-gray-600">
                      Imagen {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Derecha: respuestas mezcladas */}
            <div className="space-y-4">
              {opcionesDerecha.map((opt, index) => {
                const conectado = conexiones.some(
                  (c) => c.rightIndex === index
                );
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 bg-white cursor-pointer text-sm shadow-sm transition ${
                      conectado
                        ? "bg-indigo-50 border-indigo-400"
                        : "hover:border-indigo-300"
                    }`}
                    style={{ minHeight: rowHeight - 20 }}
                    onClick={() => handleClickRight(index)}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviar}
            className="px-4 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
          >
            Enviar respuestas
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   🔹 Panel del alumno
   ========================================================= */
export default function PanelAlumno() {
  const [nombre, setNombre] = useState("");
  const [tema, setTema] = useState("default");
  const [progreso, setProgreso] = useState(0);
  const [tareas, setTareas] = useState([]);

  const [mostrarTobi, setMostrarTobi] = useState(false);
  const [mensajeTobi, setMensajeTobi] = useState("");

  // Modal de actividad “normal”
  const [tareaActiva, setTareaActiva] = useState(null);
  const [mostrarModalTarea, setMostrarModalTarea] = useState(false);

  // Juego conectar líneas
  const [tareaEnJuego, setTareaEnJuego] = useState(null);
  const [respuestasJuego, setRespuestasJuego] = useState([]);

  const token = localStorage.getItem("token");
  const alumno_id = localStorage.getItem("alumno_id");

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
    obtenerProgresoYTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerProgresoYTareas = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/alumnos/${alumno_id}/panel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProgreso(data.progreso);

      const tareasNormalizadas = (data.tareas || []).map((t) => ({
        ...t,
        contenido:
          typeof t.contenido === "string" && t.contenido
            ? JSON.parse(t.contenido)
            : t.contenido || null,
      }));

      setTareas(tareasNormalizadas);

      let mensaje = "";
      if (data.progreso < 30) mensaje = "¡Vamos, tú puedes lograrlo! 💪";
      else if (data.progreso < 70)
        mensaje = "¡Buen trabajo, sigue concentrado! 🌟";
      else mensaje = "¡Impresionante progreso, excelente trabajo! 🦊🎉";

      if (data.progreso > 0 || tareasNormalizadas.length > 0) {
        mostrarMensajeTobi(mensaje);
      }
    } catch (error) {
      console.error("Error al cargar datos del panel:", error);
    }
  };

  // 🔹 Abrir tarea “normal” en modal
  const abrirTarea = (tarea) => {
    setTareaActiva(tarea);
    setMostrarModalTarea(true);
  };

  const cerrarTarea = () => {
    setMostrarModalTarea(false);
    setTareaActiva(null);
  };

  // 🔹 Cuando el alumno termina una tarea (no juego) con calificación
  const manejarTerminarTarea = async (calificacion) => {
    if (!tareaActiva) return;

    try {
      await axios.put(
        `http://localhost:4000/api/tareas/${tareaActiva.id}`,
        { completada: 1, alumno_id, calificacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (calificacion >= 8) {
        mostrarMensajeTobi(
          `🎉 ¡Excelente trabajo, ${nombre}! Sacaste ${calificacion}/10. Tobi está orgulloso de ti 🦊`
        );
      } else {
        mostrarMensajeTobi(
          `Has obtenido ${calificacion}/10. ¡No pasa nada, ${nombre}! Tobi sabe que puedes mejorar, intenta de nuevo 💪`
        );
      }

      cerrarTarea();
      obtenerProgresoYTareas();
    } catch (error) {
      console.error("Error al completar tarea:", error);
    }
  };

  const mostrarMensajeTobi = (mensaje) => {
    setMensajeTobi(mensaje);
    setMostrarTobi(true);
    setTimeout(() => setMostrarTobi(false), 6000);
  };

  const completarTarea = (tareaId) => {
    const tarea = tareas.find((t) => t.id === tareaId);
    if (tarea) abrirTarea(tarea);
  };

  /* =========================================================
     🔹 Flujo del juego CONECTAR LÍNEAS
     ========================================================= */

  const resolverJuegoConectar = async (tareaId) => {
    try {

      console.log("🔎 LLAMANDO A RUTA:", `http://localhost:4000/api/alumnos/tareas/${tareaId}`);
      const { data } = await axios.get(
        `http://localhost:4000/api/alumnos/tareas/${tareaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.tipo !== "conectar_lineas") return;

      const pares = data.contenido?.pares || [];

      // ¿Todas las posiciones tienen una respuesta no vacía?
const todasConectadas =
  pares.length > 0 &&
  respuestasJuego.filter((r) => r && String(r).trim() !== "").length ===
    pares.length;
      setTareaEnJuego({
        id: data.id,
        titulo: data.titulo,
        puntos: data.puntos,
        pares,
        contenido: data.contenido,
      });
      setRespuestasJuego(Array(pares.length).fill(""));
    } catch (error) {
      console.error("Error al cargar juego:", error);
    }
  };

  const enviarJuegoConectar = async () => {
    if (!tareaEnJuego) return;
    try {
      const payload = {
        respuestas: respuestasJuego.map((respuesta, index) => ({
          index,
          respuesta,
        })),
      };

      const { data } = await axios.post(
        `http://localhost:4000/api/alumnos/tareas/${tareaEnJuego.id}/conectar-lineas`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.alta) {
        mostrarMensajeTobi(
          `🎉 ¡Increíble, ${nombre}! Sacaste ${data.calificacion}/10 en "${tareaEnJuego.titulo}". Tobi te manda una recompensa 🦊`
        );
      } else {
        mostrarMensajeTobi(
          `💪 Buen intento, ${nombre}. Sacaste ${data.calificacion}/10 en "${tareaEnJuego.titulo}". Tobi sabe que puedes mejorar, ¡inténtalo otra vez!`
        );
      }

      setTareaEnJuego(null);
      obtenerProgresoYTareas();
    } catch (error) {
      console.error("Error al enviar juego:", error);
    }
  };

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-b ${temas[tema]} flex flex-col items-center`}
      >
        {/* Header */}
        <div className="w-full bg-white shadow-md py-4 text-center">
          <h1 className="text-3xl font-bold text-blue-700">
            ¡Hola, {nombre}!
          </h1>
          <p className="text-gray-600">
            Bienvenido a tu panel de aprendizaje
          </p>
        </div>

        {/* Contenido */}
        <div className="w-full max-w-3xl mt-6 p-6">
          {/* Progreso */}
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

          {/* Tareas + recompensas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tareas */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                🧩 Tareas del día
              </h3>
              {tareas.length > 0 ? (
                <ul className="text-left space-y-2">
                  {tareas.map((tarea) => (
                    <li
                      key={tarea.id}
                      className={`p-3 rounded-lg border-l-4 flex justify-between items-center ${
                        tarea.completada
                          ? "bg-green-50 border-green-400 text-green-700"
                          : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          {tarea.titulo}
                        </span>
                        <span className="text-sm text-gray-600">
                          {tarea.descripcion}
                        </span>
                        {tarea.completada && tarea.calificacion != null && (
                          <span className="text-xs text-gray-500 mt-1">
                            Calificación: {tarea.calificacion}/10
                          </span>
                        )}
                      </div>

                      {!tarea.completada && (
                        <>
                          {tarea.tipo === "conectar_lineas" ? (
                            <button
                              onClick={() => resolverJuegoConectar(tarea.id)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Resolver juego
                            </button>
                          ) : (
                            <button
                              onClick={() => completarTarea(tarea.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Completar
                            </button>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  No tienes tareas asignadas por ahora 🎉
                </p>
              )}
            </div>

            {/* Recompensas (por ahora estático) */}
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
      </div>

      {/* Tobi sólo cuando hay mensaje especial */}
      {mostrarTobi && (
        <TobiMensaje
          mensaje={mensajeTobi}
          onClose={() => setMostrarTobi(false)}
        />
      )}

      {/* Modal juego conectar líneas */}
      {tareaEnJuego && (
        <JuegoConectarLineas
          tarea={tareaEnJuego}
          respuestasJuego={respuestasJuego}
          setRespuestasJuego={setRespuestasJuego}
          onClose={() => {setTareaEnJuego(null); setRespuestasJuego([])}}
          onEnviar={enviarJuegoConectar}
        />
      )}

      {/* Modal de la tarea “normal” */}
      <ModalTarea
        open={mostrarModalTarea}
        onClose={cerrarTarea}
        tarea={tareaActiva}
        onTerminar={manejarTerminarTarea}
      />
    </>
  );
}