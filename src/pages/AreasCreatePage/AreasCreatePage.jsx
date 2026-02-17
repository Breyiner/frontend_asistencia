// Hook de navegación de React Router
import { useNavigate } from "react-router-dom";

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hook personalizado para creación de áreas
import useAreaCreate from "../../hooks/useAreaCreate";

/**
 * Componente para crear nuevas áreas del sistema.
 * 
 * Formulario simple con nombre y descripción.
 * Navega al área recién creada tras guardado exitoso.
 * 
 * Características:
 * - Formulario de 2 campos (nombre, descripción)
 * - Validación gestionada por hook
 * - Layout responsive en dos columnas
 * - Navegación automática post-creación
 * - Estados de carga en botones y campos
 * 
 * Flujo:
 * 1. Usuario completa nombre y descripción
 * 2. Hook valida y envía al backend
 * 3. Si éxito, navega a página del área creada
 * 
 * @component
 * @returns {JSX.Element} Formulario completo de creación de área
 */
export default function AreasCreatePage() {
  // Hook para navegación programática
  const navigate = useNavigate();
  
  /**
   * Hook que gestiona formulario, validaciones y envío al backend.
   * 
   * Retorna: form (datos), errors (errores), loading (estado),
   * onChange (actualizar campo), validateAndSave (validar/enviar)
   */
  const { form, errors, loading, onChange, validateAndSave } = useAreaCreate();

  /**
   * Maneja el guardado del área.
   * 
   * Valida formulario, envía al backend y navega si éxito.
   * 
   * @async
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida y envía
    if (result && result.ok) {
      navigate(`/areas/${result.createdId}`); // Navega a página del área creada
      // Alternativa comentada: navigate("/areas"); // Volver al listado
    }
  };

  /**
   * Array de secciones del BlocksGrid.
   * 
   * Left: nombre | Right: descripción | Footer: botones acción.
   */
  const sections = [
    {
      // Columna izquierda: campo principal (nombre)
      left: [
        {
          title: "Información del Área",
          content: (
            <>
              <InputField
                label="Nombre"
                name="name"
                value={form.name}
                disabled={loading}
                onChange={onChange}
                error={errors.name}
              />
            </>
          ),
        },
      ],

      // Columna derecha: campo secundario (descripción)
      right: [
        {
          title: "Información adicional",
          content: (
            <>
              <InputField
                label="Descripción"
                name="description"
                textarea
                rows={4}
                value={form.description}
                onChange={onChange}
                disabled={loading}
                error={errors.description}
              />
            </>
          ),
        },
      ],

      // Botones de acción en footer
      footer: (
        <>
          {/* Botón cancelar - regresa a listado */}
          <Button
            variant="secondary"
            onClick={() => navigate("/areas")}
            disabled={loading}
          >
            Cancelar
          </Button>

          {/* Botón guardar principal */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Área"}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Array de elementos laterales (sidebar).
   * 
   * Nota informativa sobre edición posterior.
   */
  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Puedes editar la información después de crear el área.</p>,
    },
  ];

  return (
    <div className="area-create">
      {/* Layout principal con breadcrumb */}
      <UserLayout onBack={() => navigate("/areas")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
