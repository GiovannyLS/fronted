import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function PanelMaestro() {
  const [nombre, setNombre] = useState("");
  const rol = 3;

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50">
      <Navbar nombre={nombre} rol={rol} />
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-yellow-700">
          Bienvenido, {nombre} 👩‍🏫
        </h2>
        <p className="mt-3 text-gray-600">
          Aquí se podrá gestionar grupos, tareas y observar a tus alumnos.
        </p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/706/706133.png"
          alt="maestro"
          className="w-32 mx-auto mt-6"
        />
      </div>
    </div>
  );
}