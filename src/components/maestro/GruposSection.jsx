// src/components/maestro/GruposSection.jsx
import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";

export default function GruposSection({
  grupos,
  alumnosGrupo,
  grupoSeleccionado,
  onSelectGrupo,
  busquedaGrupo,
  setBusquedaGrupo,
  paginaGrupos,
  setPaginaGrupos,
  ITEMS_PER_PAGE,
}) {
  const filtrados = grupos.filter(
    (g) =>
      g.nombre.toLowerCase().includes(busquedaGrupo) ||
      (g.grado || "").toLowerCase().includes(busquedaGrupo)
  );

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE) || 1;
  const start = (paginaGrupos - 1) * ITEMS_PER_PAGE;
  const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de grupos */}
      <section className="lg:col-span-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Users size={20} />
            Mis grupos
          </h2>

          <input
            type="text"
            placeholder="Buscar grupo..."
            value={busquedaGrupo}
            onChange={(e) => {
              setBusquedaGrupo(e.target.value.toLowerCase());
              setPaginaGrupos(1);
            }}
            className="border rounded-md p-2 text-sm w-48 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <AnimatePresence>
            {visibles.map((g) => (
              <motion.button
                key={g.id}
                layout
                onClick={() => onSelectGrupo(g)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`text-left p-4 rounded-xl border shadow-sm hover:shadow-md ${
                  grupoSeleccionado?.id === g.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <h3 className="font-semibold text-blue-700">{g.nombre}</h3>
                <p className="text-sm text-gray-600">
                  Grado: <b>{g.grado || "N/A"}</b>
                  <br />
                  Alumnos: {g.total_alumnos ?? 0}
                </p>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPaginaGrupos(n)}
                className={`px-3 py-1 rounded text-sm ${
                  paginaGrupos === n
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-blue-100 text-gray-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Alumnos del grupo */}
      <section className="bg-white rounded-2xl shadow-sm p-4 border border-blue-50">
        <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-2">
          <Users size={20} />
          Alumnos del grupo
        </h2>
        {grupoSeleccionado ? (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Grupo seleccionado: <b>{grupoSeleccionado.nombre}</b>
            </p>
            {alumnosGrupo.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no hay alumnos asignados a este grupo.
              </p>
            ) : (
              <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {alumnosGrupo.map((a) => (
                  <li
                    key={a.id}
                    className="text-sm text-gray-700 flex justify-between"
                  >
                    <span>{a.nombre}</span>
                    <span className="text-xs text-gray-400">ID: {a.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Selecciona un grupo para ver sus alumnos.
          </p>
        )}
      </section>
    </div>
  );
}