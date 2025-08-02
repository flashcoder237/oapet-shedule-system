// src/lib/api/services/auth.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { AuthCredentials, AuthResponse, User } from '@/lib/auth/types';

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH_TOKEN,
      credentials
    );
    return response;
  },

  async getCurrentUser(): Promise<User> {
    // TODO: Implémenter l'endpoint pour récupérer l'utilisateur actuel
    // En attendant, on retourne un utilisateur par défaut
    return {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
    };
  },

  logout() {
    apiClient.clearToken();
  },
};