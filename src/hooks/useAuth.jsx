import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(
    JSON.parse(localStorage.getItem('auth')) || {
      role: '',
    }
  );

  function setRole(role) {
    setAuth((prevState) => ({ ...prevState, role }));
  }

  async function login(email, password) {
    return await api.post('/oauth/login', {
      email,
      password,
    });
  }

  function logout() {
    setAuth({ role: '' });
    localStorage.removeItem('auth');
  }

  async function verify() {
    await api.get('/oauth/verify');
  }

  async function requireAuth(navigate) {
    try {
      await verify();
    } catch (error) {
      logout();
      navigate('/login', {
        replace: true,
      });
    }
  }

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{ ...auth, setRole, login, logout, verify, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function useAuth() {
  return useContext(AuthContext);
}
