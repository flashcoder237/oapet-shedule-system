// src/lib/api/services/generation.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  ScheduleGenerationConfig,
  PaginatedResponse
} from '@/types/api';

export const generationService = {
  /**
   * Récupérer les configurations de génération
   */
  async getConfigs(params?: {
    schedule?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<ScheduleGenerationConfig>> {
    return apiClient.get<PaginatedResponse<ScheduleGenerationConfig>>(
      API_ENDPOINTS.GENERATION_CONFIGS,
      params
    );
  },

  /**
   * Récupérer une configuration par ID
   */
  async getConfig(id: number): Promise<ScheduleGenerationConfig> {
    return apiClient.get<ScheduleGenerationConfig>(
      `${API_ENDPOINTS.GENERATION_CONFIGS}${id}/`
    );
  },

  /**
   * Créer une nouvelle configuration
   */
  async createConfig(data: Partial<ScheduleGenerationConfig>): Promise<ScheduleGenerationConfig> {
    return apiClient.post<ScheduleGenerationConfig>(
      API_ENDPOINTS.GENERATION_CONFIGS,
      data
    );
  },

  /**
   * Mettre à jour une configuration
   */
  async updateConfig(id: number, data: Partial<ScheduleGenerationConfig>): Promise<ScheduleGenerationConfig> {
    return apiClient.put<ScheduleGenerationConfig>(
      `${API_ENDPOINTS.GENERATION_CONFIGS}${id}/`,
      data
    );
  },

  /**
   * Supprimer une configuration
   */
  async deleteConfig(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.GENERATION_CONFIGS}${id}/`);
  },

  /**
   * Générer l'emploi du temps (occurrences)
   */
  async generateSchedule(data: {
    schedule_id: number;
    preview_mode?: boolean;
    force_regenerate?: boolean;
    preserve_modifications?: boolean;
    date_from?: string;
    date_to?: string;
    use_ml_optimization?: boolean;
    allow_conflicts?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    occurrences_created: number;
    conflicts_detected: number;
    conflicts: Array<{
      type: string;
      severity: string;
      date: string;
      time: string;
      resource: string;
      courses: string[];
    }>;
    preview_data?: {
      total_occurrences: number;
      weeks: Record<string, number>;
      conflicts: any[];
    };
    generation_time: number;
    ml_optimized?: boolean;
  }> {
    return apiClient.post(`${API_ENDPOINTS.GENERATION}generate/`, data);
  },

  /**
   * Prévisualiser la génération sans sauvegarder
   */
  async previewGeneration(data: {
    schedule_id: number;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    success: boolean;
    message: string;
    preview_data?: {
      total_occurrences: number;
      weeks: Record<string, number>;
      conflicts: any[];
    };
    conflicts_detected: number;
  }> {
    return this.generateSchedule({
      ...data,
      preview_mode: true,
    });
  },

  /**
   * Régénérer l'emploi du temps en préservant les modifications
   */
  async regenerateSchedule(scheduleId: number, options?: {
    date_from?: string;
    date_to?: string;
    use_ml_optimization?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    occurrences_created: number;
    conflicts_detected: number;
    generation_time: number;
  }> {
    return this.generateSchedule({
      schedule_id: scheduleId,
      force_regenerate: true,
      preserve_modifications: true,
      ...options,
    });
  },

  /**
   * Régénérer complètement (écrase tout)
   */
  async fullRegenerate(scheduleId: number, options?: {
    date_from?: string;
    date_to?: string;
    use_ml_optimization?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    occurrences_created: number;
    conflicts_detected: number;
    generation_time: number;
  }> {
    return this.generateSchedule({
      schedule_id: scheduleId,
      force_regenerate: true,
      preserve_modifications: false,
      ...options,
    });
  },

  /**
   * Valider une configuration avant génération
   */
  async validateConfig(configId: number): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return apiClient.post(`${API_ENDPOINTS.GENERATION_CONFIGS}${configId}/validate/`);
  },

  // Fonctions utilitaires

  /**
   * Calculer le nombre de semaines dans une période
   */
  calculateWeeks: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  },

  /**
   * Estimer le nombre d'occurrences qui seront générées
   */
  estimateOccurrences: (config: ScheduleGenerationConfig, sessionsCount: number): number => {
    const weeks = generationService.calculateWeeks(config.start_date, config.end_date);
    let multiplier = 1;

    switch (config.recurrence_type) {
      case 'weekly':
        multiplier = weeks;
        break;
      case 'biweekly':
        multiplier = Math.floor(weeks / 2);
        break;
      case 'monthly':
        multiplier = Math.floor(weeks / 4);
        break;
    }

    // Soustraire les jours exclus (approximation)
    const excludedCount = config.excluded_dates?.length || 0;
    const adjustedMultiplier = Math.max(0, multiplier - Math.floor(excludedCount / 7));

    return sessionsCount * adjustedMultiplier;
  },

  /**
   * Obtenir le libellé du type de récurrence
   */
  getRecurrenceLabel: (type: string): string => {
    switch (type) {
      case 'weekly': return 'Hebdomadaire';
      case 'biweekly': return 'Bihebdomadaire';
      case 'monthly': return 'Mensuel';
      case 'custom': return 'Personnalisé';
      default: return type;
    }
  },

  /**
   * Obtenir le libellé du niveau de flexibilité
   */
  getFlexibilityLabel: (level: string): string => {
    switch (level) {
      case 'rigid': return 'Rigide (respect strict)';
      case 'balanced': return 'Équilibré';
      case 'flexible': return 'Flexible (optimisation max)';
      default: return level;
    }
  },

  /**
   * Obtenir le libellé de la priorité d'optimisation
   */
  getOptimizationPriorityLabel: (priority: string): string => {
    switch (priority) {
      case 'teacher': return 'Enseignant';
      case 'room': return 'Salle';
      case 'balanced': return 'Équilibré';
      default: return priority;
    }
  },
};
