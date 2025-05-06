// src/lib/models.ts

// Interface pour les utilisateurs
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'professor' | 'staff';
    department?: string;
    password: string; // Stockée de manière sécurisée (hashée)
  }
  
  // Interface pour les départements
  export interface Department {
    id: string;
    name: string;
    headOfDepartment?: string; // ID de l'utilisateur chef de département
  }
  
  // Interface pour les classes/promotions
  export interface Class {
    id: string;
    name: string;
    level: string; // ex: 'L1', 'L2', 'M1', etc.
    departmentId: string;
    numberOfStudents: number;
  }
  
  // Interface pour les salles
  export interface Room {
    id: string;
    name: string;
    building: string;
    capacity: number;
    features: string[]; // ex: ['projecteur', 'tableau interactif', 'ordinateurs']
    availability?: RoomAvailability[];
  }
  
  // Interface pour la disponibilité des salles
  export interface RoomAvailability {
    roomId: string;
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string; // Raison si non disponible (maintenance, réservation fixe, etc.)
  }
  
  // Interface pour les cours
  export interface Course {
    id: string;
    name: string;
    code: string;
    professorId: string;
    departmentId: string;
    classIds: string[]; // Classes qui suivent ce cours
    durationHours: number;
    requiredFeatures?: string[]; // Caractéristiques requises pour la salle
    preferredRooms?: string[]; // Salles préférées pour ce cours
  }
  
  // Interface pour les sessions de cours (un cours planifié)
  export interface CourseSession {
    id: string;
    courseId: string;
    roomId: string;
    day: string;
    startTime: string;
    endTime: string;
    recurrence: 'once' | 'weekly' | 'biweekly'; // Type de récurrence
    startDate: Date;
    endDate?: Date; // Date de fin optionnelle
    status: 'scheduled' | 'cancelled' | 'rescheduled';
  }
  
  // Interface pour les conflits d'emploi du temps
  export interface ScheduleConflict {
    id: string;
    type: 'room' | 'professor' | 'class';
    description: string;
    courseSessionIds: string[]; // Les sessions en conflit
    resolved: boolean;
  }
  
  // Interface pour les notifications
  export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent';
    createdAt: Date;
    read: boolean;
    relatedToSessionId?: string; // Session concernée par la notification
  }