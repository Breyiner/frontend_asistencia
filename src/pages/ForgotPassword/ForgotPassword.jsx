import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClient';
import { validarCamposReact } from '../../utils/validators';
import TextField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import "./ForgotPassword.css";

const forgotPasswordSchema = [
  { name: "document_number", type: "text", required: true, maxLength: 20 },
];

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ document_number: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Limpiar mensajes al escribir
    if (error) setError('');
    if (message) setMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const result = validarCamposReact(form, forgotPasswordSchema);
    setFieldErrors(result.errors);
    
    if (!result.ok) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    const response = await api.post('forgot-password', result.data);

    if (!response.ok) {
      setError(response.message || 'Error al enviar solicitud');
      setLoading(false);
      return;
    }

    setMessage(response.message);
    setLoading(false);

    setTimeout(() => navigate('/login'), 2500);
  };

  return (
    <div className="olvide-password__layout">
      <div className="olvide-password__card">
        <h1 className="olvide-password__title">¿Olvidaste tu contraseña?</h1>
        <p className="olvide-password__subtitle">
          Ingresa tu número de documento y te enviaremos un enlace para restablecerla
        </p>

        {error && <div className="olvide-password__error">{error}</div>}
        {message && <div className="olvide-password__success">{message}</div>}

        <form onSubmit={onSubmit} className="olvide-password__form" noValidate>
          <TextField
            label="Número de documento"
            name="document_number"
            type="text"
            value={form.document_number}
            onChange={onChange}
            placeholder="Ej: 12345678"
            required
            maxLength={20}
            error={fieldErrors.document_number}
            disabled={loading}
          />

          <div className="olvide-password__buttons">
            <Button type="submit" disabled={loading || !form.document_number}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              ← Volver al inicio de sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}