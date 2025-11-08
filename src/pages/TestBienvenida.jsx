import { useEffect, useState } from "react";

export default function TestBienvenida() {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    // Recuperamos el nombre del alumno almacenado al hacer login
    const nombreUsuario = localStorage.getItem("nombre");
    setNombre(nombreUsuario || "amig@");
  }, []);

  const handleStart = () => {
    window.location.href = "/test-atencion";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="bg-white p-8 rounded-3xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-3">
          ¡Hola, {nombre}! 👋
        </h1>
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="Avatar"
          className="w-24 mx-auto mb-4"
        />
        <p className="text-gray-700 mb-4 leading-relaxed">
          Soy <b>Tobi</b> 🦊, tu compañero en este viaje.  
          Vamos a hacer un pequeño test divertido para conocerte mejor.  
          ¡No te preocupes! No es un examen.  
          Solo quiero saber cómo te gusta aprender 😄
        </p>
        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg transition"
        >
          ¡Comenzar!
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Este test te ayudará a tener actividades más divertidas y personalizadas.
        </p>
      </div>
    </div>
  );
}