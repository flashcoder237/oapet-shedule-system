// src/components/scheduling/UltraStableDragDropScheduler.tsx
'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'exam' | 'meeting' | 'break' | 'event';
  startTime: string;
  endTime: string;
  date: Date;
  professor?: string;
  room?: string;
  participants?: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'confirmed' | 'pending' | 'cancelled' | 'conflict';
}

interface UltraStableDragDropSchedulerProps {
  items?: ScheduleItem[];
  onItemChange?: (item: ScheduleItem) => void;
  onItemAdd?: (item: Partial<ScheduleItem>) => void;
  onItemDelete?: (itemId: string) => void;
  onConflictDetected?: (conflicts: string[]) => void;
  onWeekChange?: (weekStart: Date, weekEnd: Date) => void;
  readOnly?: boolean;
  showConflicts?: boolean;
  enableAutoScheduling?: boolean;
  view?: 'day' | 'week' | 'month';
}

export default function UltraStableDragDropScheduler({
  items = [],
  onItemChange,
  onItemAdd,
  onItemDelete,
  onConflictDetected,
  onWeekChange,
  readOnly = false,
  showConflicts = true,
  enableAutoScheduling = true,
  view = 'week'
}: UltraStableDragDropSchedulerProps) {
  
  // Debug: afficher les items reçus
  React.useEffect(() => {
    console.log('UltraStableDragDropScheduler - Items reçus:', items);
    console.log('Nombre d\'items:', items.length);
  }, [items]);
  
  // État local stable
  const [currentWeek, setCurrentWeek] = useState(() => new Date());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: number; hour: number } | null>(null);

  // Références pour éviter les boucles infinies
  const lastConflictsStringRef = useRef<string>('');
  const onConflictDetectedRef = useRef(onConflictDetected);

  // Mettre à jour la référence sans effet de bord
  onConflictDetectedRef.current = onConflictDetected;

  // Constantes stables (ne changent jamais)
  const WEEK_DAYS = useMemo(() => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], []);
  const TIME_SLOTS = useMemo(() => Array.from({ length: 14 }, (_, i) => 7 + i), []);

  // Calcul des dates de la semaine (stable avec currentWeek)
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [currentWeek]);

  // Fonction de vérification de chevauchement (pure, stable)
  const checkTimeOverlap = useCallback((start1: string, end1: string, start2: string, end2: string): boolean => {
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    
    return s1 < e2 && s2 < e1;
  }, []);

  // Détection de conflits (stable avec items)
  const conflicts = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const detectedConflicts: string[] = [];
    
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];
        
        if (item1.date.toDateString() === item2.date.toDateString()) {
          const overlap = checkTimeOverlap(
            item1.startTime, item1.endTime,
            item2.startTime, item2.endTime
          );
          
          if (overlap && (item1.room === item2.room || item1.professor === item2.professor)) {
            if (!detectedConflicts.includes(item1.id)) detectedConflicts.push(item1.id);
            if (!detectedConflicts.includes(item2.id)) detectedConflicts.push(item2.id);
          }
        }
      }
    }
    
    return detectedConflicts;
  }, [items, checkTimeOverlap]);

  // Notification des conflits sans boucle infinie
  React.useEffect(() => {
    const conflictsString = conflicts.sort().join(',');

    // Notifier seulement si les conflits ont réellement changé
    if (conflictsString !== lastConflictsStringRef.current) {
      lastConflictsStringRef.current = conflictsString;

      // Utiliser setTimeout pour éviter les mises à jour synchrones
      const timeoutId = setTimeout(() => {
        if (onConflictDetectedRef.current) {
          onConflictDetectedRef.current(conflicts);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [conflicts]);

  // Notification du changement de semaine
  React.useEffect(() => {
    if (onWeekChange && weekDates.length > 0) {
      const weekStart = weekDates[0];
      const weekEnd = weekDates[weekDates.length - 1];
      onWeekChange(weekStart, weekEnd);
    }
  }, [weekDates, onWeekChange]);

  // Gestionnaires d'événements stables
  const handleDragStart = useCallback((itemId: string) => {
    if (readOnly) return;
    setDraggedItem(itemId);
  }, [readOnly]);

  const handleDragOver = useCallback((day: number, hour: number) => {
    if (!draggedItem) return;
    setDragOverSlot({ day, hour });
  }, [draggedItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback(() => {
    if (!draggedItem || !dragOverSlot) {
      setDraggedItem(null);
      setDragOverSlot(null);
      return;
    }

    const item = items.find(i => i.id === draggedItem);
    if (!item) return;

    const newDate = weekDates[dragOverSlot.day];
    if (!newDate) return;

    const newStartTime = `${dragOverSlot.hour.toString().padStart(2, '0')}:00`;
    
    // Calculer la durée et la nouvelle heure de fin
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const duration = parseTime(item.endTime) - parseTime(item.startTime);
    const newEndMinutes = parseTime(newStartTime) + duration;
    const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;

    const updatedItem = {
      ...item,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    };

    // Nettoyer l'état de drag d'abord
    setDraggedItem(null);
    setDragOverSlot(null);

    // Puis notifier le changement
    if (onItemChange) {
      onItemChange(updatedItem);
    }
  }, [draggedItem, dragOverSlot, items, weekDates, onItemChange]);

  const handleSlotClick = useCallback((day: number, hour: number) => {
    if (readOnly || !onItemAdd) return;
    
    const date = weekDates[day];
    if (!date) return;

    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    onItemAdd({
      date,
      startTime,
      endTime,
      type: 'course',
      color: '#3B82F6',
      priority: 'medium',
      status: 'pending'
    });
  }, [readOnly, weekDates, onItemAdd]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentWeek(prevWeek => {
      const newWeek = new Date(prevWeek);
      newWeek.setDate(prevWeek.getDate() + (direction === 'next' ? 7 : -7));
      return newWeek;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  // Rendu des éléments de la grille (fonction pure)
  const renderTimeSlot = useCallback((day: number, hour: number) => {
    const date = weekDates[day];
    if (!date) return null;

    const slotItems = items.filter(item => {
      const itemDate = new Date(item.date);
      const itemHour = parseInt(item.startTime.split(':')[0]);
      const itemMinutes = parseInt(item.startTime.split(':')[1] || '0');
      
      // Vérifier si c'est le même jour
      const sameDay = itemDate.toDateString() === date.toDateString();
      
      // Logique de correspondance des heures améliorée
      let hourMatches = false;
      
      if (hour === 8 && itemHour === 8) {
        hourMatches = true; // 8h00
      } else if (hour === 10 && itemHour === 10 && itemMinutes === 30) {
        hourMatches = true; // 10h30
      } else if (hour === 14 && itemHour === 14) {
        hourMatches = true; // 14h00
      } else if (hour === 16 && itemHour === 16 && itemMinutes === 30) {
        hourMatches = true; // 16h30
      } else if (hour === 19 && itemHour === 19) {
        hourMatches = true; // 19h00
      }
      
      return sameDay && hourMatches;
    });

    const isDropTarget = dragOverSlot?.day === day && dragOverSlot?.hour === hour;
    
    return (
      <div
        key={`${day}-${hour}`}
        className={`
          min-h-[60px] border border-border p-1 relative transition-colors
          ${isDropTarget ? 'bg-blue-100 border-blue-300' : 'hover:bg-muted'}
          ${readOnly ? 'cursor-default' : 'cursor-pointer'}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          handleDragOver(day, hour);
        }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => handleSlotClick(day, hour)}
      >
        {slotItems.map(item => (
          <div
            key={item.id}
            className={`
              absolute inset-x-1 p-2 rounded border text-xs
              ${conflicts.includes(item.id) ? 'bg-red-100 border-red-300' : 'bg-blue-50 border-blue-300'}
              ${selectedItem === item.id ? 'ring-2 ring-blue-500' : ''}
              ${readOnly ? 'cursor-default' : 'cursor-move'}
            `}
            draggable={!readOnly}
            onDragStart={() => handleDragStart(item.id)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(item.id);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span className="font-medium truncate">{item.title}</span>
              </div>
              {conflicts.includes(item.id) ? (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              ) : (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="w-2 h-2" />
                <span>{item.startTime} - {item.endTime}</span>
              </div>
              {item.room && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-2 h-2" />
                  <span className="truncate">{item.room}</span>
                </div>
              )}
              {item.professor && (
                <div className="flex items-center gap-1">
                  <User className="w-2 h-2" />
                  <span className="truncate">{item.professor}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }, [weekDates, items, conflicts, selectedItem, dragOverSlot, readOnly, handleDragOver, handleDragLeave, handleDrop, handleSlotClick, handleDragStart]);

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-blue-600">Planification Ultra-Stable</h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[150px] text-center">
              Semaine du {currentWeek.toLocaleDateString('fr-FR')}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Aujourd'hui
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conflicts.length > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{conflicts.length} conflit(s)</span>
            </div>
          )}
          
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Grille principale */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-1 h-full">
          {/* En-tête vide */}
          <div className="p-2 border-b border-border bg-muted">
            <div className="text-sm font-medium text-muted-foreground">Horaire</div>
          </div>
          
          {/* En-têtes des jours */}
          {weekDates.map((date, dayIndex) => (
            <div key={dayIndex} className="p-2 border-b border-border bg-muted text-center">
              <div className="text-sm font-medium text-foreground">{WEEK_DAYS[dayIndex]}</div>
              <div className="text-xs text-muted-foreground">{date.getDate()}</div>
            </div>
          ))}
          
          {/* Grille horaire */}
          {TIME_SLOTS.map((hour, slotIndex) => (
            <React.Fragment key={slotIndex}>
              {/* Colonne des heures */}
              <div className="p-2 text-xs text-muted-foreground border-r border-border bg-muted text-right">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Colonnes des jours */}
              {weekDates.map((_, dayIndex) => renderTimeSlot(dayIndex, hour))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}