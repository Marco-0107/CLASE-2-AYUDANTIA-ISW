import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { getPilotos } from '@services/pilots.service';

export default function Pilotos() {
  const { user } = useAuth();
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGetPilotos = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await getPilotos();
      
      if (result.success) {
        setPilotos(result.data);
        setSuccess(`¡Se encontraron ${result.data.length} pilotos!`);
      } else {
        setError(result.message);
        setPilotos([]);
      }
    } catch (err) {
      setError('Error inesperado al obtener pilotos');
      console.error('Get pilotos error:', err);
      setPilotos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container">
      {/* Header de bienvenida */}
      <div className="card">
        <div className="text-center">
          <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
            Sistema Rally - Pilotos
          </h1>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
            Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong>
          </p>
          <p style={{ color: '#888', marginBottom: '30px' }}>
            Haz clic en el botón para cargar todos los pilotos registrados en el sistema
          </p>
          
          <button 
            onClick={handleGetPilotos}
            className="btn btn-primary"
            disabled={loading}
            style={{ fontSize: '18px', padding: '15px 30px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                Cargando pilotos...
              </span>
            ) : (
              'Mostrar Todos los Pilotos'
            )}
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Éxito:</strong> {success}
        </div>
      )}

      {/* Lista de pilotos */}
      {pilotos.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            Lista de Pilotos ({pilotos.length})
          </h2>
          
          <div className="pilots-grid">
            {pilotos.map((piloto) => (
              <div key={piloto.id_piloto} className="pilot-card">
                <div className="pilot-name">
                  {piloto.nombre} {piloto.apellido}
                </div>
                
                <div className="pilot-info">
                  <strong>ID:</strong> {piloto.id_piloto}
                </div>
                
                <div className="pilot-info">
                  <strong>Edad:</strong> {piloto.edad} años
                </div>
                
                <div className="pilot-info">
                  <strong>Nacionalidad:</strong> {piloto.nacionalidad}
                </div>
                
                <div className="pilot-info">
                  <strong>RUT:</strong> 
                  <span className="pilot-rut">{piloto.rut}</span>
                </div>

                {piloto.licencia && (
                  <div className="pilot-info">
                    <strong>Licencia:</strong> {piloto.licencia}
                  </div>
                )}
                
                {piloto.fecha_registro && (
                  <div className="pilot-info" style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
                    <strong>Registrado:</strong> {formatFecha(piloto.fecha_registro)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && pilotos.length === 0 && !error && (
        <div className="card text-center">
          <h3 style={{ color: '#666', marginBottom: '10px' }}>
            No hay pilotos cargados
          </h3>
          <p style={{ color: '#888' }}>
            Haz clic en el botón "Mostrar Todos los Pilotos" para cargar la lista
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="card" style={{ backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6' }}>
        <h3 style={{ color: '#666', marginBottom: '15px' }}>
          Información del Sistema
        </h3>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li><strong>Propósito:</strong> Sistema educativo para demostrar operaciones CRUD</li>
          <li><strong>API:</strong> Conecta con backend Node.js/Express/PostgreSQL</li>
          <li><strong>Autenticación:</strong> JWT con cookies para seguridad</li>
          <li><strong>Usuario actual:</strong> {user?.email} ({user?.rol})</li>
          <li><strong>Endpoint:</strong> GET /api/pilotos</li>
        </ul>
      </div>
    </div>
  );
}