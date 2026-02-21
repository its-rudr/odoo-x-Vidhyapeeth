import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAPI, getMeAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('fleetflow_token');
    if (token) {
      getMeAPI()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('fleetflow_token');
          localStorage.removeItem('fleetflow_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginAPI({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('fleetflow_token', token);
    localStorage.setItem('fleetflow_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fleetflow_token');
    localStorage.removeItem('fleetflow_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
