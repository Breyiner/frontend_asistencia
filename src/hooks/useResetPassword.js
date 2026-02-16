import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';

export const useResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resetPassword = async (data) => {
    setLoading(true);
    setError('');
    setMessage('');

    const response = await api.post('reset-password', data);

    if (!response.ok) {
      setError(response.message || 'Error al restablecer contraseña');
      setLoading(false);
      return false;
    }

    setMessage(response.message);
    setLoading(false);

    setTimeout(() => navigate('/login'), 2000);
    return true;
  };

  return { resetPassword, loading, message, error };
};