// Importaciones de React Router y componentes UI
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados para catálogos y creación de programas
import useCatalog from "../../hooks/useCatalog";
import useProgramCreate from "../../hooks/useProgramCreate";

/**
 * Página de creación de nuevo programa de formación.
 * 
 * Formulario completo para registrar programas de capacitación
 * con todos los campos requeridos y catálogos dinámicos.
 * 
 * Campos principales:
 * - Nombre (texto requerido)
 * - Duración en meses (solo dígitos)
 * - Nivel de formación (select)
 * - Área temática (select)
 * - Coordinador (select usuarios rol 2)
 * - Descripción (textarea opcional)
 * 
 * Características:
 * - Layout de 2 columnas balanceado
 * - Catálogos paralelos con estados de carga independientes
 * - Validación por campo con errores visuales
 * - Guardado atómico con redirección
 * - Estados de loading globales por catálogo y formulario
 * - Footer con acciones (Cancelar/Guardar)
 * 
 * Flujo:
 * 1. Carga simultánea de 3 catálogos (niveles, áreas, coordinadores)
 * 2. Usuario completa formulario
 * 3. Validación frontend inmediata
 * 4. Guardado POST + redirección a lista
 * 
 * @component
 * @returns {JSX.Element} Formulario de creación de programa de formación
 */
export default function ProgramsCreatePage() {
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal de gestión de creación de programa.
   * 
   * Retorna:
   * - form: estado completo del formulario
   * - errors: errores de validación por campo
   * - loading: estado de guardado en progreso
   * - onChange: handler unificado de cambios
   * - validateAndSave: validación + POST asíncrono
   */
  const { form, errors, loading, onChange, validateAndSave } = useProgramCreate();

  /**
   * Catálogos dinámicos para campos select.
   * 
   * levelsCatalog: niveles de cualificación
   * areasCatalog: áreas temáticas (con /select)
   * coordinatorsCatalog: usuarios rol 2 (coordinadores), sin opción vacía
   */
  const levelsCatalog = useCatalog("qualification_levels");
  const areasCatalog = useCatalog("areas/select");
  const coordinatorsCatalog = useCatalog("users/role/2", { includeEmpty: false });

  /**
   * Handler de guardado con validación y redirección.
   * 
   * @async
   * Secuencia:
   * 1. Ejecuta validación completa del formulario
   * 2. Si válido (result.ok), realiza guardado
   * 3. Redirige a lista de programas
   */
  const handleSave = async () => {
    const result = await validateAndSave();
    if (result && result.ok) {
      navigate("/training_programs");
    }
  };

  /**
   * Sección principal del formulario en layout de 2 columnas.
   * 
   * Izquierda - Información principal (5 campos):
   * - Nombre del programa
   * - Duración (solo números)
   * - Nivel de formación
   * - Área
   * - Coordinador
   * 
   * Derecha - Información adicional:
   * - Descripción (textarea 4 filas)
   * 
   * Footer con botones de acción.
   */
  const sections = [
    {
      left: [
        {
          title: "Información del Programa",
          content: (
            <>
              <InputField
                label="Nombre del Programa"
                name="name"
                value={form.name}
                disabled={loading}
                onChange={onChange}
                error={errors.name}
              />

              <InputField
                label="Duración (meses)"
                name="duration"
                value={form.duration}
                disabled={loading}
                allow="digits"
                onChange={onChange}
                error={errors.duration}
              />

              <InputField
                label="Nivel de Formación"
                name="qualification_level_id"
                value={form.qualification_level_id}
                onChange={onChange}
                options={levelsCatalog.options}
                disabled={levelsCatalog.loading || loading}
                error={errors.qualification_level_id}
                select
              />

              <InputField
                label="Área"
                name="area_id"
                value={form.area_id}
                onChange={onChange}
                options={areasCatalog.options}
                disabled={areasCatalog.loading || loading}
                error={errors.area_id}
                select
              />

              <InputField
                label="Coordinador"
                name="coordinator_id"
                value={form.coordinator_id}
                onChange={onChange}
                options={coordinatorsCatalog.options}
                disabled={coordinatorsCatalog.loading || loading}
                error={errors.coordinator_id}
                select
              />
            </>
          ),
        },
      ],

      right: [
        {
          title: "Información Adicional",
          content: (
            <InputField
              label="Descripción"
              name="description"
              textarea
              rows={4}
              value={form.description}
              onChange={onChange}
              error={errors.description}
            />
          ),
        },
      ],

      footer: (
        <>
          <Button
            variant="secondary"
            onClick={() => navigate("/training_programs")}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Programa"}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral con nota informativa.
   * 
   * Mensaje estándar sobre guardado automático.
   */
  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="user-create">
      <UserLayout onBack={() => navigate("/training_programs")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
