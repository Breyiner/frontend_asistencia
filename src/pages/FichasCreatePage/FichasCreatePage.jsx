// Hook de navegación de React Router
import { useNavigate } from "react-router-dom";

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados para catálogos y creación de ficha
import useCatalog from "../../hooks/useCatalog";
import useFichaCreate from "../../hooks/useFichaCreate";

/**
 * Componente para crear nuevas fichas de formación.
 * 
 * Formulario completo con todos los datos requeridos
 * para una ficha (número, programa, gestor, jornada, fechas).
 * 
 * Características:
 * - Catálogos dinámicos (programas, gestores, jornadas)
 * - Validación gestionada por hook
 * - Input numérico restringido para ficha_number
 * - Layout responsive en dos columnas
 * - Navegación al listado post-creación
 * 
 * Flujo:
 * 1. Usuario selecciona programa → carga gestor/jornada
 * 2. Completa todos los campos
 * 3. Valida y guarda
 * 4. Regresa a listado de fichas
 * 
 * @component
 * @returns {JSX.Element} Formulario completo de creación de ficha
 */
export default function FichasCreatePage() {
  // Hook para navegación programática
  const navigate = useNavigate();
  
  /**
   * Hook que gestiona formulario, validaciones y envío.
   * 
   * Retorna: form (datos), errors (errores), loading (estado),
   * onChange (actualizar campo), validateAndSave (validar/enviar)
   */
  const { form, errors, loading, onChange, validateAndSave } = useFichaCreate();

  // Catálogos para selects
  const programsCatalog = useCatalog("training_programs/select"); // Programas disponibles
  const gestorscatalog = useCatalog("users/role/GESTOR_FICHAS"); // Gestores (rol 3)
  const shiftsCatalog = useCatalog("shifts"); // Jornadas

  /**
   * Maneja guardado de la ficha.
   * Valida → envía → navega al listado si éxito.
   * 
   * @async
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida y envía
    if (result && result.ok) {
      navigate("/fichas"); // Regresa a listado
    }
  };

  /**
   * Array de secciones del BlocksGrid.
   * Left: info principal | Right: info adicional.
   */
  const sections = [
    {
      // Columna izquierda: Información principal de la ficha
      left: [
        {
          title: "Información de la ficha",
          content: (
            <>
              {/* Número de ficha (solo dígitos) */}
              <InputField
                label="Número de ficha"
                name="ficha_number"
                value={form.ficha_number}
                disabled={loading}
                onChange={onChange}
                allow="digits"
                error={errors.ficha_number}
              />

              {/* Select programa de formación */}
              <InputField
                label="Programa"
                name="training_program_id"
                value={form.training_program_id}
                onChange={onChange}
                options={programsCatalog.options}
                disabled={programsCatalog.loading || loading}
                error={errors.training_program_id}
                combo
              />

              {/* Select gestor (usuario rol 3) */}
              <InputField
                label="Gestor"
                name="gestor_id"
                value={form.gestor_id}
                onChange={onChange}
                options={gestorscatalog.options}
                disabled={gestorscatalog.loading || loading}
                error={errors.gestor_id}
                combo
              />
            </>
          ),
        },
      ],

      // Columna derecha: Información adicional
      right: [
        {
          title: "Información Adicional",
          content: (
            <>
              {/* Select jornada */}
              <InputField
                label="Jornada"
                name="shift_id"
                value={form.shift_id}
                onChange={onChange}
                options={shiftsCatalog.options}
                disabled={shiftsCatalog.loading || loading}
                error={errors.shift_id}
                combo
              />
              
              {/* Fecha de inicio */}
              <InputField
                label="Fecha Inicio"
                name="start_date"
                type="date"
                value={form.start_date}
                disabled={loading}
                onChange={onChange}
                error={errors.start_date}
              />

              {/* Fecha de fin */}
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

      // Botones de acción
      footer: (
        <>
          {/* Cancelar - regresa a listado */}
          <Button
            variant="secondary"
            onClick={() => navigate("/fichas")}
            disabled={loading}
          >
            Cancelar
          </Button>

          {/* Guardar ficha */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Ficha"}
          </Button>
        </>
      )
    }
  ];

  /**
   * Sidebar con nota informativa.
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
      {/* Layout principal */}
      <UserLayout onBack={() => navigate("/fichas")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
