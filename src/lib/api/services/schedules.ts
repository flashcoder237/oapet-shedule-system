// src/lib/api/services/schedules.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  Schedule, 
  ScheduleSession,
  Conflict,
  AcademicPeriod,
  TimeSlot,
  PaginatedResponse 
} from '@/types/api';

export const scheduleService = {
  // Périodes académiques
  async getAcademicPeriods(): Promise<PaginatedResponse<AcademicPeriod>> {
    return apiClient.get<PaginatedResponse<AcademicPeriod>>(API_ENDPOINTS.ACADEMIC_PERIODS);
  },

  async setCurrentPeriod(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.ACADEMIC_PERIODS}${id}/set_current/`);
  },

  // Créneaux horaires
  async getTimeSlots(params?: { day?: string }): Promise<PaginatedResponse<TimeSlot>> {
    return apiClient.get<PaginatedResponse<TimeSlot>>(API_ENDPOINTS.TIME_SLOTS, params);
  },

  // Emplois du temps
  async getSchedules(params?: {
    academic_period?: number;
    curriculum?: number;
    published_only?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Schedule>> {
    return apiClient.get<PaginatedResponse<Schedule>>(API_ENDPOINTS.SCHEDULES, params);
  },

  async getSchedule(id: number): Promise<Schedule> {
    return apiClient.get<Schedule>(`${API_ENDPOINTS.SCHEDULES}${id}/`);
  },

  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    return apiClient.post<Schedule>(API_ENDPOINTS.SCHEDULES, data);
  },

  async updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
    return apiClient.patch<Schedule>(`${API_ENDPOINTS.SCHEDULES}${id}/`, data);
  },

  async deleteSchedule(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.SCHEDULES}${id}/`);
  },

  async publishSchedule(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.SCHEDULES}${id}/publish/`);
  },

  async unpublishSchedule(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.SCHEDULES}${id}/unpublish/`);
  },

  async getWeeklyView(id: number): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.SCHEDULES}${id}/weekly_view/`);
  },

  async detectConflicts(id: number): Promise<{
    conflicts_detected: number;
    conflicts: Conflict[];
  }> {
    return apiClient.post(`${API_ENDPOINTS.SCHEDULES}${id}/detect_conflicts/`);
  },

  // Sessions d'emploi du temps
  async getScheduleSessions(params?: {
    schedule?: number;
    course?: number;
    teacher?: number;
    room?: number;
  }): Promise<PaginatedResponse<ScheduleSession>> {
    return apiClient.get<PaginatedResponse<ScheduleSession>>(API_ENDPOINTS.SCHEDULE_SESSIONS, params);
  },

  async createScheduleSession(data: Partial<ScheduleSession>): Promise<ScheduleSession> {
    return apiClient.post<ScheduleSession>(API_ENDPOINTS.SCHEDULE_SESSIONS, data);
  },

  async updateScheduleSession(id: number, data: Partial<ScheduleSession>): Promise<ScheduleSession> {
    return apiClient.patch<ScheduleSession>(`${API_ENDPOINTS.SCHEDULE_SESSIONS}${id}/`, data);
  },

  async deleteScheduleSession(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.SCHEDULE_SESSIONS}${id}/`);
  },

  // Conflits
  async getConflicts(params?: {
    schedule?: number;
    severity?: string;
    unresolved_only?: boolean;
  }): Promise<PaginatedResponse<Conflict>> {
    return apiClient.get<PaginatedResponse<Conflict>>(API_ENDPOINTS.CONFLICTS, params);
  },

  async resolveConflict(id: number, resolutionNotes?: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.CONFLICTS}${id}/resolve/`, {
      resolution_notes: resolutionNotes,
    });
  },

  // Statistiques des emplois du temps
  async getSchedulesStats(): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.SCHEDULES}stats/`);
  },

  // Templates d'emploi du temps
  async getScheduleTemplates(params?: {
    curriculum?: number;
    level?: string;
  }): Promise<any> {
    return apiClient.get('/schedule_templates/', params);
  },

  // Optimisation
  async getOptimizations(params?: { schedule?: number }): Promise<any> {
    return apiClient.get('/schedule_optimizations/', params);
  },

  // Export
  async exportSchedule(id: number, format: string, params?: any): Promise<any> {
    return apiClient.post(`${API_ENDPOINTS.SCHEDULES}${id}/export/`, {
      format,
      ...params
    });
  },
};