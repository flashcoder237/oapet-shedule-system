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
import { useApi } from './useApi';

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
}) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<Schedule>>();

  const fetchSchedules = async (params?: {
    academic_period?: number;
    curriculum?: number;
    published_only?: boolean;
    search?: string;
  }) => {
    const response = await execute(() => scheduleService.getSchedules({ ...filters, ...params }));
    if (response) {
      setSchedules(response.results);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [filters?.academic_period, filters?.curriculum, filters?.published_only]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
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

export function useWeeklySchedule(scheduleId: number | null) {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const { loading, error, execute } = useApi<any>();

  const fetchWeeklyView = async () => {
    if (!scheduleId) return;
    const response = await execute(() => scheduleService.getWeeklyView(scheduleId));
    if (response) {
      setWeeklyData(response);
    }
  };

  useEffect(() => {
    if (scheduleId) {
      fetchWeeklyView();
    }
  }, [scheduleId]);

  return {
    weeklyData,
    loading,
    error,
    refetch: fetchWeeklyView,
  };
}