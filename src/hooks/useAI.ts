// src/hooks/useAI.ts
'use client';

import { useState, useCallback } from 'react';
import { mlService } from '@/lib/api/services/ml';

// Hook pour l'analyse de charge de travail
export function useWorkloadAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (scheduleData?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.analyzeWorkload(scheduleData);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de l\'analyse de charge';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
}

// Hook pour la détection d'anomalies
export function useAnomalyDetection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (scheduleData?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.detectAnomalies(scheduleData);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la détection d\'anomalies';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, detect };
}

// Hook pour la prédiction d'occupation des salles
export function useRoomOccupancyPrediction() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (roomId?: string, dateRange?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.predictRoomOccupancy(roomId, dateRange);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la prédiction d\'occupation';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, predict };
}

// Hook pour les recommandations d'emploi du temps optimal
export function useOptimalScheduleRecommendations() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (constraints?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.getOptimalScheduleRecommendations(constraints);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la génération de recommandations';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getRecommendations };
}

// Hook pour l'analyse des préférences étudiantes
export function useStudentPreferencesAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (studentData?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.analyzeStudentPreferences(studentData);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de l\'analyse des préférences';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
}

// Hook pour la prédiction de taux de réussite
export function useCourseSuccessPrediction() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (courseData?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.predictCourseSuccess(courseData);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la prédiction de réussite';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, predict };
}

// Hook pour les recommandations personnalisées
export function usePersonalizedRecommendations() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (userProfile: {
    type: 'student' | 'teacher' | 'admin';
    preferences?: any;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.getPersonalizedRecommendations(userProfile);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la génération de recommandations personnalisées';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getRecommendations };
}

// Hook pour les suggestions de recherche IA
export function useAISearchSuggestions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (query?: string, limit: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.getSearchSuggestions(query, limit);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la génération de suggestions de recherche';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getSuggestions };
}

// Hook pour les suggestions d'emploi du temps
export function useScheduleSuggestions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (context?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.getScheduleSuggestions(context);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la génération de suggestions d\'emploi du temps';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getSuggestions };
}

// Hook pour la génération complète d'emploi du temps IA
export function useAIScheduleGeneration() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = useCallback(async (data: {
    selectedClass: string;
    constraints?: any;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mlService.generateSchedule(data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la génération d\'emploi du temps';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, generateSchedule };
}

// Hook complet pour tous les services IA
export function useAI() {
  const workloadAnalysis = useWorkloadAnalysis();
  const anomalyDetection = useAnomalyDetection();
  const roomOccupancyPrediction = useRoomOccupancyPrediction();
  const optimalScheduleRecommendations = useOptimalScheduleRecommendations();
  const studentPreferencesAnalysis = useStudentPreferencesAnalysis();
  const courseSuccessPrediction = useCourseSuccessPrediction();
  const personalizedRecommendations = usePersonalizedRecommendations();
  const searchSuggestions = useAISearchSuggestions();
  const scheduleSuggestions = useScheduleSuggestions();
  const scheduleGeneration = useAIScheduleGeneration();

  return {
    workloadAnalysis,
    anomalyDetection,
    roomOccupancyPrediction,
    optimalScheduleRecommendations,
    studentPreferencesAnalysis,
    courseSuccessPrediction,
    personalizedRecommendations,
    searchSuggestions,
    scheduleSuggestions,
    scheduleGeneration,
  };
}