'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Copy,
  GripVertical,
  Bot,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AIConflictDetector } from './AIConflictDetector';

interface EnhancedScheduleSession {
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

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group' | 'equipment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
  suggestion?: string;
}

interface ModernScheduleGridProps {
  sessions: EnhancedScheduleSession[];
  onSessionUpdate: (id: string, updates: Partial<EnhancedScheduleSession>) => Promise<void>;
  onSessionEdit: (session: EnhancedScheduleSession) => void;
  onSessionDelete: (id: string) => Promise<void>;
  onSessionDuplicate: (id: string) => Promise<void>;
  onSessionSelect: (sessionIds: string[]) => void;
  selectedSessions: string[];
  isEditMode: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Lundi', shortLabel: 'LUN' },
  { key: 'tuesday', label: 'Mardi', shortLabel: 'MAR' },
  { key: 'wednesday', label: 'Mercredi', shortLabel: 'MER' },
  { key: 'thursday', label: 'Jeudi', shortLabel: 'JEU' },
  { key: 'friday', label: 'Vendredi', shortLabel: 'VEN' },
  { key: 'saturday', label: 'Samedi', shortLabel: 'SAM' }
];

// Horaires standards pour les universités (07:30 à 18:30)
const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  '17:30', '18:00', '18:30'
];

export function ModernScheduleGrid({
  sessions,
  onSessionUpdate,
  onSessionEdit,
  onSessionDelete,
  onSessionDuplicate,
  onSessionSelect,
  selectedSessions,
  isEditMode
}: ModernScheduleGridProps) {
  const [draggedSession, setDraggedSession] = useState<string | null>(null);
  const [showAIDetector, setShowAIDetector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Organiser les sessions par jour de la semaine
  const sessionsByDay = useMemo(() => {
    const dayMapping = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday'
    };

    const organized: Record<string, EnhancedScheduleSession[]> = {};
    DAYS.forEach(day => {
      organized[day.key] = [];
    });

    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const dayKey = dayMapping[sessionDate.getDay() as keyof typeof dayMapping];
      if (organized[dayKey]) {
        organized[dayKey].push(session);
      }
    });

    // Trier les sessions de chaque jour par heure
    Object.keys(organized).forEach(dayKey => {
      organized[dayKey].sort((a, b) => {
        const timeA = a.startTime;
        const timeB = b.startTime;
        return timeA.localeCompare(timeB);
      });
    });

    return organized;
  }, [sessions]);

  // Convertir l'heure en minutes depuis minuit
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculer la position d'une session dans la grille
  const getSessionPosition = (session: EnhancedScheduleSession) => {
    const startMinutes = timeToMinutes(session.startTime);
    const endMinutes = timeToMinutes(session.endTime);
    const firstSlotMinutes = timeToMinutes(TIME_SLOTS[0]); // 07:30 = 450 minutes
    
    const startRow = Math.max(0, Math.floor((startMinutes - firstSlotMinutes) / 30));
    const duration = Math.max(1, Math.ceil((endMinutes - startMinutes) / 30));
    
    return { startRow, duration };
  };

  // Obtenir la couleur selon le type de cours
  const getCourseTypeColor = (type: string, hasConflict: boolean = false) => {
    const baseColors = {
      'CM': hasConflict ? 'bg-red-100 border-red-400 text-red-800' : 'bg-blue-100 border-blue-400 text-blue-800',
      'TD': hasConflict ? 'bg-red-100 border-red-400 text-red-800' : 'bg-green-100 border-green-400 text-green-800',
      'TP': hasConflict ? 'bg-red-100 border-red-400 text-red-800' : 'bg-purple-100 border-purple-400 text-purple-800',
      'EXAM': hasConflict ? 'bg-red-200 border-red-500 text-red-900' : 'bg-orange-100 border-orange-400 text-orange-800',
    };
    return baseColors[type as keyof typeof baseColors] || baseColors.CM;
  };

  // Gestion du drag & drop
  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    if (!isEditMode) return;
    setDraggedSession(sessionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sessionId);
  };

  const handleDrop = async (e: React.DragEvent, dayKey: string, timeSlot: string) => {
    e.preventDefault();
    if (!draggedSession || !isEditMode) return;

    const session = sessions.find(s => s.id === draggedSession);
    if (!session) return;

    // Calculer la nouvelle date basée sur le jour
    const today = new Date();
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const dayOffset = DAYS.findIndex(d => d.key === dayKey);
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + dayOffset);

    await onSessionUpdate(draggedSession, {
      date: newDate.toISOString().split('T')[0],
      startTime: timeSlot
    });

    setDraggedSession(null);
  };

  // Rendu d'une session
  const renderSession = (session: EnhancedScheduleSession) => {
    const { startRow, duration } = getSessionPosition(session);
    const hasConflicts = session.conflicts.length > 0;
    const isSelected = selectedSessions.includes(session.id);
    const isDragging = draggedSession === session.id;

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isDragging ? 0.7 : 1, 
          scale: isDragging ? 1.02 : 1 
        }}
        drag={isEditMode}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={(e) => handleDragStart(e as any, session.id)}
        className={`
          absolute left-1 right-1 rounded-lg border-2 shadow-sm transition-all duration-200 cursor-pointer
          ${getCourseTypeColor(session.course.type, hasConflicts)}
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${isDragging ? 'shadow-xl z-50' : 'hover:shadow-md z-10'}
          ${isEditMode ? 'hover:scale-102 cursor-grab active:cursor-grabbing' : ''}
        `}
        style={{
          top: `${startRow * 32 + 2}px`,
          height: `${duration * 32 - 4}px`,
          minHeight: '28px'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.ctrlKey || e.metaKey) {
            // Multi-sélection avec Ctrl/Cmd
            const newSelection = isSelected 
              ? selectedSessions.filter(id => id !== session.id)
              : [...selectedSessions, session.id];
            onSessionSelect(newSelection);
          } else {
            onSessionSelect(isSelected ? [] : [session.id]);
          }
        }}
        whileHover={{ scale: isEditMode ? 1.02 : 1.01 }}
      >
        <div className="p-2 h-full flex flex-col justify-between">
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="secondary" className="text-xs font-bold px-1 py-0">
                {session.course.type}
              </Badge>
              {hasConflicts && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        {session.conflicts.map((conflict, i) => (
                          <p key={i} className="text-xs">• {conflict.message}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="text-xs font-semibold leading-tight mb-1 line-clamp-2">
              {session.course.name}
            </div>

            <div className="text-xs space-y-0.5 text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">
                  {session.startTime}-{session.endTime}
                </span>
              </div>
              
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate font-medium">{session.room.code}</span>
              </div>
              
              {duration >= 3 && (
                <div className="flex items-center gap-1 truncate">
                  <User className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="truncate">{session.course.teacher.name.split(' ').pop()}</span>
                </div>
              )}
            </div>
          </div>

          {duration >= 4 && (
            <div className="text-xs text-gray-600 pt-1 border-t border-gray-300 text-center truncate">
              {session.course.curriculum.name}
            </div>
          )}

          {isEditMode && (
            <div className="absolute top-1 right-1 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionEdit(session);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <div className="h-5 w-5 bg-white/80 rounded flex items-center justify-center">
                <GripVertical className="h-3 w-3 text-gray-500" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Transformer les conflits pour l'IA
  const aiConflicts = sessions.reduce((acc, session) => {
    session.conflicts.forEach(conflict => {
      acc.push({
        ...conflict,
        sessionIds: [session.id]
      });
    });
    return acc;
  }, [] as any[]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                📅 Emploi du Temps - Faculté de Médecine OAPET
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border-2 border-blue-400 rounded"></div>
                  <span>CM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border-2 border-green-400 rounded"></div>
                  <span>TD</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-100 border-2 border-purple-400 rounded"></div>
                  <span>TP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border-2 border-orange-400 rounded"></div>
                  <span>EXAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span>Conflits</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIDetector(!showAIDetector)}
                className="gap-2"
              >
                <Bot className="h-4 w-4" />
                Assistant IA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {isEditMode && (
            <div className="mt-3 p-2 bg-blue-100 rounded-lg text-sm text-blue-800 flex items-center gap-2">
              <GripVertical className="h-4 w-4" />
              Mode édition actif - Glissez-déposez les cours pour les reprogrammer
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 border-b-2 border-gray-200">
                <div className="p-3 bg-gray-100 border-r border-gray-200 text-center font-semibold text-gray-700">
                  Horaires
                </div>
                {DAYS.map(day => (
                  <div key={day.key} className="p-3 bg-gray-50 border-r border-gray-200 last:border-r-0 text-center">
                    <div className="font-bold text-gray-900">{day.shortLabel}</div>
                    <div className="text-xs text-gray-600 mt-1">{day.label}</div>
                  </div>
                ))}
              </div>

              {/* Grille horaire */}
              <div className="grid grid-cols-7" style={{ height: `${TIME_SLOTS.length * 32}px` }}>
                {/* Colonne des horaires */}
                <div className="border-r-2 border-gray-200 bg-gray-50">
                  {TIME_SLOTS.map((time, index) => (
                    <div 
                      key={time}
                      className="h-8 flex items-center justify-center text-xs font-mono text-gray-600 border-b border-gray-100"
                      style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* Colonnes des jours */}
                {DAYS.map((day, dayIndex) => (
                  <div 
                    key={day.key}
                    className="border-r border-gray-200 last:border-r-0 relative"
                    onDrop={(e) => {
                      if (draggedSession) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const slotIndex = Math.floor(y / 32);
                        const targetTime = TIME_SLOTS[Math.max(0, Math.min(slotIndex, TIME_SLOTS.length - 1))];
                        handleDrop(e, day.key, targetTime);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                  >
                    {/* Lignes de fond pour les créneaux */}
                    {TIME_SLOTS.map((_, index) => (
                      <div
                        key={index}
                        className="absolute left-0 right-0 h-8 border-b border-gray-100"
                        style={{ 
                          top: `${index * 32}px`,
                          backgroundColor: index % 2 === 0 ? '#fbfcfd' : '#ffffff'
                        }}
                      />
                    ))}

                    {/* Sessions du jour */}
                    {sessionsByDay[day.key]?.map(session => renderSession(session))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistiques en pied de page */}
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <span>📊 Total: <strong>{sessions.length}</strong> sessions</span>
                <span>⚠️ Conflits: <strong className={sessions.some(s => s.conflicts.length > 0) ? 'text-red-600' : 'text-green-600'}>
                  {sessions.reduce((acc, s) => acc + s.conflicts.length, 0)}
                </strong></span>
                <span>👥 Sélectionnées: <strong>{selectedSessions.length}</strong></span>
              </div>
              <div className="text-gray-500">
                🎓 Système OAPET © 2025
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assistant IA */}
      <AIConflictDetector
        conflicts={aiConflicts}
        isVisible={showAIDetector}
        onToggleVisibility={() => setShowAIDetector(!showAIDetector)}
        onResolveConflict={async (conflictType) => {
          console.log('Résolution conflit IA:', conflictType);
        }}
        onApplySuggestion={async (suggestionId) => {
          console.log('Application suggestion IA:', suggestionId);
        }}
      />
    </div>
  );
}