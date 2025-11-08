import { useEffect, useState } from "react";
import axios from "axios";
import TobiMensaje from "../components/TobiMensaje";

export default function Personalizacion() {
  const [nombre, setNombre] = useState("");
  const [temaSugerido, setTemaSugerido] = useState("tranquilo");
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [mostrarTobi, setMostrarTobi] = useState(false);

  const token = localStorage.getItem("token");
  const alumno_id = localStorage.getItem("alumno_id");

  const temas = [
    { id: "tranquilo", color: "bg-sky-100", texto: "Tranquilo 🌊" },
    { id: "activo", color: "bg-yellow-100", texto: "Activo ⚡" },
    { id: "creativo", color: "bg-purple-100", texto: "Creativo 🎨" },
    { id: "auditivo", color: "bg-orange-100", texto: "Auditivo 🎧" },
  ];

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
    setTemaSugerido(localStorage.getItem("tema") || "tranquilo");
  }, []);

  const handleSelect = async (tema) => {
    setTemaSeleccionado(tema);
    try {
      await axios.put(
        "http://localhost:4000/api/alumnos/tema",
        { alumno_id, tema_preferido: tema },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("tema", tema);
      setMostrarTobi(true);

      // Espera 3 segundos con Tobi visible, luego redirige
      setTimeout(() => {
        window.location.href = "/panel-alumno";
      }, 3000);

    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar tu tema. Intenta nuevamente.");
    }
  };

  return (
    <>
      {/* Pantalla principal */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-50">
        <div className="bg-white p-8 rounded-3xl shadow-md w-96 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="Tobi"
            className="w-24 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-blue-700 mb-2">
            ¡Excelente trabajo, {nombre}! 🎉
          </h1>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Basado en tus respuestas, te recomiendo el tema{" "}
            <span className="font-semibold text-blue-600">{temaSugerido}</span>.
            <br />
            Pero puedes elegir el que más te guste 👇
          </p>

          <div className="grid grid-cols-2 gap-3">
            {temas.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`p-4 rounded-xl border-2 hover:scale-105 transition-all ${
                  temaSeleccionado === t.id
                    ? "border-blue-600"
                    : "border-transparent"
                } ${t.color}`}
              >
                <span className="text-lg font-semibold">{t.texto}</span>
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Tobi usará este estilo para personalizar tu panel 🦊
          </p>
        </div>
      </div>

      {/* Componente de Tobi */}
      {mostrarTobi && (
        <TobiMensaje
          mensaje={`¡Me encanta tu nuevo color, ${nombre}! 🦊`}
          onClose={() => setMostrarTobi(false)}
        />
      )}
    </>
  );
}