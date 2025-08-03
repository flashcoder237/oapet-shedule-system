// src/hooks/useCourses.ts
import { useState, useEffect, useMemo } from 'react';
import { courseService } from '@/lib/api/services/courses';
import type { Department, Teacher, Course, PaginatedResponse } from '@/types/api';
import { useApi } from './useApi';
import { useQuery } from './useQuery';

export function useDepartments(search?: string) {
  const queryKey = useMemo(() => ['departments', search || ''], [search]);
  
  const { data, loading, error, refetch } = useQuery<PaginatedResponse<Department>>(
    queryKey,
    () => courseService.getDepartments({ search }),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes pour les départements (changent rarement)
      refetchOnWindowFocus: false,
    }
  );

  return {
    departments: data?.results || [],
    count: data?.count || 0,
    loading,
    error,
    refetch,
  };
}

export function useTeachers(departmentId?: number) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<Teacher>>();

  const fetchTeachers = async (params?: { department?: number; search?: string }) => {
    const response = await execute(() => courseService.getTeachers(params));
    if (response) {
      setTeachers(response.results);
    }
  };

  useEffect(() => {
    fetchTeachers(departmentId ? { department: departmentId } : undefined);
  }, [departmentId]);

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    refetch: fetchTeachers,
  };
}

export function useCourses(filters?: {
  department?: number;
  level?: string;
  type?: string;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const { loading, error, execute } = useApi<PaginatedResponse<Course>>();

  const fetchCourses = async (params?: {
    department?: number;
    level?: string;
    type?: string;
    search?: string;
  }) => {
    const response = await execute(() => courseService.getCourses({ ...filters, ...params }));
    if (response) {
      setCourses(response.results);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters?.department, filters?.level, filters?.type]);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    refetch: fetchCourses,
  };
}

export function useCourse(id: number | null) {
  const [course, setCourse] = useState<Course | null>(null);
  const { loading, error, execute } = useApi<Course>();

  const fetchCourse = async () => {
    if (!id) return;
    const response = await execute(() => courseService.getCourse(id));
    if (response) {
      setCourse(response);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
  };
}

export function useCourseActions() {
  const createApi = useApi<Course>();
  const updateApi = useApi<Course>();
  const deleteApi = useApi<void>();

  const createCourse = async (data: Partial<Course>) => {
    return createApi.execute(() => courseService.createCourse(data));
  };

  const updateCourse = async (id: number, data: Partial<Course>) => {
    return updateApi.execute(() => courseService.updateCourse(id, data));
  };

  const deleteCourse = async (id: number) => {
    return deleteApi.execute(() => courseService.deleteCourse(id));
  };

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    creating: createApi.loading,
    updating: updateApi.loading,
    deleting: deleteApi.loading,
    error: createApi.error || updateApi.error || deleteApi.error,
  };
}