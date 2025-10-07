import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en sessionStorage al cargar
    const storedUser = sessionStorage.getItem('usuario');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('usuario', JSON.stringify(userData));
    // No navegamos aquí, lo haremos en el componente
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('usuario');
    // No navegamos aquí, lo haremos en el componente
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}