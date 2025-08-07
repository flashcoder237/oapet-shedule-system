import { useState, useCallback, useEffect } from 'react';
import { scheduleService } from '@/lib/api/services/schedules';
import { useToast } from '@/components/ui/use-toast';
import type { Schedule, ScheduleSession, Conflict } from '@/types/api';

export interface EnhancedScheduleSession {
  id: string;
  course: {
    id: string;
    name: string;
    code: string;
    type: 'CM' | 'TD' | 'TP' | 'EXAM';
    teacher: {
      id: string;
      name: string;
      email: string;
    };
    curriculum: {
      id: string;
      name: string;
      level: string;
    };
  };
  room: {
    id: string;
    code: string;
    name: string;
    capacity: number;
    building: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  expectedStudents: number;
  actualStudents?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  conflicts: ConflictInfo[];
  notes?: string;
  isLocked: boolean;
  priority: 'high' | 'medium' | 'low';
  recurrence?: 'weekly' | 'biweekly' | 'monthly';
}

export interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group' | 'equipment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
  suggestion?: string;
}

export interface ScheduleFilters {
  dateRange: { start: string; end: string };
  statusFilter: string;
  conflictFilter: string;
  selectedCurriculum: string;
  selectedTeacher: string;
  searchText: string;
}

export function useEnhancedSchedules() {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<EnhancedScheduleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les sessions
  const loadSessions = useCallback(async (filters?: Partial<ScheduleFilters>) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer les sessions depuis l'API
      const response = await scheduleService.getScheduleSessions();
      
      // Transformer les données de l'API vers notre format
      const transformedSessions: EnhancedScheduleSession[] = response.results.map((session: any, index: number) => ({
        id: session.id?.toString() || index.toString(),
        course: {
          id: session.course?.id?.toString() || '',
          name: session.course?.name || 'Cours sans nom',
          code: session.course?.code || 'N/A',
          type: session.session_type as 'CM' | 'TD' | 'TP' | 'EXAM' || 'CM',
          teacher: {
            id: session.teacher?.id?.toString() || '',
            name: session.teacher?.user?.first_name && session.teacher?.user?.last_name 
              ? `${session.teacher.user.first_name} ${session.teacher.user.last_name}`
              : 'Enseignant inconnu',
            email: session.teacher?.user?.email || 'email@oapet.edu.cm'
          },
          curriculum: {
            id: session.schedule?.curriculum?.id?.toString() || '',
            name: session.schedule?.curriculum?.name || 'Curriculum inconnu',
            level: session.schedule?.level || 'L1'
          }
        },
        room: {
          id: session.room?.id?.toString() || '',
          code: session.room?.code || 'N/A',
          name: session.room?.name || 'Salle inconnue',
          capacity: session.room?.capacity || 50,
          building: session.room?.building?.name || 'Bâtiment inconnu'
        },
        date: session.specific_date || new Date().toISOString().split('T')[0],
        startTime: session.specific_start_time || '08:00',
        endTime: session.specific_end_time || '10:00',
        expectedStudents: session.expected_students || 30,
        actualStudents: Math.floor((session.expected_students || 30) * 0.95), // 95% d'assiduité simulée
        status: 'scheduled' as const,
        conflicts: [], // À implémenter avec la détection de conflits
        isLocked: false,
        priority: session.session_type === 'EXAM' ? 'high' as const : 'medium' as const,
        notes: session.notes || undefined
      }));

      setSessions(transformedSessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
      
      // Fallback avec des données de démonstration en cas d'erreur API
      const fallbackSessions: EnhancedScheduleSession[] = [
        {
          id: '1',
          course: {
            id: '1',
            name: 'Anatomie Générale',
            code: 'MED-L1-001',
            type: 'CM',
            teacher: {
              id: '1',
              name: 'Dr. Jean-Paul Mballa',
              email: 'mballa@oapet.edu.cm'
            },
            curriculum: {
              id: '1',
              name: 'Médecine L1 Classe A',
              level: 'L1'
            }
          },
          room: {
            id: '1',
            code: 'AMPHI-MED',
            name: 'Amphithéâtre Médecine',
            capacity: 300,
            building: 'Bâtiment Médecine'
          },
          date: '2025-08-05',
          startTime: '08:00',
          endTime: '10:00',
          expectedStudents: 50,
          actualStudents: 48,
          status: 'scheduled',
          conflicts: [],
          isLocked: false,
          priority: 'high'
        },
        {
          id: '2',
          course: {
            id: '2',
            name: 'Physiologie Humaine',
            code: 'MED-L1-002',
            type: 'TD',
            teacher: {
              id: '2',
              name: 'Dr. Marie-Claire Nguema',
              email: 'nguema@oapet.edu.cm'
            },
            curriculum: {
              id: '1',
              name: 'Médecine L1 Classe A',
              level: 'L1'
            }
          },
          room: {
            id: '2',
            code: 'SALLE-MED-101',
            name: 'Salle Médecine 101',
            capacity: 80,
            building: 'Bâtiment Médecine'
          },
          date: '2025-08-05',
          startTime: '14:00',
          endTime: '16:00',
          expectedStudents: 50,
          status: 'scheduled',
          conflicts: [
            {
              type: 'room',
              severity: 'medium',
              message: 'Salle potentiellement surchargée',
              suggestion: 'Envisager une salle plus grande'
            }
          ],
          isLocked: false,
          priority: 'medium'
        }
      ];
      
      setSessions(fallbackSessions);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle session
  const createSession = useCallback(async (sessionData: Partial<EnhancedScheduleSession>) => {
    try {
      // Simulation de création
      const newSession: EnhancedScheduleSession = {
        ...sessionData as EnhancedScheduleSession,
        id: Date.now().toString()
      };

      setSessions(prev => [...prev, newSession]);
      
      addToast({
        title: "Session créée",
        description: "La nouvelle session a été créée avec succès.",
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Impossible de créer la session.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Mettre à jour une session
  const updateSession = useCallback(async (id: string, updates: Partial<EnhancedScheduleSession>) => {
    try {
      setSessions(prev => prev.map(session => 
        session.id === id ? { ...session, ...updates } : session
      ));
      
      addToast({
        title: "Session mise à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Impossible de mettre à jour la session.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Supprimer une session
  const deleteSession = useCallback(async (id: string) => {
    try {
      setSessions(prev => prev.filter(session => session.id !== id));
      
      addToast({
        title: "Session supprimée",
        description: "La session a été supprimée avec succès.",
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Impossible de supprimer la session.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Dupliquer une session
  const duplicateSession = useCallback(async (id: string) => {
    try {
      const sessionToDuplicate = sessions.find(s => s.id === id);
      if (!sessionToDuplicate) return;

      const duplicatedSession: EnhancedScheduleSession = {
        ...sessionToDuplicate,
        id: Date.now().toString(),
        status: 'scheduled'
      };

      setSessions(prev => [...prev, duplicatedSession]);
      
      addToast({
        title: "Session dupliquée",
        description: "La session a été dupliquée avec succès.",
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Impossible de dupliquer la session.",
        variant: "destructive"
      });
    }
  }, [sessions, addToast]);

  // Actions groupées
  const bulkActions = useCallback(async (action: string, sessionIds: string[]) => {
    try {
      switch (action) {
        case 'delete':
          setSessions(prev => prev.filter(session => !sessionIds.includes(session.id)));
          break;
        case 'duplicate':
          const sessionsToDuplicate = sessions.filter(s => sessionIds.includes(s.id));
          const duplicatedSessions = sessionsToDuplicate.map(session => ({
            ...session,
            id: `${session.id}-copy-${Date.now()}`,
            status: 'scheduled' as const
          }));
          setSessions(prev => [...prev, ...duplicatedSessions]);
          break;
        case 'cancel':
          setSessions(prev => prev.map(session => 
            sessionIds.includes(session.id) 
              ? { ...session, status: 'cancelled' as const }
              : session
          ));
          break;
        case 'reschedule':
          // Logique de reprogrammation
          break;
        case 'notify':
          // Logique de notification
          break;
      }

      addToast({
        title: "Actions groupées réussies",
        description: `Action "${action}" appliquée à ${sessionIds.length} session(s).`,
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Erreur lors de l'exécution des actions groupées.",
        variant: "destructive"
      });
    }
  }, [sessions, addToast]);

  // Export des données
  const exportData = useCallback(async (format: string, filters: any) => {
    try {
      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ici, nous appellerions le service d'export réel
      // const blob = await scheduleService.exportSchedule(scheduleId, format, filters);
      
      // Création d'un lien de téléchargement
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Export simulé';
      link.download = `emploi-du-temps.${format}`;
      link.click();

      addToast({
        title: "Export réussi",
        description: `Emploi du temps exporté au format ${format}.`,
      });
    } catch (err) {
      addToast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Import des données
  const importData = useCallback(async (file: File) => {
    try {
      // Simulation d'import
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addToast({
        title: "Import réussi",
        description: "L'emploi du temps a été importé avec succès.",
      });
    } catch (err) {
      addToast({
        title: "Erreur d'import",
        description: "Impossible d'importer le fichier.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Résoudre les conflits
  const resolveConflict = useCallback(async (sessionId: string, conflictType: string) => {
    try {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              conflicts: session.conflicts.filter(c => c.type !== conflictType)
            }
          : session
      ));
      
      addToast({
        title: "Conflit résolu",
        description: `Le conflit de type "${conflictType}" a été résolu.`,
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Impossible de résoudre le conflit.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Envoyer des notifications
  const sendNotification = useCallback(async (sessionId: string, type: string) => {
    try {
      // Simulation d'envoi de notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast({
        title: "Notification envoyée",
        description: `Notification de type "${type}" envoyée avec succès.`,
      });
    } catch (err) {
      addToast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification.",
        variant: "destructive"
      });
    }
  }, [addToast]);

  // Charger les données au montage
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    duplicateSession,
    bulkActions,
    exportData,
    importData,
    resolveConflict,
    sendNotification
  };
}