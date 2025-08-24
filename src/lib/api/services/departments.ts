// src/lib/api/services/departments.ts
import { apiClient } from '../client';
import type { Department } from '@/types/api';

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  head_of_department?: number;
  is_active?: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  head_of_department?: number;
  is_active?: boolean;
}

export interface DepartmentFilters {
  search?: string;
  is_active?: boolean;
}

export const departmentService = {
  // Récupérer tous les départements
  async getDepartments(filters?: DepartmentFilters): Promise<{ results: Department[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    return apiClient.get(`/courses/departments/?${params.toString()}`);
  },

  // Récupérer un département par ID
  async getDepartment(departmentId: number): Promise<Department> {
    return apiClient.get(`/courses/departments/${departmentId}/`);
  },

  // Créer un nouveau département
  async createDepartment(departmentData: CreateDepartmentData): Promise<Department> {
    return apiClient.post('/courses/departments/', departmentData);
  },

  // Mettre à jour un département
  async updateDepartment(departmentId: number, departmentData: UpdateDepartmentData): Promise<Department> {
    return apiClient.patch(`/courses/departments/${departmentId}/`, departmentData);
  },

  // Supprimer un département
  async deleteDepartment(departmentId: number): Promise<void> {
    return apiClient.delete(`/courses/departments/${departmentId}/`);
  },

  // Activer/Désactiver un département
  async toggleDepartmentStatus(departmentId: number, isActive: boolean): Promise<Department> {
    return apiClient.patch(`/courses/departments/${departmentId}/`, { is_active: isActive });
  },

  // Obtenir les statistiques d'un département
  async getDepartmentStats(departmentId: number): Promise<{
    total_teachers: number;
    active_teachers: number;
    total_courses: number;
    active_courses: number;
    total_students: number;
  }> {
    return apiClient.get(`/courses/departments/${departmentId}/stats/`);
  },

  // Obtenir tous les enseignants d'un département
  async getDepartmentTeachers(departmentId: number): Promise<any[]> {
    return apiClient.get(`/courses/departments/${departmentId}/teachers/`);
  },

  // Obtenir tous les cours d'un département
  async getDepartmentCourses(departmentId: number): Promise<any[]> {
    return apiClient.get(`/courses/departments/${departmentId}/courses/`);
  },

  // Assigner un chef de département
  async assignDepartmentHead(departmentId: number, teacherId: number): Promise<Department> {
    return apiClient.patch(`/courses/departments/${departmentId}/`, { head_of_department: teacherId });
  },

  // Supprimer le chef de département
  async removeDepartmentHead(departmentId: number): Promise<Department> {
    return apiClient.patch(`/courses/departments/${departmentId}/`, { head_of_department: null });
  },

  // Exporter les départements
  async exportDepartments(format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(`/courses/departments/export/?format=${format}`, {
      responseType: 'blob'
    });
    return response as Blob;
  },

  // Obtenir les statistiques globales des départements
  async getDepartmentsGlobalStats(): Promise<{
    total_departments: number;
    active_departments: number;
    total_teachers: number;
    total_courses: number;
    departments_with_head: number;
  }> {
    return apiClient.get('/courses/departments/stats/');
  },
};