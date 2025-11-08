import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Tobi({ nombre, tema }) {
  const [mensaje, setMensaje] = useState("¡Hola, " + nombre + "! 🦊");
  const mensajes = [
    "¡Sigue así, lo estás haciendo genial! 💪",
    "¡Qué buena energía hoy! ⚡",
    "Tu atención mejora cada día 🌟",
    "¡Tobi está orgulloso de ti! 🦊",
    "¡Gran trabajo, " + nombre + "! 🎉",
  ];

  // Cambiar mensaje cada cierto tiempo
  useEffect(() => {
    const intervalo = setInterval(() => {
      const nuevo = mensajes[Math.floor(Math.random() * mensajes.length)];
      setMensaje(nuevo);
    }, 7000);
    return () => clearInterval(intervalo);
  }, []);

  // Colores del tema
  const colores = {
    activo: "bg-yellow-100 border-yellow-400 text-yellow-700",
    tranquilo: "bg-sky-100 border-sky-400 text-sky-700",
    creativo: "bg-purple-100 border-purple-400 text-purple-700",
    auditivo: "bg-orange-100 border-orange-400 text-orange-700",
    default: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <motion.div
      className={`fixed bottom-8 right-8 p-4 border-2 rounded-3xl shadow-md w-72 ${colores[tema]}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center space-x-3">
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="Tobi"
          className="w-12 h-12"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <div>
          <p className="font-semibold">{mensaje}</p>
        </div>
      </div>
    </motion.div>
  );
}