import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';

/**
 * Hook simple para el proceso de RESETEO DE CONTRASEÑA.
 * 
 * Uso típico:
 * - Página /reset-password/:token o similar
 * - Recibe { password, password_confirmation } o solo { email } según flujo
 * - Envía POST a /reset-password
 * - Muestra mensaje de éxito y redirige a login tras 2 segundos
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  // Indicador de operación en curso
  const [loading, setLoading] = useState(false);

  // Mensaje de éxito (para mostrar "Contraseña actualizada, redirigiendo...")
  const [message, setMessage] = useState('');

  // Mensaje de error específico
  const [error, setError] = useState('');

  /**
   * Ejecuta el reseteo de contraseña.
   * @param {Object} data - Payload esperado por el backend (token, email, password, etc.)
   * @returns {Promise<boolean>} - true si éxito
   */
  const resetPassword = async (data) => {
    setLoading(true);
    setError('');     // Limpieza de errores previos
    setMessage('');   // Limpieza de mensajes previos

    try {
      // Envío al endpoint (normalmente incluye token en URL o en body)
      const response = await api.post('reset-password', data);

      if (!response.ok) {
        // Error controlado (token inválido, password débil, etc.)
        const errMsg = response.message || 'Error al restablecer contraseña';
        setError(errMsg);
        setLoading(false);
        return false;
      }

      // Éxito
      setMessage(response.message || 'Contraseña restablecida correctamente');

      // Redirección automática con delay para que el usuario lea el mensaje
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return true;

    } catch (err) {
      // Errores de red / inesperados
      setError(err.message || 'Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPassword,   // Función principal
    loading,         // Estado de carga
    message,         // Mensaje éxito
    error            // Mensaje error
  };
};