import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClient';
import Button from '../../components/Button/Button';
import { RiCheckboxCircleLine } from "@remixicon/react";
import "./ResendVerification.css";

export default function ResendVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verificando correo...');

  useEffect(() => {
    const email = searchParams.get('email');
    
    if (!email) {
      setMessage('No se encontró el correo electrónico en el enlace.');
      setLoading(false);
      return;
    }

    api.post('email/verification-notification', { email })
      .then((response) => {
        setMessage(
          response.message || 
          'Si el correo existe, se reenvió el enlace de verificación. Revisa tu bandeja (incluyendo spam).'
        );
      })
      .catch(() => {
        setMessage('Si el correo existe, se reenvió el enlace de verificación.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const handleGoLogin = () => {
    navigate('/login');
  };

  return (
    <div className="reenviar-verificacion">
      <div className="reenviar-verificacion__container">
        <div className="reenviar-verificacion__card">
          <div className="reenviar-verificacion__icon">
            {loading ? (
              <div className="reenviar-verificacion__spinner" />
            ) : (
              <span className="reenviar-verificacion__check">
                <RiCheckboxCircleLine size={40} />
              </span>
            )}
          </div>

          <h2 className={`reenviar-verificacion__title ${loading ? 'reenviar-verificacion__title--loading' : ''}`}>
            {loading ? 'Enviando correo' : '¡Listo!'}
          </h2>

          <p className={`reenviar-verificacion__message ${loading ? 'reenviar-verificacion__message--subtitle' : ''}`}>
            {loading 
              ? 'Esto puede tardar unos segundos...' 
              : message
            }
          </p>

          {!loading && (
            <Button onClick={handleGoLogin} variant='fullWidth-primary'>
              Ir al login
            </Button>
          )}

          {!loading && (
            <p className="reenviar-verificacion__footer">
              ¿No llega el correo? Revisa tu carpeta de spam o contacta al administrador.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}