import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { login as loginService } from '@services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error al escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const result = await loginService(formData);
      
      if (result.success) {
        login(result.data.user);
        navigate('/pilotos');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-20">
          <h1 className="auth-title">Sistema Rally</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@rally.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="auth-link">
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>

        {/* Credenciales de ejemplo */}
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>Credenciales de prueba:</strong><br />
          Email: admin@rally.com<br />
          Contraseña: admin123
        </div>
      </div>
    </div>
  );
}