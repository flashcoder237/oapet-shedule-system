'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SessionCard } from './SessionCard';
import { ScheduleSession } from '@/types/api';

type ViewMode = 'week' | 'day' | 'month';
type EditMode = 'view' | 'edit' | 'drag';

interface ScheduleGridProps {
  sessions: ScheduleSession[];
  viewMode: ViewMode;
  editMode: EditMode;
  selectedDate: Date;
  timeSlots: string[];
  onSessionEdit: (session: ScheduleSession) => void;
  onSessionDelete: (sessionId: number) => void;
  onSessionDuplicate: (session: ScheduleSession) => void;
  onDrop?: (day: string, time: string, session: ScheduleSession) => void;
  conflicts: any[];
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function ScheduleGrid({
  sessions,
  viewMode,
  editMode,
  selectedDate,
  timeSlots,
  onSessionEdit,
  onSessionDelete,
  onSessionDuplicate,
  onDrop,
  conflicts
}: ScheduleGridProps) {
  
  // États pour le drag & drop avec visualisation en direct
  const [draggedSession, setDraggedSession] = useState<ScheduleSession | null>(null);
  const [dropTarget, setDropTarget] = useState<{day: string, time: string, y?: number, isValid?: boolean} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Constantes pour la grille temporelle
  const startHour = 8;
  const endHour = 19;
  const totalMinutes = (endHour - startHour) * 60;
  const pixelsPerMinute = 1; // 1 pixel = 1 minute
  
  const getDayFromDate = (date: Date, dayOffset: number = 0) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + dayOffset);
    return newDate;
  };

  // Fonctions utilitaires pour le positionnement temporel
  const getSessionDurationMinutes = (session: ScheduleSession) => {
    const startTime = session.specific_start_time || session.time_slot_details?.start_time;
    const endTime = session.specific_end_time || session.time_slot_details?.end_time;
    
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes - startMinutes;
    }
    return 120; // Default 2 hours
  };

  const getSessionTopPosition = (session: ScheduleSession) => {
    const startTime = session.specific_start_time || session.time_slot_details?.start_time;
    if (startTime) {
      const [hour, min] = startTime.split(':').map(Number);
      const sessionStartMinutes = hour * 60 + min;
      const gridStartMinutes = startHour * 60;
      return (sessionStartMinutes - gridStartMinutes) * pixelsPerMinute;
    }
    return 0;
  };

  const getSessionHeightPixels = (session: ScheduleSession) => {
    const durationMinutes = getSessionDurationMinutes(session);
    return Math.max(durationMinutes * pixelsPerMinute, 30); // Minimum 30px
  };

  const getSnapTime = (mouseY: number, containerTop: number) => {
    const relativeY = mouseY - containerTop;
    const snapInterval = 10; // 10 minutes
    
    const totalMinutes = Math.max(0, relativeY / pixelsPerMinute);
    const snapMinutes = Math.round(totalMinutes / snapInterval) * snapInterval;
    
    const hour = startHour + Math.floor(snapMinutes / 60);
    const minute = snapMinutes % 60;
    
    if (hour < startHour) return `${startHour.toString().padStart(2, '0')}:00`;
    if (hour >= endHour) return `${(endHour-1).toString().padStart(2, '0')}:50`;
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getSessionsForSlot = (day: string, timeSlot: string) => {
    // Debug simplifié - seulement une fois par rendu
    if (sessions.length > 0 && timeSlot === '08:00' && day === 'lundi') {
      console.log('=== DEBUG SESSION STRUCTURE ===');
      console.log('Total sessions:', sessions.length);
      console.log('Sample session:', sessions[0]);
      console.log('Session structure:', {
        id: sessions[0]?.id,
        time_slot_details: sessions[0]?.time_slot_details,
        specific_start_time: sessions[0]?.specific_start_time,
        specific_end_time: sessions[0]?.specific_end_time,
        course_details: sessions[0]?.course_details,
        FULL_SESSION: sessions[0]
      });
    }
    
    return sessions.filter(session => {
      // 1. Essayer d'extraire le jour depuis specific_date si disponible
      let sessionDay = null;
      if (session.specific_date) {
        const date = new Date(session.specific_date);
        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        sessionDay = dayNames[date.getDay()];
      } else if (session.time_slot_details?.day_of_week) {
        sessionDay = session.time_slot_details.day_of_week.toLowerCase();
      }
      
      const sessionTime = session.specific_start_time || 
                         session.time_slot_details?.start_time ||
                         (session as any).start_time;
      
      // Debug spécifique pour 16:30
      if (timeSlot === '16:30' && day === 'lundi') {
        console.log('🔍 Checking 16:30 lundi slot:', {
          day,
          timeSlot,
          sessionDay,
          sessionTime,
          specific_date: session.specific_date,
          session_id: session.id,
          course: session.course_details?.name
        });
      }
      
      // Correspondance jour
      const dayMatch = sessionDay === day.toLowerCase();
      
      // Correspondance heure
      let timeMatch = false;
      if (sessionTime) {
        const sessionTimeStr = sessionTime.toString();
        const timeSlotStr = timeSlot.toString();
        
        if (sessionTimeStr.length >= 5 && timeSlotStr.length >= 5) {
          const sessionHour = parseInt(sessionTimeStr.slice(0, 2));
          const sessionMinute = parseInt(sessionTimeStr.slice(3, 5));
          const slotHour = parseInt(timeSlotStr.slice(0, 2));
          const slotMinute = parseInt(timeSlotStr.slice(3, 5));
          
          // Match si exactement la même heure ou dans les 10 minutes
          timeMatch = sessionHour === slotHour && Math.abs(sessionMinute - slotMinute) <= 10;
        }
      }
      
      const result = dayMatch && timeMatch;
      
      // Log seulement les matches trouvés
      if (result) {
        console.log('✅ MATCH FOUND!', { 
          day, 
          timeSlot, 
          sessionDay, 
          sessionTime, 
          course: session.course_details?.name 
        });
      }
      
      return result;
    });
  };

  const hasConflict = (session: ScheduleSession) => {
    return conflicts.some(conflict => 
      conflict.session_id === session.id || 
      conflict.sessions?.some((s: any) => s.id === session.id)
    );
  };

  // Fonction pour détecter les chevauchements locaux et organiser les sessions
  const getSessionsWithOverlapLayout = (daySessions: ScheduleSession[]) => {
    const sessionsWithLayout: Array<ScheduleSession & { 
      overlapIndex: number, 
      overlapTotal: number,
      hasVisualConflict: boolean 
    }> = [];
    
    daySessions.forEach((session, index) => {
      // Trouver toutes les sessions qui chevauchent avec celle-ci
      const overlappingSessions = daySessions.filter((otherSession, otherIndex) => {
        if (otherIndex === index) return false;
        
        const sessionStart = session.specific_start_time;
        const sessionEnd = session.specific_end_time;
        const otherStart = otherSession.specific_start_time;
        const otherEnd = otherSession.specific_end_time;
        
        if (!sessionStart || !sessionEnd || !otherStart || !otherEnd) return false;
        
        const [sessionStartH, sessionStartM] = sessionStart.split(':').map(Number);
        const [sessionEndH, sessionEndM] = sessionEnd.split(':').map(Number);
        const [otherStartH, otherStartM] = otherStart.split(':').map(Number);
        const [otherEndH, otherEndM] = otherEnd.split(':').map(Number);
        const sessionStartMinutes = sessionStartH * 60 + sessionStartM;
        const sessionEndMinutes = sessionEndH * 60 + sessionEndM;
        const otherStartMinutes = otherStartH * 60 + otherStartM;
        const otherEndMinutes = otherEndH * 60 + otherEndM;
        
        return (sessionStartMinutes < otherEndMinutes && sessionEndMinutes > otherStartMinutes);
      });
      
      const overlapTotal = overlappingSessions.length + 1;
      const overlapIndex = overlappingSessions.filter((_, otherIndex) => otherIndex < index).length;
      
      sessionsWithLayout.push({
        ...session,
        overlapIndex,
        overlapTotal,
        hasVisualConflict: overlappingSessions.length > 0
      });
    });
    
    return sessionsWithLayout;
  };

  const handleDragOver = (e: React.DragEvent, day: string, containerRef?: React.RefObject<HTMLDivElement | null>) => {
    e.preventDefault();
    if ((editMode === 'edit' || editMode === 'drag') && draggedSession && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const snapTime = getSnapTime(e.clientY, rect.top);
      
      // Calculer l'heure de fin pour vérifier les chevauchements
      const duration = getSessionDurationMinutes(draggedSession);
      const startMinutes = (() => {
        const [hours, minutes] = snapTime.split(':').map(Number);
        return hours * 60 + minutes;
      })();
      const endMinutes = startMinutes + duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      
      // Vérifier les chevauchements avec d'autres sessions
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      let currentWeekStart;
      try {
        currentWeekStart = new Date(selectedDate);
        // Calcul plus sûr du début de semaine (lundi)
        const dayOfWeek = currentWeekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche (0), reculer de 6 jours
        currentWeekStart.setDate(currentWeekStart.getDate() + diff);
      } catch (error) {
        console.error('Erreur lors du calcul de la date:', error);
        return; // Sortir en cas d'erreur de date
      }
      
      const dayIndex = dayNames.findIndex(d => d === day.toLowerCase());
      if (dayIndex === -1) return; // Jour invalide
      
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1));
      const newDateStr = newDate.toISOString().split('T')[0];
      
      const hasOverlap = sessions.some(otherSession => {
        if (otherSession.id === draggedSession.id) return false;
        if (otherSession.specific_date !== newDateStr) return false;
        
        const otherStart = otherSession.specific_start_time;
        const otherEnd = otherSession.specific_end_time;
        if (!otherStart || !otherEnd) return false;
        
        const newStartMinutes = startMinutes;
        const newEndMinutes = endMinutes;
        const [otherStartH, otherStartM] = otherStart.split(':').map(Number);
        const [otherEndH, otherEndM] = otherEnd.split(':').map(Number);
        const otherStartMinutes = otherStartH * 60 + otherStartM;
        const otherEndMinutes = otherEndH * 60 + otherEndM;
        
        return (newStartMinutes < otherEndMinutes && newEndMinutes > otherStartMinutes);
      });
      
      const isValid = !hasOverlap;
      
      setDropTarget({ day, time: snapTime, y: relativeY, isValid });
    }
  };

  // Handlers simplifiés pour la vue jour
  const handleDayDragOver = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    if ((editMode === 'edit' || editMode === 'drag') && draggedSession) {
      // Calculer l'heure de fin pour vérifier les chevauchements
      const duration = getSessionDurationMinutes(draggedSession);
      const startMinutes = (() => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      })();
      const endMinutes = startMinutes + duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      
      // Vérifier les chevauchements
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      let currentWeekStart;
      try {
        currentWeekStart = new Date(selectedDate);
        // Calcul plus sûr du début de semaine (lundi)
        const dayOfWeek = currentWeekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche (0), reculer de 6 jours
        currentWeekStart.setDate(currentWeekStart.getDate() + diff);
      } catch (error) {
        console.error('Erreur lors du calcul de la date:', error);
        return; // Sortir en cas d'erreur de date
      }
      
      const dayIndex = dayNames.findIndex(d => d === day.toLowerCase());
      if (dayIndex === -1) return; // Jour invalide
      
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1));
      const newDateStr = newDate.toISOString().split('T')[0];
      
      const hasOverlap = sessions.some(otherSession => {
        if (otherSession.id === draggedSession.id) return false;
        if (otherSession.specific_date !== newDateStr) return false;
        
        const otherStart = otherSession.specific_start_time;
        const otherEnd = otherSession.specific_end_time;
        if (!otherStart || !otherEnd) return false;
        
        const newStartMinutes = startMinutes;
        const newEndMinutes = endMinutes;
        const [otherStartH, otherStartM] = otherStart.split(':').map(Number);
        const [otherEndH, otherEndM] = otherEnd.split(':').map(Number);
        const otherStartMinutes = otherStartH * 60 + otherStartM;
        const otherEndMinutes = otherEndH * 60 + otherEndM;
        
        return (newStartMinutes < otherEndMinutes && newEndMinutes > otherStartMinutes);
      });
      
      const isValid = !hasOverlap;
      setDropTarget({ day, time, isValid });
    }
  };

  const handleDayDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    
    // Vérifier si le drop est valide avant de l'effectuer
    if (dropTarget && !dropTarget.isValid) {
      setDropTarget(null);
      setIsDragging(false);
      setDraggedSession(null);
      return; // Empêcher le drop invalide
    }
    
    setDropTarget(null);
    setIsDragging(false);
    
    if (draggedSession && onDrop) {
      onDrop(day, time, draggedSession);
    }
    setDraggedSession(null);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, day: string, containerRef?: React.RefObject<HTMLDivElement | null>) => {
    e.preventDefault();
    
    // Vérifier si le drop est valide avant de l'effectuer
    if (dropTarget && !dropTarget.isValid) {
      setDropTarget(null);
      setIsDragging(false);
      setDraggedSession(null);
      return; // Empêcher le drop invalide
    }
    
    setDropTarget(null);
    setIsDragging(false);
    
    if (draggedSession && onDrop && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const snapTime = getSnapTime(e.clientY, rect.top);
      onDrop(day, snapTime, draggedSession);
    }
    setDraggedSession(null);
  };

  const handleDragStart = (e: React.DragEvent, session: ScheduleSession) => {
    setDraggedSession(session);
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify(session));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedSession(null);
    setDropTarget(null);
    setIsDragging(false);
  };

  if (viewMode === 'day') {
    const dayName = selectedDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayKey = dayName.toLowerCase();
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">
            {dayName} {selectedDate.toLocaleDateString('fr-FR')}
          </h2>
        </div>
        
        <div className="grid grid-cols-[80px_1fr] gap-0">
          {/* Heures */}
          <div className="border-r border-border">
            <div className="h-12 border-b border-border bg-gray-50"></div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-4 border-b border-border bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-600"
              >
                {time.endsWith(':00') ? time : time.endsWith(':30') ? time : ''}
              </div>
            ))}
          </div>
          
          {/* Sessions */}
          <div>
            <div className="h-12 border-b border-border bg-blue-50 flex items-center justify-center font-medium">
              Sessions
            </div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className={`
                  h-4 border-b border-border p-1 relative transition-all duration-200 group
                  ${(editMode === 'edit' || editMode === 'drag') && isDragging ? 'hover:bg-blue-100 hover:border-blue-300' : 'hover:bg-blue-50'}
                  ${dropTarget?.day === dayKey && dropTarget?.time === time ? 'bg-blue-200 border-blue-400 shadow-inner' : ''}
                `}
                onDragOver={(e) => handleDayDragOver(e, dayKey, time)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDayDrop(e, dayKey, time)}
              >
                {getSessionsForSlot(dayKey, time).map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    editMode={editMode}
                    onEdit={onSessionEdit}
                    onDelete={onSessionDelete}
                    onDuplicate={onSessionDuplicate}
                    onDragStart={(e) => handleDragStart(e, session)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedSession?.id === session.id}
                    hasConflict={hasConflict(session)}
                  />
                ))}
                {/* Indicateur de zone de dépôt */}
                {(editMode === 'edit' || editMode === 'drag') && getSessionsForSlot(dayKey, time).length === 0 && !isDragging && (
                  <div className="opacity-0 group-hover:opacity-30 absolute inset-0 bg-blue-200 rounded flex items-center justify-center text-xs text-blue-600 transition-opacity">
                    +
                  </div>
                )}
                
                {/* Aperçu du cours en cours de déplacement */}
                {(editMode === 'edit' || editMode === 'drag') && isDragging && dropTarget?.day === dayKey && dropTarget?.time === time && draggedSession && (
                  <div className="absolute inset-0 bg-blue-300 rounded border-2 border-blue-500 opacity-60 flex items-center justify-center text-xs text-blue-800 font-medium animate-pulse">
                    {draggedSession.course_details?.code}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'week') {
    const dayContainerRefs = DAYS.map(() => React.useRef<HTMLDivElement>(null));
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-0" style={{ minWidth: '1000px' }}>
            {/* En-tête avec les jours */}
            <div className="p-2 text-left text-xs font-medium text-gray-600 bg-gray-50 border-b">
              Heure
            </div>
            {DAYS.map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 bg-gray-50 border-b border-l">
                {day}
              </div>
            ))}

            {/* Colonne des heures avec demi-heures */}
            <div className="relative bg-gray-50 border-r" style={{ height: `${totalMinutes}px` }}>
              {Array.from({ length: (endHour - startHour) * 2 }, (_, i) => {
                const isFullHour = i % 2 === 0;
                const hour = startHour + Math.floor(i / 2);
                const minute = isFullHour ? 0 : 30;
                return (
                  <div
                    key={i}
                    className={`absolute left-0 right-0 text-xs p-2 border-t ${
                      isFullHour 
                        ? 'font-medium text-gray-700 bg-gray-50' 
                        : 'font-normal text-gray-500 bg-gray-25'
                    }`}
                    style={{ top: `${i * 30}px`, height: '30px' }}
                  >
                    {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>

            {/* Colonnes pour chaque jour */}
            {DAYS.map((day, dayIndex) => {
              const dayKey = day.toLowerCase();
              const containerRef = dayContainerRefs[dayIndex];
              
              return (
                <div
                  key={day}
                  ref={containerRef}
                  className={`relative border-l border-gray-200 ${
                    (editMode === 'edit' || editMode === 'drag') ? 'cursor-pointer hover:bg-blue-50' : ''
                  }`}
                  style={{ height: `${totalMinutes}px` }}
                  onDragOver={(e) => handleDragOver(e, dayKey, containerRef)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dayKey, containerRef)}
                >
                  {/* Lignes horizontales - grille détaillée */}
                  {Array.from({ length: (endHour - startHour) * 4 }, (_, i) => {
                    const isHour = i % 4 === 0;
                    const isHalfHour = i % 2 === 0;
                    return (
                      <div
                        key={i}
                        className={`absolute left-0 right-0 border-t ${
                          isHour 
                            ? 'border-gray-300' 
                            : isHalfHour 
                              ? 'border-gray-200' 
                              : 'border-gray-100'
                        }`}
                        style={{ top: `${i * 15}px` }}
                      />
                    );
                  })}

                  {/* Indicateur de drop position avec preview */}
                  {(editMode === 'edit' || editMode === 'drag') && draggedSession && dropTarget?.day === dayKey && dropTarget.y !== undefined && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ 
                        top: `${Math.round(dropTarget.y / 10) * 10}px`,
                        height: `${getSessionHeightPixels(draggedSession)}px`
                      }}
                    >
                      <div 
                        className={`w-full h-full rounded border-2 border-dashed ${
                          dropTarget.isValid 
                            ? 'bg-green-100 border-green-400' 
                            : 'bg-red-100 border-red-400'
                        } opacity-70`}
                      >
                        <div className={`text-xs p-1 font-medium ${
                          dropTarget.isValid ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {draggedSession.course_details?.code}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sessions positionnées selon leur heure et durée réelles avec gestion des chevauchements */}
                  {(() => {
                    const daySessions = sessions.filter(session => {
                      if (session.specific_date) {
                        const date = new Date(session.specific_date);
                        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
                        return dayNames[date.getDay()] === dayKey;
                      }
                      return false;
                    });
                    
                    const sessionsWithLayout = getSessionsWithOverlapLayout(daySessions);
                    
                    return sessionsWithLayout.map((session) => {
                      const topPosition = getSessionTopPosition(session);
                      const height = getSessionHeightPixels(session);
                      
                      if (topPosition < 0 || topPosition >= totalMinutes) return null;

                      // Calcul de la largeur et position horizontale pour les chevauchements
                      const widthPercent = session.overlapTotal > 1 ? 100 / session.overlapTotal : 100;
                      const leftPercent = session.overlapTotal > 1 ? (session.overlapIndex * widthPercent) : 0;

                      return (
                        <div
                          key={session.id}
                          className={`absolute z-10 ${session.hasVisualConflict ? 'ring-2 ring-red-400 ring-opacity-60' : ''}`}
                          style={{
                            top: `${topPosition}px`,
                            height: `${height}px`,
                            left: `${4 + leftPercent * 0.92}%`, // 4% marge + largeur ajustée
                            width: `${widthPercent * 0.92}%`, // 92% de largeur totale pour garder des marges
                            zIndex: session.hasVisualConflict ? 15 : 10
                          }}
                        >
                          <SessionCard
                            session={session}
                            isDragging={draggedSession?.id === session.id}
                            onDragStart={(e) => handleDragStart(e, session)}
                            onDragEnd={handleDragEnd}
                            onEdit={onSessionEdit}
                            onDelete={onSessionDelete}
                            onDuplicate={onSessionDuplicate}
                            editMode={editMode}
                            hasConflict={hasConflict(session) || session.hasVisualConflict}
                          />
                          {/* Indicateur de conflit visuel */}
                          {session.hasVisualConflict && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white text-white text-xs flex items-center justify-center font-bold">
                              !
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vue mois - calendrier complet
  if (viewMode === 'month') {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay() + 1); // Lundi
    
    const days = [];
    const currentDate = new Date(startOfCalendar);
    
    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const getSessionsForDate = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return sessions.filter(session => {
        if (session.specific_date) {
          return session.specific_date === dateStr;
        }
        return false;
      });
    };
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        {/* En-tête du mois */}
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-center">
            {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 border-b">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grille du calendrier */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayOfMonth = day.getDate();
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const daySessions = getSessionsForDate(day);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[120px] border-r border-b last:border-r-0 p-1 
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isToday ? 'bg-blue-50' : ''}
                  hover:bg-blue-50 transition-colors
                `}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isToday ? 'text-blue-600' : ''}
                `}>
                  {dayOfMonth}
                </div>
                
                {/* Sessions du jour */}
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${getSessionTypeColor(session.session_type)}
                      `}
                      onClick={() => onSessionEdit(session)}
                      title={`${session.course_details?.name} - ${session.specific_start_time}`}
                    >
                      <div className="font-medium">{session.course_details?.code}</div>
                      <div className="opacity-80">{session.specific_start_time?.slice(0, 5)}</div>
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{daySessions.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Fonction helper pour les couleurs
  const getSessionTypeColor = (sessionType: string) => {
    switch (sessionType) {
      case 'CM': return 'bg-blue-100 text-blue-800 border-l-2 border-blue-500';
      case 'TD': return 'bg-green-100 text-green-800 border-l-2 border-green-500';
      case 'TP': return 'bg-yellow-100 text-yellow-800 border-l-2 border-yellow-500';
      case 'EXAM': return 'bg-red-100 text-red-800 border-l-2 border-red-500';
      case 'CONF': return 'bg-purple-100 text-purple-800 border-l-2 border-purple-500';
      default: return 'bg-gray-100 text-gray-800 border-l-2 border-gray-500';
    }
  };

  return null;
}