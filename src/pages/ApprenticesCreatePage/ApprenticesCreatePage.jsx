// Hook de navegación de React Router
import { useNavigate } from "react-router-dom";

// Componentes de layout y UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados para catálogos y creación de aprendices
import useCatalog from "../../hooks/useCatalog";
import useApprenticeCreate from "../../hooks/useApprenticeCreate";

/**
 * Función auxiliar que retorna fecha de ayer en formato YYYY-MM-DD.
 * 
 * Usada como valor máximo para fecha de nacimiento.
 * 
 * @returns {string} Fecha de ayer en formato ISO (YYYY-MM-DD)
 */
function yesterdayYmd() {
  const d = new Date();
  d.setDate(d.getDate() - 1); // Resta un día a la fecha actual
  return d.toISOString().slice(0, 10); // Retorna solo YYYY-MM-DD
}

/**
 * Componente para crear nuevos aprendices.
 * 
 * Gestiona formulario completo con validación, catálogos dinámicos
 * y navegación post-creación.
 * 
 * Características:
 * - Formulario dividido en bloques (personal/sistema)
 * - Catálogos dinámicos (tipos doc, programas, fichas)
 * - Validación en tiempo real
 * - Navegación automática al aprendiz creado
 * - Layout responsive con sidebar informativa
 * 
 * Flujo:
 * 1. Usuario completa formulario
 * 2. Hook valida y envía al backend
 * 3. Si éxito, navega a página del aprendiz creado
 * 
 * @component
 * @returns {JSX.Element} Formulario completo de creación de aprendiz
 */
export default function ApprenticesCreatePage() {
  // Hook para navegación programática
  const navigate = useNavigate();
  
  /**
   * Hook que gestiona estado del formulario, validaciones y envío.
   * 
   * Retorna: form (datos), errors (errores), loading (estado), 
   * onChange (actualizar campo), validateAndSave (validar/enviar)
   */
  const { form, errors, loading, onChange, validateAndSave } = useApprenticeCreate();

  // Catálogo de tipos de documento
  const docTypesCatalog = useCatalog("document_types");
  
  // Catálogo de programas de formación (para select)
  const programsCatalog = useCatalog("training_programs/select");
  
  // Catálogo de fichas filtrado por programa seleccionado
  const fichasCatalog = useCatalog(`fichas/training_program/${form.training_program_id}`);

  /**
   * Maneja el guardado del aprendiz.
   * 
   * Valida formulario, envía al backend y navega si éxito.
   * 
   * @async
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida y envía
    if (result && result.ok && result.createdId) {
      navigate(`/apprentices/${result.createdId}`); // Navega a página del nuevo aprendiz
    }
  };

  /**
   * Array de secciones del BlocksGrid.
   * 
   * Cada sección contiene left/right (columnas) y footer (botones).
   */
  const sections = [
    {
      // Columna izquierda: datos personales
      left: [
        {
          title: "Información Personal",
          content: (
            <>
              {/* Campo nombres */}
              <InputField label="Nombres" name="first_name" value={form.first_name} disabled={loading} onChange={onChange} error={errors.first_name} />
              
              {/* Campo apellidos */}
              <InputField label="Apellidos" name="last_name" value={form.last_name} disabled={loading} onChange={onChange} error={errors.last_name} />

              {/* Select tipo de documento */}
              <InputField
                label="Tipo de Documento"
                name="document_type_id"
                value={form.document_type_id}
                onChange={onChange}
                options={docTypesCatalog.options}
                disabled={docTypesCatalog.loading || loading}
                error={errors.document_type_id}
                select
              />

              {/* Campo número de documento */}
              <InputField label="Documento" name="document_number" value={form.document_number} disabled={loading} onChange={onChange} error={errors.document_number} />

              {/* Campo correo */}
              <InputField label="Correo" name="email" value={form.email} disabled={loading} onChange={onChange} error={errors.email} />

              {/* Campo teléfono */}
              <InputField label="Teléfono" name="telephone_number" value={form.telephone_number} disabled={loading} onChange={onChange} error={errors.telephone_number} />

              {/* Campo fecha nacimiento con max=ayer */}
              <InputField
                label="Fecha de nacimiento"
                name="birth_date"
                type="date"
                value={form.birth_date}
                disabled={loading}
                onChange={onChange}
                error={errors.birth_date}
                max={yesterdayYmd()}
              />
            </>
          ),
        },
      ],

      // Columna derecha: datos del sistema
      right: [
        {
          title: "Información Sistema",
          content: (
            <>
              {/* Select programa de formación */}
              <InputField
                label="Programa de Formación"
                name="training_program_id"
                value={form.training_program_id}
                onChange={onChange}
                options={programsCatalog.options}
                disabled={programsCatalog.loading || loading}
                error={errors.training_program_id}
                select
              />

              {/* Select fichas (depende del programa) */}
              <InputField
                label="Fichas"
                name="ficha_id"
                value={form.ficha_id}
                onChange={onChange}
                options={fichasCatalog.options}
                disabled={fichasCatalog.loading || loading}
                error={errors.ficha_id}
                select
              />
            </>
          ),
        },
      ],

      // Botones de acción en footer
      footer: (
        <>
          {/* Botón cancelar - regresa a lista */}
          <Button variant="secondary" onClick={() => navigate("/apprentices")} disabled={loading}>
            Cancelar
          </Button>

          {/* Botón guardar principal */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Aprendiz"}
          </Button>
        </>
      )
    }
  ];

  /**
   * Array de elementos laterales (sidebar).
   * 
   * Muestra información adicional al formulario.
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
      {/* Layout principal con breadcrumb y grid de bloques */}
      <UserLayout onBack={() => navigate("/apprentices")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
