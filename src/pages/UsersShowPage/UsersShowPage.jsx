// React hooks para efectos y optimización
import { useEffect, useMemo } from "react"; // Efectos secundarios + memoización

// React Router para parámetros y navegación
import { useNavigate, useParams } from "react-router-dom"; // ID usuario + navegación contextual

// Layout y componentes UI principales
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout superior con back
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid 2 columnas optimizado
import InfoRow from "../../components/InfoRow/InfoRow"; // Fila informativa solo lectura
import InputField from "../../components/InputField/InputField"; // Campo editable avanzado
import Button from "../../components/Button/Button"; // Botones con estados contextuales

// Hooks maestros para datos y edición
import useUserShow from "../../hooks/useUserShow"; // CRUD completo + permisos sincronizados
import useCatalog from "../../hooks/useCatalog"; // Catálogos reactivos para selects

/**
 * Página de detalle completo y edición inline de usuario específico.
 * 
 * **Más compleja** que otros shows:
 * - 4 catálogos (roles/áreas/status/documentos)
 * - useEffect sincroniza catálogos con hook padre
 * - Multi-selects con size diferenciado (roles=6, áreas=4)
 * - Render condicional arrays → string para InfoRow
 * - Edición de estado (única diferencia vs otros)
 * 
 * Secciones:
 * Izquierda: 6 campos personales (editable/InfoRow)
 * Derecha: 3 campos sistema (roles/áreas/estado)
 * 
 * Flujo:
 * 1. Carga usuario + 4 catálogos
 * 2. Sincroniza catálogos con hook via setRolesCatalog/setAreasCatalog
 * 3. Lectura: InfoRow con join() para arrays
 * 4. Edición: multi-selects + inputs normales
 * 5. Acciones: Editar/Eliminar vs Cancelar/Guardar
 * 
 * @component
 * @returns {JSX.Element} Detalle usuario con edición inline + multi-selects
 */
export default function UsersShowPage() {
  // ID usuario desde URL params
  const { id } = useParams();
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook COMPLETO de gestión usuario:
   * Datos: user (completo), loading, isEditing
   * Form: form, errors, saving
   * Acciones: startEdit, cancelEdit, onChange, save, deleteUser
   * Sincronización: setRolesCatalog, setAreasCatalog (para multi-selects)
   */
  const {
    user,            // Usuario completo (roles/áreas arrays)
    loading,         // Loading inicial
    isEditing,       // Modo edición activo
    form,            // Formulario controlado
    errors,          // Errores por campo
    saving,          // Guardado PATCH en progreso
    startEdit,       // Activa edición
    cancelEdit,      // Cancela/resetea
    onChange,        // Handler unificado
    save,            // PATCH datos
    deleteUser,      // DELETE usuario
    setRolesCatalog, // Sincroniza catálogo roles con hook
    setAreasCatalog, // Sincroniza catálogo áreas
  } = useUserShow(id);

  /**
   * 4 catálogos con configuración específica.
   * 
   * roles/áreas: sin vacío (includeEmpty: false)
   * status/docTypes: estándar con vacío
   */
  const rolesCatalog = useCatalog("roles/select", { includeEmpty: false });     // Multi-select
  const areasCatalog = useCatalog("areas/select", { includeEmpty: false });     // Multi-select
  const statusCatalog = useCatalog("user_statuses");                            // Select simple
  const docTypesCatalog = useCatalog("document_types");                         // Select simple

  /**
   * Sincroniza catálogos externos con estado interno del hook.
   * 
   * Permite que useUserShow maneje multi-selects internamente.
   * Ejecuta cuando cambian opciones de roles/áreas.
   */
  useEffect(() => {
    setRolesCatalog?.(rolesCatalog.options); // ? → safe si no existe
    setAreasCatalog?.(areasCatalog.options);
  }, [rolesCatalog.options, areasCatalog.options, setRolesCatalog, setAreasCatalog]);

  /**
   * Secciones principales (una sección extensa).
   * 
   * **Izquierda: Información Personal (6 campos)**
   * Nombres/Apellidos/DocType/DocNumber/Email/Teléfono
   * 
   * **Derecha: Información Sistema (3 campos únicos)**
   * Roles (multi size=6), Áreas (multi size=4), Estado (simple)
   * 
   * Render condicional: InputField vs InfoRow
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información Personal", // Datos humanos básicos
            content: isEditing ? (
              // MODO EDICIÓN: 6 campos editables
              <>
                <InputField
                  label="Nombres"
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  error={errors.first_name}
                  disabled={saving}
                />
                <InputField
                  label="Apellidos"
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  error={errors.last_name}
                  disabled={saving}
                />
                <InputField
                  label="Tipo de Documento"
                  name="document_type_id"
                  value={form.document_type_id}
                  onChange={onChange}
                  options={docTypesCatalog.options}
                  disabled={docTypesCatalog.loading || saving}
                  error={errors.document_type_id}
                  select
                />
                <InputField
                  label="Documento"
                  name="document_number"
                  value={form.document_number}
                  onChange={onChange}
                  error={errors.document_number}
                  disabled={saving}
                />
                <InputField
                  label="Correo"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  error={errors.email}
                  disabled={saving}
                />
                <InputField
                  label="Teléfono"
                  name="telephone_number"
                  value={form.telephone_number}
                  onChange={onChange}
                  error={errors.telephone_number}
                  disabled={saving}
                />
              </>
            ) : (
              // MODO LECTURA: 6 InfoRow simples
              <>
                <InfoRow label="Nombres" value={user?.first_name} />
                <InfoRow label="Apellidos" value={user?.last_name} />
                <InfoRow label="Tipo de Documento" value={user?.document_type_name} />
                <InfoRow label="Documento" value={user?.document_number} />
                <InfoRow label="Correo" value={user?.email} />
                <InfoRow label="Teléfono" value={user?.telephone_number} />
              </>
            ),
          },
        ],

        right: [
          {
            title: "Información Sistema", // Datos administrativos
            content: isEditing ? (
              // MODO EDICIÓN: 3 campos especiales
              <>
                <InputField
                  label="Roles"
                  name="roles"
                  value={form.roles}                    // Array IDs seleccionados
                  options={rolesCatalog.options}
                  multiple                              // Selección múltiple
                  size={6}                              // Altura extendida
                  disabled={rolesCatalog.loading || saving}
                  error={errors.roles}
                  onChange={onChange}
                />

                <InputField
                  label="Áreas"
                  name="areas"
                  value={form.areas}                    // Array IDs
                  options={areasCatalog.options}
                  multiple
                  size={4}                              // Altura compacta
                  disabled={areasCatalog.loading || saving}
                  error={errors.areas}
                  onChange={onChange}
                />

                <InputField
                  label="Estado"
                  name="status_id"
                  value={form.status_id}
                  onChange={onChange}
                  options={statusCatalog.options}
                  disabled={statusCatalog.loading || saving}
                  error={errors.status_id}
                  select                                // Simple (no multiple)
                />
              </>
            ) : (
              // MODO LECTURA: InfoRow con join() para arrays
              <>
                <InfoRow
                  label="Roles"
                  value={Array.isArray(user?.roles) ? user.roles.join(", ") : user?.roles} // Array → string
                />
                <InfoRow
                  label="Áreas"
                  value={Array.isArray(user?.areas) ? user.areas.join(", ") : user?.areas} // Array → string
                />
                <InfoRow label="Estado" value={user?.status} />
              </>
            ),
          },
        ],
      },
    ],
    [
      // Dependencias extensivas (optimización crítica)
      isEditing, form, errors, onChange, user,
      docTypesCatalog.options, docTypesCatalog.loading,
      rolesCatalog.options, rolesCatalog.loading,
      areasCatalog.options, areasCatalog.loading,
      statusCatalog.options, statusCatalog.loading,
      saving,
    ]
  );

  /**
   * Panel lateral dinámico (2 secciones).
   * 
   * 1. Info adicional (solo lectura): ID/fechas
   * 2. Nota fija informativa
   */
  const side = useMemo(
    () => [
      // Sección 1: Metadatos técnicos (solo !isEditing)
      !isEditing && user
        ? {
            title: "Información Adicional",
            variant: "default",
            content: (
              <>
                <InfoRow label="ID" value={user.id} />
                <InfoRow label="Fecha registro" value={user.created_at} />
                <InfoRow label="Última actualización" value={user.updated_at} />
              </>
            ),
          }
        : null,

      // Sección 2: Nota persistente
      {
        title: "Nota",
        variant: "info",
        content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
      },
    ].filter(Boolean), // Elimina nulos
    [isEditing, user]
  );

  /**
   * Actions contextuales en barra superior.
   * 
   * Edición: Cancelar/Guardar
   * Lectura: Editar/Eliminar
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        // DURANTE EDICIÓN
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"} // Dinámico
          </Button>
        </>
      ) : (
        // MODO LECTURA
        <>
          <Button variant="primary" onClick={startEdit}>
            Editar
          </Button>
          <Button variant="danger" onClick={deleteUser}>
            Eliminar
          </Button>
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteUser]
  );

  /**
   * Early returns priorizados.
   */
  if (loading) return <div>Cargando...</div>;  // Loading datos
  if (!user) return <div>No encontrado</div>;   // 404 usuario

  return (
    <div className="user-show"> {/* Contenedor estilizado */}
      <UserLayout onBack={() => navigate("/users")} actions={actions}>
        {/* Grid principal + panel lateral */}
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
