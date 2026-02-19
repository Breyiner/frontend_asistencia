// Importaciones de React
import { useMemo, useState } from "react";

// React Router para navegación y parámetros
import { useNavigate, useParams } from "react-router-dom";

// Layout y componentes UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hook principal y modal específico
import useRoleShow from "../../hooks/useRoleShow";
import PermissionsModal from "../../components/PermissionsModal/PermissionsModal";

// Utilidades de autenticación
import { can } from "../../utils/auth";

/**
 * Página de detalle y edición de rol específico con gestión de permisos.
 * 
 * PERMISOS: Control granular con `can()` utility
 */
export default function RoleShowPage() {
  // ID del rol desde parámetros de URL
  const { roleId } = useParams();
  const navigate = useNavigate();

  // Permisos usando solo `can()` utility (sin hooks)
  const canEdit = can("roles.update");
  const canDelete = can("roles.delete");

  /**
   * Hook maestro que maneja TODO.
   */
  const {
    role,
    loading,
    notFound,

    isEditing,
    form,
    errors,
    saving,

    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteRole,

    allPermissions,
    syncPermissions,
  } = useRoleShow(roleId);

  /**
   * Estado local del modal de permisos.
   */
  const [openPermModal, setOpenPermModal] = useState(false);

  /**
   * IDs de permisos actualmente seleccionados para este rol.
   */
  const initialSelectedIds = useMemo(
    () => role?.permissions?.map((p) => p.id) || [],
    [role]
  );

  /**
   * Secciones principales del BlocksGrid (una sola sección).
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información del Rol",
            content: isEditing && canEdit ? ( // Solo si puede editar
              // MODO EDICIÓN: solo campo nombre editable
              <>
                <InputField
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  error={errors.name}
                  disabled={saving}
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
            title: "Descripción",
            content: isEditing && canEdit ? ( // Solo si puede editar
              // Textarea editable en modo edición
              <InputField
                label="Descripción"
                name="description"
                textarea
                rows={4}
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
    [isEditing, canEdit, form, errors, onChange, role, saving] // ← NUEVA DEPENDENCIA
  );

  /**
   * Panel lateral con 2 secciones dinámicas.
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
                <InfoRow label="ID" value={role.id} />
                <InfoRow label="Fecha registro" value={role.created_at} />
                <InfoRow label="Última actualización" value={role.updated_at} />
              </>
            ),
          }
        : null,

      // Sección 2: Gestión de permisos (siempre visible, pero botón protegido)
      role
        ? {
            title: "Permisos",
            variant: "default",
            content: (
              <>
                {/* ← Botón permisos solo si puede editar */}
                {canEdit && (
                  <Button
                    variant="primary"
                    onClick={() => setOpenPermModal(true)}
                    disabled={saving}
                  >
                    Vincular permisos
                  </Button>
                )}
                {/* Contador actual de permisos asignados (siempre visible) */}
                <div style={{ marginTop: 12 }}>
                  <InfoRow 
                    label="Total permisos" 
                    value={role.permissions?.length ?? 0}
                  />
                </div>
              </>
            ),
          }
        : null,
    ].filter(Boolean),
    [isEditing, role, saving, canEdit] // ← NUEVA DEPENDENCIA
  );

  /**
   * Barra de acciones contextual Y permisos.
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
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        // Acciones en modo lectura
        <>
          {/* ← Botón Editar solo si tiene permiso */}
          {canEdit && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {/* ← Botón Eliminar solo si tiene permiso */}
          {canDelete && (
            <Button variant="danger" onClick={deleteRole} disabled={saving}>
              Eliminar
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteRole, canEdit, canDelete]
  );

  // Early returns por estado crítico
  if (loading) return <div>Cargando...</div>;
  if (notFound) return <div>No encontrado</div>;
  if (!role) return null;

  return (
    <div className="role-show">
      <UserLayout onBack={() => navigate("/roles")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>

      {/* Modal independiente de permisos*/}
      {canEdit && (
        <PermissionsModal
          isOpen={openPermModal}
          onClose={() => setOpenPermModal(false)}
          permissions={allPermissions}
          initialSelectedIds={initialSelectedIds}
          loading={saving}
          onSave={async (ids) => {
            const ok = await syncPermissions(ids);
            if (ok) setOpenPermModal(false);
          }}
        />
      )}
    </div>
  );
}
