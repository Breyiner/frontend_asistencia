// Hook de navegación de React Router
import { useNavigate } from "react-router-dom";

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button     from "../../components/Button/Button";

// Hook personalizado para creación de tipos de documento
import useDocumentTypeCreate from "../../hooks/useDocumentTypeCreate";

/**
 * Página para crear nuevos tipos de documento del sistema.
 *
 * Formulario simple con nombre y sigla.
 * Navega al tipo de documento recién creado tras guardado exitoso.
 *
 * Características:
 * - Formulario de 2 campos (nombre, sigla)
 * - Validación gestionada por hook
 * - Layout responsive en dos columnas
 * - Navegación automática post-creación
 * - Estados de carga en botones y campos
 *
 * Flujo:
 * 1. Usuario completa nombre y sigla
 * 2. Hook valida y envía al backend
 * 3. Si éxito, navega a página del tipo de documento creado
 *
 * @component
 * @returns {JSX.Element} Formulario completo de creación de tipo de documento
 */
export default function DocumentTypeCreatePage() {
  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * Hook que gestiona formulario, validaciones y envío al backend.
   *
   * Retorna: form (datos), errors (errores), loading (estado),
   * onChange (actualizar campo), validateAndSave (validar/enviar)
   */
  const { form, errors, loading, onChange, validateAndSave } = useDocumentTypeCreate();

  /**
   * Maneja el guardado del tipo de documento.
   *
   * Valida formulario, envía al backend y navega si éxito.
   *
   * @async
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida y envía al backend
    if (result && result.ok) {
      navigate(`/document_types/${result.createdId}`); // Navega a la página del tipo creado
    }
  };

  /**
   * Array de secciones del BlocksGrid.
   *
   * Left: nombre | Right: sigla | Footer: botones de acción.
   */
  const sections = [
    {
      // Columna izquierda: campo principal (nombre)
      left: [
        {
          title: "Información del Tipo de Documento",
          content: (
            <InputField
              label="Nombre *"
              name="name"
              value={form.name}
              onChange={onChange}
              error={errors.name}
              disabled={loading}
              required
            />
          ),
        },
      ],

      // Columna derecha: campo de sigla
      right: [
        {
          title: "Sigla",
          content: (
            <InputField
              label="Sigla *"
              name="acronym"
              value={form.acronym}
              onChange={onChange}
              error={errors.acronym}
              disabled={loading}
              required
            />
          ),
        },
      ],

      // Botones de acción en footer
      footer: (
        <>
          {/* Botón cancelar - regresa al listado */}
          <Button
            variant="secondary"
            onClick={() => navigate("/document_types")}
            disabled={loading}
          >
            Cancelar
          </Button>

          {/* Botón guardar principal */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Tipo de Documento"}
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
      content: <p>Puedes editar la información después de crear el tipo de documento.</p>,
    },
  ];

  return (
    <div className="document-type-create">
      {/* Layout principal con navegación de regreso */}
      <UserLayout onBack={() => navigate("/document_types")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}