// Componente principal de listado de datos
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos del badge
import "../../components/Badge/Badge.css";

// Utilidades de autorización y badges
import { can, getCurrentRoleCode } from "../../utils/auth";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

/**
 * Componente para listar fichas con filtros contextuales por rol.
 * 
 * Aplica RBAC (Role-Based Access Control):
 * - Instructores: filtros limitados
 * - Otros roles: filtros completos
 * - Oculta botón crear si no tiene permiso
 * 
 * Características:
 * - Filtros dinámicos según rol usuario
 * - Badges visuales para jornada/trimestre/estado
 * - Paginación 10 elementos
 * - Navegación a detalle por fila
 * 
 * Columnas: número, programa, jornada, trimestre, aprendices, estado
 * 
 * @component
 * @returns {JSX.Element} Tabla de fichas con filtros por rol
 */
export default function FichasListPage() {
  // Obtiene código del rol actual del usuario
  const roleCode = getCurrentRoleCode();
  // Determina si usuario es instructor
  const isInstructor = roleCode === "INSTRUCTOR";

  // Verifica permiso para crear fichas
  const canCreate = can("fichas.create");

  /**
   * Configuración de filtros dinámica según rol.
   * 
   * Instructores ven solo filtros básicos.
   * Otros roles ven filtros avanzados (trimestre, estado).
   */
  const filtersConfig = [
    /* Filtro básico: número de ficha */
    {
      name: "ficha_number",
      label: "Número de ficha",
      placeholder: "Número de ficha",
      defaultValue: "",
      withSearchIcon: true,
    },
    /* Filtro básico: nombre programa */
    {
      name: "training_program_name",
      label: "Programa de Formación",
      placeholder: "Programa de Formación",
      defaultValue: "",
    },

    /* Filtros avanzados SOLO para no-instructores */
    ...(!isInstructor
      ? [
          {
            name: "term_name",
            label: "Trimestre Actual",
            placeholder: "Trimestre Actual",
            defaultValue: "",
            advanced: true,
          },
          {
            name: "status_name",
            label: "Estado",
            placeholder: "Estado",
            defaultValue: "",
            advanced: true,
          },
        ]
      : []),
  ];

  return (
    <DataListLayout
      title="Listado de Fichas"
      endpoint="fichas" // Endpoint backend
      createPath={canCreate ? "/fichas/create" : null} // Oculta botón si no tiene permiso
      initialFilters={{ per_page: 10 }} // Paginación inicial
      rowClickPath={(f) => `/fichas/${f.id}`} // Navega a detalle
      filtersConfig={filtersConfig}
      tableColumns={[
        /* Número de ficha */
        { key: "ficha_number", label: "Número" },
        
        /* Nombre programa */
        { key: "training_program_name", label: "Programa" },
        
        /* Jornada con badge marrón */
        {
          key: "shift_name",
          label: "Jornada",
          render: (f) => (
            <BadgesCompact 
              items={[f.shift_name]} 
              maxVisible={1} 
              badgeClassName="badge badge--brown" 
            />
          ),
        },
        
        /* Trimestre actual con badge púrpura */
        {
          key: "current_term_name",
          label: "Trimestre Actual",
          render: (f) => (
            <BadgesCompact 
              items={[f.current_term_name]} 
              maxVisible={1} 
              badgeClassName="badge badge--purple" 
            />
          ),
        },
        
        /* Conteo de aprendices */
        { key: "apprentices_count", label: "Aprendices" },
        
        /* Estado con badge dinámico */
        {
          key: "status_name",
          label: "Estado",
          render: (f) => (
            <BadgesCompact 
              items={[f.status_name]} 
              maxVisible={1} 
              badgeClassName="badge" 
            />
          ),
        },
      ]}
    />
  );
}
