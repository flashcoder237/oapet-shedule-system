'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AnimatedBackground from '@/components/ui/animated-background';
import { Plus, Settings2 } from 'lucide-react';

// Import des composants créés
import {
  FloatingHeader,
  FiltersSection,
  FloatingStats,
  SessionCard,
  FloatingAIDetector,
  SessionForm,
  ScheduleGrid,
  ManagementPanel
} from './components';

// Import des services API
import { scheduleService } from '@/lib/api/services/schedules';
import { courseService } from '@/lib/api/services/courses';
import { roomService } from '@/lib/api/services/rooms';

// Import des types
import { 
  ScheduleSession as ApiScheduleSession, 
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
    try {
      let data;
      
      if (viewMode === 'week') {
        const weekStart = scheduleService.getWeekStart(selectedDate);
        data = await scheduleService.getWeeklySessions({
          week_start: weekStart,
          curriculum: selectedCurriculum
        });
        
        const allSessions = data?.sessions_by_day ? Object.values(data.sessions_by_day).flat() as ScheduleSession[] : [];
        console.log('WEEKLY SESSIONS LOADED:', allSessions.length, allSessions);
        setSessions(allSessions);
        setWeeklyData(data);
      } else if (viewMode === 'day') {
        const dateStr = scheduleService.formatDate(selectedDate);
        data = await scheduleService.getDailySessions({
          date: dateStr,
          curriculum: selectedCurriculum
        });
        
        const sessions = data?.sessions || [];
        console.log('DAILY SESSIONS LOADED:', sessions.length, sessions);
        setSessions(sessions);
        setDailyData(data);
      } else {
        // Mode mois - pour l'instant, même logique que semaine
        const weekStart = scheduleService.getWeekStart(selectedDate);
        data = await scheduleService.getWeeklySessions({
          week_start: weekStart,
          curriculum: selectedCurriculum
        });
        
        const allSessions = data?.sessions_by_day ? Object.values(data.sessions_by_day).flat() as ScheduleSession[] : [];
        setSessions(allSessions);
      }

      // Détecter les conflits
      if (data && (data.results?.length > 0 || data.sessions?.length > 0 || data.sessions_by_day)) {
        await detectConflicts();
      }

    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de charger les sessions",
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
      const currentWeekStart = scheduleService.getWeekStart(selectedDate);
      const dayIndex = dayNames.findIndex(d => d === day.toLowerCase());
      
      if (dayIndex === -1) {
        throw new Error('Jour invalide');
      }
      
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1)); // Dimanche = 6, Lundi = 0, etc.
      
      // Calculer l'heure de fin basée sur la durée originale
      const originalStart = session.specific_start_time || session.time_slot_details?.start_time;
      const originalEnd = session.specific_end_time || session.time_slot_details?.end_time;
      
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
        if (otherSession.id === session.id) return false; // Ignorer la session qu'on déplace
        
        // Vérifier si c'est le même jour
        const otherDate = otherSession.specific_date;
        if (otherDate !== newDateStr) return false;
        
        // Vérifier le chevauchement temporel
        const otherStart = otherSession.specific_start_time;
        const otherEnd = otherSession.specific_end_time;
        
        if (!otherStart || !otherEnd) return false;
        
        // Convertir en minutes pour comparaison
        const [newStartH, newStartM] = time.split(':').map(Number);
        const [newEndH, newEndM] = endTime.split(':').map(Number);
        const [otherStartH, otherStartM] = otherStart.split(':').map(Number);
        const [otherEndH, otherEndM] = otherEnd.split(':').map(Number);
        const newStartMinutes = newStartH * 60 + newStartM;
        const newEndMinutes = newEndH * 60 + newEndM;
        const otherStartMinutes = otherStartH * 60 + otherStartM;
        const otherEndMinutes = otherEndH * 60 + otherEndM;
        
        // Vérification de chevauchement: nouvelles heures chevauchent avec les heures existantes
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
      
      // Mettre à jour sur le serveur
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
      
      setHasChanges(true);
      
      // Détecter les nouveaux conflits
      await detectConflicts();
      
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de déplacer la session",
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

        {/* Boutons d'actions en mode édition */}
        <AnimatePresence>
          {editMode === 'edit' && (
            <>
              {/* Bouton d'ajout de session */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed bottom-40 left-6 z-50"
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

              {/* Bouton de gestion des ressources */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="fixed bottom-24 left-6 z-50"
              >
                <Button
                  onClick={() => setShowManagementPanel(true)}
                  className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 p-0"
                  title="Gérer les cours, enseignants et salles"
                >
                  <Settings2 className="h-6 w-6 text-white" />
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Composants flottants */}
        <FloatingHeader
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
          addToast={addToast}
        />

        <FloatingStats
          sessions={filteredSessions}
          conflicts={backendConflicts}
        />

        <FloatingAIDetector
          conflicts={backendConflicts}
          onResolve={(conflict) => {
            // TODO: Implémenter la résolution de conflits
            console.log('Résoudre conflit:', conflict);
          }}
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
      </div>
    </div>
  );
}