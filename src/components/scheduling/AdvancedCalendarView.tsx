'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Edit,
  Eye,
  Trash2,
  GripVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface AdvancedCalendarViewProps {
  sessions: EnhancedScheduleSession[];
  onSessionMove: (sessionId: string, newDate: string, newStartTime: string) => void;
  onSessionEdit: (session: EnhancedScheduleSession) => void;
  isEditMode: boolean;
  selectedSessions: string[];
  onSessionSelect: (sessionId: string) => void;
}

const DAYS = [
  { key: 'monday', label: 'Lundi', short: 'LUN' },
  { key: 'tuesday', label: 'Mardi', short: 'MAR' },
  { key: 'wednesday', label: 'Mercredi', short: 'MER' },
  { key: 'thursday', label: 'Jeudi', short: 'JEU' },
  { key: 'friday', label: 'Vendredi', short: 'VEN' },
  { key: 'saturday', label: 'Samedi', short: 'SAM' },
  { key: 'sunday', label: 'Dimanche', short: 'DIM' }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

export function AdvancedCalendarView({ 
  sessions, 
  onSessionMove, 
  onSessionEdit, 
  isEditMode,
  selectedSessions,
  onSessionSelect
}: AdvancedCalendarViewProps) {
  const [draggedSession, setDraggedSession] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{day: string, time: string} | null>(null);

  // Grouper les sessions par jour et heure
  const getSessionsForSlot = (day: string, time: string) => {
    const dayMapping = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
      'friday': 5, 'saturday': 6, 'sunday': 0
    };

    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const sessionDay = sessionDate.getDay();
      const expectedDay = dayMapping[day as keyof typeof dayMapping];
      
      if (sessionDay !== expectedDay) return false;
      
      const [sessionHour, sessionMin] = session.startTime.split(':').map(Number);
      const [slotHour, slotMin] = time.split(':').map(Number);
      
      return sessionHour === slotHour && sessionMin === slotMin;
    });
  };

  // Calculer la durée d'une session en créneaux de 30min
  const getSessionDuration = (session: EnhancedScheduleSession) => {
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    const [endHour, endMin] = session.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return Math.ceil((endMinutes - startMinutes) / 30);
  };

  // Gérer le début du drag
  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    if (!isEditMode) return;
    
    setDraggedSession(sessionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sessionId);
  };

  // Gérer le drop
  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    
    if (!draggedSession || !isEditMode) return;
    
    const session = sessions.find(s => s.id === draggedSession);
    if (!session) return;

    // Calculer la nouvelle date basée sur le jour
    const currentWeekStart = new Date(session.date);
    const dayOfWeek = currentWeekStart.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentWeekStart.setDate(currentWeekStart.getDate() + mondayOffset);

    const dayMapping = {
      'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
      'friday': 4, 'saturday': 5, 'sunday': 6
    };

    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(currentWeekStart.getDate() + (dayMapping[day as keyof typeof dayMapping] || 0));
    const newDate = targetDate.toISOString().split('T')[0];

    onSessionMove(draggedSession, newDate, time);
    
    setDraggedSession(null);
    setDragOverSlot(null);
  };

  // Gérer le dragover
  const handleDragOver = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ day, time });
  };

  // Gérer le dragleave
  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  // Rendu d'une session
  const renderSession = (session: EnhancedScheduleSession, isFirst: boolean = true) => {
    const duration = getSessionDuration(session);
    const isSelected = selectedSessions.includes(session.id);
    const isDragging = draggedSession === session.id;
    
    return (
      <motion.div
        key={session.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isDragging ? 0.5 : 1, 
          scale: isDragging ? 0.95 : 1,
          y: 0
        }}
        drag={isEditMode}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={(e, info) => handleDragStart(e as any, session.id)}
        className={`
          relative bg-white border rounded-lg p-2 mb-1 cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'}
          ${session.conflicts.length > 0 ? 'border-l-4 border-l-red-500' : ''}
          ${isDragging ? 'shadow-lg z-10' : 'shadow-sm hover:shadow-md'}
          ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        `}
        style={{
          height: `${duration * 30 - 4}px`,
          minHeight: '60px'
        }}
        onClick={() => onSessionSelect(session.id)}
      >
        <div className="flex items-start justify-between h-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Badge 
                variant={
                  session.course.type === 'EXAM' ? 'destructive' :
                  session.course.type === 'TP' ? 'secondary' :
                  session.course.type === 'TD' ? 'outline' : 'default'
                }
                className="text-xs"
              >
                {session.course.type}
              </Badge>
              
              {session.conflicts.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {session.conflicts.map((conflict, index) => (
                          <p key={index} className="text-xs">{conflict.message}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <h4 className="font-semibold text-xs text-gray-900 truncate">
              {session.course.name}
            </h4>
            
            <div className="space-y-0.5 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{session.startTime}-{session.endTime}</span>
              </div>
              
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{session.room.code}</span>
              </div>
              
              <div className="flex items-center gap-1 truncate">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{session.course.teacher.name}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isEditMode && (
            <div className="flex flex-col gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionEdit(session);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isEditMode && (
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <GripVertical className="h-3 w-3" />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-8 gap-2">
          {/* En-tête des heures */}
          <div className="font-medium text-sm text-gray-600 p-2">Heures</div>
          
          {/* En-têtes des jours */}
          {DAYS.map(day => (
            <div key={day.key} className="text-center p-2">
              <div className="font-semibold text-sm text-gray-900">{day.short}</div>
              <div className="text-xs text-gray-500">{day.label}</div>
            </div>
          ))}

          {/* Grille horaire */}
          {TIME_SLOTS.map(time => (
            <React.Fragment key={time}>
              {/* Colonne des heures */}
              <div className="text-xs text-gray-600 p-2 text-right font-mono">
                {time}
              </div>
              
              {/* Colonnes des jours */}
              {DAYS.map(day => {
                const slotSessions = getSessionsForSlot(day.key, time);
                const isDragOver = dragOverSlot?.day === day.key && dragOverSlot?.time === time;
                const hasConflicts = slotSessions.some(s => s.conflicts.length > 0);
                
                return (
                  <div
                    key={`${day.key}-${time}`}
                    className={`
                      min-h-[30px] border border-gray-100 transition-colors duration-200
                      ${isDragOver ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                      ${hasConflicts ? 'bg-red-50' : ''}
                      ${isEditMode ? 'cursor-pointer' : ''}
                    `}
                    onDrop={(e) => handleDrop(e, day.key, time)}
                    onDragOver={(e) => handleDragOver(e, day.key, time)}
                    onDragLeave={handleDragLeave}
                  >
                    {slotSessions.map((session, index) => (
                      <div key={session.id}>
                        {renderSession(session, index === 0)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Légende */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>CM - Cours Magistral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>TD - Travaux Dirigés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
              <span>TP - Travaux Pratiques</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>EXAM - Examen</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Conflits détectés</span>
            </div>
          </div>
          
          {isEditMode && (
            <div className="mt-2 text-xs text-blue-600">
              💡 Glissez-déposez les cours pour les reprogrammer
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}