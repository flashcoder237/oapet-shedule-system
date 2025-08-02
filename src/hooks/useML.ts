// src/hooks/useML.ts
import { useState, useEffect } from 'react';
import { mlService } from '@/lib/api/services/ml';
import type { 
  MLModel,
  MLPredictionRequest,
  MLPredictionResponse,
  PaginatedResponse 
} from '@/types/api';
import { useApi } from './useApi';

export function useMLModels() {
  const [models, setModels] = useState<MLModel[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<MLModel>>();

  const fetchModels = async (params?: { active_only?: boolean }) => {
    const response = await execute(() => mlService.getModels(params));
    if (response) {
      setModels(response.results);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const setActiveModel = async (id: number) => {
    await mlService.setActiveModel(id);
    // Rafraîchir la liste après changement
    await fetchModels();
  };

  return {
    models,
    loading,
    error,
    fetchModels,
    setActiveModel,
    refetch: fetchModels,
  };
}

export function useMLModel(id: number | null) {
  const [model, setModel] = useState<MLModel | null>(null);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const { loading, error, execute } = useApi<MLModel>();

  const fetchModel = async () => {
    if (!id) return;
    const response = await execute(() => mlService.getModel(id));
    if (response) {
      setModel(response);
    }
  };

  const fetchFeatureImportance = async () => {
    if (!id) return;
    try {
      const importance = await mlService.getFeatureImportance(id);
      setFeatureImportance(importance);
    } catch (error) {
      console.error('Failed to fetch feature importance:', error);
    }
  };

  const fetchPerformanceHistory = async () => {
    if (!id) return;
    try {
      const history = await mlService.getPerformanceHistory(id);
      setPerformanceHistory(history);
    } catch (error) {
      console.error('Failed to fetch performance history:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchModel();
      fetchFeatureImportance();
      fetchPerformanceHistory();
    }
  }, [id]);

  return {
    model,
    featureImportance,
    performanceHistory,
    loading,
    error,
    refetch: fetchModel,
  };
}

export function useMLPrediction() {
  const { loading, error, execute } = useApi<MLPredictionResponse>();
  const [lastPrediction, setLastPrediction] = useState<MLPredictionResponse | null>(null);

  const predictCourseDifficulty = async (data: MLPredictionRequest) => {
    const response = await execute(() => mlService.predictCourseDifficulty(data));
    if (response) {
      setLastPrediction(response);
    }
    return response;
  };

  return {
    predictCourseDifficulty,
    lastPrediction,
    loading,
    error,
    reset: () => setLastPrediction(null),
  };
}

export function useMLDatasets() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const downloadApi = useApi<{ message: string; files: string[] }>();
  const extractApi = useApi<{ message: string; courses_count: number; features_count: number }>();

  const fetchDatasets = async () => {
    try {
      const response = await mlService.getDatasets();
      setDatasets(response.results);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    }
  };

  const downloadITCDatasets = async () => {
    return downloadApi.execute(() => mlService.downloadITCDatasets());
  };

  const extractFeatures = async (id: number) => {
    return extractApi.execute(() => mlService.extractFeatures(id));
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return {
    datasets,
    downloadITCDatasets,
    extractFeatures,
    downloadLoading: downloadApi.loading,
    extractLoading: extractApi.loading,
    error: downloadApi.error || extractApi.error,
    refetch: fetchDatasets,
  };
}

export function useMLTraining() {
  const [tasks, setTasks] = useState<any[]>([]);
  const startApi = useApi<any>();
  const cancelApi = useApi<{ message: string }>();

  const fetchTasks = async (params?: { user_id?: number; status?: string }) => {
    try {
      const response = await mlService.getTrainingTasks(params);
      setTasks(response.results);
    } catch (error) {
      console.error('Failed to fetch training tasks:', error);
    }
  };

  const startTraining = async (data: {
    dataset_id: number;
    model_types?: string[];
    parameters?: Record<string, any>;
  }) => {
    const response = await startApi.execute(() => mlService.startTraining(data));
    if (response) {
      // Rafraîchir la liste des tâches
      await fetchTasks();
    }
    return response;
  };

  const cancelTraining = async (id: number) => {
    const response = await cancelApi.execute(() => mlService.cancelTraining(id));
    if (response) {
      // Rafraîchir la liste des tâches
      await fetchTasks();
    }
    return response;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    startTraining,
    cancelTraining,
    startLoading: startApi.loading,
    cancelLoading: cancelApi.loading,
    error: startApi.error || cancelApi.error,
    refetch: fetchTasks,
  };
}

export function useMLAccuracy() {
  const [stats, setStats] = useState<any>(null);
  const { loading, error, execute } = useApi<any>();

  const fetchAccuracyStats = async () => {
    const response = await execute(() => mlService.getAccuracyStats());
    if (response) {
      setStats(response);
    }
  };

  useEffect(() => {
    fetchAccuracyStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchAccuracyStats,
  };
}