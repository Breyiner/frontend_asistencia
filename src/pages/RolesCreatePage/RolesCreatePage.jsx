// Importación específica de React Router
import { useNavigate } from "react-router-dom"; // Hook para navegación programática

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con barra superior y back
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid responsive de 2 columnas
import InputField from "../../components/InputField/InputField"; // Campo versátil (text/select/textarea)
import Button from "../../components/Button/Button"; // Botones con variantes y estados

// Hook personalizado para lógica de creación de rol
import useRoleCreate from "../../hooks/useRoleCreate"; // Maneja form, validación y API

/**
 * Página de creación de nuevo rol del sistema.
 * 
 * Formulario simple de 3 campos para crear roles básicos.
 * UX optimizada: redirige al detalle del rol recién creado.
 * 
 * Campos requeridos:
 * 1. name: Nombre legible (ej: "Administrador")
 * 2. code: Código único (ej: "ADMIN", "INSTRUCTOR")
 * 3. description: Descripción opcional (textarea)
 * 
 * Características:
 * - Layout estándar 2 columnas (info básica + adicional)
 * - Validación completa por campo
 * - Helper textual para código
 * - Redirección inteligente post-creación
 * - Nota contextual sobre permisos posteriores
 * 
 * Flujo:
 * 1. Usuario completa formulario básico
 * 2. Validación frontend inmediata
 * 3. POST /roles → obtiene ID creado
 * 4. Navega a /roles/{createdId} (mejor UX que listado)
 * 
 * @component
 * @returns {JSX.Element} Formulario minimalista de creación de rol
 */
export default function RolesCreatePage() {
  // Hook de navegación programática (push/replace)
  const navigate = useNavigate();
  
  /**
   * Hook que centraliza lógica completa de creación:
   * - form: estado controlado del formulario
   * - errors: errores de validación por campo
   * - loading: estado de guardado en progreso
   * - onChange: handler unificado de inputs
   * - validateAndSave: validación + POST asíncrono
   */
  const { form, errors, loading, onChange, validateAndSave } = useRoleCreate();

  /**
   * Handler principal de guardado.
   * 
   * @async
   * Secuencia:
   * 1. Ejecuta validación completa del formulario
   * 2. Si válido (result.ok), realiza POST al backend
   * 3. Extrae ID del rol creado del resultado
   * 4. Navega directamente al detalle (UX superior vs listado)
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida + guarda en backend
    if (result && result.ok) { // Verifica éxito completo
      // UX optimizada: va al detalle del recién creado
      navigate(`/roles/${result.createdId}`);
      // Alternativa comentada: ir a listado general
      // navigate("/roles");
    }
  };

  /**
   * Estructura de secciones del BlocksGrid (una sola sección principal).
   * 
   * Izquierda: Campos obligatorios (nombre + código)
   * Derecha: Campo opcional (descripción textarea)
   * Footer: Botones Cancelar/Guardar
   */
  const sections = [
    {
      left: [
        {
          title: "Información del Rol", // Título de sección izquierda
          content: (
            <>
              {/* Campo nombre: requerido, texto simple */}
              <InputField
                label="Nombre"
                name="name"
                value={form.name}                  // Valor controlado
                disabled={loading}                 // Bloqueado durante guardado
                onChange={onChange}                // Actualiza estado
                error={errors.name}                // Muestra error específico
              />

              {/* Campo código: único, con helper */}
              <InputField
                label="Código"
                name="code"
                value={form.code}
                disabled={loading}                 // Bloqueado durante guardado
                onChange={onChange}
                error={errors.code}
                helper="Ej: ADMIN, COORDINADOR, INSTRUCTOR" // Tooltip/ejemplo
              />
            </>
          ),
        },
      ],

      right: [
        {
          title: "Información adicional", // Título sección derecha
          content: (
            <>
              {/* Textarea descripción: opcional, 4 filas */}
              <InputField
                label="Descripción"
                name="description"
                textarea                       // Renderiza como textarea
                rows={4}                       // Altura fija (4 líneas)
                value={form.description}
                onChange={onChange}
                disabled={loading}
                error={errors.description}
              />
            </>
          ),
        },
      ],

      footer: (
        <>
          {/* Botón secundario: cancela y regresa a listado */}
          <Button
            variant="secondary"
            onClick={() => navigate("/roles")} // Navegación directa al listado
            disabled={loading}                 // Bloqueado durante guardado
          >
            Cancelar
          </Button>

          {/* Botón primario: ejecuta guardado */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Rol"} {/* Texto dinámico */}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral con nota contextual.
   * 
   * Informa que permisos se asignan post-creación.
   */
  const side = [
    {
      title: "Nota",
      variant: "info",                   // Estilo visual informativo
      content: <p>Puedes vincular permisos después de crear el rol.</p>, // Mensaje guía
    },
  ];

  return (
    <div className="role-create"> {/* Contenedor principal con estilos específicos */}
      {/* Layout con botón back y sin acciones adicionales */}
      <UserLayout onBack={() => navigate("/roles")} actions={null}>
        {/* Renderiza grid de bloques con panel lateral */}
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
