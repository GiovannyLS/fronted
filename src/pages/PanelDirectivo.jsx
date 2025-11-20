import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  GraduationCap,
  Layers,
  Plus,
  LogOut,
  X,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================
   Constantes / helpers
========================= */

const API_BASE = "http://localhost:4000/api/directivo";
const ITEMS_PER_PAGE = 12;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* =========================
   Toasters reutilizables
========================= */

function ToastStack({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`min-w-[220px] max-w-xs rounded-lg shadow-lg border-l-4 px-4 py-3 bg-white text-sm ${
              t.type === "success"
                ? "border-emerald-500"
                : t.type === "error"
                ? "border-red-500"
                : "border-blue-500"
            }`}
          >
            <div className="flex justify-between gap-3">
              <span>{t.msg}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* =========================
   Modal genérico
========================= */

function BaseModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-40"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-md space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold text-blue-700">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================
   Modal de confirmación
========================= */

function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  return (
    <BaseModal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-gray-700 mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-md text-sm bg-red-500 hover:bg-red-600 text-white"
        >
          Confirmar
        </button>
      </div>
    </BaseModal>
  );
}

/* =========================
   Tabs de navegación
========================= */

function DirectivoTabs({ vista, onChange }) {
  const tabs = [
    { id: "maestros", label: "Maestros", icon: Users },
    { id: "alumnos", label: "Alumnos", icon: GraduationCap },
    { id: "grupos", label: "Grupos", icon: Layers },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
            vista === t.id
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-blue-700 border hover:bg-blue-50"
          }`}
        >
          <t.icon size={16} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* =========================
   Header principal
========================= */

function DirectivoHeader({ onLogout }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <GraduationCap size={30} /> Panel del Directivo
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra maestros, alumnos y grupos de forma visual y sencilla.
        </p>
      </div>
      <button
        onClick={onLogout}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
      >
        <LogOut size={18} /> Cerrar sesión
      </button>
    </div>
  );
}

/* =========================
   Panel: Maestros
========================= */

function MaestrosPanel({
  maestros,
  grupos,
  onCreate,
  onUpdate,
  onDelete,
  pagina,
  setPagina,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [maestroForm, setMaestroForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [maestroAEliminar, setMaestroAEliminar] = useState(null);

  const filtrados = maestros.filter(
    (m) =>
      m.nombre.toLowerCase().includes(busqueda) ||
      m.email.toLowerCase().includes(busqueda)
  );
  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE) || 1;
  const start = (pagina - 1) * ITEMS_PER_PAGE;
  const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

  return (
    <motion.div
      key="maestros-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Header vista */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
          👩‍🏫 Gestión de Maestros
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar maestro..."
              onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
              className="border rounded-md pl-9 pr-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Nuevo maestro
          </button>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {visibles.map((m) => (
            <motion.div
              key={m.maestro_id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-semibold text-blue-700 text-lg">
                    {m.nombre}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {m.email}
                    <br />
                    Grupos asignados:{" "}
                    <span className="font-semibold">{m.total_grupos}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditandoId(m.maestro_id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setMaestroAEliminar(m)}
                    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Panel edición */}
              <AnimatePresence>
                {editandoId === m.maestro_id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 border-t pt-3 space-y-2 overflow-hidden"
                  >
                    <input
                      defaultValue={m.nombre}
                      onChange={(e) => (m._nombre = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-sm"
                    />
                    <input
                      defaultValue={m.email}
                      onChange={(e) => (m._email = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-sm"
                    />

                    <select
                      onChange={(e) => (m._grupoAsignado = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-sm"
                      defaultValue=""
                    >
                      <option value="">Asignar grupo...</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nombre}
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={async () => {
                          await onUpdate(m.maestro_id, {
                            nombre: m._nombre ?? m.nombre,
                            email: m._email ?? m.email,
                            grupo_id: m._grupoAsignado || null,
                          });
                          setEditandoId(null);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Paginación */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPagina(n)}
            className={`px-3 py-1 rounded-md text-sm ${
              pagina === n
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-blue-100 text-gray-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Modal nuevo maestro */}
      <BaseModal
        open={mostrarModalNuevo}
        title="Nuevo maestro"
        onClose={() => setMostrarModalNuevo(false)}
      >
        <div className="space-y-3">
          <input
            placeholder="Nombre"
            value={maestroForm.nombre}
            onChange={(e) =>
              setMaestroForm({ ...maestroForm, nombre: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />
          <input
            placeholder="Correo electrónico"
            type="email"
            value={maestroForm.email}
            onChange={(e) =>
              setMaestroForm({ ...maestroForm, email: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={maestroForm.password}
            onChange={(e) =>
              setMaestroForm({ ...maestroForm, password: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />

          <button
            onClick={async () => {
              await onCreate(maestroForm);
              setMaestroForm({ nombre: "", email: "", password: "" });
              setMostrarModalNuevo(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Guardar maestro
          </button>
        </div>
      </BaseModal>

      {/* Modal eliminar maestro */}
      <ConfirmModal
        open={!!maestroAEliminar}
        title="Eliminar maestro"
        message={`¿Seguro que deseas eliminar a "${maestroAEliminar?.nombre}"? Debe estar sin grupos asignados.`}
        onCancel={() => setMaestroAEliminar(null)}
        onConfirm={async () => {
          if (maestroAEliminar) {
            await onDelete(maestroAEliminar.maestro_id);
            setMaestroAEliminar(null);
          }
        }}
      />
    </motion.div>
  );
}

/* =========================
   Panel: Alumnos
========================= */

function AlumnosPanel({
  alumnos,
  grupos,
  onCreate,
  onUpdate,
  onDelete,
  pagina,
  setPagina,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroTDAH, setFiltroTDAH] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [alumnoForm, setAlumnoForm] = useState({
    nombre: "",
    email: "",
    password: "",
    grupo_id: "",
    tiene_tdah: false,
    tipo_tdah: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);

  const filtrados = alumnos
    .filter((a) =>
      a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((a) =>
      filtroGrupo ? String(a.grupo_id) === String(filtroGrupo) : true
    )
    .filter((a) =>
      filtroTDAH === ""
        ? true
        : filtroTDAH === "1"
        ? a.tiene_tdah
        : !a.tiene_tdah
    );

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE) || 1;
  const start = (pagina - 1) * ITEMS_PER_PAGE;
  const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

  return (
    <motion.div
      key="alumnos-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Controles superiores */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="border rounded-md p-2 text-sm"
          >
            <option value="">Todos los grupos</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setFiltroTDAH(e.target.value)}
            className="border rounded-md p-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="1">Con TDAH</option>
            <option value="0">Sin TDAH</option>
          </select>
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar alumno..."
              onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
              className="border rounded-md pl-9 pr-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Nuevo alumno
          </button>
        </div>
      </div>

      {/* Lista de alumnos */}
      <div>
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          Lista de alumnos
        </h3>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {visibles.map((a) => (
              <motion.div
                key={a.alumno_id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg border border-gray-100"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-blue-700 text-lg">
                      {a.nombre}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {a.email}
                      <br />
                      Grupo:{" "}
                      <b>{a.grupo_nombre || "Sin grupo"}</b>
                      <br />
                      TDAH:{" "}
                      <span
                        className={`font-bold ${
                          a.tiene_tdah ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {a.tiene_tdah ? "Sí" : "No"}
                      </span>
                      {a.tiene_tdah && a.tipo_tdah && (
                        <span className="ml-1 text-blue-700 font-medium">
                          ({a.tipo_tdah})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setEditandoId(a.alumno_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setAlumnoAEliminar(a)}
                      className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Panel edición */}
                <AnimatePresence>
                  {editandoId === a.alumno_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 border-t pt-3 space-y-2 overflow-hidden"
                    >
                      <input
                        defaultValue={a.nombre}
                        onChange={(e) => (a._nombre = e.target.value)}
                        className="border rounded-md px-2 py-1 w-full text-sm"
                      />
                      <input
                        defaultValue={a.email}
                        onChange={(e) => (a._email = e.target.value)}
                        className="border rounded-md px-2 py-1 w-full text-sm"
                      />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          defaultValue={a.grupo_id || ""}
                          onChange={(e) => (a._grupo = e.target.value)}
                          className="border p-1 rounded-md text-sm flex-1"
                        >
                          <option value="">Grupo...</option>
                          {grupos.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.nombre}
                            </option>
                          ))}
                        </select>

                        <select
                          defaultValue={a.tiene_tdah ? "1" : "0"}
                          onChange={(e) => (a._tdah = e.target.value)}
                          className="border p-1 rounded-md text-sm flex-1"
                        >
                          <option value="0">Sin TDAH</option>
                          <option value="1">Con TDAH</option>
                        </select>
                      </div>

                      {(a._tdah === "1" || a.tiene_tdah) && (
                        <input
                          placeholder="Tipo de TDAH"
                          defaultValue={a.tipo_tdah || ""}
                          onChange={(e) => (a._tipo = e.target.value)}
                          className="border rounded-md px-2 py-1 w-full text-sm"
                        />
                      )}

                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          onClick={async () => {
                            await onUpdate({
                              alumno_id: a.alumno_id,
                              nombre: a._nombre ?? a.nombre,
                              email: a._email ?? a.email,
                              grupo_id:
                                a._grupo !== undefined
                                  ? a._grupo
                                  : a.grupo_id,
                              tiene_tdah:
                                (a._tdah ??
                                  (a.tiene_tdah ? "1" : "0")) === "1",
                              tipo_tdah:
                                a._tipo ??
                                (a._tdah === "1" ? a.tipo_tdah : null),
                            });
                            setEditandoId(null);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Paginación */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPagina(n)}
              className={`px-3 py-1 rounded-md text-sm ${
                pagina === n
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-blue-100 text-gray-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Modal nuevo alumno */}
      <BaseModal
        open={mostrarModalNuevo}
        title="Nuevo alumno"
        onClose={() => setMostrarModalNuevo(false)}
      >
        <div className="space-y-3">
          <input
            placeholder="Nombre completo"
            value={alumnoForm.nombre}
            onChange={(e) =>
              setAlumnoForm({ ...alumnoForm, nombre: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />
          <input
            placeholder="Correo electrónico"
            type="email"
            value={alumnoForm.email}
            onChange={(e) =>
              setAlumnoForm({ ...alumnoForm, email: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={alumnoForm.password}
            onChange={(e) =>
              setAlumnoForm({ ...alumnoForm, password: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />

          <select
            value={alumnoForm.grupo_id}
            onChange={(e) =>
              setAlumnoForm({ ...alumnoForm, grupo_id: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="">Seleccionar grupo</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>

          <select
            value={alumnoForm.tiene_tdah ? "1" : "0"}
            onChange={(e) =>
              setAlumnoForm({
                ...alumnoForm,
                tiene_tdah: e.target.value === "1",
              })
            }
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="0">Sin TDAH</option>
            <option value="1">Con TDAH</option>
          </select>

          {alumnoForm.tiene_tdah && (
            <input
              placeholder="Tipo de TDAH"
              value={alumnoForm.tipo_tdah}
              onChange={(e) =>
                setAlumnoForm({ ...alumnoForm, tipo_tdah: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
            />
          )}

          <button
            onClick={async () => {
              await onCreate(alumnoForm);
              setAlumnoForm({
                nombre: "",
                email: "",
                password: "",
                grupo_id: "",
                tiene_tdah: false,
                tipo_tdah: "",
              });
              setMostrarModalNuevo(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Guardar alumno
          </button>
        </div>
      </BaseModal>

      {/* Modal eliminar alumno */}
      <ConfirmModal
        open={!!alumnoAEliminar}
        title="Eliminar alumno"
        message={`¿Seguro que deseas eliminar a "${alumnoAEliminar?.nombre}"?`}
        onCancel={() => setAlumnoAEliminar(null)}
        onConfirm={async () => {
          if (alumnoAEliminar) {
            await onDelete(alumnoAEliminar.alumno_id);
            setAlumnoAEliminar(null);
          }
        }}
      />
    </motion.div>
  );
}

/* =========================
   Panel: Grupos
========================= */

function GruposPanel({
  grupos,
  maestros,
  onCreate,
  onUpdate,
  onDelete,
  pagina,
  setPagina,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [grupoForm, setGrupoForm] = useState({
    nombre: "",
    grado: "",
    maestro_id: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [grupoAEliminar, setGrupoAEliminar] = useState(null);

  const filtrados = grupos.filter(
    (g) =>
      g.nombre.toLowerCase().includes(busqueda) ||
      g.grado.toLowerCase().includes(busqueda)
  );

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE) || 1;
  const start = (pagina - 1) * ITEMS_PER_PAGE;
  const visibles = filtrados.slice(start, start + ITEMS_PER_PAGE);

  return (
    <motion.div
      key="grupos-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
          🏫 Gestión de Grupos
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar grupo..."
              onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
              className="border rounded-md pl-9 pr-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Nuevo grupo
          </button>
        </div>
      </div>

      {/* Grid de grupos */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {visibles.map((g) => (
            <motion.div
              key={g.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-bold text-blue-700 text-lg">
                    {g.nombre}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Grado: <b>{g.grado}</b>
                    <br />
                    Alumnos: {g.total_alumnos ?? 0}
                    <br />
                    Maestro:{" "}
                    <span className="font-medium text-gray-700">
                      {g.maestro || "Sin maestro"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditandoId(g.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setGrupoAEliminar(g)}
                    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Panel edición */}
              <AnimatePresence>
                {editandoId === g.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 border-t pt-3 space-y-2 overflow-hidden"
                  >
                    <input
                      defaultValue={g.nombre}
                      onChange={(e) => (g._nombre = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-sm"
                    />
                    <input
                      defaultValue={g.grado}
                      onChange={(e) => (g._grado = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-sm"
                    />

                    <select
                      defaultValue={g.maestro_id || ""}
                      onChange={(e) => (g._maestro = e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-sm"
                    >
                      <option value="">Asignar maestro...</option>
                      {maestros.map((m) => (
                        <option key={m.maestro_id} value={m.maestro_id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={async () => {
                          await onUpdate(g.id, {
                            nombre: g._nombre ?? g.nombre,
                            grado: g._grado ?? g.grado,
                            maestro_id: g._maestro || null,
                          });
                          setEditandoId(null);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Paginación */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPagina(n)}
            className={`px-3 py-1 rounded-md text-sm ${
              pagina === n
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-blue-100 text-gray-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Modal nuevo grupo */}
      <BaseModal
        open={mostrarModalNuevo}
        title="Nuevo grupo"
        onClose={() => setMostrarModalNuevo(false)}
      >
        <div className="space-y-3">
          <input
            placeholder="Nombre (p. ej. Primero A)"
            value={grupoForm.nombre}
            onChange={(e) =>
              setGrupoForm({ ...grupoForm, nombre: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />
          <input
            placeholder="Grado (p. ej. Primero)"
            value={grupoForm.grado}
            onChange={(e) =>
              setGrupoForm({ ...grupoForm, grado: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />

          <select
            value={grupoForm.maestro_id}
            onChange={(e) =>
              setGrupoForm({ ...grupoForm, maestro_id: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="">Asignar maestro...</option>
            {maestros.map((m) => (
              <option key={m.maestro_id} value={m.maestro_id}>
                {m.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={async () => {
              await onCreate(grupoForm);
              setGrupoForm({ nombre: "", grado: "", maestro_id: "" });
              setMostrarModalNuevo(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Guardar grupo
          </button>
        </div>
      </BaseModal>

      {/* Modal eliminar grupo */}
      <ConfirmModal
        open={!!grupoAEliminar}
        title="Eliminar grupo"
        message={`¿Seguro que deseas eliminar el grupo "${grupoAEliminar?.nombre}"? Asegúrate de que no tenga alumnos asignados.`}
        onCancel={() => setGrupoAEliminar(null)}
        onConfirm={async () => {
          if (grupoAEliminar) {
            await onDelete(grupoAEliminar.id);
            setGrupoAEliminar(null);
          }
        }}
      />
    </motion.div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */

export default function PanelDirectivo() {
  const [vista, setVista] = useState("maestros");
  const [maestros, setMaestros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };
  const ok = (m) => showToast(m, "success");
  const fail = (m) => showToast(m, "error");

  const [paginaMaestros, setPaginaMaestros] = useState(1);
  const [paginaAlumnos, setPaginaAlumnos] = useState(1);
  const [paginaGrupos, setPaginaGrupos] = useState(1);

  const cambiarVista = (v) => {
    setVista(v);
    setPaginaMaestros(1);
    setPaginaAlumnos(1);
    setPaginaGrupos(1);
  };

  const cargarDatos = async () => {
    try {
      setLoadingGlobal(true);
      const headers = getAuthHeaders();
      const [m, a, g] = await Promise.all([
        axios.get(`${API_BASE}/maestros`, { headers }),
        axios.get(`${API_BASE}/alumnos`, { headers }),
        axios.get(`${API_BASE}/grupos`, { headers }),
      ]);
      setMaestros(m.data);
      setAlumnos(a.data);
      setGrupos(g.data);
    } catch (e) {
      console.error(e);
      fail("Error al cargar datos");
    } finally {
      setLoadingGlobal(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ----- Handlers API ----- */

  const createMaestro = async (payload) => {
    if (!payload.nombre || !payload.email || !payload.password) {
      fail("Todos los campos son obligatorios");
      return;
    }
    try {
      await axios.post(`${API_BASE}/crear-maestro`, payload, {
        headers: getAuthHeaders(),
      });
      ok("Maestro creado correctamente");
      await cargarDatos();
    } catch (e) {
      fail(e.response?.data?.message || "Error al crear maestro");
    }
  };

  const updateMaestro = async (id, payload) => {
    try {
      await axios.put(`${API_BASE}/actualizar-maestro/${id}`, payload, {
        headers: getAuthHeaders(),
      });
      ok("Maestro actualizado");
      await cargarDatos();
    } catch (e) {
      fail("Error al actualizar maestro");
    }
  };

  const deleteMaestro = async (id) => {
    try {
      await axios.delete(`${API_BASE}/eliminar-maestro/${id}`, {
        headers: getAuthHeaders(),
      });
      ok("Maestro eliminado");
      await cargarDatos();
    } catch (e) {
      fail("No se pudo eliminar maestro");
    }
  };

  const createAlumno = async (payload) => {
    const { nombre, email, password, grupo_id } = payload;
    if (!nombre || !email || !password || !grupo_id) {
      fail("Todos los campos son obligatorios");
      return;
    }
    try {
      await axios.post(`${API_BASE}/crear-alumno`, payload, {
        headers: getAuthHeaders(),
      });
      ok("Alumno creado correctamente");
      await cargarDatos();
    } catch (e) {
      fail("Error al crear alumno");
    }
  };

  const updateAlumno = async (payload) => {
    try {
      await axios.put(`${API_BASE}/actualizar-alumno`, payload, {
        headers: getAuthHeaders(),
      });
      ok("Alumno actualizado");
      await cargarDatos();
    } catch (e) {
      fail("Error al actualizar alumno");
    }
  };

  const deleteAlumno = async (id) => {
    try {
      await axios.delete(`${API_BASE}/eliminar-alumno/${id}`, {
        headers: getAuthHeaders(),
      });
      ok("Alumno eliminado");
      await cargarDatos();
    } catch (e) {
      fail("Error al eliminar alumno");
    }
  };

  const createGrupo = async (payload) => {
    if (!payload.nombre || !payload.grado) {
      fail("Nombre y grado son obligatorios");
      return;
    }
    try {
      await axios.post(`${API_BASE}/crear-grupo`, payload, {
        headers: getAuthHeaders(),
      });
      ok("Grupo creado correctamente");
      await cargarDatos();
    } catch (e) {
      fail("Error al crear grupo");
    }
  };

  const updateGrupo = async (id, payload) => {
    try {
      await axios.put(`${API_BASE}/actualizar-grupo/${id}`, payload, {
        headers: getAuthHeaders(),
      });
      ok("Grupo actualizado");
      await cargarDatos();
    } catch (e) {
      fail("Error al actualizar grupo");
    }
  };

  const deleteGrupo = async (id) => {
    try {
      await axios.delete(`${API_BASE}/eliminar-grupo/${id}`, {
        headers: getAuthHeaders(),
      });
      ok("Grupo eliminado");
      await cargarDatos();
    } catch (e) {
      fail("No se pudo eliminar grupo (quizá tiene alumnos)");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <DirectivoHeader onLogout={handleLogout} />
        <DirectivoTabs vista={vista} onChange={cambiarVista} />

        {loadingGlobal && (
          <div className="text-sm text-gray-500 mb-2">
            Cargando información...
          </div>
        )}

        {vista === "maestros" && (
          <MaestrosPanel
            maestros={maestros}
            grupos={grupos}
            onCreate={createMaestro}
            onUpdate={updateMaestro}
            onDelete={deleteMaestro}
            pagina={paginaMaestros}
            setPagina={setPaginaMaestros}
          />
        )}

        {vista === "alumnos" && (
          <AlumnosPanel
            alumnos={alumnos}
            grupos={grupos}
            onCreate={createAlumno}
            onUpdate={updateAlumno}
            onDelete={deleteAlumno}
            pagina={paginaAlumnos}
            setPagina={setPaginaAlumnos}
          />
        )}

        {vista === "grupos" && (
          <GruposPanel
            grupos={grupos}
            maestros={maestros}
            onCreate={createGrupo}
            onUpdate={updateGrupo}
            onDelete={deleteGrupo}
            pagina={paginaGrupos}
            setPagina={setPaginaGrupos}
          />
        )}
      </div>

      <ToastStack
        toasts={toasts}
        remove={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </div>
  );
}