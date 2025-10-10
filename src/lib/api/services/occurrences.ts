// src/lib/api/services/occurrences.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  SessionOccurrence,
  PaginatedResponse
} from '@/types/api';

export const occurrenceService = {
  /**
   * Récupérer les occurrences avec filtres
   */
  async getOccurrences(params?: {
    schedule?: number;
    date_from?: string;
    date_to?: string;
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    teacher?: number;
    room?: number;
    course?: number;
  }): Promise<PaginatedResponse<SessionOccurrence>> {
    return apiClient.get<PaginatedResponse<SessionOccurrence>>(
      API_ENDPOINTS.OCCURRENCES,
      params
    );
  },

  /**
   * Récupérer une occurrence par ID
   */
  async getOccurrence(id: number): Promise<SessionOccurrence> {
    return apiClient.get<SessionOccurrence>(`${API_ENDPOINTS.OCCURRENCES}${id}/`);
  },

  /**
   * Vue journalière des occurrences
   */
  async getDailyOccurrences(params: {
    date: string;  // Format YYYY-MM-DD
    schedule?: number;
    teacher?: number;
    room?: number;
  }): Promise<{
    date: string;
    day_of_week: string;
    day_of_week_fr: string;
    occurrences: SessionOccurrence[];
    total: number;
  }> {
    return apiClient.get(`${API_ENDPOINTS.OCCURRENCES}daily/`, params);
  },

  /**
   * Vue hebdomadaire des occurrences
   */
  async getWeeklyOccurrences(params: {
    week_start?: string;  // Format YYYY-MM-DD
    date?: string;  // Alternative : date dans la semaine
    schedule?: number;
    teacher?: number;
    room?: number;
  }): Promise<{
    week_start: string;
    week_end: string;
    occurrences_by_day: {
      monday: SessionOccurrence[];
      tuesday: SessionOccurrence[];
      wednesday: SessionOccurrence[];
      thursday: SessionOccurrence[];
      friday: SessionOccurrence[];
      saturday: SessionOccurrence[];
      sunday: SessionOccurrence[];
    };
    total: number;
  }> {
    // L'API attend 'date' et non 'week_start'
    const apiParams = {
      ...params,
      date: params.week_start || params.date,
    };
    // Supprimer week_start car l'API ne le reconnaît pas
    delete apiParams.week_start;

    return apiClient.get(`${API_ENDPOINTS.OCCURRENCES}weekly/`, apiParams);
  },

  /**
   * Annuler une occurrence
   */
  async cancelOccurrence(id: number, data: {
    reason: string;
    notify_students?: boolean;
    notify_teacher?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    occurrence?: SessionOccurrence;
  }> {
    return apiClient.post(`${API_ENDPOINTS.OCCURRENCES}${id}/cancel/`, data);
  },

  /**
   * Reprogrammer une occurrence
   */
  async rescheduleOccurrence(id: number, data: {
    new_date: string;
    new_start_time: string;
    new_end_time: string;
    new_room?: number;
    new_teacher?: number;
    reason?: string;
    notify_students?: boolean;
    notify_teacher?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    new_occurrence?: SessionOccurrence;
    old_occurrence?: SessionOccurrence;
  }> {
    return apiClient.post(`${API_ENDPOINTS.OCCURRENCES}${id}/reschedule/`, data);
  },

  /**
   * Modifier une occurrence (salle, enseignant, notes)
   */
  async modifyOccurrence(id: number, data: {
    room?: number;
    teacher?: number;
    notes?: string;
  }): Promise<SessionOccurrence> {
    return apiClient.patch(`${API_ENDPOINTS.OCCURRENCES}${id}/modify/`, data);
  },

  /**
   * Vérifier les conflits d'une occurrence
   */
  async checkConflicts(id: number): Promise<{
    conflicts: Array<{
      type: string;
      severity: string;
      description: string;
      conflicting_occurrence_id?: number;
    }>;
    has_conflicts: boolean;
  }> {
    return apiClient.get(`${API_ENDPOINTS.OCCURRENCES}${id}/conflicts/`);
  },

  /**
   * Marquer une occurrence comme complétée
   */
  async markAsCompleted(id: number, notes?: string): Promise<SessionOccurrence> {
    return apiClient.post(`${API_ENDPOINTS.OCCURRENCES}${id}/complete/`, { notes });
  },

  /**
   * Marquer une occurrence comme en cours
   */
  async markAsInProgress(id: number): Promise<SessionOccurrence> {
    return apiClient.post(`${API_ENDPOINTS.OCCURRENCES}${id}/start/`);
  },

  // Fonctions utilitaires
  formatDate: (date: Date) => {
    return date.toISOString().split('T')[0];
  },

  formatTime: (date: Date) => {
    return date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  },

  getWeekStart: (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek.toISOString().split('T')[0];
  },

  /**
   * Calculer la durée d'une occurrence en heures
   */
  calculateDuration: (occurrence: SessionOccurrence): number => {
    const [startH, startM] = occurrence.start_time.split(':').map(Number);
    const [endH, endM] = occurrence.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return (endMinutes - startMinutes) / 60;
  },

  /**
   * Vérifier si une occurrence est modifiée
   */
  isModified: (occurrence: SessionOccurrence): boolean => {
    return occurrence.is_room_modified ||
           occurrence.is_teacher_modified ||
           occurrence.is_time_modified;
  },

  /**
   * Obtenir le statut d'affichage
   */
  getStatusDisplay: (occurrence: SessionOccurrence): string => {
    if (occurrence.is_cancelled) return 'Annulé';
    switch (occurrence.status) {
      case 'scheduled': return 'Planifié';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return occurrence.status;
    }
  },

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor: (occurrence: SessionOccurrence): string => {
    if (occurrence.is_cancelled) return 'error';
    switch (occurrence.status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  },
};
