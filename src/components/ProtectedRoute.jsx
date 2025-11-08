import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, rolPermitido }) {
  const token = localStorage.getItem("token");
  const rol = parseInt(localStorage.getItem("rol"));

  // Si no hay token → redirige al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay restricción de rol y no coincide → redirige al login
  if (rolPermitido && rol !== rolPermitido) {
    return <Navigate to="/" replace />;
  }

  // Si pasa las verificaciones → renderiza el contenido protegido
  return children;
}