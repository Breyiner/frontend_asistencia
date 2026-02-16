import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClient';
import Button from '../../components/Button/Button';
import './VerifyEmail.css';

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Enlace de verificación inválido');
      return;
    }

    const verificarEmail = async () => {
      const response = await api.post('verify-email', { token, email });

      if (response.ok) {
        setStatus('success');
        setMessage(response.message || 'Email verificado exitosamente');
      } else {
        setStatus('error');
        setMessage(response.message || 'Error al verificar el email');
      }
    };

    verificarEmail();
  }, [token, email]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verificar-email">
      <div className="verificar-email__container">
        <div className="verificar-email__card">
          <div className="verificar-email__icon">
            {status === 'loading' && (
              <div className="verificar-email__spinner" />
            )}
            {status === 'success' && (
              <div className="verificar-email__check">✓</div>
            )}
            {status === 'error' && (
              <div className="verificar-email__check">✕</div>
            )}
          </div>

          <h1 className={`verificar-email__title ${status === 'loading' ? 'verificar-email__title--loading' : ''}`}>
            {status === 'loading' && 'Verificando tu correo'}
            {status === 'success' && '¡Email verificado!'}
            {status === 'error' && 'Error de verificación'}
          </h1>

          <p className="verificar-email__message">
            {status === 'loading' && 'Por favor espera mientras verificamos tu cuenta...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          {status !== 'loading' && (
            <Button onClick={handleGoToLogin} variant='fullWidth-primary'>
              Ir al inicio de sesión
            </Button>
          )}

          {status === 'loading' && (
            <p className="verificar-email__footer">Esto puede tomar unos segundos</p>
          )}
        </div>
      </div>
    </div>
  );
}