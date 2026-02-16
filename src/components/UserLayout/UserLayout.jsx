import { RiArrowLeftLine } from "@remixicon/react";
import "./UserLayout.css";

/**
 * Componente de layout para páginas de detalle de usuario.
 * 
 * Proporciona una estructura consistente para las páginas que muestran
 * información detallada de un usuario, con barra superior que incluye
 * navegación de retorno y área de acciones.
 * 
 * Características:
 * - Botón "Volver a la lista" con icono
 * - Área de acciones personalizable en la esquina superior derecha
 * - Contenedor children para el contenido principal
 * - Estilos consistentes mediante CSS module
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onBack - Callback ejecutado al hacer clic en "Volver"
 * @param {React.ReactNode} [props.actions] - Elementos JSX de acciones (botones, enlaces)
 * @param {React.ReactNode} props.children - Contenido principal de la página
 * 
 * @returns {JSX.Element} Layout con barra superior y contenido
 * 
 * @example
 * // Layout básico con botón de retorno
 * <UserLayout onBack={() => navigate('/users')}>
 *   <UserProfile user={currentUser} />
 *   <UserActivity userId={userId} />
 * </UserLayout>
 * 
 * @example
 * // Layout con acciones personalizadas
 * <UserLayout
 *   onBack={() => navigate('/instructors')}
 *   actions={
 *     <>
 *       <button onClick={handleEdit}>Editar Perfil</button>
 *       <button onClick={handleDelete} className="btn-danger">
 *         Eliminar Usuario
 *       </button>
 *     </>
 *   }
 * >
 *   <InstructorDetails instructor={instructor} />
 *   <SchedulesList schedules={schedules} />
 * </UserLayout>
 * 
 * @example
 * // Con React Router
 * <UserLayout onBack={() => navigate(-1)}>
 *   <h2>{user.name}</h2>
 *   <p>{user.email}</p>
 * </UserLayout>
 */
export default function UserLayout({ onBack, actions, children }) {
  return (
    <div className="user-layout">
      {/* Barra superior del layout */}
      <div className="user-layout__top">
        {/* Botón de retorno - esquina superior izquierda */}
        {/* type="button": previene comportamiento de submit si está dentro de un form */}
        <button type="button" className="user-layout__back" onClick={onBack}>
          {/* Icono de flecha hacia la izquierda */}
          <RiArrowLeftLine size={18} />
          Volver a la lista
        </button>

        {/* Área de acciones - esquina superior derecha */}
        {/* Renderiza los botones/enlaces que se pasen como prop */}
        <div className="user-layout__actions">
          {actions}
        </div>
      </div>

      {/* Contenido principal de la página */}
      {/* Aquí se renderiza todo lo que se pase entre las etiquetas de UserLayout */}
      {children}
    </div>
  );
}
