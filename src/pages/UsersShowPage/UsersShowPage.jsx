// React hooks para efectos y optimización
import { useEffect, useMemo } from "react";

// React Router para parámetros y navegación
import { useNavigate, useParams } from "react-router-dom";

// Layout y componentes UI principales
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks maestros para datos y edición
import useUserShow from "../../hooks/useUserShow";
import useCatalog from "../../hooks/useCatalog";

// Utilidades de autenticación ← AGREGADO
import { can } from "../../utils/auth";

/**
 * Página de detalle completo y edición inline de usuario específico.
 * 
 * PERMISOS: Control granular con `can()` utility
 */
export default function UsersShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Permisos usando solo `can()` utility (sin hooks)
  const canEdit = can("users.update");
  const canDelete = can("users.delete");

  /**
   * Hook COMPLETO de gestión usuario.
   */
  const {
    user,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteUser,
    setRolesCatalog,
    setAreasCatalog,
  } = useUserShow(id);

  /**
   * 4 catálogos con configuración específica (solo si puede editar)
   */
  const rolesCatalog = useCatalog("roles/select", { 
    enabled: canEdit,
    includeEmpty: false 
  });
  const areasCatalog = useCatalog("areas/select", { 
    enabled: canEdit,
    includeEmpty: false 
  });
  const statusCatalog = useCatalog("user_statuses", { enabled: canEdit });
  const docTypesCatalog = useCatalog("document_types", { enabled: canEdit });

  /**
   * Sincroniza catálogos externos con estado interno del hook.
   */
  useEffect(() => {
    setRolesCatalog?.(rolesCatalog.options);
    setAreasCatalog?.(areasCatalog.options);
  }, [rolesCatalog.options, areasCatalog.options, setRolesCatalog, setAreasCatalog]);

  /**
   * Secciones principales (una sección extensa).
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información Personal",
            content: isEditing && canEdit ? ( // Solo si puede editar
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
            title: "Información Sistema",
            content: isEditing && canEdit ? ( // Solo si puede editar
              // MODO EDICIÓN: 3 campos especiales
              <>
                <InputField
                  label="Roles"
                  name="roles"
                  value={form.roles}
                  options={rolesCatalog.options}
                  multiple
                  size={6}
                  disabled={rolesCatalog.loading || saving}
                  error={errors.roles}
                  onChange={onChange}
                />
                <InputField
                  label="Áreas"
                  name="areas"
                  value={form.areas}
                  options={areasCatalog.options}
                  multiple
                  size={4}
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
                  select
                />
              </>
            ) : (
              // MODO LECTURA: InfoRow con join() para arrays
              <>
                <InfoRow
                  label="Roles"
                  value={Array.isArray(user?.roles) ? user.roles.join(", ") : user?.roles}
                />
                <InfoRow
                  label="Áreas"
                  value={Array.isArray(user?.areas) ? user.areas.join(", ") : user?.areas}
                />
                <InfoRow label="Estado" value={user?.status} />
              </>
            ),
          },
        ],
      },
    ],
    [
      isEditing,
      canEdit, // ← NUEVA DEPENDENCIA
      form,
      errors,
      onChange,
      user,
      docTypesCatalog.options,
      docTypesCatalog.loading,
      rolesCatalog.options,
      rolesCatalog.loading,
      areasCatalog.options,
      areasCatalog.loading,
      statusCatalog.options,
      statusCatalog.loading,
      saving,
    ]
  );

  /**
   * Panel lateral dinámico (2 secciones).
   */
  const side = useMemo(
    () => [
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
      {
        title: "Nota",
        variant: "info",
        content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
      },
    ].filter(Boolean),
    [isEditing, user]
  );

  /**
   * Actions contextuales en barra superior Y permisos. ← MODIFICADO
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        <>
          {/* ← Botón Editar solo si tiene permiso */}
          {canEdit && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {/* ← Botón Eliminar solo si tiene permiso */}
          {canDelete && (
            <Button variant="danger" onClick={deleteUser} disabled={saving}>
              Eliminar
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteUser, canEdit, canDelete] // ← NUEVAS DEPENDENCIAS
  );

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No encontrado</div>;

  return (
    <div className="user-show">
      <UserLayout onBack={() => navigate("/users")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
