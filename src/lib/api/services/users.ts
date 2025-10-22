// src/lib/api/services/users.ts
import { apiClient } from '../client';
import type { Teacher } from '@/types/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active: boolean;
  department_id?: number;
  department_name?: string;
  employee_id?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role?: string;
  department_id?: number;
  employee_id?: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  department_id?: number;
  employee_id?: string;
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}

export const userService = {
  // Récupérer tous les utilisateurs
  async getUsers(filters?: UserFilters): Promise<{ results: User[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    return apiClient.get(`/users/users/?${params.toString()}`);
  },

  // Récupérer un utilisateur par ID
  async getUser(userId: number): Promise<User> {
    return apiClient.get(`/users/users/${userId}/`);
  },

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<User> {
    return apiClient.post('/users/users/', userData);
  },

  // Mettre à jour un utilisateur
  async updateUser(userId: number, userData: UpdateUserData): Promise<User> {
    return apiClient.patch(`/users/users/${userId}/`, userData);
  },

  // Supprimer un utilisateur
  async deleteUser(userId: number): Promise<void> {
    return apiClient.delete(`/users/users/${userId}/`);
  },

  // Activer/Désactiver un utilisateur
  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    return apiClient.patch(`/users/users/${userId}/`, { is_active: isActive });
  },

  // Réinitialiser le mot de passe d'un utilisateur
  async resetUserPassword(userId: number): Promise<{ message: string; temporary_password: string }> {
    return apiClient.post(`/users/users/${userId}/reset-password/`);
  },

  // Assigner un rôle à un utilisateur
  async assignRole(userId: number, role: string): Promise<User> {
    return apiClient.patch(`/users/users/${userId}/`, { role });
  },

  // Obtenir les statistiques des utilisateurs
  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    by_role: Record<string, number>;
    by_department: Record<string, number>;
  }> {
    return apiClient.get('/users/users/stats/');
  },

  // Obtenir l'historique des actions d'un utilisateur
  async getUserHistory(userId: number): Promise<any[]> {
    return apiClient.get(`/users/users/${userId}/history/`);
  },

  // Exporter les utilisateurs
  async exportUsers(format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(`/users/users/export/?format=${format}`, {
      responseType: 'blob'
    });
    return response as Blob;
  },

  // Importer des utilisateurs en masse
  async bulkImportUsers(file: File): Promise<{
    success: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/users/users/bulk-import/', formData);
  },

  // Envoyer une invitation par email
  async sendInvitation(email: string, role: string, department_id?: number): Promise<{ message: string }> {
    return apiClient.post('/users/users/invite/', { email, role, department_id });
  },

  // Obtenir les permissions d'un utilisateur
  async getUserPermissions(userId: number): Promise<string[]> {
    return apiClient.get(`/users/users/${userId}/permissions/`);
  },

  // Mettre à jour les permissions d'un utilisateur
  async updateUserPermissions(userId: number, permissions: string[]): Promise<{ message: string }> {
    return apiClient.post(`/users/users/${userId}/permissions/`, { permissions });
  },
};