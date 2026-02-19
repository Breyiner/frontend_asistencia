// Importación específica para navegación programática
import { useNavigate } from "react-router-dom"; // Navegación push/replace contextual

// Componentes de layout y formulario principales
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con back button superior
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid responsive de 2 columnas
import InputField from "../../components/InputField/InputField"; // Campo versátil (text/select/multi)
import Button from "../../components/Button/Button"; // Botones con loading/variantes

// Hook personalizado para creación completa de usuario
import useCatalog from "../../hooks/useCatalog"; // Catálogos asíncronos múltiples
import useUserCreate from "../../hooks/useUserCreate"; // Lógica form + validación + API

/**
 * Página de creación completa de nuevo usuario del sistema.
 * 
 * Formulario extenso de 9 campos divididos en:
 * **Izquierda (personal - 6 campos)**: Nombres, Apellidos, Documento, Email, Teléfono
 * **Derecha (sistema - 2 campos multi-select)**: Roles, Áreas
 * 
 * Características:
 * - 3 catálogos paralelos (roles/áreas/documentos)
 * - Select múltiple para roles (size=4) y áreas (size=6)
 * - Validación completa por campo con errores inline
 * - UX optimizada: redirige al detalle creado
 * - Sin opción vacía en roles/áreas (includeEmpty: false)
 * 
 * Flujo:
 * 1. Usuario completa datos personales + selecciona roles/áreas
 * 2. Validación frontend exhaustiva
 * 3. POST /users → obtiene ID creado
 * 4. Navega a /users/{createdId} (mejor que listado)
 * 
 * @component
 * @returns {JSX.Element} Formulario extenso de creación de usuario
 */
export default function UsersCreatePage() {
  // Hook de navegación con rutas dinámicas
  const navigate = useNavigate();
  
  /**
   * Hook maestro que maneja TODO el proceso:
   * - form: estado completo (9 campos)
   * - errors: errores reactivos por campo
   * - loading: guardado POST en progreso
   * - onChange: handler unificado
   * - validateAndSave: valida + POST + retorna createdId
   */
  const { form, errors, loading, onChange, validateAndSave } = useUserCreate();

  /**
   * 3 catálogos paralelos con configuración específica.
   * 
   * roles: sin opción vacía (includeEmpty: false)
   * areas: sin opción vacía
   * docTypes: opción vacía permitida (estándar)
   */
  const rolesCatalog = useCatalog("roles/select", { includeEmpty: false });     // Múltiple obligatorio
  const areasCatalog = useCatalog("areas/select", { includeEmpty: false });     // Múltiple opcional
  const docTypesCatalog = useCatalog("document_types/select");                         // Select simple

  /**
   * Handler final de creación con UX optimizada.
   * 
   * @async
   * 1. Valida formulario completo (9 campos)
   * 2. Si OK → POST al backend
   * 3. Extrae createdId del resultado
   * 4. Navega directamente al detalle creado (vs listado)
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida + POST + retorna resultado
    if (result && result.ok && result.createdId) { // Verifica éxito + ID
      navigate(`/users/${result.createdId}`); // UX: detalle inmediato del creado
    }
  };

  /**
   * Estructura de BlocksGrid (una sola sección extensa).
   * 
   * **Izquierda: Información Personal (6 campos básicos)**
   * Nombres/Apellidos/Documento/Email/Teléfono
   * 
   * **Derecha: Información Sistema (2 multi-selects)**
   * Roles (size=4), Áreas (size=6)
   * 
   * Footer: Cancelar/Guardar Usuario
   */
  const sections = [
    {
      left: [
        {
          title: "Información Personal", // Sección datos humanos
          content: (
            <>
              {/* Campo nombres (requerido) */}
              <InputField
                label="Nombres"
                name="first_name"
                value={form.first_name}
                disabled={loading}              // Bloqueado durante POST
                onChange={onChange}
                error={errors.first_name}
              />
              
              {/* Campo apellidos (requerido) */}
              <InputField
                label="Apellidos"
                name="last_name"
                value={form.last_name}
                disabled={loading}
                onChange={onChange}
                error={errors.last_name}
              />
              
              {/* Select tipo documento */}
              <InputField
                label="Tipo de Documento"
                name="document_type_id"
                value={form.document_type_id}
                onChange={onChange}
                options={docTypesCatalog.options}
                disabled={docTypesCatalog.loading || loading} // Loading catálogos
                error={errors.document_type_id}
                combo
              />
              
              {/* Campo número documento */}
              <InputField
                label="Documento"
                name="document_number"
                value={form.document_number}
                disabled={loading}
                onChange={onChange}
                error={errors.document_number}
              />
              
              {/* Campo email único */}
              <InputField
                label="Correo"
                name="email"
                value={form.email}
                disabled={loading}
                onChange={onChange}
                error={errors.email}
              />
              
              {/* Campo teléfono opcional */}
              <InputField
                label="Teléfono"
                name="telephone_number"
                value={form.telephone_number}
                disabled={loading}
                onChange={onChange}
                error={errors.telephone_number}
              />
            </>
          ),
        },
      ],
      right: [
        {
          title: "Información Sistema", // Sección técnica/admin
          content: (
            <>
              {/* Multi-select roles (sin vacío, size compacto) */}
              <InputField
                label="Roles"
                name="roles"
                value={form.roles}              // Array de IDs seleccionados
                onChange={onChange}
                options={rolesCatalog.options}
                multiple                        // Selección múltiple
                size={4}                        // Altura visible (4 opciones)
                disabled={rolesCatalog.loading || loading}
                error={errors.roles}
                combo
              />

              {/* Multi-select áreas (sin vacío, size extendido) */}
              <InputField
                label="Áreas"
                name="areas"
                value={form.areas}              // Array de IDs
                onChange={onChange}
                options={areasCatalog.options}
                multiple
                size={6}                        // Más altura (6 opciones)
                disabled={areasCatalog.loading || loading}
                error={errors.areas}
                combo
              />
            </>
          ),
        },
      ],
      footer: (
        <>
          {/* Cancelar: regresa a listado sin guardar */}
          <Button
            variant="secondary"
            onClick={() => navigate("/users")}    // Listado principal
            disabled={loading}
          >
            Cancelar
          </Button>
          
          {/* Guardar: crea + navega a detalle */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Usuario"} // Texto dinámico
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral simple con nota estándar.
   */
  const side = [
    {
      title: "Nota",
      variant: "info", // Estilo visual informativo
      content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="user-create"> {/* Contenedor con estilos de creación */}
      <UserLayout 
        onBack={() => navigate("/users")}  // Back al listado
        actions={null}                    // Sin actions adicionales
      >
        <BlocksGrid sections={sections} side={side} /> {/* Grid + panel lateral */}
      </UserLayout>
    </div>
  );
}
