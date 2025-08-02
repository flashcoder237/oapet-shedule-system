// src/types/api.ts

// Types pour les modèles de base
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_of_department?: number;
  head_of_department_name?: string;
  teachers_count?: number;
  courses_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  user: number;
  user_details?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  employee_id: string;
  department: number;
  department_name?: string;
  phone?: string;
  office?: string;
  specializations: string[];
  availability: Record<string, any>;
  max_hours_per_week: number;
  preferred_days: string[];
  courses_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  department: number;
  department_name?: string;
  teacher: number;
  teacher_name?: string;
  course_type: 'CM' | 'TD' | 'TP' | 'CONF' | 'EXAM';
  level: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  credits: number;
  hours_per_week: number;
  total_hours: number;
  max_students: number;
  min_room_capacity: number;
  requires_computer: boolean;
  requires_projector: boolean;
  requires_laboratory: boolean;
  semester: string;
  academic_year: string;
  min_sessions_per_week: number;
  max_sessions_per_week: number;
  preferred_times: any[];
  unavailable_times: any[];
  enrollments_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  building: number;
  building_name?: string;
  building_code?: string;
  room_type: number;
  room_type_name?: string;
  floor: string;
  capacity: number;
  area?: number;
  description?: string;
  has_projector: boolean;
  has_computer: boolean;
  has_whiteboard: boolean;
  has_blackboard: boolean;
  has_air_conditioning: boolean;
  has_internet: boolean;
  has_audio_system: boolean;
  is_laboratory: boolean;
  laboratory_type?: string;
  has_special_equipment: boolean;
  equipment_list: string[];
  is_accessible: boolean;
  has_emergency_exit: boolean;
  is_bookable: boolean;
  priority_level: number;
  maintenance_notes?: string;
  equipment_summary?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  name: string;
  academic_period: number;
  academic_period_details?: AcademicPeriod;
  curriculum?: number;
  curriculum_details?: any;
  teacher?: number;
  teacher_details?: Teacher;
  level?: string;
  description?: string;
  is_published: boolean;
  published_at?: string;
  version: number;
  created_by: number;
  created_by_name?: string;
  sessions_count?: number;
  conflicts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleSession {
  id: number;
  schedule: number;
  course: number;
  course_details?: Course;
  room: number;
  room_details?: Room;
  teacher: number;
  teacher_details?: Teacher;
  time_slot: number;
  time_slot_details?: TimeSlot;
  specific_date?: string;
  specific_start_time?: string;
  specific_end_time?: string;
  session_type: string;
  expected_students: number;
  notes?: string;
  is_cancelled: boolean;
  cancellation_reason?: string;
  difficulty_score?: number;
  complexity_level?: string;
  scheduling_priority: number;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: number;
  day_of_week: string;
  day_display?: string;
  start_time: string;
  end_time: string;
  name?: string;
  duration?: number;
  is_active: boolean;
}

export interface AcademicPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_year: string;
  semester: string;
  duration?: number;
  created_at: string;
}

export interface Conflict {
  id: number;
  schedule_session: number;
  schedule_session_details?: ScheduleSession;
  conflict_type: string;
  conflict_type_display?: string;
  conflicting_session?: number;
  conflicting_session_details?: ScheduleSession;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severity_display?: string;
  is_resolved: boolean;
  resolution_notes?: string;
  detected_at: string;
  resolved_at?: string;
}

// Types pour les prédictions ML
export interface MLPredictionRequest {
  course_name: string;
  lectures: number;
  min_days: number;
  students: number;
  teacher: string;
  instance?: string;
  total_courses?: number;
  total_rooms?: number;
  total_days?: number;
  periods_per_day?: number;
  lecture_density?: number;
  student_lecture_ratio?: number;
  course_room_ratio?: number;
  utilization_pressure?: number;
  min_days_constraint_tightness?: number;
  conflict_degree?: number;
  conflict_density?: number;
  clustering_coefficient?: number;
  betweenness_centrality?: number;
  unavailability_count?: number;
  unavailability_ratio?: number;
  room_constraint_count?: number;
}

export interface MLPredictionResponse {
  difficulty_score: number;
  complexity_level: string;
  priority: number;
  recommendations: string[];
  processing_time?: number;
  model_used?: string;
}

export interface MLModel {
  id: number;
  name: string;
  model_type: string;
  description?: string;
  performance_metrics: Record<string, any>;
  feature_names: string[];
  is_active: boolean;
  performance_summary?: {
    average_r2: number;
    model_count: number;
    best_score: number;
  };
  created_at: string;
  updated_at: string;
}

// Types pour les recherches
export interface RoomSearchParams {
  min_capacity?: number;
  max_capacity?: number;
  building?: string;
  room_type?: string;
  floor?: string;
  has_projector?: boolean;
  has_computer?: boolean;
  has_air_conditioning?: boolean;
  is_laboratory?: boolean;
  is_accessible?: boolean;
  is_available?: boolean;
  day_of_week?: string;
  period?: string;
}

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Types pour les statistiques
export interface DashboardStats {
  total_courses: number;
  total_teachers: number;
  total_students: number;
  total_rooms: number;
  active_schedules: number;
  unresolved_conflicts: number;
  recent_predictions: number;
  system_utilization: number;
}