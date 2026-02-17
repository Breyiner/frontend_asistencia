// Importa hooks de React
import { useEffect, useMemo, useState } from "react";

// Importa iconos de Remix Icon
import { RiCloseLine, RiCheckLine, RiSearchLine } from "@remixicon/react";

// Importa componente Button
import Button from "../Button/Button";

// Importa estilos del modal de permisos
import "./PermissionsModal.css";

/**
 * Modal para seleccionar y gestionar permisos de un rol.
 * 
 * Proporciona una interfaz para:
 * - Buscar permisos por nombre, código o grupo
 * - Visualizar permisos agrupados por categoría
 * - Seleccionar/deseleccionar permisos mediante chips clickeables
 * - Contador de permisos seleccionados
 * - Guardar selección de permisos
 * 
 * Características:
 * - Búsqueda en tiempo real (filtra por display_name, name y group)
 * - Agrupación automática de permisos por grupo
 * - Selección visual con chips activos
 * - Prevención de cambios durante guardado
 * - Reseteo automático al abrir/cerrar
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {Function} props.onSave - Callback para guardar (recibe array de IDs seleccionados)
 * @param {string} [props.title="Vincular permisos"] - Título del modal
 * @param {string} [props.subtitle="Selecciona los permisos que tendrá este rol"] - Subtítulo
 * @param {Array<Object>} [props.permissions=[]] - Catálogo completo de permisos disponibles
 * @param {number} props.permissions[].id - ID único del permiso
 * @param {string} props.permissions[].name - Nombre técnico del permiso
 * @param {string} props.permissions[].display_name - Nombre legible del permiso
 * @param {string} props.permissions[].group - Grupo/categoría del permiso
 * @param {Array<number>} [props.initialSelectedIds=[]] - IDs de permisos inicialmente seleccionados
 * @param {boolean} [props.loading=false] - Indica si está guardando
 * 
 * @returns {JSX.Element|null} Modal de selección de permisos o null si está cerrado
 * 
 * @example
 * <PermissionsModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSave={(selectedIds) => handleSavePermissions(selectedIds)}
 *   permissions={allPermissions}
 *   initialSelectedIds={role.permission_ids}
 *   loading={isSaving}
 * />
 */
export default function PermissionsModal({
  isOpen,
  onClose,
  onSave,
  title = "Vincular permisos",
  subtitle = "Selecciona los permisos que tendrá este rol",
  permissions = [], // catálogo global [{id,name,display_name,group}]
  initialSelectedIds = [],
  loading = false,
}) {
  
  // Estado del texto de búsqueda
  const [q, setQ] = useState("");
  
  // Estado de permisos seleccionados (usa Set para búsquedas O(1))
  // Función inicializadora: crea Set a partir de initialSelectedIds
  const [selected, setSelected] = useState(() => new Set(initialSelectedIds));

  // Efecto: resetea el estado cuando el modal se abre o cambian los IDs iniciales
  useEffect(() => {
    if (!isOpen) return; // Solo ejecuta si el modal está abierto
    
    // Resetea la selección con los IDs iniciales
    setSelected(new Set(initialSelectedIds));
    
    // Limpia el campo de búsqueda
    setQ("");
  }, [isOpen, initialSelectedIds]);

  /**
   * Lista filtrada de permisos según la búsqueda.
   * 
   * Filtra por coincidencia parcial (case-insensitive) en:
   * - display_name
   * - name
   * - group
   * 
   * useMemo evita recalcular en cada render si permissions o q no cambian.
   */
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    
    // Si no hay búsqueda, retorna todos los permisos
    if (!text) return permissions;
    
    // Filtra permisos que coincidan en algún campo
    return permissions.filter((p) => {
      const a = (p.display_name || "").toLowerCase();
      const b = (p.name || "").toLowerCase();
      const c = (p.group || "").toLowerCase();
      
      // Retorna true si el texto de búsqueda está en algún campo
      return a.includes(text) || b.includes(text) || c.includes(text);
    });
  }, [permissions, q]);

  /**
   * Permisos agrupados por categoría.
   * 
   * Agrupa los permisos filtrados por su campo "group".
   * Retorna array de tuplas [nombreGrupo, arrayPermisos].
   * 
   * useMemo evita reagrupar en cada render.
   */
  const grouped = useMemo(() => {
    const map = new Map();
    
    // Agrupa cada permiso por su grupo
    for (const p of filtered) {
      const g = p.group || "Otros"; // "Otros" si no tiene grupo
      
      // Crea el array del grupo si no existe
      if (!map.has(g)) map.set(g, []);
      
      // Agrega el permiso al grupo
      map.get(g).push(p);
    }
    
    // Convierte Map a array de [clave, valor]
    return Array.from(map.entries());
  }, [filtered]);

  /**
   * Alterna la selección de un permiso.
   * 
   * Si está seleccionado, lo deselecciona.
   * Si no está seleccionado, lo selecciona.
   * 
   * @param {number} id - ID del permiso a alternar
   */
  const toggle = (id) => {
    if (loading) return; // Previene cambios durante guardado
    
    setSelected((prev) => {
      // Crea nuevo Set a partir del anterior (inmutabilidad)
      const next = new Set(prev);
      
      // Alterna: si existe lo elimina, si no existe lo agrega
      if (next.has(id)) next.delete(id);
      else next.add(id);
      
      return next;
    });
  };

  /**
   * Array de IDs seleccionados (conversión de Set a Array).
   * 
   * Se usa para el contador y para pasar a onSave.
   * useMemo evita reconversión en cada render.
   */
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  /**
   * Cierra el modal si no está guardando.
   */
  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  /**
   * Ejecuta el guardado pasando los IDs seleccionados.
   */
  const handleSave = async () => {
    await onSave(selectedIds);
  };

  // Si no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    // Backdrop del modal con atributos de accesibilidad
    <div className="perm-modal__backdrop" role="dialog" aria-modal="true">
      
      {/* Contenedor principal del modal */}
      <div className="perm-modal">
        
        {/* Header con título y botón de cerrar */}
        <div className="perm-modal__header">
          <div className="perm-modal__title">{title}</div>
          
          <button
            type="button"
            className="perm-modal__close"
            onClick={handleClose}
            disabled={loading}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Subtítulo */}
        <div className="perm-modal__subtitle">{subtitle}</div>

        {/* Barra de búsqueda */}
        <div className="perm-modal__search">
          {/* Icono de búsqueda */}
          <div className="perm-modal__search-icon">
            <RiSearchLine size={18} />
          </div>
          
          {/* Input de búsqueda */}
          <input
            className="perm-modal__search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, código o grupo..."
            disabled={loading}
          />
          
          {/* Contador de seleccionados */}
          <div className="perm-modal__search-count">
            {selectedIds.length} seleccionados
          </div>
        </div>

        {/* Cuerpo del modal con permisos agrupados */}
        <div className="perm-modal__body">
          
          {/* Mensaje si no hay permisos (después de filtrar) */}
          {grouped.length === 0 ? (
            <div className="perm-modal__empty">No hay permisos para mostrar</div>
          ) : (
            // Mapea cada grupo de permisos
            grouped.map(([group, items]) => (
              <div key={group} className="perm-modal__group">
                
                {/* Título del grupo */}
                <div className="perm-modal__group-title">{group}</div>

                {/* Contenedor de chips de permisos */}
                <div className="perm-modal__chips">
                  
                  {/* Mapea cada permiso del grupo */}
                  {items.map((p) => {
                    // Determina si este permiso está seleccionado
                    const active = selected.has(p.id);
                    
                    return (
                      // Chip clickeable para seleccionar/deseleccionar
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggle(p.id)}
                        // Clase dinámica: agrega --active si está seleccionado
                        className={`perm-modal__chip ${active ? "perm-modal__chip--active" : ""}`}
                        disabled={loading}
                        title={p.name} // Tooltip con nombre técnico
                      >
                        {/* Nombre legible del permiso */}
                        <span className="perm-modal__chip-name">
                          {p.display_name || p.name}
                        </span>
                        
                        {/* Código técnico del permiso */}
                        <span className="perm-modal__chip-code">{p.name}</span>

                        {/* Icono de check - solo visible si está seleccionado */}
                        {active && (
                          <span className="perm-modal__chip-check">
                            <RiCheckLine size={18} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con botones de acción */}
        <div className="perm-modal__footer">
          {/* Botón secundario para cerrar */}
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cerrar
          </Button>
          
          {/* Botón principal para guardar
              Muestra "Guardando..." durante el proceso */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar permisos"}
          </Button>
        </div>
      </div>
    </div>
  );
}