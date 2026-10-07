// AuthContext.jsx — global login state using the Context API + hooks.
// Any component can call useAuth() to get { user, login, register, logout }.
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check a saved token

  // useEffect with [] runs ONCE when the app loads:
  // if a token was saved earlier, ask the backend who it belongs to.
  useEffect(() => {
    const token = localStorage.getItem('fb_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('fb_token')) // token expired/invalid
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('fb_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => saveSession((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => saveSession((await api.post('/auth/register', form)).data);
  const logout = () => {
    localStorage.removeItem('fb_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

// Custom hook
export const useAuth = () => useContext(AuthContext);
