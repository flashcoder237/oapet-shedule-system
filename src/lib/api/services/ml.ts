// src/lib/api/services/ml.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  MLModel,
  MLPredictionRequest,
  MLPredictionResponse,
  PaginatedResponse 
} from '@/types/api';

export const mlService = {
  // Modèles ML
  async getModels(params?: { active_only?: boolean }): Promise<PaginatedResponse<MLModel>> {
    return apiClient.get<PaginatedResponse<MLModel>>(API_ENDPOINTS.ML_MODELS, params);
  },

  async getModel(id: number): Promise<MLModel> {
    return apiClient.get<MLModel>(`${API_ENDPOINTS.ML_MODELS}${id}/`);
  },

  async setActiveModel(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.ML_MODELS}${id}/set_active/`);
  },

  async getFeatureImportance(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.ML_MODELS}${id}/feature_importance/`);
  },

  async getPerformanceHistory(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.ML_MODELS}${id}/performance_history/`);
  },

  // Prédictions
  async predictCourseDifficulty(data: MLPredictionRequest): Promise<MLPredictionResponse> {
    return apiClient.post<MLPredictionResponse>(API_ENDPOINTS.ML_PREDICTIONS, data);
  },

  // Datasets
  async getDatasets(): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>(API_ENDPOINTS.ML_DATASETS);
  },

  async downloadITCDatasets(): Promise<{ message: string; files: string[] }> {
    return apiClient.post<{ message: string; files: string[] }>(`${API_ENDPOINTS.ML_DATASETS}download_itc_datasets/`);
  },

  async extractFeatures(id: number): Promise<{
    message: string;
    courses_count: number;
    features_count: number;
  }> {
    return apiClient.post(`${API_ENDPOINTS.ML_DATASETS}${id}/extract_features/`);
  },

  // Tâches d'entraînement
  async getTrainingTasks(params?: {
    user_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>(API_ENDPOINTS.ML_TRAINING, params);
  },

  async startTraining(data: {
    dataset_id: number;
    model_types?: string[];
    parameters?: Record<string, any>;
  }): Promise<any> {
    return apiClient.post(`${API_ENDPOINTS.ML_TRAINING}start_training/`, data);
  },

  async cancelTraining(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.ML_TRAINING}${id}/cancel/`);
  },

  // Historique des prédictions
  async getPredictionHistory(): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>('/ml/prediction-history/');
  },

  async provideFeedback(id: number, actualDifficulty: number): Promise<{
    message: string;
    accuracy: number;
  }> {
    return apiClient.post(`/ml/prediction-history/${id}/provide_feedback/`, {
      actual_difficulty: actualDifficulty,
    });
  },

  async getAccuracyStats(): Promise<{
    total_predictions_with_feedback: number;
    average_error: number;
    accuracy: number;
    accuracy_percentage: number;
  }> {
    return apiClient.get('/ml/prediction-history/accuracy_stats/');
  },

  // Optimisation d'emploi du temps
  async optimizeSchedule(params: {
    constraints: {
      avoid_conflicts: boolean;
      balance_workload: boolean;
      prefer_morning_sessions: boolean;
    };
    period_id?: number;
    department_id?: number;
  }): Promise<{
    optimized_schedule: any;
    conflicts_resolved: number;
    optimization_score: number;
    suggestions: string[];
  }> {
    return apiClient.post('/ml/optimize-schedule/', params);
  },

  // Suggestions IA
  async getScheduleSuggestions(context?: string): Promise<{
    suggestions: string[];
    context?: string;
    confidence: number;
    model_used: string;
    generated_at: string;
  }> {
    const params = context ? { context } : {};
    return apiClient.get('/ml/suggestions/schedule_suggestions/', params);
  },

  async getSearchSuggestions(query?: string, limit: number = 5): Promise<{
    suggestions: Array<{
      text: string;
      type: string;
      category: string;
    }>;
    query?: string;
    model_used: string;
    generated_at: string;
  }> {
    const params: any = { limit };
    if (query) params.query = query;
    return apiClient.get('/ml/suggestions/search_suggestions/', params);
  },

  async generateSchedule(data: {
    selectedClass: string;
    constraints?: any;
  }): Promise<{
    success: boolean;
    scheduleId: string;
    conflicts: Array<{
      type: string;
      severity: string;
      message: string;
      sessionId: string;
      suggestions: string[];
    }>;
    metrics: {
      totalHours: number;
      utilizationRate: number;
      conflictScore: number;
      balanceScore: number;
      teacherSatisfaction: number;
      roomUtilization: number;
    };
    suggestions: string[];
    generated_by_ai: boolean;
    model_used: string;
  }> {
    return apiClient.post('/ml/suggestions/generate_schedule/', data);
  },

  // Analyse de charge de travail
  async analyzeWorkload(scheduleData?: any): Promise<{
    teachers: Array<{
      teacher: string;
      total_hours: number;
      daily_hours: Record<string, number>;
      balance_score: number;
      overloaded_days: string[];
      recommendations: string[];
    }>;
    overall_balance: number;
    model_used: string;
    analyzed_at: string;
  }> {
    const params = scheduleData ? { schedule_data: JSON.stringify(scheduleData) } : {};
    return apiClient.get('/ml/suggestions/analyze_workload/', params);
  },

  // Détection d'anomalies
  async detectAnomalies(scheduleData?: any): Promise<{
    anomalies: Array<{
      type: string;
      severity: string;
      description: string;
      location: string;
      time: string;
      impact: string;
    }>;
    total_anomalies: number;
    risk_score: number;
    recommendations: string[];
    model_used: string;
    detected_at: string;
  }> {
    const params = scheduleData ? { schedule_data: JSON.stringify(scheduleData) } : {};
    return apiClient.get('/ml/suggestions/detect_anomalies/', params);
  },

  // Prédiction d'occupation des salles
  async predictRoomOccupancy(roomId?: string, dateRange?: string): Promise<{
    predictions: Array<{
      room: string;
      hourly_predictions: Record<string, number>;
      average_occupancy: number;
      peak_hours: string[];
      available_slots: string[];
      capacity_utilization: number;
    }>;
    date_range: string;
    model_used: string;
    predicted_at: string;
  }> {
    const params: any = {};
    if (roomId) params.room_id = roomId;
    if (dateRange) params.date_range = dateRange;
    return apiClient.get('/ml/suggestions/predict_room_occupancy/', params);
  },

  // Recommandations d'emploi du temps optimal
  async getOptimalScheduleRecommendations(constraints?: any): Promise<{
    recommendations: {
      time_slots: Record<string, {
        recommended: string[];
        reason: string;
        efficiency_score: number;
      }>;
      room_assignments: Array<{
        course_type: string;
        recommended_rooms: string[];
        reason: string;
        priority: string;
      }>;
      teacher_optimization: Array<{
        teacher: string;
        recommended_schedule: Record<string, string[]>;
        workload_balance: number;
      }>;
      conflict_resolution: string[];
      optimization_score: number;
    };
    confidence: number;
    model_used: string;
    generated_at: string;
  }> {
    const params = constraints ? { constraints: JSON.stringify(constraints) } : {};
    return apiClient.get('/ml/suggestions/optimal_schedule_recommendations/', params);
  },

  // Analyse des préférences étudiantes
  async analyzeStudentPreferences(studentData?: any): Promise<{
    analysis: {
      time_preferences: {
        morning_lovers: number;
        afternoon_lovers: number;
        evening_lovers: number;
        preferred_start_time: string;
        preferred_end_time: string;
      };
      course_format_preferences: {
        short_sessions: number;
        long_sessions: number;
        mixed_format: number;
        ideal_session_length: string;
      };
      break_preferences: {
        short_frequent: number;
        long_infrequent: number;
        flexible: number;
        ideal_break_length: string;
      };
      room_preferences: {
        small_classrooms: number;
        large_amphitheaters: number;
        mixed_environments: number;
        preferred_capacity: string;
      };
      satisfaction_metrics: {
        current_satisfaction: number;
        attendance_correlation: number;
        performance_impact: number;
      };
    };
    recommendations: string[];
    model_used: string;
    analyzed_at: string;
  }> {
    const params = studentData ? { student_data: JSON.stringify(studentData) } : {};
    return apiClient.get('/ml/suggestions/analyze_student_preferences/', params);
  },

  // Prédiction de taux de réussite
  async predictCourseSuccess(courseData?: any): Promise<{
    course_predictions: Array<{
      course: string;
      predicted_success_rate: number;
      confidence: number;
      key_factors: {
        optimal_time_slot: boolean;
        appropriate_room: boolean;
        teacher_experience: number;
        class_size: number;
        course_difficulty: number;
      };
      recommendations: string[];
      risk_level: string;
    }>;
    overall_average: number;
    model_used: string;
    predicted_at: string;
  }> {
    const params = courseData ? { course_data: JSON.stringify(courseData) } : {};
    return apiClient.get('/ml/suggestions/predict_course_success/', params);
  },

  // Recommandations personnalisées
  async getPersonalizedRecommendations(userProfile: {
    type: 'student' | 'teacher' | 'admin';
    preferences?: any;
  }): Promise<{
    user_type: string;
    recommendations: Record<string, string[]>;
    personalization_score: number;
    model_used: string;
    generated_at: string;
  }> {
    return apiClient.post('/ml/suggestions/personalized_recommendations/', {
      user_profile: userProfile
    });
  },
};