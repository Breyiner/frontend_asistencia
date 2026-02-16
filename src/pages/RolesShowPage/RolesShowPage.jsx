// Importaciones de React
import { useMemo, useState } from "react"; // Memoización y estado local

// React Router para navegación y parámetros
import { useNavigate, useParams } from "react-router-dom"; // Navegación y URL params

// Layout y componentes UI
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con barra superior
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid 2 columnas responsive
import InfoRow from "../../components/InfoRow/InfoRow"; // Fila informativa solo lectura
import InputField from "../../components/InputField/InputField"; // Campo formulario versátil
import Button from "../../components/Button/Button"; // Botones con estados

// Hook principal y modal específico
import useRoleShow from "../../hooks/useRoleShow"; // Lógica CRUD completa del rol
import PermissionsModal from "../../components/PermissionsModal/PermissionsModal"; // Modal de gestión permisos

/**
 * Página de detalle y edición de rol específico con gestión de permisos.
 * 
 * Interfaz completa para visualizar/editar rol + modal independiente
 * para vincular/desvincular permisos.
 * 
 * Características:
 * - Modo lectura/edición alternable (solo nombre/descripción)
 * - Panel permisos con botón + contador + modal externo
 * - Secciones optimizadas con useMemo extenso
 * - Estados de carga/error/notFound manejados
 * - UX: edición básica inline, permisos en modal separado
 * 
 * Flujo:
 * 1. Carga rol por ID + todos los permisos disponibles
 * 2. Modo lectura: info básica + botón "Vincular permisos"
 * 3. Click → modal con lista completa de permisos (checkboxes)
 * 4. Guardado permisos → syncPermissions → cierra modal
 * 5. Edición básica: solo name/description (código inmutable)
 * 
 * @component
 * @returns {JSX.Element} Detalle de rol con modal de permisos
 */
export default function RoleShowPage() {
  // ID del rol desde parámetros de URL
  const { roleId } = useParams();
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook maestro que maneja TODO:
   * Datos: role (completo con permisos), loading, notFound
   * Edición: isEditing, form, errors, saving
   * Acciones: startEdit, cancelEdit, onChange, save, deleteRole
   * Permisos: allPermissions (lista completa), syncPermissions (guarda selección)
   */
  const {
    role,              // Datos completos del rol (con permisos embebidos)
    loading,           // Loading inicial de datos
    notFound,          // Flag 404 si rol no existe

    isEditing,         // Modo edición activo
    form,              // Formulario controlado (name, description)
    errors,            // Errores validación por campo
    saving,            // Guardado en progreso

    startEdit,         // Activa edición
    cancelEdit,        // Cancela y resetea
    onChange,          // Handler cambios formulario
    save,              // PATCH datos básicos
    deleteRole,        // DELETE rol completo

    allPermissions,    // Lista COMPLETA de permisos del sistema
    syncPermissions,   // POST/PUT selección de permisos para este rol
  } = useRoleShow(roleId);

  /**
   * Estado local del modal de permisos.
   * Controla apertura/cierre independiente del resto.
   */
  const [openPermModal, setOpenPermModal] = useState(false);

  /**
   * IDs de permisos actualmente seleccionados para este rol.
   * Extraídos de role.permissions → array de IDs.
   * Fallback: array vacío si no hay permisos.
   */
  const initialSelectedIds = useMemo(
    () => role?.permissions?.map((p) => p.id) || [], // Mapea IDs o vacío
    [role] // Recalcula solo si cambia el rol
  );

  /**
   * Secciones principales del BlocksGrid (una sola sección).
   * 
   * Izquierda: Nombre (editable) + Código (solo lectura)
   * Derecha: Descripción (textarea editable)
   * 
   * Contenido condicional según isEditing.
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información del Rol", // Título sección principal
            content: isEditing ? (
              // MODO EDICIÓN: solo campo nombre editable
              <>
                <InputField
                  label="Nombre"
                  name="name"                      // Campo específico
                  value={form.name}                // Valor controlado
                  onChange={onChange}              // Actualiza form
                  error={errors.name}              // Error específico
                  disabled={saving}                // Bloqueado durante guardado
                />
              </>
            ) : (
              // MODO LECTURA: filas informativas
              <>
                <InfoRow label="Nombre" value={role?.name} />
                <InfoRow label="Código" value={role?.code} /> {/* Inmutable */}
              </>
            ),
          },
        ],
        right: [
          {
            title: "Descripción", // Título sección secundaria
            content: isEditing ? (
              // Textarea editable en modo edición
              <InputField
                label="Descripción"
                name="description"
                textarea                       // Renderiza textarea
                rows={4}                       // Altura fija
                value={form.description}
                onChange={onChange}
                disabled={saving}
                error={errors.description}
              />
            ) : (
              // InfoRow con fallback si no hay descripción
              <InfoRow label="Descripción" value={role?.description || "Sin descripción"} />
            ),
          },
        ],
      },
    ],
    [isEditing, form, errors, onChange, role, saving] // Dependencias del memo
  );

  /**
   * Panel lateral con 2 secciones dinámicas.
   * 
   * 1. Info sistema (solo lectura)
   * 2. Gestión permisos (botón + contador)
   */
  const side = useMemo(
    () => [
      // Sección 1: Metadatos del sistema (solo modo lectura)
      !isEditing && role
        ? {
            title: "Información Sistema",
            variant: "default",
            content: (
              <>
                <InfoRow label="ID" value={role.id} />                {/* ID interno */}
                <InfoRow label="Fecha registro" value={role.created_at} /> {/* Creación */}
                <InfoRow label="Última actualización" value={role.updated_at} /> {/* Modificación */}
              </>
            ),
          }
        : null,

      // Sección 2: Gestión de permisos (siempre visible)
      role
        ? {
            title: "Permisos",
            variant: "default",
            content: (
              <>
                {/* Botón para abrir modal de permisos */}
                <Button
                  variant="primary"
                  onClick={() => setOpenPermModal(true)}  // Abre modal independiente
                  disabled={saving}                       // Bloqueado durante edición
                >
                  Vincular permisos
                </Button>

                {/* Contador actual de permisos asignados */}
                <div style={{ marginTop: 12 }}> {/* Espaciado inline */}
                  <InfoRow 
                    label="Total permisos" 
                    value={role.permissions?.length ?? 0}  // Longitud array o 0
                  />
                </div>
              </>
            ),
          }
        : null,
    ].filter(Boolean), // Elimina secciones nulas
    [isEditing, role, saving] // Dependencias del panel
  );

  /**
   * Barra de acciones contextual.
   * 
   * Edición: Cancelar/Guardar
   * Lectura: Editar/Eliminar
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        // Acciones durante edición
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"} // Texto dinámico
          </Button>
        </>
      ) : (
        // Acciones en modo lectura
        <>
          <Button variant="primary" onClick={startEdit} disabled={saving}>
            Editar
          </Button>
          <Button variant="danger" onClick={deleteRole} disabled={saving}>
            Eliminar
          </Button>
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteRole] // Dependencias
  );

  /**
   * Early returns por estado crítico.
   * Prioridad: loading → notFound → null
   */
  if (loading) return <div>Cargando...</div>;     // Loading inicial
  if (notFound) return <div>No encontrado</div>;  // Error 404
  if (!role) return null;                         // Fallback seguro

  return (
    <div className="role-show"> {/* Contenedor principal estilizado */}
      {/* Layout con back + acciones contextuales */}
      <UserLayout onBack={() => navigate("/roles")} actions={actions}>
        {/* Grid principal con panel lateral */}
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>

      {/* Modal independiente de permisos */}
      <PermissionsModal
        isOpen={openPermModal}                    // Controlado por estado local
        onClose={() => setOpenPermModal(false)}   // Cierra modal
        permissions={allPermissions}              // Lista completa disponible
        initialSelectedIds={initialSelectedIds}   // Permisos actualmente asignados
        loading={saving}                          // Bloquea durante guardado general
        onSave={async (ids) => {                  // Callback de guardado del modal
          const ok = await syncPermissions(ids);  // Sincroniza selección con backend
          if (ok) setOpenPermModal(false);        // Cierra si éxito
        }}
      />
    </div>
  );
}
