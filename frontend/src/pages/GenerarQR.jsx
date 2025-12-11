import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import QRCode from 'qrcode';

export default function GenerarQR() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    nacionalidad: '',
    rut: '',
    licencia: ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleGenerarQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.nombre || !formData.apellido || !formData.edad || !formData.nacionalidad || !formData.rut) {
      setError('Por favor completa todos los campos obligatorios');
      setLoading(false);
      return;
    }

    if (formData.edad < 18 || formData.edad > 100) {
      setError('La edad debe estar entre 18 y 100 años');
      setLoading(false);
      return;
    }

    try {
      // Crear objeto con los datos del piloto
      const pilotoData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        edad: parseInt(formData.edad),
        nacionalidad: formData.nacionalidad.trim(),
        rut: formData.rut.trim(),
        licencia: formData.licencia.trim() || null
      };

      // Convertir a JSON string para el QR
      const qrData = JSON.stringify(pilotoData);

      // Generar el código QR
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrUrl);
      setError('');
    } catch (err) {
      setError('Error al generar el código QR');
      console.error('Error generando QR:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `piloto-${formData.rut}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLimpiar = () => {
    setFormData({
      nombre: '',
      apellido: '',
      edad: '',
      nacionalidad: '',
      rut: '',
      licencia: ''
    });
    setQrCodeUrl('');
    setError('');
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
          Generar QR para Piloto
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Usuario: <strong>{user?.nombre} {user?.apellido}</strong>
        </p>
        <p style={{ color: '#888', marginBottom: '30px' }}>
          Completa el formulario para generar un código QR con los datos del piloto
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Formulario */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Datos del Piloto</h2>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleGenerarQR}>
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apellido">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                className="form-control"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edad">
                Edad *
              </label>
              <input
                type="number"
                id="edad"
                name="edad"
                className="form-control"
                value={formData.edad}
                onChange={handleChange}
                placeholder="25"
                min="18"
                max="100"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nacionalidad">
                Nacionalidad *
              </label>
              <input
                type="text"
                id="nacionalidad"
                name="nacionalidad"
                className="form-control"
                value={formData.nacionalidad}
                onChange={handleChange}
                placeholder="Chilena"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rut">
                RUT *
              </label>
              <input
                type="text"
                id="rut"
                name="rut"
                className="form-control"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12.345.678-9"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="licencia">
                Licencia (Opcional)
              </label>
              <input
                type="text"
                id="licencia"
                name="licencia"
                className="form-control"
                value={formData.licencia}
                onChange={handleChange}
                placeholder="Tipo A1"
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Generando...' : 'Generar QR'}
              </button>

              <button 
                type="button" 
                className="btn"
                onClick={handleLimpiar}
                disabled={loading}
                style={{ 
                  flex: 1,
                  backgroundColor: '#6c757d',
                  color: 'white'
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Código QR */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Código QR</h2>

          {!qrCodeUrl && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <p style={{ color: '#888', fontSize: '16px' }}>
                El código QR aparecerá aquí una vez que completes el formulario
              </p>
            </div>
          )}

          {qrCodeUrl && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ 
                    maxWidth: '100%',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    padding: '10px'
                  }}
                />
              </div>

              <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                ✓ Código QR generado exitosamente
              </div>

              <button 
                onClick={handleDescargarQR}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Descargar QR
              </button>              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#e7f3ff',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'left'
              }}>
                <strong>Datos codificados:</strong>
                <pre style={{ 
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información */}
      <div className="card" style={{ backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6' }}>
        <h3 style={{ color: '#666', marginBottom: '15px' }}>
          ℹ️ Instrucciones
        </h3>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li>Completa el formulario con los datos del piloto</li>
          <li>Haz clic en "Generar QR" para crear el código</li>
          <li>Descarga el código QR si lo necesitas</li>
          <li>Ve a la sección "Escanear QR" para leer el código y crear el piloto en la base de datos</li>
          <li>Los campos marcados con * son obligatorios</li>
        </ul>
      </div>
    </div>
  );
}
