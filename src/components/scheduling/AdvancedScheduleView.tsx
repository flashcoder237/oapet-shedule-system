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

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

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
    return sessions.filter(session => 
      session.timeSlot.day === day && session.timeSlot.startTime === time
    );
  };

  const calculateSessionHeight = (duration: number) => {
    const slotsNeeded = Math.ceil(duration / 30); // 30 min par slot
    return `${slotsNeeded * 4}rem`; // 4rem par slot
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

        {/* Contenu de la session */}
        <div className="space-y-1">
          <div className="font-semibold text-sm truncate">
            {session.course.code}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {session.course.name}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>{session.timeSlot.startTime}-{session.timeSlot.endTime}</span>
          </div>
          {session.course.room && (
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{session.course.room.code}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <User className="w-3 h-3" />
            <span className="truncate">{session.course.teacher.name}</span>
          </div>
          
          <Badge className={`text-xs ${getSessionTypeColor(session.course.type)}`}>
            {session.course.type}
          </Badge>
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
    <div className="bg-card rounded-xl border border-border overflow-hidden">
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
              {TIME_SLOTS.map((time, index) => (
                <tr key={time} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-2 font-medium text-muted-foreground bg-muted/10 sticky left-0 z-10 border-r border-border">
                    <div className="text-sm font-bold text-primary">
                      {time}
                    </div>
                    {index < TIME_SLOTS.length - 1 && (
                      <div className="text-xs text-muted-foreground">
                        {TIME_SLOTS[index + 1]}
                      </div>
                    )}
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
                        style={{ height: '4rem' }}
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
                        
                        {/* Sessions existantes */}
                        <div className="relative z-10 space-y-1">
                          {slotSessions.map(session => renderSessionCard(session))}
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
              ))}
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
    </div>
  );
}