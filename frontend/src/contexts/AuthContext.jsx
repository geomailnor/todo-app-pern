import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка за запазен токен при зареждане
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      }
      catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken, rememberMe = false) => {
    setUser(userData);
    setToken(userToken);

    if (rememberMe) {
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('rememberMe', 'true');
    } else {
      sessionStorage.setItem('token', userToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('rememberMe', 'false');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('rememberMe');
    toast.success('Успешен изход!');
    navigate('/', { replace: true });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};