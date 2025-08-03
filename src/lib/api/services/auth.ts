// src/lib/api/services/auth.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { AuthCredentials, AuthResponse, User } from '@/lib/auth/types';

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/users/auth/login/',
      credentials
    );
    
    // Stocker le token
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/users/auth/logout/');
    } catch (error) {
      // Ignorer les erreurs de déconnexion côté serveur
    } finally {
      apiClient.clearToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/auth/me/');
  },

  async register(userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    role?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/users/auth/register/',
      userData
    );
    
    // Stocker le token
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  async changePassword(passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> {
    return apiClient.post('/users/auth/change-password/', passwordData);
  },

  async getUserProfile(): Promise<any> {
    return apiClient.get('/users/profiles/me/');
  },

  async updateProfile(profileData: {
    phone?: string;
    address?: string;
    date_of_birth?: string;
    language?: string;
    timezone?: string;
    email_notifications?: boolean;
    sms_notifications?: boolean;
  }): Promise<any> {
    return apiClient.patch('/users/profiles/me/', profileData);
  },

  async getUserSessions(): Promise<any> {
    return apiClient.get('/users/sessions/');
  },

  async terminateSession(sessionId: number): Promise<{ message: string }> {
    return apiClient.post(`/users/sessions/${sessionId}/terminate/`);
  },

  async getLoginHistory(): Promise<any> {
    return apiClient.get('/users/login-attempts/');
  },

  // Vérification du token
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },
};