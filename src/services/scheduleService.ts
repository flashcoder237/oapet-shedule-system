import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface GenerateScheduleParams {
  academic_year: string;
  semester: string;
  start_date: string;
  end_date: string;
  curriculum_ids: string[];
}

interface Schedule {
  id: number;
  name: string;
  academic_period: any;
  curriculum: any;
  schedule_type: string;
  status: string;
  is_published: boolean;
  sessions_count?: number;
  created_at: string;
  updated_at: string;
}

interface GenerateResponse {
  message: string;
  schedules: Array<{
    id: number;
    name: string;
    sessions_count: number;
  }>;
  period: {
    start: string;
    end: string;
    name: string;
  };
}

interface WeeklySessionsParams {
  week_start: string;
  curriculum?: string;
  teacher?: string;
  room?: string;
}

class ScheduleService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Générer un emploi du temps pour une période
   */
  async generateSchedule(params: GenerateScheduleParams): Promise<GenerateResponse> {
    const response = await this.api.post<GenerateResponse>(
      '/schedules/generate_for_period/',
      params
    );
    return response.data;
  }

  /**
   * Récupérer tous les emplois du temps
   */
  async getAllSchedules(filters?: {
    academic_period?: number;
    curriculum?: string;
    published_only?: boolean;
  }): Promise<Schedule[]> {
    const params = new URLSearchParams();
    if (filters?.academic_period) params.append('academic_period', filters.academic_period.toString());
    if (filters?.curriculum) params.append('curriculum', filters.curriculum);
    if (filters?.published_only) params.append('published_only', 'true');

    const response = await this.api.get<{ results?: Schedule[]; data?: Schedule[] }>(
      `/schedules/?${params.toString()}`
    );
    return response.data.results || response.data.data || [];
  }

  /**
   * Récupérer un emploi du temps par ID
   */
  async getScheduleById(id: number): Promise<Schedule> {
    const response = await this.api.get<Schedule>(`/schedules/${id}/`);
    return response.data;
  }

  /**
   * Publier un emploi du temps
   */
  async publishSchedule(id: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(
      `/schedules/${id}/publish/`
    );
    return response.data;
  }

  /**
   * Dépublier un emploi du temps
   */
  async unpublishSchedule(id: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(
      `/schedules/${id}/unpublish/`
    );
    return response.data;
  }

  /**
   * Supprimer un emploi du temps
   */
  async deleteSchedule(id: number): Promise<{ message: string; sessions_deleted: number }> {
    const response = await this.api.delete<{ message: string; sessions_deleted: number }>(
      `/schedules/${id}/delete_schedule/`
    );
    return response.data;
  }

  /**
   * Récupérer les sessions d'une semaine
   */
  async getWeeklySessions(params: WeeklySessionsParams) {
    const queryParams = new URLSearchParams({
      week_start: params.week_start,
      ...(params.curriculum && { curriculum: params.curriculum }),
      ...(params.teacher && { teacher: params.teacher }),
      ...(params.room && { room: params.room }),
    });

    const response = await this.api.get(
      `/schedules/weekly_sessions/?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Récupérer les sessions d'un jour
   */
  async getDailySessions(params: {
    date: string;
    curriculum?: string;
    teacher?: string;
    room?: string;
  }) {
    const queryParams = new URLSearchParams({
      date: params.date,
      ...(params.curriculum && { curriculum: params.curriculum }),
      ...(params.teacher && { teacher: params.teacher }),
      ...(params.room && { room: params.room }),
    });

    const response = await this.api.get(
      `/schedules/daily_sessions/?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Détecter les conflits dans un emploi du temps
   */
  async detectConflicts(scheduleId: number) {
    const response = await this.api.post(`/schedules/${scheduleId}/detect_conflicts/`);
    return response.data;
  }

  /**
   * Récupérer les statistiques
   */
  async getStats() {
    const response = await this.api.get('/schedules/stats/');
    return response.data;
  }

  /**
   * Récupérer la vue hebdomadaire d'un emploi du temps
   */
  async getWeeklyView(scheduleId: number) {
    const response = await this.api.get(`/schedules/${scheduleId}/weekly_view/`);
    return response.data;
  }

  /**
   * Obtenir les dates par défaut selon le semestre
   */
  getDefaultDates(academicYear: string, semester: string): { start_date: string; end_date: string } {
    const year = parseInt(academicYear.split('-')[0]);

    if (semester === 'S1') {
      return {
        start_date: `${year}-10-01`,
        end_date: `${year + 1}-02-28`,
      };
    } else if (semester === 'S2') {
      return {
        start_date: `${year + 1}-03-01`,
        end_date: `${year + 1}-07-31`,
      };
    } else {
      // Annuel
      return {
        start_date: `${year}-10-01`,
        end_date: `${year + 1}-07-31`,
      };
    }
  }
}

// Export une instance unique (singleton)
export const scheduleService = new ScheduleService();
export default scheduleService;
