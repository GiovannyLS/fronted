export default function Navbar({ nombre, rol }) {
  const roles = {
    1: "Alumno 🎒",
    2: "Padre 👨‍👩‍👧",
    3: "Maestro 👩‍🏫",
    4: "Directivo 🧭",
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center px-4 py-3 shadow-md">
      <h1 className="text-lg font-semibold">
        Sistema TDAH - {roles[rol] || "Usuario"}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm italic">Hola, {nombre}</span>
        <button
          onClick={logout}
          className="bg-white text-blue-700 font-medium px-3 py-1 rounded-md hover:bg-gray-200"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}