import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function PanelDirectivo() {
  const [nombre, setNombre] = useState("");
  const rol = 4;

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
  }, []);

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar nombre={nombre} rol={rol} />
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-purple-700">
          Bienvenido, {nombre} 🧭
        </h2>
        <p className="mt-3 text-gray-600">
          Desde aquí podrás administrar maestros, grupos y alumnos con TDAH.
        </p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="directivo"
          className="w-32 mx-auto mt-6"
        />
      </div>
    </div>
  );
}