'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Copy, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Bot,
  Save,
  Undo2,
  Redo2,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FloatingAIConflictDetector } from './FloatingAIConflictDetector';

// Types
interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  type: 'CM' | 'TD' | 'TP' | 'EXAM';
  duration: number; // en minutes
  teacher: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    code: string;
    name: string;
  };
  expectedStudents: number;
  color?: string;
}

interface ScheduleSession {
  id: string;
  course: Course;
  timeSlot: TimeSlot;
  conflicts: ConflictInfo[];
  isLocked: boolean;
}

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group';
  severity: 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
}

interface ScheduleGridProps {
  sessions: ScheduleSession[];
  onSessionMove: (sessionId: string, newTimeSlot: TimeSlot) => void;
  onSessionEdit: (session: ScheduleSession) => void;
  onSessionDelete: (sessionId: string) => void;
  onConflictResolve: (sessionId: string, conflictType: string) => void;
  isEditMode: boolean;
  selectedClass: string;
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' }
];

// Génération d'une grille horaire détaillée (07:30 à 18:30 par intervalles de 15 minutes)
const generateTimeSlots = () => {
  const slots = [];
  let hour = 7;
  let minute = 30;
  
  while (hour < 18 || (hour === 18 && minute <= 30)) {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push(timeString);
    
    minute += 15;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Identifie les créneaux principaux (toutes les 2 heures)
const isMainTimeSlot = (time: string): boolean => {
  const [hour, minute] = time.split(':').map(Number);
  return minute === 0 && hour % 2 === 0;
};

// Identifie les créneaux horaires (toutes les heures)
const isHourSlot = (time: string): boolean => {
  const [, minute] = time.split(':').map(Number);
  return minute === 0;
};

export function AdvancedScheduleView({ 
  sessions, 
  onSessionMove, 
  onSessionEdit, 
  onSessionDelete, 
  onConflictResolve,
  isEditMode,
  selectedClass 
}: ScheduleGridProps) {
  const [draggedSession, setDraggedSession] = useState<ScheduleSession | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ day: string; time: string } | null>(null);
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const { addToast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'CM': return 'bg-primary/10 border-l-primary text-primary';
      case 'TD': return 'bg-accent/10 border-l-accent text-accent';
      case 'TP': return 'bg-orange-100 border-l-orange-500 text-orange-700';
      case 'EXAM': return 'bg-red-100 border-l-red-500 text-red-700';
      default: return 'bg-muted border-l-muted-foreground text-muted-foreground';
    }
  };

  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSessionsForSlot = (day: string, time: string) => {
    return sessions.filter(session => {
      if (session.timeSlot.day !== day) return false;
      
      // Vérifier si la session commence exactement à ce créneau ou le chevauche
      const sessionStart = session.timeSlot.startTime;
      const sessionEnd = session.timeSlot.endTime;
      
      // Conversion en minutes pour comparaison précise
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const slotMinutes = timeToMinutes(time);
      const nextSlotMinutes = slotMinutes + 15; // Prochaine slot de 15 min
      const startMinutes = timeToMinutes(sessionStart);
      const endMinutes = timeToMinutes(sessionEnd);
      
      // La session chevauche ce créneau si elle commence avant la fin du slot et se termine après le début
      return startMinutes < nextSlotMinutes && endMinutes > slotMinutes;
    });
  };

  const calculateSessionHeight = (duration: number) => {
    const slotsNeeded = Math.ceil(duration / 15); // 15 min par slot
    return `${slotsNeeded * 1.5}rem`; // 1.5rem par slot (plus compact)
  };

  const handleDragStart = (session: ScheduleSession) => {
    if (!isEditMode || session.isLocked) return;
    setDraggedSession(session);
  };

  const handleDragEnd = () => {
    if (draggedSession && hoveredSlot) {
      const newTimeSlot: TimeSlot = {
        id: `${hoveredSlot.day}-${hoveredSlot.time}`,
        day: hoveredSlot.day,
        startTime: hoveredSlot.time,
        endTime: calculateEndTime(hoveredSlot.time, draggedSession.course.duration)
      };
      
      onSessionMove(draggedSession.id, newTimeSlot);
      
      addToast({
        title: "Cours déplacé",
        description: `${draggedSession.course.name} déplacé vers ${hoveredSlot.day} à ${hoveredSlot.time}`,
        variant: "default"
      });
    }
    
    setDraggedSession(null);
    setHoveredSlot(null);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const renderSessionCard = (session: ScheduleSession, isPreview = false) => {
    const hasConflicts = session.conflicts.length > 0;
    const highPriorityConflicts = session.conflicts.filter(c => c.severity === 'high');
    
    return (
      <motion.div
        key={session.id}
        layout
        drag={isEditMode && !session.isLocked}
        dragControls={useDragControls()}
        onDragStart={() => handleDragStart(session)}
        onDragEnd={handleDragEnd}
        whileHover={isEditMode ? { scale: 1.02, zIndex: 10 } : {}}
        whileDrag={{ scale: 1.05, zIndex: 20, rotate: 2 }}
        className={`
          relative p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200
          ${getSessionTypeColor(session.course.type)}
          ${hasConflicts ? 'ring-2 ring-red-300 ring-opacity-50' : ''}
          ${session.isLocked ? 'opacity-75 cursor-not-allowed' : ''}
          ${isPreview ? 'opacity-60 border-dashed' : ''}
          ${selectedSession?.id === session.id ? 'ring-2 ring-primary' : ''}
          hover:shadow-md
        `}
        style={{ height: calculateSessionHeight(session.course.duration) }}
        onClick={() => setSelectedSession(session)}
      >
        {/* Indicateur de verrouillage */}
        {session.isLocked && (
          <div className="absolute top-1 right-1">
            <div className="w-4 h-4 bg-muted-foreground rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-background rounded-full" />
            </div>
          </div>
        )}

        {/* Indicateurs de conflits */}
        {hasConflicts && (
          <div className="absolute top-1 left-1">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              highPriorityConflicts.length > 0 ? 'bg-red-500' : 'bg-amber-500'
            }`}>
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Contenu de la session - horaires proéminents */}
        <div className="space-y-1">
          {/* Horaires très visibles */}
          <div className="bg-white/80 rounded px-2 py-1 text-center mb-2">
            <div className="font-bold text-xs text-primary font-mono">
              {session.timeSlot.startTime}-{session.timeSlot.endTime}
            </div>
          </div>
          
          {/* Code et type du cours */}
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-xs truncate">
              {session.course.code}
            </div>
            <Badge className={`text-xs px-1 py-0 ${getSessionTypeColor(session.course.type)}`}>
              {session.course.type}
            </Badge>
          </div>
          
          {/* Nom du cours (seulement si assez de place) */}
          {session.course.duration > 45 && (
            <div className="text-xs text-muted-foreground truncate leading-tight">
              {session.course.name}
            </div>
          )}
          
          {/* Informations compactes */}
          <div className="space-y-0.5">
            {session.course.room && (
              <div className="flex items-center gap-1 text-xs">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate font-medium">{session.course.room.code}</span>
              </div>
            )}
            
            {/* Enseignant seulement si assez de durée */}
            {session.course.duration > 30 && (
              <div className="flex items-center gap-1 text-xs">
                <User className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{session.course.teacher.name.split(' ').pop()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu contextuel en mode édition */}
        {isEditMode && !session.isLocked && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionEdit(session);
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionDelete(session.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden relative">
      {/* Header avec contrôles */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Planning - {selectedClass}
            </h3>
            <p className="text-sm text-muted-foreground">
              {sessions.length} cours programmés
            </p>
          </div>
          
          {isEditMode && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Undo2 className="w-4 h-4 mr-1" />
                Annuler
              </Button>
              <Button size="sm" variant="outline">
                <Redo2 className="w-4 h-4 mr-1" />
                Refaire
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-1" />
                Sauvegarder
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Grille des emplois du temps */}
      <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
        <div ref={gridRef} className="relative">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="p-4 text-left font-semibold text-foreground bg-muted/30 sticky left-0 z-20 min-w-24">
                  Horaires
                </th>
                {DAYS.map(day => (
                  <th key={day.key} className="p-4 text-center font-semibold text-foreground bg-muted/30 min-w-48">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time, index) => {
                const isMain = isMainTimeSlot(time);
                const isHour = isHourSlot(time);
                
                return (
                <tr key={time} className={`transition-colors ${
                  isMain ? 'border-b-2 border-gray-300 bg-gray-50/50' :
                  isHour ? 'border-b border-gray-200 bg-gray-25/50' :
                  'border-b border-gray-100 hover:bg-muted/10'
                }`}>
                  <td className={`p-1 font-medium text-muted-foreground sticky left-0 z-10 border-r border-border ${
                    isMainTimeSlot(time) ? 'bg-muted/20 border-b-2 border-gray-400' : 
                    isHourSlot(time) ? 'bg-muted/10 border-b border-gray-300' : 
                    'bg-muted/5 border-b border-gray-100'
                  }`}>
                    <div className={`font-mono ${
                      isMainTimeSlot(time) ? 'text-sm font-bold text-primary' :
                      isHourSlot(time) ? 'text-xs font-semibold text-secondary-foreground' :
                      'text-xs text-muted-foreground'
                    }`}>
                      {isMainTimeSlot(time) || isHourSlot(time) ? time : ''}
                    </div>
                  </td>
                  {DAYS.map(day => {
                    const slotSessions = getSessionsForSlot(day.key, time);
                    const isHovered = hoveredSlot?.day === day.key && hoveredSlot?.time === time;
                    
                    return (
                      <td 
                        key={`${day.key}-${time}`} 
                        className={`p-1 align-top relative transition-colors ${
                          isHovered && draggedSession ? 'bg-primary/10 ring-2 ring-primary/30' : ''
                        }`}
                        style={{ height: '1.5rem' }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedSession) {
                            setHoveredSlot({ day: day.key, time });
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedSession && isEditMode) {
                            handleDragEnd();
                          }
                        }}
                      >
                        {/* Zone de drop */}
                        {isEditMode && (
                          <div 
                            className={`absolute inset-0 transition-all duration-200 ${
                              isHovered && draggedSession 
                                ? 'bg-primary/5 border-2 border-dashed border-primary' 
                                : 'hover:bg-muted/20'
                            }`}
                          />
                        )}
                        
                        {/* Sessions existantes - afficher uniquement dans le premier slot */}
                        <div className="relative z-10 space-y-1">
                          {slotSessions
                            .filter(session => session.timeSlot.startTime === time) // Afficher seulement dans le slot de début
                            .map(session => renderSessionCard(session))
                          }
                        </div>
                        
                        {/* Aperçu de drop */}
                        {isHovered && draggedSession && (
                          <div className="absolute inset-0 z-20">
                            {renderSessionCard(draggedSession, true)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de détails de session */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-muted/30"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground text-lg">
                    {selectedSession.course.name}
                  </h4>
                  <p className="text-muted-foreground">
                    {selectedSession.course.code} - {selectedSession.course.type}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedSession(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {selectedSession.timeSlot.startTime} - {selectedSession.timeSlot.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedSession.timeSlot.day}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedSession.course.teacher.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedSession.course.expectedStudents} étudiants</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {selectedSession.course.room && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedSession.course.room.code} - {selectedSession.course.room.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conflits détectés */}
              {selectedSession.conflicts.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Conflits détectés
                  </h5>
                  <div className="space-y-2">
                    {selectedSession.conflicts.map((conflict, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${getConflictSeverityColor(conflict.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{conflict.message}</p>
                            {conflict.conflictWith && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Conflit avec: {conflict.conflictWith}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onConflictResolve(selectedSession.id, conflict.type)}
                          >
                            Résoudre
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {isEditMode && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => onSessionEdit(selectedSession)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-1" />
                    Dupliquer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onSessionDelete(selectedSession.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant IA flottant */}
      <FloatingAIConflictDetector
        sessions={sessions}
        onResolveConflict={(sessionId, conflictType) => {
          onConflictResolve(sessionId, conflictType);
          addToast({
            title: "Conflit résolu",
            description: `Le conflit de type "${conflictType}" a été résolu.`,
            variant: "default"
          });
        }}
        onAutoResolve={() => {
          // Logique de résolution automatique
          addToast({
            title: "Résolution automatique",
            description: "L'IA a tenté de résoudre les conflits automatiquement.",
            variant: "default"
          });
        }}
      />
    </div>
  );
}