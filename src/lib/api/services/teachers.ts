// src/lib/api/services/teachers.ts
import { apiClient } from '../client';

export interface Teacher {
  id: number;
  employee_id: string;
  user: number;
  user_details?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  department: number;
  department_name?: string;
  specialization?: string;
  max_hours_per_week: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherForSelect {
  id: number;
  name: string;
  code: string;
}

export const teacherService = {
  /**
   * Récupère la liste des enseignants
   */
  async getTeachers(params?: { department?: number }): Promise<Teacher[]> {
    const queryParams = new URLSearchParams();
    if (params?.department) {
      queryParams.append('department', params.department.toString());
    }

    const url = `/courses/teachers/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get<any>(url);

    return response.results || response || [];
  },

  /**
   * Récupère un enseignant par son ID
   */
  async getTeacher(id: number): Promise<Teacher> {
    return apiClient.get<Teacher>(`/courses/teachers/${id}/`);
  },

  /**
   * Formate les enseignants pour les dropdowns/selects
   * Filtre automatiquement ceux qui n'ont pas d'utilisateur associé
   */
  formatTeachersForSelect(teachers: Teacher[]): TeacherForSelect[] {
    return teachers
      .filter((teacher) => {
        if (!teacher.user_details) {
          console.warn(`⚠️ Enseignant #${teacher.id} sans user_details - ignoré`);
          return false;
        }
        return true;
      })
      .map((teacher) => {
        const firstName = teacher.user_details?.first_name || '';
        const lastName = teacher.user_details?.last_name || '';
        const username = teacher.user_details?.username || '';

        let displayName = '';
        if (firstName && lastName) {
          displayName = `${firstName} ${lastName}`;
        } else if (firstName || lastName) {
          displayName = firstName || lastName;
        } else if (username) {
          displayName = username;
        } else {
          displayName = `Enseignant #${teacher.id}`;
        }

        return {
          id: teacher.id,
          name: displayName,
          code: teacher.employee_id || `T${teacher.id}`
        };
      });
  },

  /**
   * Récupère et formate les enseignants pour les selects en une seule opération
   */
  async getTeachersForSelect(params?: { department?: number }): Promise<TeacherForSelect[]> {
    const teachers = await this.getTeachers(params);
    return this.formatTeachersForSelect(teachers);
  }
};
