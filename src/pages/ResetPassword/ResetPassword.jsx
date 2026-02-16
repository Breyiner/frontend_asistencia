import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validarCamposReact } from '../../utils/validators';
import { api } from '../../services/apiClient';
import TextField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import "./ResetPassword.css";

const resetPasswordSchema = [
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
  { name: "password_confirmation", type: "password", required: true, minLength: 8, maxLength: 60 },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    password: '',
    password_confirmation: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido. Solicita uno nuevo.');
      setTimeout(() => navigate('/olvide-password'), 2000);
    }
  }, [token, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (error) setError('');
    if (message) setMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Las contraseñas no coinciden' });
      return;
    }
    
    const result = validarCamposReact(form, resetPasswordSchema);
    setFieldErrors(result.errors);
    
    if (!result.ok) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    const response = await api.post('reset-password', {
      token,
      email,
      ...result.data
    });

    if (!response.ok) {
      setError(response.message || 'Error al restablecer contraseña');
      setLoading(false);
      return;
    }

    setMessage(response.message);
    setLoading(false);
    setTimeout(() => navigate('/login'), 2000);
  };

  if (!token) {
    return (
      <div className="reset-password__layout">
        <div className="reset-password__card">
          <div className="reset-password__loading">Redirigiendo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password__layout">
      <div className="reset-password__card">
        <h1 className="reset-password__title">Nueva Contraseña</h1>
        <p className="reset-password__subtitle">
          Tu contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.
        </p>

        {error && <div className="reset-password__error">{error}</div>}
        {message && <div className="reset-password__success">{message}</div>}

        <form onSubmit={onSubmit} className="reset-password__form" noValidate>
          <TextField
            label="Nueva contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="********"
            required
            minLength={8}
            maxLength={60}
            autoComplete="new-password"
            error={fieldErrors.password}
            disabled={loading}
          />

          <TextField
            label="Confirmar nueva contraseña"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={onChange}
            placeholder="********"
            required
            minLength={8}
            maxLength={60}
            autoComplete="new-password"
            error={fieldErrors.password_confirmation}
            disabled={loading}
          />

          <div className="reset-password__buttons">
            <Button type="submit" disabled={loading}>
              {loading ? 'Restableciendo...' : 'Cambiar Contraseña'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/olvide-password')}
              disabled={loading}
            >
              ← Solicitar nuevo enlace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}