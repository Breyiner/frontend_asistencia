// Hooks de React para efectos y memoización
import { useEffect, useMemo } from "react";
// Hooks de React Router para parámetros y navegación
import { useNavigate, useParams } from "react-router-dom";

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Utilidades de autenticación
import { can } from "../../utils/auth";

// Hooks personalizados para datos del aprendiz y catálogos
import useApprenticeShow from "../../hooks/useApprenticeShow";
import useCatalog from "../../hooks/useCatalog";

/**
 * Función auxiliar que retorna fecha de ayer en formato YYYY-MM-DD.
 * 
 * Usada como valor máximo para fecha de nacimiento (evita fechas futuras).
 * 
 * @returns {string} Fecha de ayer en formato ISO (YYYY-MM-DD)
 */
function yesterdayYmd() {
  const d = new Date();
  d.setDate(d.getDate() - 1); // Resta un día
  return d.toISOString().slice(0, 10); // Formato YYYY-MM-DD
}

/**
 * Página de visualización y edición de un aprendiz específico.
 * 
 * Interfaz dual modo lectura/edición con controles de acceso granular:
 * - Vista: todos los roles con apprentices.view
 * - Editar: requiere apprentices.update
 * - Eliminar: requiere apprentices.delete
 * 
 * Características:
 * - Layout responsive BlocksGrid (2 columnas + sidebar)
 * - Catálogos dinámicos para selects (roles, estados, tipos documento)
 * - Validación en tiempo real con errores inline
 * - Acciones contextuales según permisos y modo
 * - Guardado automático con feedback visual
 * 
 * Flujo de usuario:
 * 1. Carga aprendiz por ID desde URL
 * 2. Vista lectura → Botón "Editar" (si tiene permiso)
 * 3. Modo edición → "Guardar"/"Cancelar"
 * 4. Opcional: "Eliminar" (si tiene permiso)
 * 
 * @component
 * @returns {JSX.Element} Layout completo del aprendiz
 */
export default function ApprenticesShowPage() {
  // ID del aprendiz desde parámetros de URL
  const { id } = useParams();
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Verificaciones de permisos Spatie para acciones CRUD.
   * Determinan visibilidad y habilitación de botones.
   */
  const canUpdate = can("apprentices.update");
  const canDelete = can("apprentices.delete");

  /**
   * Hook principal: gestiona datos, estado y acciones del aprendiz.
   * 
   * Proporciona:
   * - apprentice: datos completos
   * - loading/isEditing/saving: estados UI
   * - form/errors/onChange: formulario controlado
   * - startEdit/cancelEdit/save/deleteApprentice: acciones
   * - setRolesCatalog: sincronización catálogos
   */
  const {
    apprentice,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteApprentice,
    setRolesCatalog,
  } = useApprenticeShow(id);

  /**
   * Catálogos dinámicos para campos select del formulario.
   */
  const rolesCatalog = useCatalog("roles", { includeEmpty: false });
  const statusCatalog = useCatalog("user_statuses");
  const docTypesCatalog = useCatalog("document_types/select");

  /**
   * Sincroniza catálogo de roles con hook principal.
   * Permite usar roles en formulario de edición.
   */
  useEffect(() => {
    if (setRolesCatalog) setRolesCatalog(rolesCatalog.options);
  }, [rolesCatalog.options, setRolesCatalog]);

  /**
   * Secciones principales del BlocksGrid (layout 2 columnas).
   * 
   * Estructura dinámica según modo edición/lectura:
   * - Izquierda: Información personal (nombres, documento, contacto)
   * - Derecha: Información sistema (roles, estado, ficha)
   * 
   * Optimizado con useMemo para evitar re-renders.
   */
  const sections = useMemo(
    () => [
      {
        // Columna izquierda: Datos personales
        left: [
          {
            title: "Información Personal",
            content: isEditing ? (
              // MODO EDICIÓN: Formularios controlados
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

                <InputField
                  label="Fecha de nacimiento"
                  name="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={onChange}
                  error={errors.birth_date}
                  disabled={saving}
                  max={yesterdayYmd()}
                />
              </>
            ) : (
              // MODO LECTURA: Filas informativas
              <>
                <InfoRow label="Nombres" value={apprentice?.first_name} />
                <InfoRow label="Apellidos" value={apprentice?.last_name} />
                <InfoRow label="Tipo de Documento" value={apprentice?.document_type_name} />
                <InfoRow label="Documento" value={apprentice?.document_number} />
                <InfoRow label="Correo" value={apprentice?.email} />
                <InfoRow label="Teléfono" value={apprentice?.telephone_number} />
                <InfoRow label="Fecha de nacimiento" value={apprentice?.birth_date} />
              </>
            ),
          },
        ],
        // Columna derecha: Datos del sistema
        right: [
          {
            title: "Información Sistema",
            content: isEditing ? (
              // MODO EDICIÓN: Solo estado editable
              <>
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
              // MODO LECTURA: Datos relacionados
              <>
                <InfoRow 
                  label="Rol" 
                  value={Array.isArray(apprentice?.roles) ? apprentice.roles.join(", ") : apprentice?.roles} 
                />
                <InfoRow label="Estado" value={apprentice?.status} />
                <InfoRow label="Programa de Formación" value={apprentice?.training_program} />
                <InfoRow label="Ficha" value={apprentice?.ficha_number} />
              </>
            ),
          },
        ],
      },
    ],
    [
      isEditing, 
      form, 
      errors, 
      onChange, 
      apprentice, 
      docTypesCatalog.options, 
      docTypesCatalog.loading, 
      statusCatalog.options, 
      statusCatalog.loading, 
      saving
    ]
  );

  /**
   * Panel lateral (sidebar) con información complementaria.
   * 
   * Solo visible en modo lectura:
   * - Metadatos del sistema (ID, timestamps)
   * - Nota informativa permanente sobre guardado
   */
  const side = useMemo(
    () => [
      // Metadatos del sistema (solo lectura)
      !isEditing && apprentice
        ? {
            title: "Información Adicional",
            variant: "default",
            content: (
              <>
                <InfoRow label="ID" value={apprentice.id} />
                <InfoRow label="Fecha registro" value={apprentice.created_at} />
                <InfoRow label="Última actualización" value={apprentice.updated_at} />
              </>
            ),
          }
        : null,
      // Nota permanente sobre guardado automático
      {
        title: "Nota",
        variant: "info",
        content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
      },
    ].filter(Boolean),
    [isEditing, apprentice]
  );

  /**
   * Barra de acciones contextual según permisos y modo.
   * 
   * MODO LECTURA: Editar (si puede) / Eliminar (si puede)
   * MODO EDICIÓN: Cancelar / Guardar
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        // MODO EDICIÓN: Acciones de formulario
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        // MODO LECTURA: Acciones contextuales por permiso
        <>
          {canUpdate && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={deleteApprentice} disabled={saving}>
              Eliminar
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteApprentice, canUpdate, canDelete]
  );

  // Render condicional: loading/error
  if (loading) return <div>Cargando...</div>;
  if (!apprentice) return <div>Aprendiz no encontrado</div>;

  return (
    <div className="apprentice-show">
      {/* Layout principal con navegación y acciones dinámicas */}
      <UserLayout onBack={() => navigate("/apprentices")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
