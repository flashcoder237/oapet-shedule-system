// src/components/scheduling/RealisticScheduleView.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Monitor,
  Zap,
  Settings
} from 'lucide-react';

interface ScheduleSession {
  id: string;
  course: {
    code: string;
    name: string;
    type: 'CM' | 'TD' | 'TP' | 'CONF' | 'EXAM';
    level: string;
    department: string;
  };
  teacher: {
    name: string;
    id: string;
  };
  room: {
    code: string;
    name: string;
    capacity: number;
    building: string;
    hasComputer: boolean;
    hasProjector: boolean;
    isLaboratory: boolean;
  };
  timeSlot: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    startTime: string;
    endTime: string;
    name: string;
  };
  expectedStudents: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'conflict';
  notes?: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
}

interface Schedule {
  id: string;
  name: string;
  curriculum: string;
  level: string;
  isPublished: boolean;
  sessions: ScheduleSession[];
  conflicts: string[];
}

interface RealisticScheduleViewProps {
  schedule?: Schedule;
  readOnly?: boolean;
  showConflicts?: boolean;
  onSessionClick?: (session: ScheduleSession) => void;
  onConflictDetected?: (conflicts: string[]) => void;
}

export default function RealisticScheduleView({
  schedule,
  readOnly = false,
  showConflicts = true,
  onSessionClick,
  onConflictDetected
}: RealisticScheduleViewProps) {
  
  const [currentWeek, setCurrentWeek] = useState(() => new Date());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'CM' | 'TD' | 'TP'>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);

  // Configuration des jours et horaires
  const weekDays = [
    { key: 'monday', label: 'Lundi', short: 'Lun' },
    { key: 'tuesday', label: 'Mardi', short: 'Mar' },
    { key: 'wednesday', label: 'Mercredi', short: 'Mer' },
    { key: 'thursday', label: 'Jeudi', short: 'Jeu' },
    { key: 'friday', label: 'Vendredi', short: 'Ven' },
    { key: 'saturday', label: 'Samedi', short: 'Sam' }
  ];

  const timeSlots = [
    { start: '08:00', end: '09:30', name: 'Créneau 1' },
    { start: '09:45', end: '11:15', name: 'Créneau 2' },
    { start: '11:30', end: '13:00', name: 'Créneau 3' },
    { start: '14:00', end: '15:30', name: 'Créneau 4' },
    { start: '15:45', end: '17:15', name: 'Créneau 5' },
    { start: '17:30', end: '19:00', name: 'Créneau 6' }
  ];

  // Sessions filtrées
  const filteredSessions = useMemo(() => {
    if (!schedule?.sessions) return [];
    
    return schedule.sessions.filter(session => {
      if (selectedFilter === 'all') return true;
      return session.course.type === selectedFilter;
    });
  }, [schedule?.sessions, selectedFilter]);

  // Calcul des dates de la semaine
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    return weekDays.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        ...day,
        date: date,
        dateStr: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      };
    });
  }, [currentWeek]);

  // Obtenir les sessions pour un jour et créneau donnés
  const getSessionsForSlot = useCallback((dayKey: string, timeSlot: any) => {
    return filteredSessions.filter(session => 
      session.timeSlot.day === dayKey &&
      session.timeSlot.startTime === timeSlot.start &&
      session.timeSlot.endTime === timeSlot.end
    );
  }, [filteredSessions]);

  // Styles pour les types de cours
  const getSessionStyle = (session: ScheduleSession) => {
    const baseClasses = "text-xs p-2 rounded border-l-4 cursor-pointer transition-all hover:shadow-md";
    const hasConflict = schedule?.conflicts?.includes(session.id);
    
    if (hasConflict) {
      return `${baseClasses} bg-red-50 border-red-400 text-red-800`;
    }
    
    switch (session.course.type) {
      case 'CM':
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`;
      case 'TD':
        return `${baseClasses} bg-green-50 border-green-400 text-green-800`;
      case 'TP':
        return `${baseClasses} bg-orange-50 border-orange-400 text-orange-800`;
      case 'EXAM':
        return `${baseClasses} bg-red-50 border-red-400 text-red-800`;
      default:
        return `${baseClasses} bg-muted border-border text-foreground`;
    }
  };

  // Icône selon le type de cours
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CM': return <BookOpen className="w-3 h-3" />;
      case 'TD': return <Users className="w-3 h-3" />;
      case 'TP': return <Monitor className="w-3 h-3" />;
      case 'EXAM': return <AlertTriangle className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  // Navigation de semaine
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Gestionnaire de clic sur session
  const handleSessionClick = (session: ScheduleSession) => {
    setSelectedSession(session);
    onSessionClick?.(session);
  };

  if (!schedule) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun emploi du temps</h3>
            <p className="text-muted-foreground">Sélectionnez ou créez un emploi du temps pour commencer</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* En-tête avec contrôles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-600">{schedule.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {schedule.curriculum} - {schedule.level} 
                {schedule.isPublished ? (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Publié
                  </span>
                ) : (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Brouillon
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Filtres par type */}
              <div className="flex border rounded-lg overflow-hidden">
                {['all', 'CM', 'TD', 'TP'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter as any)}
                    className="rounded-none"
                  >
                    {filter === 'all' ? 'Tout' : filter}
                  </Button>
                ))}
              </div>
              
              {/* Actions */}
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              
              {!readOnly && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation de semaine */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold">Semaine du {weekDates[0]?.date.toLocaleDateString('fr-FR')}</h3>
              
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{filteredSessions.length} sessions</span>
              </div>
              {schedule.conflicts && schedule.conflicts.length > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{schedule.conflicts.length} conflit(s)</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille principale de l'emploi du temps */}
      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-7 h-full">
            {/* En-tête vide pour la colonne des heures */}
            <div className="border-r border-b border-border bg-muted p-3">
              <div className="text-sm font-medium text-muted-foreground">Horaires</div>
            </div>
            
            {/* En-têtes des jours */}
            {weekDates.map((day) => (
              <div key={day.key} className="border-r border-b border-border bg-muted p-3 text-center">
                <div className="text-sm font-medium text-foreground">{day.short}</div>
                <div className="text-xs text-muted-foreground">{day.dateStr}</div>
              </div>
            ))}
            
            {/* Grille des créneaux */}
            {timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slotIndex}>
                {/* Colonne des heures */}
                <div className="border-r border-b border-border bg-muted p-3 text-right">
                  <div className="text-xs font-medium text-foreground">
                    {slot.start}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {slot.end}
                  </div>
                </div>
                
                {/* Colonnes des jours */}
                {weekDates.map((day) => {
                  const sessions = getSessionsForSlot(day.key, slot);
                  
                  return (
                    <div
                      key={`${day.key}-${slotIndex}`}
                      className="border-r border-b border-border p-2 min-h-[80px] hover:bg-muted transition-colors"
                    >
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className={getSessionStyle(session)}
                            onClick={() => handleSessionClick(session)}
                          >
                            {/* En-tête de la session */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1">
                                {getTypeIcon(session.course.type)}
                                <span className="font-medium truncate">
                                  {session.course.code}
                                </span>
                              </div>
                              <div className="text-xs">
                                {session.course.type}
                              </div>
                            </div>
                            
                            {/* Nom du cours */}
                            <div className="font-medium mb-1 truncate" title={session.course.name}>
                              {session.course.name}
                            </div>
                            
                            {/* Informations additionnelles */}
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <User className="w-2 h-2" />
                                <span className="truncate">{session.teacher.name}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-2 h-2" />
                                <span className="truncate">{session.room.code}</span>
                                {session.room.hasComputer && <Monitor className="w-2 h-2" />}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Users className="w-2 h-2" />
                                <span>{session.expectedStudents}</span>
                                <span className="text-xs opacity-75">étudiants</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium text-foreground">Légende :</div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span className="text-xs">CM - Cours Magistral</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span className="text-xs">TD - Travaux Dirigés</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <span className="text-xs">TP - Travaux Pratiques</span>
                </div>
                
                {schedule.conflicts && schedule.conflicts.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span className="text-xs">Conflit détecté</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Total: {filteredSessions.length} sessions programmées
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}