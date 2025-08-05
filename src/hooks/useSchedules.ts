// src/hooks/useSchedules.ts
import { useState, useEffect } from 'react';
import { scheduleService } from '@/lib/api/services/schedules';
import type { 
  Schedule, 
  ScheduleSession,
  Conflict,
  AcademicPeriod,
  TimeSlot,
  PaginatedResponse 
} from '@/types/api';
import { useApi } from './useApiStable';

export function useAcademicPeriods() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<AcademicPeriod>>();

  const fetchPeriods = async () => {
    const response = await execute(() => scheduleService.getAcademicPeriods());
    if (response) {
      setPeriods(response.results);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  return {
    periods,
    loading,
    error,
    refetch: fetchPeriods,
  };
}

export function useTimeSlots(day?: string) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<TimeSlot>>();

  const fetchTimeSlots = async (params?: { day?: string }) => {
    const response = await execute(() => scheduleService.getTimeSlots(params));
    if (response) {
      setTimeSlots(response.results);
    }
  };

  useEffect(() => {
    fetchTimeSlots(day ? { day } : undefined);
  }, [day]);

  return {
    timeSlots,
    loading,
    error,
    refetch: fetchTimeSlots,
  };
}

export function useSchedules(filters?: {
  academic_period?: number;
  curriculum?: number;
  published_only?: boolean;
  date?: string; // Ajout du filtre par date
}) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<Schedule>>();

  const fetchSchedules = async (params?: {
    academic_period?: number;
    curriculum?: number;
    published_only?: boolean;
    search?: string;
    date?: string;
  }) => {
    const response = await execute(() => scheduleService.getSchedules({ ...filters, ...params }));
    if (response) {
      setSchedules(response.results);
    }
  };

  // Fonction spécifique pour récupérer les emplois du temps d'aujourd'hui
  const fetchTodaySchedules = async () => {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    return fetchSchedules({ date: today });
  };

  useEffect(() => {
    fetchSchedules();
  }, [filters?.academic_period, filters?.curriculum, filters?.published_only, filters?.date]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    fetchTodaySchedules,
    refetch: fetchSchedules,
  };
}

export function useSchedule(id: number | null) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const { loading, error, execute } = useApi<Schedule>();

  const fetchSchedule = async () => {
    if (!id) return;
    const response = await execute(() => scheduleService.getSchedule(id));
    if (response) {
      setSchedule(response);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSchedule();
    }
  }, [id]);

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
  };
}

export function useScheduleActions() {
  const publishApi = useApi<{ message: string }>();
  const unpublishApi = useApi<{ message: string }>();
  const detectConflictsApi = useApi<{ conflicts_detected: number; conflicts: Conflict[] }>();

  const publishSchedule = async (id: number) => {
    return publishApi.execute(() => scheduleService.publishSchedule(id));
  };

  const unpublishSchedule = async (id: number) => {
    return unpublishApi.execute(() => scheduleService.unpublishSchedule(id));
  };

  const detectConflicts = async (id: number) => {
    return detectConflictsApi.execute(() => scheduleService.detectConflicts(id));
  };

  return {
    publishSchedule,
    unpublishSchedule,
    detectConflicts,
    publishing: publishApi.loading,
    unpublishing: unpublishApi.loading,
    detectingConflicts: detectConflictsApi.loading,
    error: publishApi.error || unpublishApi.error || detectConflictsApi.error,
  };
}

export function useConflicts(scheduleId?: number) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<Conflict>>();

  const fetchConflicts = async (params?: {
    schedule?: number;
    severity?: string;
    unresolved_only?: boolean;
  }) => {
    const response = await execute(() => scheduleService.getConflicts(params));
    if (response) {
      setConflicts(response.results);
    }
  };

  useEffect(() => {
    fetchConflicts(scheduleId ? { schedule: scheduleId, unresolved_only: true } : undefined);
  }, [scheduleId]);

  return {
    conflicts,
    loading,
    error,
    fetchConflicts,
    refetch: fetchConflicts,
  };
}

export function useWeeklySchedule(scheduleId: number | null, weekDate?: Date) {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const { loading, error, execute } = useApi<any>();

  const fetchWeeklyView = async (customDate?: Date) => {
    if (!scheduleId) return;
    const params: any = {};
    
    if (customDate || weekDate) {
      const targetDate = customDate || weekDate;
      params.week_start = targetDate.toISOString().split('T')[0];
    }
    
    const response = await execute(() => scheduleService.getWeeklyView(scheduleId, params));
    if (response) {
      setWeeklyData(response);
    }
  };

  // Fonction pour récupérer la semaine d'aujourd'hui
  const fetchCurrentWeek = async () => {
    return fetchWeeklyView(new Date());
  };

  useEffect(() => {
    if (scheduleId) {
      fetchWeeklyView();
    }
  }, [scheduleId, weekDate]);

  return {
    weeklyData,
    loading,
    error,
    fetchWeeklyView,
    fetchCurrentWeek,
    refetch: fetchWeeklyView,
  };
}