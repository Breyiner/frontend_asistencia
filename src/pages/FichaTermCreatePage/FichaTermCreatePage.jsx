// Importaciones de React Router y componentes UI
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import InfoRow from "../../components/InfoRow/InfoRow";

// Hooks personalizados para gestión de fichas y catálogos
import useCatalog from "../../hooks/useCatalog";
import useFichaTermCreate from "../../hooks/useFichaTermCreate";

/**
 * Página de creación de asociación entre ficha y trimestre.
 * 
 * Permite al usuario crear un nuevo trimestre (ficha_term) asociado a
 * una ficha específica. Incluye selección de trimestre, fase, y definición
 * de fechas de inicio/fin.
 * 
 * Características:
 * - Formulario validado con manejo de errores en tiempo real
 * - Catálogos dinámicos para trimestres y fases
 * - Layout de 2 columnas con información contextual en panel lateral
 * - Navegación automática al éxito (regresa a ficha)
 * - Estados de carga diferenciados (catálogos vs guardado)
 * - Información contextual de la ficha padre
 * 
 * Flujo:
 * 1. Carga datos de ficha desde ID de ruta
 * 2. Carga catálogos de trimestres y fases
 * 3. Usuario completa formulario (trimestre, fase, fechas)
 * 4. Validación y guardado asíncrono
 * 5. Redirección a página de ficha al éxito
 * 
 * @component
 * @returns {JSX.Element} Formulario de creación de trimestre para ficha
 */
export default function FichaTermCreatePage() {
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona toda la lógica de creación de ficha_term.
   * 
   * Retorna:
   * - form: estado del formulario (term_id, phase_id, start_date, end_date)
   * - ficha: datos de la ficha padre
   * - fichaId: ID de la ficha desde parámetros de ruta
   * - errors: errores de validación por campo
   * - loading: estado de guardado en progreso
   * - onChange: handler unificado para cambios de formulario
   * - validateAndSave: función de validación + guardado asíncrono
   */
  const { form, ficha, fichaId, errors, loading, onChange, validateAndSave } = useFichaTermCreate();

  // Catálogos para campos select del formulario
  const termsCatalog = useCatalog("terms");
  const phasesCatalog = useCatalog("phases");

  /**
   * Handler de guardado con validación y redirección.
   * 
   * 1. Ejecuta validación y guardado
   * 2. Si éxito (result.ok), navega a página de ficha
   * 3. Maneja errores silenciosamente (mostrados via errors del hook)
   */
  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) {
      navigate(`/fichas/${fichaId}`);
    }
  };

  // Estado de carga de ficha padre
  if (!ficha) {
    return (
      <div className="loading-center">
        <div>Cargando...</div>
      </div>
    );
  }

  /**
   * Sección principal del formulario organizada en layout de 2 columnas.
   * 
   * Izquierda: Selección de trimestre y fase
   * Derecha: Fechas de inicio y fin
   * Footer: Botones de acción (Cancelar/Asociar)
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
            {loading ? "Guardando..." : "Asociar Trimestre"}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral con información contextual de la ficha.
   * 
   * Muestra:
   * - Número de ficha
   * - Nombre del programa de formación
   * - Nota informativa sobre guardado automático
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
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
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
