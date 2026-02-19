// Importaciones de React Router y componentes UI
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import InfoRow from "../../components/InfoRow/InfoRow";

// Hooks personalizados para gestión de fichas y catálogos
import useCatalog from "../../hooks/useCatalog";
import useFichaTermUpdate from "../../hooks/useFichaTermUpdate";

/**
 * Página de edición de trimestre asociado a ficha.
 * 
 * Permite actualizar la configuración de un ficha_term existente:
 * trimestre, fase, y fechas de vigencia. Similar a creación pero
 * precargado con datos actuales.
 * 
 * Características:
 * - Formulario pre-poblado con datos actuales del trimestre
 * - Validación completa con feedback por campo
 * - Catálogos dinámicos para trimestres y fases
 * - Layout responsive de 2 columnas
 * - Navegación automática post-guardado exitoso
 * - Manejo de estados de carga diferenciados
 * 
 * Flujo:
 * 1. Carga datos de ficha y trimestre específicos desde ruta
 * 2. Inicializa formulario con valores actuales
 * 3. Usuario modifica campos necesarios
 * 4. Validación + actualización asíncrona
 * 5. Redirección a página principal de ficha
 * 
 * Diferencias vs Create:
 * - Datos precargados en formulario
 * - Texto de botón "Actualizar Trimestre"
 * - Hook useFichaTermUpdate específico
 * 
 * @component
 * @returns {JSX.Element} Formulario de edición de trimestre para ficha
 */
export default function FichaTermUpdatePage() {
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona lógica de actualización de ficha_term.
   * 
   * Retorna:
   * - form: estado del formulario precargado (term_id, phase_id, fechas)
   * - ficha: datos contextuales de la ficha padre
   * - fichaId: ID de la ficha desde parámetros de ruta
   * - errors: errores de validación específicos por campo
   * - loading: estado de actualización en progreso
   * - onChange: handler unificado de cambios de formulario
   * - validateAndSave: validación + PATCH/PUT asíncrono
   */
  const { form, ficha, fichaId, errors, loading, onChange, validateAndSave } = useFichaTermUpdate();

  // Catálogos para campos select del formulario
  const termsCatalog = useCatalog("terms");
  const phasesCatalog = useCatalog("phases");

  /**
   * Handler de actualización con validación y redirección.
   * 
   * 1. Ejecuta validación del formulario
   * 2. Si válido, realiza actualización en backend
   * 3. Redirige a página de ficha al éxito
   * 4. Errores mostrados automáticamente via 'errors'
   */
  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) navigate(`/fichas/${fichaId}`);
  };

  // Estado de carga de datos iniciales
  if (!ficha) {
    return (
      <div className="loading-center">
        <div>Cargando...</div>
      </div>
    );
  }

  /**
   * Sección principal del formulario en layout de 2 columnas.
   * 
   * Izquierda: Campos de selección (trimestre, fase)
   * Derecha: Campos de fechas (inicio, fin)
   * Footer: Acciones (Cancelar/Actualizar)
   * 
   * Todos los campos deshabilitados durante loading.
   */
  const sections = [
    {
      left: [
        {
          content: (
            <>
              <InputField
                label="Trimestre"
                name="term_id"
                value={form.term_id}
                onChange={onChange}
                options={termsCatalog.options}
                disabled={termsCatalog.loading || loading}
                error={errors.term_id}
                combo
              />
              <InputField
                label="Fase"
                name="phase_id"
                value={form.phase_id}
                onChange={onChange}
                options={phasesCatalog.options}
                disabled={phasesCatalog.loading || loading}
                error={errors.phase_id}
                combo
              />
            </>
          ),
        },
      ],
      right: [
        {
          content: (
            <>
              <InputField
                label="Fecha Inicio"
                name="start_date"
                type="date"
                value={form.start_date}
                disabled={loading}
                onChange={onChange}
                error={errors.start_date}
              />
              <InputField
                label="Fecha Fin"
                name="end_date"
                type="date"
                value={form.end_date}
                disabled={loading}
                onChange={onChange}
                error={errors.end_date}
              />
            </>
          ),
        },
      ],
      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate(`/fichas/${fichaId}`)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Actualizar Trimestre"}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral con contexto de la ficha padre.
   * 
   * Proporciona referencia visual del contexto:
   * - Número de ficha
   * - Programa de formación asociado
   */
  const side = [
    {
      title: "Información Adicional",
      variant: "default",
      content: (
        <>
          <InfoRow label="Ficha" value={ficha.ficha_number} />
          <InfoRow label="Programa de Formación" value={ficha.training_program_name} />
        </>
      ),
    },
  ];

  return (
    <div className="user-create">
      <UserLayout onBack={() => navigate(`/fichas/${fichaId}`)} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
