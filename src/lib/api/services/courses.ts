// src/lib/api/services/courses.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { teacherService } from './teachers';
import type {
  Department,
  Teacher,
  Course,
  PaginatedResponse,
  DashboardStats
} from '@/types/api';

export const courseService = {
  // Départements
  async getDepartments(params?: { search?: string }): Promise<PaginatedResponse<Department>> {
    return apiClient.get<PaginatedResponse<Department>>(API_ENDPOINTS.DEPARTMENTS, params);
  },

  async getDepartment(id: number): Promise<Department> {
    return apiClient.get<Department>(`${API_ENDPOINTS.DEPARTMENTS}${id}/`);
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return apiClient.post<Department>(API_ENDPOINTS.DEPARTMENTS, data);
  },

  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    return apiClient.patch<Department>(`${API_ENDPOINTS.DEPARTMENTS}${id}/`, data);
  },

  async deleteDepartment(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.DEPARTMENTS}${id}/`);
  },

  async getDepartmentStats(id: number): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.DEPARTMENTS}${id}/stats/`);
  },

  // Enseignants - Délégation vers teacherService
  async getTeachers(params?: {
    department?: number;
    search?: string;
  }): Promise<PaginatedResponse<Teacher>> {
    // Appeler teacherService.getTeachers et formater en PaginatedResponse
    const teachers = await teacherService.getTeachers(params);
    return {
      results: teachers,
      count: teachers.length,
      next: null,
      previous: null
    };
  },

  async getTeacher(id: number): Promise<Teacher> {
    return teacherService.getTeacher(id);
  },

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    return apiClient.post<Teacher>(API_ENDPOINTS.TEACHERS, data);
  },

  async updateTeacher(id: number, data: Partial<Teacher>): Promise<Teacher> {
    return apiClient.patch<Teacher>(`${API_ENDPOINTS.TEACHERS}${id}/`, data);
  },

  async deleteTeacher(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.TEACHERS}${id}/`);
  },

  // Cours
  async getCourses(params?: {
    department?: number;
    level?: string;
    type?: string;
    search?: string;
  }): Promise<PaginatedResponse<Course>> {
    return apiClient.get<PaginatedResponse<Course>>(API_ENDPOINTS.COURSES, params);
  },

  async getCourse(id: number): Promise<Course> {
    return apiClient.get<Course>(`${API_ENDPOINTS.COURSES}${id}/`);
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    return apiClient.post<Course>(API_ENDPOINTS.COURSES, data);
  },

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    return apiClient.patch<Course>(`${API_ENDPOINTS.COURSES}${id}/`, data);
  },

  async deleteCourse(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.COURSES}${id}/`);
  },

  // Statistiques des cours
  async getCoursesStats(): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.COURSES}stats/`);
  },

  // Statistiques des enseignants  
  async getTeachersStats(): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.TEACHERS}stats/`);
  },

  // Inscriptions d'un cours
  async getCourseEnrollments(id: number): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.COURSES}${id}/enrollments/`);
  },

  // Planning d'un enseignant
  async getTeacherSchedule(id: number): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.TEACHERS}${id}/schedule/`);
  },

  // Statistiques générales du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get('/dashboard/stats/');
  },

  // Santé du système
  async getSystemHealth(): Promise<any> {
    return apiClient.get('/dashboard/health/');
  },
};