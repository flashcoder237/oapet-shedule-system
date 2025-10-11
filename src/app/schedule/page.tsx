'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AnimatedBackground from '@/components/ui/animated-background';
import { Plus, Settings2, X, Calendar } from 'lucide-react';

// Import des composants créés
import {
  FloatingHeader,
  FiltersSection,
  FloatingStats,
  SessionCard,
  FloatingAIDetector,
  SessionForm,
  ScheduleGrid,
  ManagementPanel,
  UnifiedFloatingMenu
} from './components';

// Import des services API
import { scheduleService } from '@/lib/api/services/schedules';
import { occurrenceService } from '@/lib/api/services/occurrences';
import { courseService } from '@/lib/api/services/courses';
import { roomService } from '@/lib/api/services/rooms';

// Import du système de feature flags
import { FEATURE_FLAGS, debugLog, getActiveSystem } from '@/lib/featureFlags';

// Import du générateur IA
import { AIScheduleGenerator } from '@/components/scheduling/AIScheduleGenerator';

// Import des composants de gestion des occurrences
import ScheduleGenerationConfig from '@/components/scheduling/ScheduleGenerationConfig';
import OccurrenceManager from '@/components/scheduling/OccurrenceManager';

// Import des types
import {
  ScheduleSession as ApiScheduleSession,
  SessionOccurrence,
  Teacher,
  Course,
  Room,
  TimeSlot
} from '@/types/api';

// Types locaux
interface Curriculum {
  id: number;
  code: string;
  name: string;
  level: string;
  department: {
    name: string;
  };
}

type ScheduleSession = ApiScheduleSession;
type FilterType = 'all' | 'CM' | 'TD' | 'TP' | 'EXAM';
type ViewMode = 'week' | 'day' | 'month';
type EditMode = 'view' | 'edit' | 'drag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function SchedulePage() {
  // États principaux
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  // États de vue et mode
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // États pour les données auxiliaires
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // États de conflit et statistiques
  const [backendConflicts, setBackendConflicts] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  
  // États d'édition
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedSession, setDraggedSession] = useState<ScheduleSession | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: string; time: string; y?: number; isValid?: boolean } | null>(null);
  
  // États de filtrage
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // États de formulaire
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduleSession | null>(null);
  const [showManagementPanel, setShowManagementPanel] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // États pour les nouveaux composants d'occurrences
  const [showGenerationConfig, setShowGenerationConfig] = useState(false);
  const [showOccurrenceManager, setShowOccurrenceManager] = useState(false);

  const { addToast } = useToast();

  // Génération d'une grille très fine (intervalles de 5 minutes) sur horaires réduits
  const generateTimeSlots = () => {
    const slots = [];
    // Horaires concentrés de 8h à 19h avec intervalles de 10 minutes
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fonctions de chargement des données
  const loadCurricula = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/curricula/`);
      if (!response.ok) throw new Error('Erreur lors du chargement des curricula');
      const data = await response.json();
      setCurricula(data.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des curricula:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de charger les classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAuxiliaryData = async () => {
    try {
      const [coursesResponse, teachersResponse, roomsResponse] = await Promise.all([
        courseService.getCourses(),
        courseService.getTeachers(),
        roomService.getRooms()
      ]);
      
      setCourses(coursesResponse.results || []);
      setTeachers(teachersResponse.results || []);
      setRooms(roomsResponse.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données auxiliaires:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de charger certaines données",
        variant: "destructive"
      });
    }
  };

  const loadSessions = async () => {
    if (!selectedCurriculum) {
      setSessions([]);
      setFilteredSessions([]);
      return;
    }

    setSessionsLoading(true);
    const systemType = getActiveSystem();
    debugLog(`Loading ${systemType} for curriculum ${selectedCurriculum}`, { viewMode, selectedDate });

    try {
      let data;

      // ===== NOUVEAU SYSTÈME (Occurrences) =====
      if (FEATURE_FLAGS.USE_OCCURRENCES_SYSTEM) {
        debugLog('Using NEW occurrences system');

        // Récupérer le schedule ID à partir du curriculum code
        let scheduleId: number | undefined;
        try {
          const schedule = await scheduleService.getScheduleByCurriculum(selectedCurriculum);
          scheduleId = schedule.id;
          debugLog('Schedule found for curriculum', selectedCurriculum, 'ID:', scheduleId);
        } catch (error) {
          console.error('No schedule found for curriculum:', selectedCurriculum, error);
          // Si pas de schedule, essayer de parser comme ID directement
          const parsedId = parseInt(selectedCurriculum);
          scheduleId = isNaN(parsedId) ? undefined : parsedId;
        }

        if (viewMode === 'week') {
          const weekStart = occurrenceService.getWeekStart(selectedDate);
          data = await occurrenceService.getWeeklyOccurrences({
            week_start: weekStart,
            schedule: scheduleId
          });

          // Convertir les occurrences en format compatible avec l'ancien système
          const allOccurrences = data?.occurrences_by_day
            ? Object.values(data.occurrences_by_day).flat() as SessionOccurrence[]
            : [];

          debugLog('WEEKLY OCCURRENCES LOADED:', allOccurrences.length, allOccurrences);

          console.log('🔍 RAW OCCURRENCE SAMPLE (before adaptation):', allOccurrences[0]);

          // Adapter les occurrences pour qu'elles ressemblent aux sessions
          const adaptedSessions = allOccurrences.map((occ: any) => ({
            ...occ,
            // Ajouter les champs manquants pour compatibilité
            schedule: occ.session_template,
            course: occ.session_template_details?.course || 0,
            specific_date: occ.actual_date,
            specific_start_time: occ.start_time,
            specific_end_time: occ.end_time,
            session_type: occ.session_template_details?.session_type || 'CM',
            expected_students: occ.session_template_details?.expected_students || 0,
            // Adapter les détails de cours depuis le format simplifié
            course_details: {
              code: occ.course_code,
              name: occ.course_name,
            },
            room_details: {
              code: occ.room_code,
            },
            teacher_details: {
              user_details: {
                last_name: occ.teacher_name,
              },
            },
            // Garder les données d'origine pour le composant
            __is_occurrence: true,
          })) as any[];

          console.log('✅ ADAPTED SESSION SAMPLE (after adaptation):', adaptedSessions[0]);

          setSessions(adaptedSessions);
          setWeeklyData(data);

        } else if (viewMode === 'day') {
          // Le scheduleId a déjà été récupéré ci-dessus
          const dateStr = occurrenceService.formatDate(selectedDate);
          data = await occurrenceService.getDailyOccurrences({
            date: dateStr,
            schedule: scheduleId
          });

          const occurrences = data?.occurrences || [];
          debugLog('DAILY OCCURRENCES LOADED:', occurrences.length, occurrences);

          // Adapter les occurrences
          const adaptedSessions = occurrences.map((occ: any) => ({
            ...occ,
            schedule: occ.session_template,
            course: occ.session_template_details?.course || 0,
            specific_date: occ.actual_date,
            specific_start_time: occ.start_time,
            specific_end_time: occ.end_time,
            session_type: occ.session_template_details?.session_type || 'CM',
            expected_students: occ.session_template_details?.expected_students || 0,
            // Adapter les détails de cours depuis le format simplifié
            course_details: {
              code: occ.course_code,
              name: occ.course_name,
            },
            room_details: {
              code: occ.room_code,
            },
            teacher_details: {
              user_details: {
                last_name: occ.teacher_name,
              },
            },
            __is_occurrence: true,
          })) as any[];

          setSessions(adaptedSessions);
          setDailyData(data);
        }
      }
      // ===== ANCIEN SYSTÈME (Sessions) =====
      else {
        debugLog('Using OLD sessions system');

        if (viewMode === 'week') {
          const weekStart = scheduleService.getWeekStart(selectedDate);
          data = await scheduleService.getWeeklySessions({
            week_start: weekStart,
            curriculum: selectedCurriculum
          });

          const allSessions = data?.sessions_by_day
            ? Object.values(data.sessions_by_day).flat() as ScheduleSession[]
            : [];
          debugLog('WEEKLY SESSIONS LOADED:', allSessions.length, allSessions);
          setSessions(allSessions);
          setWeeklyData(data);

        } else if (viewMode === 'day') {
          const dateStr = scheduleService.formatDate(selectedDate);
          data = await scheduleService.getDailySessions({
            date: dateStr,
            curriculum: selectedCurriculum
          });

          const sessions = data?.sessions || [];
          debugLog('DAILY SESSIONS LOADED:', sessions.length, sessions);
          setSessions(sessions);
          setDailyData(data);

        } else {
          // Mode mois - pour l'instant, même logique que semaine
          const weekStart = scheduleService.getWeekStart(selectedDate);
          data = await scheduleService.getWeeklySessions({
            week_start: weekStart,
            curriculum: selectedCurriculum
          });

          const allSessions = data?.sessions_by_day
            ? Object.values(data.sessions_by_day).flat() as ScheduleSession[]
            : [];
          setSessions(allSessions);
        }
      }

      // Détecter les conflits
      if (data && (data.results?.length > 0 || data.sessions?.length > 0 || data.sessions_by_day || data.occurrences_by_day)) {
        await detectConflicts();
      }

    } catch (error) {
      console.error(`Erreur lors du chargement des ${systemType}:`, error);
      addToast({
        title: "Erreur",
        description: `Impossible de charger les ${systemType === 'occurrences' ? 'occurrences' : 'sessions'}`,
        variant: "destructive"
      });
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const detectConflicts = async () => {
    try {
      const response = await scheduleService.getConflicts();
      setBackendConflicts(response.results || []);
    } catch (error) {
      console.error('Erreur lors de la détection des conflits:', error);
      setBackendConflicts([]);
    }
  };

  // Gestion des sessions
  const handleSessionSave = async (formData: any) => {
    try {
      const sessionData = {
        course: formData.course,
        teacher: formData.teacher,
        room: formData.room,
        day: formData.day,
        specific_start_time: formData.startTime,
        specific_end_time: formData.endTime,
        session_type: formData.sessionType,
        expected_students: formData.expectedStudents,
        notes: formData.notes
      };

      if (editingSession) {
        await scheduleService.updateScheduleSession(editingSession.id, sessionData);
        addToast({
          title: "Succès",
          description: "Session modifiée avec succès",
          variant: "default"
        });
      } else {
        await scheduleService.createScheduleSession(sessionData);
        addToast({
          title: "Succès", 
          description: "Session créée avec succès",
          variant: "default"
        });
      }

      setShowSessionForm(false);
      setEditingSession(null);
      await loadSessions();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de sauvegarder la session",
        variant: "destructive"
      });
    }
  };

  const handleSessionEdit = (session: ScheduleSession) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleSessionDelete = async (sessionId: number) => {
    // Dans le nouveau système, on annule l'occurrence au lieu de la supprimer
    if (FEATURE_FLAGS.USE_OCCURRENCES_SYSTEM) {
      const reason = prompt('Raison de l\'annulation :');
      if (!reason) return;

      try {
        await occurrenceService.cancelOccurrence(sessionId, {
          reason,
          notify_students: true,
          notify_teacher: true
        });
        addToast({
          title: "Succès",
          description: "Séance annulée avec succès",
          variant: "default"
        });
        await loadSessions();
      } catch (error: any) {
        console.error('Erreur lors de l\'annulation:', error);
        addToast({
          title: "Erreur",
          description: error.response?.data?.message || "Impossible d'annuler la séance",
          variant: "destructive"
        });
      }
    }
    // Ancien système : suppression classique
    else {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;

      try {
        await scheduleService.deleteScheduleSession(sessionId);
        addToast({
          title: "Succès",
          description: "Session supprimée avec succès",
          variant: "default"
        });
        await loadSessions();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        addToast({
          title: "Erreur",
          description: "Impossible de supprimer la session",
          variant: "destructive"
        });
      }
    }
  };

  const handleSessionDuplicate = (session: ScheduleSession) => {
    const { id, ...duplicatedSession } = session;
    setEditingSession(duplicatedSession as ScheduleSession);
    setShowSessionForm(true);
  };

  // Gestion du drag & drop
  const handleSessionDrop = async (day: string, time: string, session: ScheduleSession) => {
    try {
      // Convertir le jour en date spécifique
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      const currentWeekStart = FEATURE_FLAGS.USE_OCCURRENCES_SYSTEM
        ? occurrenceService.getWeekStart(selectedDate)
        : scheduleService.getWeekStart(selectedDate);
      const dayIndex = dayNames.findIndex(d => d === day.toLowerCase());

      if (dayIndex === -1) {
        throw new Error('Jour invalide');
      }

      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1));

      // Calculer l'heure de fin basée sur la durée originale
      const originalStart = session.specific_start_time || (session as any).time_slot_details?.start_time;
      const originalEnd = session.specific_end_time || (session as any).time_slot_details?.end_time;

      let endTime = time;
      if (originalStart && originalEnd) {
        const [startH, startM] = originalStart.split(':').map(Number);
        const [endH, endM] = originalEnd.split(':').map(Number);
        const [newStartH, newStartM] = time.split(':').map(Number);

        const originalDuration = (endH * 60 + endM) - (startH * 60 + startM);
        const newEndMinutes = (newStartH * 60 + newStartM) + originalDuration;

        const endHour = Math.floor(newEndMinutes / 60);
        const endMinute = newEndMinutes % 60;
        endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      }

      // Vérifier les chevauchements avant de faire le déplacement
      const newDateStr = newDate.toISOString().split('T')[0];
      const hasOverlap = sessions.some(otherSession => {
        if (otherSession.id === session.id) return false;

        const otherDate = otherSession.specific_date;
        if (otherDate !== newDateStr) return false;

        const otherStart = otherSession.specific_start_time;
        const otherEnd = otherSession.specific_end_time;

        if (!otherStart || !otherEnd) return false;

        const [newStartH, newStartM] = time.split(':').map(Number);
        const [newEndH, newEndM] = endTime.split(':').map(Number);
        const [otherStartH, otherStartM] = otherStart.split(':').map(Number);
        const [otherEndH, otherEndM] = otherEnd.split(':').map(Number);
        const newStartMinutes = newStartH * 60 + newStartM;
        const newEndMinutes = newEndH * 60 + newEndM;
        const otherStartMinutes = otherStartH * 60 + otherStartM;
        const otherEndMinutes = otherEndH * 60 + otherEndM;

        return (newStartMinutes < otherEndMinutes && newEndMinutes > otherStartMinutes);
      });

      if (hasOverlap) {
        addToast({
          title: "Conflit détecté",
          description: "Une autre session occupe déjà ce créneau horaire",
          variant: "destructive"
        });
        return;
      }

      // Mettre à jour localement d'abord pour un feedback immédiat
      const updatedSessions = sessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            specific_date: newDateStr,
            specific_start_time: time,
            specific_end_time: endTime
          };
        }
        return s;
      });
      setSessions(updatedSessions);

      // ===== NOUVEAU SYSTÈME : Modifier directement l'occurrence =====
      if (FEATURE_FLAGS.USE_OCCURRENCES_SYSTEM) {
        // Utiliser l'API PATCH pour modifier directement l'occurrence
        await apiClient.patch(`/schedules/occurrences/${session.id}/`, {
          actual_date: newDateStr,
          start_time: time,
          end_time: endTime,
        });

        addToast({
          title: "Succès",
          description: "Séance déplacée avec succès",
          variant: "default"
        });
      }
      // ===== ANCIEN SYSTÈME : Mettre à jour les champs =====
      else {
        const updateData = {
          specific_date: newDateStr,
          specific_start_time: time,
          specific_end_time: endTime
        };

        await scheduleService.updateScheduleSession(session.id, updateData);

        addToast({
          title: "Succès",
          description: "Session déplacée avec succès",
          variant: "default"
        });
      }

      setHasChanges(true);

      // Détecter les nouveaux conflits
      await detectConflicts();

    } catch (error: any) {
      console.error('Erreur lors du déplacement:', error);
      addToast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de déplacer la séance",
        variant: "destructive"
      });

      // Recharger les données originales en cas d'erreur
      await loadSessions();
    }
  };

  // Gestion du filtrage
  const applyFilters = () => {
    let filtered = [...sessions];

    // Filtre par type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(session => session.session_type === activeFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(session =>
        session.course_details?.name?.toLowerCase().includes(searchLower) ||
        session.course_details?.code?.toLowerCase().includes(searchLower) ||
        session.teacher_details?.user_details?.last_name?.toLowerCase().includes(searchLower) ||
        session.room_details?.code?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSessions(filtered);
  };

  // Gestion de l'export et import
  const handleExport = async () => {
    try {
      // TODO: Implémenter l'export
      addToast({
        title: "Info",
        description: "Fonctionnalité d'export en cours de développement",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const handleImport = () => {
    // TODO: Implémenter l'import
    addToast({
      title: "Info",
      description: "Fonctionnalité d'import en cours de développement",
      variant: "default"
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implémenter la sauvegarde des modifications
      setHasChanges(false);
      addToast({
        title: "Succès",
        description: "Modifications sauvegardées",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    }
  };

  const handleGenerateSchedule = () => {
    setShowAIGenerator(true);
  };

  // Effects
  useEffect(() => {
    loadCurricula();
    loadAuxiliaryData();
  }, []);

  useEffect(() => {
    if (selectedCurriculum) {
      loadSessions();
    }
  }, [selectedCurriculum, selectedDate, viewMode]);

  useEffect(() => {
    applyFilters();
  }, [sessions, activeFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto py-6 px-4 relative z-10">
        {/* En-tête principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Emplois du Temps
          </h1>
          <p className="text-gray-600">
            Gérez et organisez vos emplois du temps en temps réel
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Section de filtres */}
            <FiltersSection
              sessions={sessions}
              filteredSessions={filteredSessions}
              onFilterChange={setActiveFilter}
              activeFilter={activeFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {/* Grille de planning */}
            {selectedCurriculum ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {sessionsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Chargement des sessions...</p>
                  </div>
                ) : (
                  <>
                    {console.log('PASSING TO GRID:', { sessionsCount: filteredSessions.length, sessions: filteredSessions })}
                    <ScheduleGrid
                      sessions={filteredSessions}
                      viewMode={viewMode}
                      editMode={editMode}
                      selectedDate={selectedDate}
                      timeSlots={timeSlots}
                      onSessionEdit={handleSessionEdit}
                      onSessionDelete={handleSessionDelete}
                      onSessionDuplicate={handleSessionDuplicate}
                      onDrop={handleSessionDrop}
                      conflicts={backendConflicts}
                    />
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Aucune classe sélectionnée
                </h3>
                <p className="text-gray-500">
                  Sélectionnez une classe pour afficher l'emploi du temps
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Boutons d'actions en mode édition/drag */}
        <AnimatePresence>
          {(editMode === 'edit' || editMode === 'drag') && (
            <>
              {/* Bouton d'ajout de session - repositionné */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed bottom-32 right-6 z-50"
              >
                <Button
                  onClick={() => {
                    setEditingSession(null);
                    setShowSessionForm(true);
                  }}
                  className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 p-0 mb-4"
                  title="Ajouter une session"
                >
                  <Plus className="h-6 w-6 text-white" />
                </Button>
              </motion.div>

              {/* Bouton de gestion des ressources - repositionné */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="fixed bottom-16 right-6 z-50"
              >
                <Button
                  onClick={() => setShowManagementPanel(true)}
                  className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 p-0"
                  title="Gérer les cours, enseignants et salles"
                >
                  <Settings2 className="h-6 w-6 text-white" />
                </Button>
              </motion.div>

              {/* Indicateur de mode drag/edit */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="fixed top-32 right-6 z-40"
              >
                <div className={`px-3 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
                  editMode === 'edit' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600'
                }`}>
                  {editMode === 'edit' ? '✏️ Mode Édition' : '🖱️ Mode Drag'}
                </div>
              </motion.div>

              {/* Instructions de drag & drop */}
              {editMode === 'drag' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="fixed top-48 right-6 z-40 max-w-xs"
                >
                  <div className="bg-white rounded-lg shadow-lg border p-3 text-xs">
                    <div className="font-medium text-gray-800 mb-1">💡 Instructions</div>
                    <div className="text-gray-600 space-y-1">
                      <div>• Cliquez et glissez un cours</div>
                      <div>• 🟢 Vert = Position valide</div>
                      <div>• 🔴 Rouge = Conflit détecté</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Menu flottant unifié */}
        <UnifiedFloatingMenu
          selectedClass={selectedCurriculum}
          onClassChange={setSelectedCurriculum}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onExport={handleExport}
          onImport={handleImport}
          editMode={editMode}
          onEditModeChange={setEditMode}
          onSave={handleSave}
          hasChanges={hasChanges}
          curricula={curricula}
          conflicts={backendConflicts}
          sessions={filteredSessions}
          addToast={addToast}
          onGenerateSchedule={handleGenerateSchedule}
          onShowGenerationConfig={() => setShowGenerationConfig(true)}
          onShowOccurrenceManager={() => setShowOccurrenceManager(true)}
        />

        {/* Formulaire de session */}
        <SessionForm
          isOpen={showSessionForm}
          onClose={() => {
            setShowSessionForm(false);
            setEditingSession(null);
          }}
          onSave={handleSessionSave}
          editingSession={editingSession}
          courses={courses}
          teachers={teachers}
          rooms={rooms}
        />

        {/* Panneau de gestion des ressources */}
        <ManagementPanel
          isOpen={showManagementPanel}
          onClose={() => setShowManagementPanel(false)}
          onDataUpdate={loadAuxiliaryData}
          addToast={addToast}
        />

        {/* Générateur IA d'emploi du temps */}
        {showAIGenerator && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Generateur IA d'Emploi du Temps
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIGenerator(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <AIScheduleGenerator
                  selectedClass={selectedCurriculum}
                  onScheduleGenerated={() => {
                    setShowAIGenerator(false);
                    loadSessions();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Configuration de génération d'emploi du temps */}
        {showGenerationConfig && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ⚙️ Configuration de Génération
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGenerationConfig(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <ScheduleGenerationConfig
                  scheduleId={parseInt(selectedCurriculum) || 1}
                  onConfigSaved={() => {
                    setShowGenerationConfig(false);
                    addToast({
                      title: "Succès",
                      description: "Configuration sauvegardée. Vous pouvez maintenant générer l'emploi du temps.",
                      variant: "default"
                    });
                    loadSessions();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Gestionnaire d'occurrences */}
        {showOccurrenceManager && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📋 Gestion des Séances
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOccurrenceManager(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <OccurrenceManager
                  scheduleId={parseInt(selectedCurriculum)}
                  dateFrom={scheduleService.formatDate(
                    new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000)
                  )}
                  dateTo={scheduleService.formatDate(
                    new Date(selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}