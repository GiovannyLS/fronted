import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import TestAtencion from "./pages/TestAtencion";
import TestBienvenida from "./pages/TestBienvenida";
import PanelAlumno from "./pages/PanelAlumno";
import PanelPadre from "./pages/PanelPadre";
import PanelMaestro from "./pages/PanelMaestro";
import PanelDirectivo from "./pages/PanelDirectivo";
import ProtectedRoute from "./components/ProtectedRoute";
import Personalizacion from "./pages/Personalizacion";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/test-bienvenida" element={<TestBienvenida />} />
        <Route path="/test-atencion" element={<TestAtencion />} />

        {/* Rutas protegidas */}
        <Route
          path="/panel-alumno"
          element={
            <ProtectedRoute rolPermitido={1}>
              <PanelAlumno />
            </ProtectedRoute>
            
          }
        />
        <Route path="/personalizacion" element={<Personalizacion />} />
        <Route
          path="/panel-padre"
          element={
            <ProtectedRoute rolPermitido={2}>
              <PanelPadre />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel-maestro"
          element={
            <ProtectedRoute rolPermitido={3}>
              <PanelMaestro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel-directivo"
          element={
            <ProtectedRoute rolPermitido={4}>
              <PanelDirectivo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;