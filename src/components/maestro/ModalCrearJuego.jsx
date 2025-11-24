// src/components/maestro/ModalCrearJuego.jsx
import { useState, useEffect } from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";

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

  useEffect(() => {
    if (!open) {
      setTitulo("");
      setDescripcion("");
      setGrupoId("");
      setPares([]);
    }
  }, [open]);

  if (!open) return null;

  const agregarPar = () => {
    setPares([
      ...pares,
      { imagenPreview: "", imagenFile: null, correcta: "", opciones: ["", "", ""] },
    ]);
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
    // VALIDACIÓN
    if (!titulo.trim() || !descripcion.trim() || !grupoId || pares.length === 0) {
      alert("Completa todos los campos y agrega al menos un par");
      return;
    }

    // Validar que cada par tenga imagen, correcta y opciones
    for (const p of pares) {
      if (!p.imagenPreview || !p.correcta.trim() || p.opciones.some((o) => !o.trim())) {
        alert("Cada par debe tener una imagen, una respuesta correcta y todas las opciones llenas");
        return;
      }
    }

    const contenido = {
      pares: pares.map((p) => ({
        imagen: p.imagenPreview,
        correcta: p.correcta,
        opciones: p.opciones,
      })),
    };

    onSubmit({
      titulo,
      descripcion,
      grupo_id: Number(grupoId),
      tipo: "conectar_lineas",
      contenido,
    });

    onClose();
    setTitulo("");
    setDescripcion("");
    setGrupoId("");
    setPares([]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-3xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-3">
          Crear tarea tipo juego: Conectar líneas
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
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
          >
            <option value="">Selecciona un grupo</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>

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