import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { LogOut, User, Home } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="header" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          Sistema Rally
        </h1>
      </div>
      
      <nav className="nav">
        <Link to="/pilotos" className="nav-link">
          <Home size={18} style={{ marginRight: '8px' }} />
          Pilotos
        </Link>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'white', 
          marginLeft: '20px' 
        }}>
          <User size={18} style={{ marginRight: '8px' }} />
          <span style={{ marginRight: '15px' }}>
            {user?.nombre} {user?.apellido}
          </span>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <LogOut size={16} style={{ marginRight: '6px' }} />
            Salir
          </button>
        </div>
      </nav>
    </header>
  );
}