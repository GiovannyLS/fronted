import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function PanelPadre() {
  const [nombre, setNombre] = useState("");
  const rol = 2;

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
  }, []);

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar nombre={nombre} rol={rol} />
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-green-700">
          Bienvenido, {nombre} 👨‍👩‍👧
        </h2>
        <p className="mt-3 text-gray-600">
          Aquí podrás ver el progreso y desempeño de tu hijo.
        </p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/2922/2922522.png"
          alt="padre"
          className="w-32 mx-auto mt-6"
        />
      </div>
    </div>
  );
}