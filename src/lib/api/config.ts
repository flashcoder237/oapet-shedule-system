// src/lib/api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_TOKEN: '/auth/token/',
  
  // Courses
  DEPARTMENTS: '/courses/departments/',
  TEACHERS: '/courses/teachers/',
  COURSES: '/courses/courses/',
  CURRICULA: '/courses/curricula/',
  STUDENTS: '/courses/students/',
  ENROLLMENTS: '/courses/enrollments/',
  
  // Rooms
  BUILDINGS: '/rooms/buildings/',
  ROOM_TYPES: '/rooms/room-types/',
  ROOMS: '/rooms/rooms/',
  ROOM_AVAILABILITY: '/rooms/availability/',
  ROOM_BOOKINGS: '/rooms/bookings/',
  ROOM_SEARCH: '/rooms/rooms/search_available/',
  
  // Schedules
  ACADEMIC_PERIODS: '/schedules/academic-periods/',
  TIME_SLOTS: '/schedules/time-slots/',
  SCHEDULES: '/schedules/schedules/',
  SCHEDULE_SESSIONS: '/schedules/sessions/',
  CONFLICTS: '/schedules/conflicts/',
  
  // ML Engine
  ML_MODELS: '/ml/models/',
  ML_PREDICTIONS: '/ml/predictions/predict_course_difficulty/',
  ML_TRAINING: '/ml/training-tasks/',
  ML_DATASETS: '/ml/datasets/',
} as const;

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;