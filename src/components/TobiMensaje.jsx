import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TobiMensaje({ mensaje, onClose }) {
  const [voces, setVoces] = useState([]);

  useEffect(() => {
    console.log("🦊 Tobi está listo para hablar...");

    const timer = setTimeout(() => onClose(), 6000);

    // 🔊 Cargar voces disponibles
    const cargarVoces = () => {
      const disponibles = window.speechSynthesis.getVoices();
      console.log("🎤 Voces detectadas:", disponibles);

      if (disponibles.length > 0) {
        setVoces(disponibles);
        hablarMensaje(mensaje, disponibles);
      } else {
        console.warn("⚠️ Aún no hay voces disponibles. Intentando otra vez...");
        // volver a intentar en 1 segundo
        setTimeout(() => cargarVoces(), 1000);
      }
    };

    if ("speechSynthesis" in window) {
      // Algunos navegadores cargan las voces de forma asíncrona
      window.speechSynthesis.onvoiceschanged = cargarVoces;
      cargarVoces();
    } else {
      console.error("❌ El navegador no soporta SpeechSynthesis.");
    }

    return () => clearTimeout(timer);
  }, [mensaje, onClose]);

  const hablarMensaje = (texto, listaVoces) => {
    if (!("speechSynthesis" in window)) {
      console.error("❌ SpeechSynthesis no está disponible en este navegador.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-MX"; // Español latino
    utterance.pitch = 1.1; // tono más alegre
    utterance.rate = 0.95; // velocidad más pausada
    utterance.volume = 1;

    // 🗣️ Buscar voz en español
    const vozEsp = listaVoces.find(
      (v) =>
        v.lang.toLowerCase().startsWith("es") ||
        v.name.toLowerCase().includes("spanish")
    );

    if (vozEsp) {
      utterance.voice = vozEsp;
      console.log("🗣️ Voz seleccionada:", vozEsp.name, "| Idioma:", vozEsp.lang);
    } else {
      console.warn("⚠️ No se encontró una voz en español. Usando la predeterminada.");
    }

    // Cancelar cualquier voz en curso
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      className="fixed bottom-10 right-10 bg-white shadow-lg border-2 border-blue-400 rounded-3xl p-4 w-72 flex items-center space-x-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
        alt="Tobi"
        className="w-12 h-12"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <p className="text-blue-700 font-semibold text-sm">{mensaje}</p>
    </motion.div>
  );
}