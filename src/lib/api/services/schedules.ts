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
    date?: string; // Format YYYY-MM-DD pour filtrer par date
    week_start?: string; // Début de semaine pour vue hebdomadaire
  }): Promise<PaginatedResponse<Schedule>> {
    return apiClient.get<PaginatedResponse<Schedule>>(API_ENDPOINTS.SCHEDULES, params);
  },

  // Fonction spécifique pour récupérer les sessions d'aujourd'hui
  async getTodayScheduleSessions(): Promise<PaginatedResponse<ScheduleSession>> {
    const today = new Date().toISOString().split('T')[0];
    console.log('Date recherchée:', today);
    return this.getScheduleSessions({ date: today });
  },

  // Fonction spécifique pour récupérer les emplois du temps d'aujourd'hui
  async getTodaySchedules(): Promise<PaginatedResponse<Schedule>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getSchedules({ date: today, published_only: true });
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

  /**
   * Récupère le schedule actif pour un curriculum donné
   */
  async getScheduleByCurriculum(curriculumCode: string): Promise<Schedule> {
    return apiClient.get<Schedule>(`${API_ENDPOINTS.SCHEDULES}by_curriculum/`, {
      curriculum: curriculumCode
    });
  },

  async getWeeklyView(id: number, params?: { week_start?: string }): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.SCHEDULES}${id}/weekly_view/`, params);
  },

  // Vue hebdomadaire pour la semaine courante
  async getCurrentWeekView(id: number): Promise<any> {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const week_start = startOfWeek.toISOString().split('T')[0];
    return this.getWeeklyView(id, { week_start });
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
    date?: string;
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

  // Fonctions utilitaires
  formatDate: (date: Date) => {
    return date.toISOString().split('T')[0];
  },

  getWeekStart: (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek.toISOString().split('T')[0];
  },

  // Sessions hebdomadaires
  async getWeeklySessions(params: { week_start: string; curriculum?: string }): Promise<{
    sessions_by_day: { [key: string]: ScheduleSession[] };
    results: ScheduleSession[];
  }> {
    // Charger toutes les sessions disponibles
    const sessions = await this.getScheduleSessions();
    
    let filteredResults = sessions.results || [];
    
    // Filtrer par curriculum si spécifié
    if (params.curriculum && sessions.results) {
      try {
        const schedulesResponse = await this.getSchedules();
        const schedulesForCurriculum = schedulesResponse.results?.filter((schedule: any) => {
          return schedule.curriculum_details?.code === params.curriculum;
        }) || [];
        
        const scheduleIds = schedulesForCurriculum.map((s: any) => s.id);
        
        filteredResults = sessions.results.filter((session: any) => {
          return scheduleIds.includes(session.schedule);
        });
        
        console.log(`Weekly view: Filtered ${sessions.results.length} sessions to ${filteredResults.length} for curriculum ${params.curriculum}`);
      } catch (error) {
        console.error('Error filtering weekly sessions by curriculum:', error);
      }
    }
    
    // Organiser les sessions par jour de la semaine
    const sessionsByDay: { [key: string]: ScheduleSession[] } = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    // Mapping des jours pour organiser les sessions
    const dayMapping: { [key: string]: string } = {
      'monday': 'monday', 'lundi': 'monday', 'mon': 'monday', 'lun': 'monday',
      'tuesday': 'tuesday', 'mardi': 'tuesday', 'tue': 'tuesday', 'mar': 'tuesday',
      'wednesday': 'wednesday', 'mercredi': 'wednesday', 'wed': 'wednesday', 'mer': 'wednesday',
      'thursday': 'thursday', 'jeudi': 'thursday', 'thu': 'thursday', 'jeu': 'thursday',
      'friday': 'friday', 'vendredi': 'friday', 'fri': 'friday', 'ven': 'friday',
      'saturday': 'saturday', 'samedi': 'saturday', 'sat': 'saturday', 'sam': 'saturday',
      'sunday': 'sunday', 'dimanche': 'sunday', 'sun': 'sunday', 'dim': 'sunday'
    };

    // Organiser les sessions filtrées par jour
    filteredResults.forEach((session: ScheduleSession) => {
      const sessionDay = session.time_slot_details?.day_of_week?.toLowerCase();
      const mappedDay = sessionDay ? dayMapping[sessionDay] : null;
      
      if (mappedDay && sessionsByDay[mappedDay]) {
        sessionsByDay[mappedDay].push(session);
      } else {
        // Si le jour n'est pas reconnu, essayer de le dériver de la date
        const sessionDate = session.specific_date;
        if (sessionDate) {
          const date = new Date(sessionDate);
          const dayIndex = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const derivedDay = dayNames[dayIndex];
          if (sessionsByDay[derivedDay]) {
            sessionsByDay[derivedDay].push(session);
          }
        }
      }
    });
    
    return {
      sessions_by_day: sessionsByDay,
      results: filteredResults
    };
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

  // API methods for fetching sessions by period
  async getWeeklySessionsFromAPI(params: {
    week_start: string; // Format YYYY-MM-DD
    curriculum?: string;
    teacher?: number;
    room?: number;
  }): Promise<{
    week_start: string;
    week_end: string;
    sessions_by_day: {
      monday: ScheduleSession[];
      tuesday: ScheduleSession[];
      wednesday: ScheduleSession[];
      thursday: ScheduleSession[];
      friday: ScheduleSession[];
      saturday: ScheduleSession[];
      sunday: ScheduleSession[];
    };
    total_sessions: number;
  }> {
    return apiClient.get(`${API_ENDPOINTS.SCHEDULES}weekly_sessions/`, params);
  },

  async getDailySessionsFromAPI(params: {
    date: string; // Format YYYY-MM-DD
    curriculum?: string;
    teacher?: number;
    room?: number;
  }): Promise<{
    date: string;
    day_of_week: string;
    day_of_week_fr: string;
    sessions: ScheduleSession[];
    total_sessions: number;
  }> {
    return apiClient.get(`${API_ENDPOINTS.SCHEDULES}daily_sessions/`, params);
  },

  // Legacy method for backward compatibility - reproduit l'ancienne logique et format
  async getDailySessions(params: { date: string; curriculum?: string }): Promise<any> {
    const paginatedResponse = await this.getScheduleSessions({ date: params.date });
    
    let filteredResults = paginatedResponse.results || [];
    
    // Si un curriculum est spécifié, on doit filtrer les sessions
    if (params.curriculum && paginatedResponse.results) {
      // D'abord, récupérer tous les emplois du temps pour trouver ceux du curriculum sélectionné
      try {
        const schedulesResponse = await this.getSchedules();
        const schedulesForCurriculum = schedulesResponse.results?.filter((schedule: any) => {
          // Le curriculum est identifié par son code
          return schedule.curriculum_details?.code === params.curriculum;
        }) || [];
        
        const scheduleIds = schedulesForCurriculum.map((s: any) => s.id);
        
        // Filtrer les sessions qui appartiennent à ces emplois du temps
        filteredResults = paginatedResponse.results.filter((session: any) => {
          return scheduleIds.includes(session.schedule);
        });
        
        console.log(`Filtered ${paginatedResponse.results.length} sessions to ${filteredResults.length} for curriculum ${params.curriculum}`);
      } catch (error) {
        console.error('Error filtering by curriculum:', error);
        // En cas d'erreur, retourner toutes les sessions
      }
    }
    
    // Retourner le format attendu par l'ancienne page
    return {
      ...paginatedResponse,
      results: filteredResults,
      sessions: filteredResults
    };
  },
};