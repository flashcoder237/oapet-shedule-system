// src/lib/auth/context.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AuthContextType, AuthCredentials, User } from './types';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

// État initial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user?: User } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user || null,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier le token au démarrage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      // TODO: Vérifier la validité du token et récupérer l'utilisateur
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token } });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiClient.post<{ token: string }>(
        API_ENDPOINTS.AUTH_TOKEN,
        credentials
      );

      const { token } = response;
      apiClient.setToken(token);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token } });
      
      // TODO: Récupérer les informations utilisateur après login
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    try {
      // TODO: Implémenter la récupération des infos utilisateur
      console.log('Refresh user not implemented yet');
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}