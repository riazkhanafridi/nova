import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeAuthPayload = (payload) => payload?.data ?? payload ?? {};
  const getAccessToken = (payload) => {
    const authPayload = normalizeAuthPayload(payload);
    return authPayload.accessToken || authPayload.token || null;
  };
  const getUserData = (payload) => {
    const authPayload = normalizeAuthPayload(payload);
    return authPayload.user || authPayload.data?.user || authPayload.data || null;
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/profile')
        .then(({ data }) => setUser(getUserData(data)))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const token = getAccessToken(data);
    const userData = getUserData(data);

    if (token) localStorage.setItem('accessToken', token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const token = getAccessToken(data);
    const userData = getUserData(data);

    if (token) localStorage.setItem('accessToken', token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const adminRegister = async (formData) => {
    const { data } = await api.post('/auth/admin/register', formData);
    const token = getAccessToken(data);
    const userData = getUserData(data);

    if (token) {
      localStorage.setItem('accessToken', token);
      setUser(userData);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, adminRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
