import { useState } from "react";
import axios from "axios";

export default function TestAtencion() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  // 🔹 Obtener alumno_id y token desde localStorage al inicio
  const token = localStorage.getItem("token");
  const alumno_id = localStorage.getItem("alumno_id"); // ✅ disponible para todo el componente

  console.log("🧩 ID del alumno detectado:", alumno_id);

  const preguntas = [
    { id: 1, texto: "¿Te cuesta mantenerte quieto cuando debes hacerlo?" },
    { id: 2, texto: "¿Te distraes fácilmente con sonidos o cosas a tu alrededor?" },
    { id: 3, texto: "¿Actúas sin pensar en las consecuencias?" },
    { id: 4, texto: "¿Te cuesta terminar las tareas que empiezas?" },
    { id: 5, texto: "¿Sueles perder objetos o materiales escolares?" },
    { id: 6, texto: "¿Te aburres fácilmente en clases largas?" },
    { id: 7, texto: "¿Necesitas moverte o caminar mientras haces tareas?" },
  ];

  const opciones = [
    { valor: 1, texto: "Nunca" },
    { valor: 2, texto: "A veces" },
    { valor: 3, texto: "Casi siempre" },
    { valor: 4, texto: "Siempre" },
  ];

  const handleAnswer = (valor) => {
    setAnswers({ ...answers, [preguntas[step].id]: valor });
    if (step < preguntas.length - 1) {
      setStep(step + 1);
    } else {
      enviarResultados();
    }
  };

  const enviarResultados = async () => {
    // 🔹 Verificación de seguridad
    if (!alumno_id) {
      alert("⚠️ No se encontró el ID del alumno. Inicia sesión nuevamente.");
      window.location.href = "/";
      return;
    }

    // 🔹 Calcular niveles
    const nivel_atencion = Math.round((answers[2] + answers[4] + answers[6]) / 3);
    const nivel_impulsividad = Math.round((answers[1] + answers[3] + answers[7]) / 3);
    const nivel_hiperactividad = Math.round((answers[5] + answers[7]) / 2);

    let resultado = "";
    let tema = "default";

    if (nivel_atencion >= 3) resultado += "Dificultad para mantener la atención. ";
    if (nivel_hiperactividad >= 3) resultado += "Alta actividad física. ";
    if (nivel_impulsividad >= 3) resultado += "Tendencia a la impulsividad. ";
    if (resultado === "") resultado = "Buen control atencional general.";

    // 🔹 Determinar tema según el resultado
    if (nivel_hiperactividad >= 3) tema = "activo";
    else if (nivel_atencion <= 2 && nivel_impulsividad <= 2) tema = "tranquilo";
    else if (nivel_atencion >= 3 && nivel_impulsividad >= 3) tema = "creativo";
    else tema = "auditivo";

    // 🔹 Guardar tema en localStorage
    localStorage.setItem("tema", tema);

    console.log("🧩 Guardando resultados del alumno:", alumno_id, tema);

    try {
      await axios.post(
        "http://localhost:4000/api/test/guardar",
        {
          alumno_id,
          nivel_atencion,
          nivel_impulsividad,
          nivel_hiperactividad,
          resultado,
          tema,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFinished(true);

      // 🔁 Redirige a la personalización
      setTimeout(() => {
        window.location.href = "/personalizacion";
      }, 1500);
    } catch (error) {
      console.error("❌ Error al guardar los resultados:", error);
      alert("Error al guardar los resultados. Revisa la consola.");
    }
  };

  // 🔹 Pantalla final
  if (finished)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <h2 className="text-2xl font-bold text-green-700">
          ¡Has completado el test! 🎉
        </h2>
        <p className="mt-3 text-gray-700">
          Tus resultados fueron enviados. Tobi preparará algo especial para ti...
        </p>
      </div>
    );

  // 🔹 Pantalla de preguntas
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 text-center">
        <h2 className="text-xl font-bold text-blue-700 mb-4">
          Test de Atención y Concentración
        </h2>
        <p className="text-gray-700 mb-6">{preguntas[step].texto}</p>

        <div className="space-y-2">
          {opciones.map((op) => (
            <button
              key={op.valor}
              onClick={() => handleAnswer(op.valor)}
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-lg"
            >
              {op.texto}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Pregunta {step + 1} de {preguntas.length}
        </p>
      </div>
    </div>
  );
}