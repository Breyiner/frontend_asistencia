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

// Hooks personalizados para datos del aprendiz y catálogos
import useApprenticeShow from "../../hooks/useApprenticeShow";
import useCatalog from "../../hooks/useCatalog";

/**
 * Función auxiliar que retorna fecha de ayer en formato YYYY-MM-DD.
 * 
 * Usada como valor máximo para fecha de nacimiento en edición.
 * 
 * @returns {string} Fecha de ayer en formato ISO (YYYY-MM-DD)
 */
function yesterdayYmd() {
  const d = new Date();
  d.setDate(d.getDate() - 1); // Resta un día
  return d.toISOString().slice(0, 10); // Formato YYYY-MM-DD
}

/**
 * Componente para visualizar y editar información completa de un aprendiz.
 * 
 * Muestra datos en modo lectura (InfoRow) o edición (InputField)
 * con alternancia entre modos mediante botones.
 * 
 * Características:
 * - Vista dual: lectura/edición
 * - Catálogos dinámicos para selects
 * - Validación en tiempo real
 * - Acciones CRUD (editar, guardar, cancelar, eliminar)
 * - Layout responsive con sidebar informativa
 * - Manejo completo de estados de carga
 * 
 * Flujo:
 * 1. Carga datos del aprendiz por ID
 * 2. Muestra en modo lectura con botón Editar
 * 3. Usuario edita campos → Guarda/Cancela
 * 4. Opcional: Eliminar aprendiz
 * 
 * @component
 * @returns {JSX.Element} Vista completa del aprendiz (lectura/edición)
 */
export default function ApprenticesShowPage() {
  // ID del aprendiz desde URL params
  const { id } = useParams();
  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona todos los datos y acciones del aprendiz.
   * 
   * Retorna:
   * - apprentice: datos completos del aprendiz
   * - loading: estado de carga inicial
   * - isEditing: modo edición activo
   * - form: datos editables
   * - errors: errores de validación
   * - saving: estado de guardado
   * - startEdit/cancelEdit/save/deleteApprentice: acciones CRUD
   * - setRolesCatalog: setter para catálogo de roles
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

  // Catálogos para selects
  const rolesCatalog = useCatalog("roles", { includeEmpty: false });
  const statusCatalog = useCatalog("user_statuses");
  const docTypesCatalog = useCatalog("document_types");

  /**
   * Efecto para sincronizar catálogo de roles con el hook.
   * 
   * Cuando rolesCatalog carga opciones, las pasa al hook principal.
   */
  useEffect(() => {
    if (setRolesCatalog) setRolesCatalog(rolesCatalog.options);
  }, [rolesCatalog.options, setRolesCatalog]);

  /**
   * Secciones del BlocksGrid calculadas dinámicamente.
   * 
   * Cambian según modo edición/lectura.
   * Left: datos personales | Right: datos sistema.
   */
  const sections = useMemo(
    () => [
      {
        // Columna izquierda: Información Personal
        left: [
          {
            title: "Información Personal",
            content: isEditing ? (
              // MODO EDICIÓN: campos editables
              <>
                <InputField label="Nombres" name="first_name" value={form.first_name} onChange={onChange} error={errors.first_name} disabled={saving} />
                <InputField label="Apellidos" name="last_name" value={form.last_name} onChange={onChange} error={errors.last_name} disabled={saving} />

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

                <InputField label="Documento" name="document_number" value={form.document_number} onChange={onChange} error={errors.document_number} disabled={saving} />
                <InputField label="Correo" name="email" value={form.email} onChange={onChange} error={errors.email} disabled={saving} />
                <InputField label="Teléfono" name="telephone_number" value={form.telephone_number} onChange={onChange} error={errors.telephone_number} disabled={saving} />

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
              // MODO LECTURA: filas informativas
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
        // Columna derecha: Información Sistema
        right: [
          {
            title: "Información Sistema",
            content: isEditing ? (
              // MODO EDICIÓN: solo estado editable
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
              // MODO LECTURA: información sistema
              <>
                <InfoRow label="Rol" value={Array.isArray(apprentice?.roles) ? apprentice.roles.join(", ") : apprentice?.roles} />
                <InfoRow label="Estado" value={apprentice?.status} />
                <InfoRow label="Programa de Formación" value={apprentice?.training_program} />
                <InfoRow label="Ficha" value={apprentice?.ficha_number} />
              </>
            ),
          },
        ],
      }
    ],
    [isEditing, form, errors, onChange, apprentice, docTypesCatalog.options, docTypesCatalog.loading, statusCatalog.options, statusCatalog.loading, saving]
  );

  /**
   * Elementos laterales (sidebar) calculados dinámicamente.
   * 
   * Muestra info adicional solo en modo lectura.
   */
  const side = useMemo(
    () =>
      [
        // Info adicional solo si no está editando
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
        // Nota informativa permanente
        {
          title: "Nota",
          variant: "info",
          content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
        },
      ].filter(Boolean), // Elimina elementos null
    [isEditing, apprentice]
  );

  /**
   * Acciones dinámicas según modo edición/lectura.
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        // MODO EDICIÓN: Cancelar/Guardar
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        // MODO LECTURA: Editar/Eliminar
        <>
          <Button variant="primary" onClick={startEdit}>
            Editar
          </Button>
          <Button variant="danger" onClick={deleteApprentice}>
            Eliminar
          </Button>
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteApprentice]
  );

  // Estados de carga/error
  if (loading) return <div>Cargando...</div>;
  if (!apprentice) return <div>No encontrado</div>;

  return (
    <div className="apprentice-show">
      {/* Layout principal con acciones dinámicas */}
      <UserLayout onBack={() => navigate("/apprentices")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
