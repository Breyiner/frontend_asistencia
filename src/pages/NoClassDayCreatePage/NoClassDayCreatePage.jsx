// Importaciones de React Router y componentes UI
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados para catálogos y gestión de días sin clase
import useCatalog from "../../hooks/useCatalog";
import useNoClassDayCreate from "../../hooks/useNoClassDayCreate";

/**
 * Página de creación de día sin clase.
 * 
 * Registra días no lectivos para una ficha específica, excluyéndolos
 * del cálculo de asistencias y ausencias de aprendices.
 * 
 * Características:
 * - Selección de ficha vía catálogo dinámico
 * - Fecha específica con validación
 * - Motivo predefinido desde catálogo de razones
 * - Campo de observaciones opcional (textarea)
 * - Layout de 2 columnas balanceado
 * - Panel lateral con información contextual
 * - Validación completa y guardado atómico
 * 
 * Campos requeridos:
 * - ficha_id (select)
 * - date (date)
 * - reason_id (select)
 * - observations (textarea, opcional)
 * 
 * Flujo:
 * 1. Usuario selecciona ficha y completa formulario
 * 2. Validación frontend inmediata por campo
 * 3. Guardado atómico con feedback de loading
 * 4. Redirección a lista de días sin clase
 * 
 * @component
 * @returns {JSX.Element} Formulario de creación de día sin clase
 */
export default function NoClassDayCreatePage() {
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona estado y lógica de creación.
   * 
   * Retorna:
   * - form: estado completo del formulario
   * - errors: errores de validación por campo
   * - loading: estado de guardado en progreso
   * - onChange: handler unificado de cambios
   * - validateAndSave: función de validación + POST asíncrono
   */
  const { form, errors, loading, onChange, validateAndSave } = useNoClassDayCreate();

  // Catálogos dinámicos para selects
  const fichasCatalog = useCatalog("fichas/select");
  const reasonsCatalog = useCatalog("no_class_reasons");

  /**
   * Handler de guardado con validación y redirección.
   * 
   * @async
   * Secuencia:
   * 1. Ejecuta validación completa del formulario
   * 2. Si válido, realiza guardado en backend
   * 3. Redirige a lista principal al éxito
   */
  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) navigate("/no_class_days");
  };

  /**
   * Sección principal del formulario en layout de 2 columnas.
   * 
   * Izquierda:
   * - Selección de ficha
   * - Fecha del día sin clase
   * 
   * Derecha:
   * - Motivo del día sin clase
   * - Observaciones adicionales
   * 
   * Footer con botones de acción.
   */
  const sections = [
    {
      left: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Ficha"
                name="ficha_id"
                value={form.ficha_id}
                onChange={onChange}
                options={fichasCatalog.options}
                disabled={fichasCatalog.loading || loading}
                error={errors.ficha_id}
                combo
              />

              <InputField
                label="Fecha"
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
                disabled={loading}
                error={errors.date}
              />
            </>
          ),
        },
      ],

      right: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Motivo"
                name="reason_id"
                value={form.reason_id}
                onChange={onChange}
                options={reasonsCatalog.options}
                disabled={reasonsCatalog.loading || loading}
                error={errors.reason_id}
                combo
              />

              <InputField
                label="Observaciones"
                name="observations"
                textarea
                value={form.observations}
                onChange={onChange}
                disabled={loading}
                error={errors.observations}
              />
            </>
          ),
        },
      ],

      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate("/no_class_days")} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Día sin Clase"}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral con información contextual e instrucciones.
   * 
   * Incluye:
   * - Explicación del impacto en cálculos de asistencia
   * - Nota sobre guardado automático
   */
  const side = [
    {
      title: "Información",
      variant: "info",
      content: (
        <p>
          Los días sin clase no se contabilizan como ausencias para los aprendices 
          y afectan el cálculo de asistencias de la ficha.
        </p>
      ),
    },
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="no-class-day-create">
      <UserLayout onBack={() => navigate("/no_class_days")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
