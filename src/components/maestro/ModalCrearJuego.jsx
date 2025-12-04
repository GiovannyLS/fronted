// src/components/maestro/ModalCrearJuego.jsx
import { useState, useEffect } from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import axios from "axios";

function MemoramaElementoInput({ parIndex, field, par, actualizarPar }) {
  const handleTipoChange = (tipo) => {
    actualizarPar(parIndex, field, { tipo, valor: "" });
  };

  const handleValorChange = (value) => {
    actualizarPar(parIndex, field, { ...par[field], valor: value });
  };

  return (
    <div className="border rounded-md p-3 bg-white">
      <select
        className="w-full border rounded-md px-2 py-1 mb-2"
        value={par[field].tipo}
        onChange={(e) => handleTipoChange(e.target.value)}
      >
        <option value="">Selecciona tipo</option>
        <option value="imagen">Imagen</option>
        <option value="texto">Texto</option>
      </select>

      {par[field].tipo === "texto" && (
        <input
          className="w-full border rounded-md px-3 py-1"
          placeholder="Texto"
          value={par[field].valor}
          onChange={(e) => handleValorChange(e.target.value)}
        />
      )}

      {par[field].tipo === "imagen" && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                handleValorChange(reader.result);
              };
              reader.readAsDataURL(file);
            }}
          />

          {par[field].valor && (
            <img
              src={par[field].valor}
              className="w-20 h-20 object-cover rounded-md border mt-2"
            />
          )}
        </>
      )}
    </div>
  );
}

export default function ModalCrearJuego({
  open,
  onClose,
  grupos,
  onSubmit,
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [pares, setPares] = useState([]);
  const [tipoJuego, setTipoJuego] = useState("");

  const [recomendaciones, setRecomendaciones] = useState([]);

  useEffect(() => {
    if (!open) {
      setTitulo("");
      setDescripcion("");
      setGrupoId("");
      setPares([]);
      setTipoJuego("");
    }
  }, [open]);

  useEffect(() => {
    if (open) cargarRecomendaciones();
  }, [open]);

  useEffect(() => {
    if (tipoJuego === "memorama" && pares.length === 0) {
      setPares([{ a: { tipo: "", valor: "" }, b: { tipo: "", valor: "" } }]);
    }
  }, [tipoJuego]);

  // <-- Move this function HERE
  const cargarRecomendaciones = async (grupoId) => {
    try {
      if (!grupoId) {
        setRecomendaciones([]);
        return;
      }

      const token = localStorage.getItem("token");

      // 1. obtener alumnos del grupo
      const { data: alumnos } = await axios.get(
        `http://localhost:4000/api/maestro/grupo/${grupoId}/alumnos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!alumnos || alumnos.length === 0) {
        setRecomendaciones([]);
        return;
      }

      // 2. determinar recomendaciones
      let recomendacionesFinales = [];

      for (const alumno of alumnos) {
        if (alumno.tiene_tdah === 1 || alumno.test_completado === 1) {
          recomendacionesFinales.push({
            nombre: "Juego de conectar líneas",
            tipo: "conectar_lineas",
            descripcion: "Ayuda a mejorar la atención sostenida.",
            recomendado_por: ["atencion_baja"],
          });
        }

        if (alumno.modo_trabajo === "Visual y Lúdico") {
          recomendacionesFinales.push({
            nombre: "Memorama visual",
            tipo: "memorama",
            descripcion: "Fortalece la memoria y discriminación visual.",
            recomendado_por: ["memoria_debil"],
          });
        }
      }

      setRecomendaciones(recomendacionesFinales);

    } catch (error) {
      console.error("Error cargando recomendaciones:", error);
    }
  };

  if (!open) return null;

  const agregarPar = () => {
    if (tipoJuego === "memorama") {
      setPares([...pares, { a: { tipo: "", valor: "" }, b: { tipo: "", valor: "" } }]);
    } else {
      setPares([
        ...pares,
        { imagenPreview: "", imagenFile: null, correcta: "", opciones: ["", "", ""] },
      ]);
    }
  };

  const actualizarPar = (index, field, value) => {
    const copia = [...pares];
    copia[index][field] = value;
    setPares(copia);
  };

  const actualizarOpcion = (index, optIndex, value) => {
    const copia = [...pares];
    copia[index].opciones[optIndex] = value;
    setPares(copia);
  };

  const onSubmitJuego = () => {
    if (!titulo.trim() || !descripcion.trim() || !grupoId || pares.length === 0) {
      alert("Completa todos los campos y agrega al menos un par");
      return;
    }
if (!tipoJuego) {
  alert("Selecciona un tipo de juego");
  return;
}

if (pares.length === 0) {
  alert("Debes agregar al menos un par");
  return;
}

if (tipoJuego === "conectar_lineas") {
  for (const p of pares) {
    if (!p.imagenPreview || !p.correcta.trim() || p.opciones.some((o) => !o.trim())) {
      alert("Cada par debe tener una imagen y la respuesta correcta.");
      return;
    }
  }
}

if (tipoJuego === "memorama") {
  for (const p of pares) {
    const a = p.a;
    const b = p.b;

    // Ambos elementos deben tener tipo seleccionado
    if (!a.tipo || !b.tipo) {
      alert("Cada par debe definir tipos para A y B (imagen o texto)");
      return;
    }

    // Si el tipo es texto, debe tener texto
    if (a.tipo === "texto" && !a.valor.trim()) {
      alert("El elemento A requiere texto si se seleccionó 'texto'");
      return;
    }
    if (b.tipo === "texto" && !b.valor.trim()) {
      alert("El elemento B requiere texto si se seleccionó 'texto'");
      return;
    }

    // Si el tipo es imagen, debe tener imagen
    if (a.tipo === "imagen" && !a.valor) {
      alert("El elemento A requiere imagen si se seleccionó 'imagen'");
      return;
    }
    if (b.tipo === "imagen" && !b.valor) {
      alert("El elemento B requiere imagen si se seleccionó 'imagen'");
      return;
    }
  }
}

if (tipoJuego === "arrastrar") {
  for (const p of pares) {
    if (!p.imagenPreview || !p.correcta.trim()) {
      alert("El juego de arrastrar necesita imagen + etiqueta correcta");
      return;
    }
  }
}

    let contenido = {};

if (tipoJuego === "conectar_lineas") {
  contenido = {
    pares: pares.map((p) => ({
      imagen: p.imagenPreview,
      correcta: p.correcta,
      opciones: p.opciones,
    })),
  };
}

if (tipoJuego === "memorama") {
  contenido = {
    pares: pares.map((p) => ({
      a: { tipo: p.a.tipo, valor: p.a.valor },
      b: { tipo: p.b.tipo, valor: p.b.valor }
    })),
  };
}

if (tipoJuego === "arrastrar") {
  contenido = {
    pares: pares.map((p) => ({
      imagen: p.imagenPreview,
      etiqueta: p.correcta
    })),
  };
}

    onSubmit({
      titulo,
      descripcion,
      grupo_id: Number(grupoId),
      tipo: tipoJuego,
      contenido,
    });

    onClose();
    setTitulo("");
    setDescripcion("");
    setGrupoId("");
    setPares([]);
    setTipoJuego("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-3xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-3">
          Crear tarea tipo juego: {tipoJuego ? tipoJuego.replace("_", " ") : ""}
        </h2>

        {/* Campos principales */}
        <div className="space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Título de la actividad"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            className="w-full border rounded-md px-3 py-2"
            placeholder="Descripción de la actividad"
            value={descripcion}
            rows={3}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <select
            className="w-full border rounded-md px-3 py-2"
            value={tipoJuego}
            onChange={(e) => setTipoJuego(e.target.value)}
          >
            <option value="">Selecciona tipo de juego</option>
            <option value="conectar_lineas">Conectar líneas</option>
            <option value="memorama">Memorama</option>
            <option value="arrastrar">Arrastrar y soltar</option>
          </select>

          <select
            className="w-full border rounded-md px-3 py-2"
            value={grupoId}
            onChange={(e) => {
              const val = e.target.value;
              setGrupoId(val);
              cargarRecomendaciones(val);
            }}
          >
            <option value="">Selecciona un grupo</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
          {recomendaciones.length > 0 && (
            <div className="mt-4 p-3 border rounded-lg bg-purple-50">
              <h3 className="text-md font-semibold text-purple-700 mb-2">
                🎯 Recomendaciones basadas en el grupo
              </h3>

              <ul className="space-y-2">
                {recomendaciones.map((rec, i) => (
                  <li key={i} className="border p-2 rounded bg-white">
                    <strong>{rec.nombre}</strong>
                    <p className="text-sm">{rec.descripcion}</p>
                    <p className="text-xs text-purple-700">
                      Sugerido por: {rec.recomendado_por.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {tipoJuego === "conectar_lineas" && (
        <>
        {/* LISTA DE PARES */}
        <h3 className="text-lg font-semibold text-blue-700 mt-5">Pares</h3>

        <div className="max-h-64 overflow-y-auto pr-2">
          {pares.map((par, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 my-3 bg-gray-50 relative"
            >
              <button
                onClick={() => {
                  const copia = [...pares];
                  copia.splice(index, 1);
                  setPares(copia);
                }}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                <X size={18} />
              </button>
              {/* Imagen */}
              <label className="block mb-2 text-sm font-medium">
                Imagen
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => {
                      actualizarPar(index, "imagenPreview", reader.result);
                      actualizarPar(index, "imagenFile", file);
                    };
                    reader.readAsDataURL(file);
                  }}
                />

                {par.imagenPreview ? (
                  <img
                    src={par.imagenPreview}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-md">
                    <ImageIcon size={32} className="text-gray-500" />
                  </div>
                )}
              </div>

              {/* Respuesta correcta */}
              <label className="block mt-3 text-sm font-medium">
                Respuesta correcta
              </label>
              <input
                className="w-full border rounded-md px-3 py-1"
                value={par.correcta}
                onChange={(e) =>
                  actualizarPar(index, "correcta", e.target.value)
                }
              />

              {/* Opciones */}
              <label className="block mt-3 text-sm font-medium">
                Opciones (incluye la correcta)
              </label>

              {par.opciones.map((opt, optIndex) => (
                <input
                  key={optIndex}
                  className="w-full border rounded-md px-3 py-1 mb-1"
                  placeholder={`Opción ${optIndex + 1}`}
                  value={opt}
                  onChange={(e) =>
                    actualizarOpcion(index, optIndex, e.target.value)
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Botón agregar par */}
        <button
          onClick={agregarPar}
          className="mt-2 text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Agregar par
        </button>
        </>
        )}

        {tipoJuego === "memorama" && (
  <>
    <h3 className="text-lg font-semibold text-blue-700 mt-5">Pares del memorama</h3>

    <div className="max-h-64 overflow-y-auto pr-2">
      {pares.map((par, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 my-3 bg-gray-50 relative"
        >
          <button
            onClick={() => {
              const copia = [...pares];
              copia.splice(index, 1);
              setPares(copia);
            }}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          >
            <X size={18} />
          </button>

          <label className="block mb-2 text-sm font-medium">Elemento A</label>
          <MemoramaElementoInput
            parIndex={index}
            field="a"
            par={par}
            actualizarPar={actualizarPar}
          />

          <label className="block mt-3 text-sm font-medium">Elemento B</label>
          <MemoramaElementoInput
            parIndex={index}
            field="b"
            par={par}
            actualizarPar={actualizarPar}
          />
        </div>
      ))}
    </div>

    <button
      onClick={() =>
        setPares([
          ...pares,
          { a: { tipo: "", valor: "" }, b: { tipo: "", valor: "" } },
        ])
      }
      className="mt-2 text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md flex items-center gap-2"
    >
      <Plus size={18} />
      Agregar par
    </button>
  </>
)}
        {/* Botón crear */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onSubmitJuego}
            className="bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Crear actividad
          </button>
        </div>
      </div>
    </div>
  );
}