import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { getPilotos, updatePiloto, updatePilotoWithFiles, deletePiloto } from '@services/pilots.service';

export default function Pilotos() {
  const { user } = useAuth();
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPiloto, setEditingPiloto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    nacionalidad: '',
    rut: '',
    licencia: ''
  });
  const [fileData, setFileData] = useState({
    foto: null,
    doc: null
  });

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

  const handleEdit = (piloto) => {
    setEditingPiloto(piloto);
    setFormData({
      nombre: piloto.nombre,
      apellido: piloto.apellido,
      edad: piloto.edad,
      nacionalidad: piloto.nacionalidad,
      rut: piloto.rut,
      licencia: piloto.licencia || ''
    });
    setFileData({ foto: null, doc: null });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingPiloto(null);
    setFormData({
      nombre: '',
      apellido: '',
      edad: '',
      nacionalidad: '',
      rut: '',
      licencia: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFileData(prev => ({ ...prev, [name]: files && files[0] ? files[0] : null }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const useFiles = fileData.foto || fileData.doc;
      if (useFiles) {
        const fd = new FormData();
        fd.append('nombre', formData.nombre);
        fd.append('apellido', formData.apellido);
        fd.append('edad', formData.edad);
        fd.append('nacionalidad', formData.nacionalidad);
        fd.append('rut', formData.rut);
        fd.append('licencia', formData.licencia);
        if (fileData.foto) fd.append('foto', fileData.foto);
        if (fileData.doc) fd.append('doc', fileData.doc);

        const result = await updatePilotoWithFiles(editingPiloto.id_piloto, fd);
        if (result.success) {
          setSuccess('Piloto actualizado exitosamente');
          setPilotos(pilotos.map(p => p.id_piloto === editingPiloto.id_piloto ? result.data : p));
          handleCancelEdit();
        } else {
          setError(result.message);
        }
      } else {
        const result = await updatePiloto(editingPiloto.id_piloto, formData);
        if (result.success) {
          setSuccess('Piloto actualizado exitosamente');
          setPilotos(pilotos.map(p => 
            p.id_piloto === editingPiloto.id_piloto ? { ...p, ...formData } : p
          ));
          handleCancelEdit();
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Error inesperado al actualizar piloto');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este piloto?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await deletePiloto(id);
      
      if (result.success) {
        setSuccess('Piloto eliminado exitosamente');
        setPilotos(pilotos.filter(p => p.id_piloto !== id));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error inesperado al eliminar piloto');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
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

      {editingPiloto && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            Editar Piloto: {editingPiloto.nombre} {editingPiloto.apellido}
          </h2>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Edad</label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nacionalidad</label>
                <input
                  type="text"
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">RUT</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Licencia</label>
                <input
                  type="text"
                  name="licencia"
                  value={formData.licencia}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Foto del Piloto (JPG/PNG)</label>
                <input
                  type="file"
                  name="foto"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="form-control"
                />
                {fileData.foto && <p style={{marginTop:'5px',color:'#28a745'}}>Archivo seleccionado: {fileData.foto.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Documentación (PDF)</label>
                <input
                  type="file"
                  name="doc"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="form-control"
                />
                {fileData.doc && <p style={{marginTop:'5px',color:'#28a745'}}>Archivo seleccionado: {fileData.doc.name}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} disabled={loading}>
                Cancelar
              </button>
            </div>
          </form>
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

                {piloto.foto_url && (
                  <div className="pilot-info" style={{ marginTop: '10px' }}>
                    <strong>Foto:</strong>
                    <div style={{ marginTop: '5px' }}>
                      <img src={piloto.foto_url} alt="Foto del piloto" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
                    </div>
                  </div>
                )}

                {piloto.doc_url && (
                  <div className="pilot-info" style={{ marginTop: '10px' }}>
                    <strong>Documentación:</strong>
                    <a href={piloto.doc_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px', color: '#007bff', textDecoration: 'underline' }}>
                      Ver PDF
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button 
                    onClick={() => handleEdit(piloto)} 
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(piloto.id_piloto)} 
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '10px' }}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
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