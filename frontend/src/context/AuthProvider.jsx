import { useState, useEffect, useCallback } from 'react';
import { api, savedUser } from '../lib/api';
import { AuthContext } from './AuthContext';
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(savedUser);
  const [checking, setChecking] = useState(Boolean(savedUser()?.token));
  const login = useCallback((data) => {
    localStorage.setItem('tripwise_user', JSON.stringify(data));
    setUser(data);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('tripwise_user');
    setUser(null);
  }, []);
  useEffect(() => {
    let active = true;
    const clear = () => { if (active) { setUser(null); localStorage.removeItem('tripwise_user'); } };
    window.addEventListener('tripwise:logout', clear);
    const current = savedUser();
    if (current?.token) api('/auth/me').then(data => {
      if (active) {
        const updated = { ...data, token: current.token };
        setUser(updated);
        localStorage.setItem('tripwise_user', JSON.stringify(updated));
      }
    }).catch(clear).finally(() => { if (active) setChecking(false); });
    return () => { active = false; window.removeEventListener('tripwise:logout', clear); };
  }, []);
  return <AuthContext.Provider value={{ user, login, logout, checking }}>{children}</AuthContext.Provider>;
};
