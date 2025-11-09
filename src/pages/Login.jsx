import { useState } from "react";
import axios from "axios";
import AlertMessage from "../components/AlertMessage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });

    try {
      const { data } = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.user.rol);
      setAlert({ message: "Inicio de sesión exitoso ✅", type: "success" });
      localStorage.setItem("nombre", data.user.nombre);
      localStorage.setItem("tema", data.user.tema_preferido);


    if (data.user.alumno_id) {
  localStorage.setItem("alumno_id", data.user.alumno_id);
  console.log("Alumno ID guardado:", data.user.alumno_id); // 👈 agrega esto para verificar
} else {
  console.warn("⚠️ No se recibió alumno_id desde el backend");
}


      setTimeout(() => {
        switch (data.user.rol) {
          case 1:
            if (data.user.testCompletado) {
              window.location.href = "/panel-alumno";
            } else {
              window.location.href = "/test-bienvenida";
            }
            break;
          case 2:
            window.location.href = "/panel-padre";
            break;
          case 3:
            if (data.user.rol === 3) {
              localStorage.setItem("maestro_id", data.user.maestro_id); // 👈 importante
            window.location.href = "/panel-maestro";
            }
            break;
          case 4:
            window.location.href = "/panel-directivo";
            break;
          default:
            setAlert({ message: "Rol no reconocido", type: "error" });
        }
      }, 1000);
    } catch (error) {
      if (error.response) {
        setAlert({ message: error.response.data.message, type: "error" });
      } else {
        setAlert({ message: "Error de conexión con el servidor", type: "error" });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-80 space-y-4"
      >
        <h2 className="text-center text-2xl font-bold text-blue-700">
          Iniciar Sesión
        </h2>

        {alert.message && <AlertMessage message={alert.message} type={alert.type} />}

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full p-2 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition"
        >
          Ingresar
        </button>

        <p className="text-xs text-gray-500 text-center mt-2">
          Sistema TDAH © 2025
        </p>
      </form>
    </div>
  );
}