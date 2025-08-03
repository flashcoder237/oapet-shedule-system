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
};