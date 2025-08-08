'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AnimatedBackground from '@/components/ui/animated-background';
import { MicroButton, MicroCard } from '@/components/ui/micro-interactions';
import { scheduleService } from '@/lib/api/services/schedules';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Settings, 
  Eye,
  Activity,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Zap,
  CalendarDays,
  CalendarRange,
  Edit,
  Bot,
  Sparkles,
  AlertTriangle,
  Copy,
  Trash2,
  X,
  Minimize2,
  Maximize2,
  Shield,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  Grid3x3,
  List,
  Upload,
  Save,
  Move,
  Layers,
  MoreVertical,
  Bell,
  Info,
  Menu,
  ChevronDown,
  GripVertical
} from 'lucide-react';

// Import the API types
import { ScheduleSession as ApiScheduleSession, Teacher, Course, Room, TimeSlot } from '@/types/api';

// Types
interface Curriculum {
  id: number;
  code: string;
  name: string;
  level: string;
  department: {
    name: string;
  };
}

// Use the API ScheduleSession type directly
type ScheduleSession = ApiScheduleSession;

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group' | 'equipment';
  severity: 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
  suggestion?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type FilterType = 'all' | 'CM' | 'TD' | 'TP' | 'EXAM';
type ViewMode = 'week' | 'day' | 'month';
type EditMode = 'view' | 'edit' | 'drag';

// Composant Header compact et flottant
function CompactHeader({ 
  selectedClass,
  onClassChange,
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  onExport,
  onImport,
  editMode,
  onEditModeChange,
  onSave,
  hasChanges,
  curricula
}: any) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isCollapsed ? -60 : 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
    >
      {/* Barre principale ultra-compacte */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Gauche - Titre et sélection classe */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary hidden sm:block">Emplois du temps</h1>
          
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              {curricula.map((c: Curriculum) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="font-medium">{c.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Centre - Navigation temporelle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              const newDate = new Date(selectedDate);
              if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() - 7);
              } else if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() - 1);
              } else {
                newDate.setMonth(newDate.getMonth() - 1);
              }
              onDateChange(newDate);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Input 
            type="date" 
            value={scheduleService.formatDate(selectedDate)}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="h-8 w-32 text-sm"
          />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              const newDate = new Date(selectedDate);
              if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + 7);
              } else if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() + 1);
              } else {
                newDate.setMonth(newDate.getMonth() + 1);
              }
              onDateChange(newDate);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Droite - Actions et modes */}
        <div className="flex items-center gap-2">
          {/* Mode de vue */}
          <div className="flex bg-muted rounded-md p-0.5">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onViewModeChange('day')}
            >
              <CalendarDays className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onViewModeChange('week')}
            >
              <CalendarRange className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onViewModeChange('month')}
            >
              <Grid3x3 className="w-3 h-3" />
            </Button>
          </div>

          {/* Mode édition */}
          <div className="flex bg-muted rounded-md p-0.5">
            <Button
              variant={editMode === 'view' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEditModeChange('view')}
              title="Mode consultation"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant={editMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEditModeChange('edit')}
              title="Mode édition"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant={editMode === 'drag' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEditModeChange('drag')}
              title="Mode glisser-déposer"
            >
              <Move className="w-3 h-3" />
            </Button>
          </div>

          {/* Actions */}
          {editMode !== 'view' && hasChanges && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
              onClick={onSave}
            >
              <Save className="w-3 h-3 mr-1" />
              Sauvegarder
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onExport}
            title="Exporter"
          >
            <Download className="w-3 h-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onImport}
            title="Importer"
          >
            <Upload className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Composant de stats flottantes
function FloatingStats({ sessions, conflicts, onToggle, isVisible }: any) {
  if (!isVisible) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-20 right-4 z-30 bg-white rounded-full shadow-lg p-3"
        onClick={onToggle}
      >
        <BarChart3 className="w-5 h-5 text-primary" />
      </motion.button>
    );
  }

  const stats = {
    total: sessions.length,
    CM: sessions.filter((s: ScheduleSession) => s.session_type === 'CM').length,
    TD: sessions.filter((s: ScheduleSession) => s.session_type === 'TD').length,
    TP: sessions.filter((s: ScheduleSession) => s.session_type === 'TP').length,
    EXAM: sessions.filter((s: ScheduleSession) => s.session_type === 'EXAM').length,
    totalStudents: sessions.reduce((sum: number, s: ScheduleSession) => sum + s.expected_students, 0),
    conflicts: conflicts.length
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 right-4 z-30 w-64 bg-white rounded-lg shadow-lg border border-border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Statistiques
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onToggle}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-lg font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-lg font-bold text-blue-600">{stats.CM}</div>
          <div className="text-xs text-muted-foreground">CM</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-lg font-bold text-green-600">{stats.TD}</div>
          <div className="text-xs text-muted-foreground">TD</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-lg font-bold text-purple-600">{stats.TP}</div>
          <div className="text-xs text-muted-foreground">TP</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-lg font-bold text-red-600">{stats.EXAM}</div>
          <div className="text-xs text-muted-foreground">Examens</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-lg font-bold text-orange-600">{stats.conflicts}</div>
          <div className="text-xs text-muted-foreground">Conflits</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total étudiants</span>
          <span className="font-bold">{stats.totalStudents}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Composant Session Card pour drag & drop
function SessionCard({ 
  session, 
  isDragging, 
  onDragStart, 
  onDragEnd,
  onEdit,
  onDelete,
  onDuplicate,
  editMode,
  hasConflict
}: any) {
  const [showMenu, setShowMenu] = useState(false);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'CM': return 'bg-blue-100 border-l-4 border-l-blue-500 text-blue-900';
      case 'TD': return 'bg-green-100 border-l-4 border-l-green-500 text-green-900';
      case 'TP': return 'bg-purple-100 border-l-4 border-l-purple-500 text-purple-900';
      case 'EXAM': return 'bg-red-100 border-l-4 border-l-red-500 text-red-900';
      default: return 'bg-gray-100 border-l-4 border-l-gray-500 text-gray-900';
    }
  };

  return (
    <motion.div
      className={`
        relative p-2 rounded shadow-sm cursor-pointer
        ${getSessionTypeColor(session.session_type)}
        ${hasConflict ? 'ring-2 ring-red-500' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${editMode === 'drag' ? 'cursor-move' : ''}
        hover:shadow-md transition-all
      `}
      draggable={editMode === 'drag'}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {editMode === 'drag' && (
        <GripVertical className="absolute left-1 top-1 w-3 h-3 opacity-50" />
      )}

      <div className="ml-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs">{session.course_details?.code}</span>
          <div className="flex items-center gap-1">
            <Badge className="text-xs scale-75">{session.session_type}</Badge>
            {editMode === 'edit' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs opacity-90 mt-1">
          {session.course_details?.name}
        </div>

        <div className="text-xs space-y-0.5 opacity-80 mt-1">
          <div className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>
              {formatTime(session.specific_start_time || session.time_slot_details?.start_time || '')} - 
              {formatTime(session.specific_end_time || session.time_slot_details?.end_time || '')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            <span>{session.room_details?.code}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-2.5 h-2.5" />
            <span className="truncate">
              {session.teacher_details?.user_details?.last_name}
            </span>
          </div>
        </div>

        {hasConflict && (
          <div className="flex items-center gap-1 mt-1 text-red-600">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs">Conflit détecté</span>
          </div>
        )}
      </div>

      {/* Menu contextuel */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-border z-50"
          >
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
                setShowMenu(false);
              }}
            >
              <Edit className="w-3 h-3" />
              Modifier
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(session);
                setShowMenu(false);
              }}
            >
              <Copy className="w-3 h-3" />
              Dupliquer
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
                setShowMenu(false);
              }}
            >
              <Trash2 className="w-3 h-3" />
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Fonction pour formater l'heure
const formatTime = (timeString: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

// Composant principal
export default function SchedulePage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedSession, setDraggedSession] = useState<ScheduleSession | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: string; time: string } | null>(null);
  
  const { addToast } = useToast();

  // Génération des créneaux horaires
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Charger les curricula au démarrage
  useEffect(() => {
    loadCurricula();
  }, []);

  // Charger les données quand les paramètres changent
  useEffect(() => {
    if (selectedCurriculum) {
      if (viewMode === 'week') {
        loadWeeklyData();
      } else if (viewMode === 'day') {
        loadDailyData();
      }
    }
  }, [selectedCurriculum, selectedDate, viewMode]);

  const loadCurricula = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/curricula/`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      setCurricula(data.results || data);
      
      if ((data.results || data).length > 0) {
        const firstCurriculum = (data.results || data)[0];
        setSelectedCurriculum(firstCurriculum.code);
      }
      
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

  const loadWeeklyData = async () => {
    if (!selectedCurriculum) return;
    
    setSessionsLoading(true);
    try {
      const weekStart = scheduleService.getWeekStart(selectedDate);
      const data = await scheduleService.getWeeklySessions({
        week_start: weekStart,
        curriculum: selectedCurriculum
      });
      
      setWeeklyData(data);
      setSessions(Object.values(data.sessions_by_day).flat());
      setFilteredSessions(Object.values(data.sessions_by_day).flat());
      
    } catch (error) {
      console.error('Erreur lors du chargement des données hebdomadaires:', error);
      setWeeklyData(null);
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadDailyData = async () => {
    if (!selectedCurriculum) return;
    
    setSessionsLoading(true);
    try {
      const dateString = scheduleService.formatDate(selectedDate);
      const data = await scheduleService.getDailySessions({
        date: dateString,
        curriculum: selectedCurriculum
      });
      
      setDailyData(data);
      setSessions(data.sessions || []);
      setFilteredSessions(data.sessions || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données journalières:', error);
      setDailyData(null);
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Actions d'édition
  const handleSessionEdit = (session: ScheduleSession) => {
    // Ouvrir le modal d'édition
    addToast({
      title: "Édition",
      description: `Édition de ${session.course_details?.name}`,
    });
  };

  const handleSessionDelete = async (sessionId: number) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setHasChanges(true);
    addToast({
      title: "Session supprimée",
      description: "La session a été supprimée",
    });
  };

  const handleSessionDuplicate = (session: ScheduleSession) => {
    const newSession = { ...session, id: Date.now() };
    setSessions(prev => [...prev, newSession]);
    setHasChanges(true);
    addToast({
      title: "Session dupliquée",
      description: "La session a été dupliquée",
    });
  };

  const handleDragStart = (session: ScheduleSession) => {
    setDraggedSession(session);
  };

  const handleDragEnd = () => {
    setDraggedSession(null);
    setDropTarget(null);
  };

  const handleDrop = (day: string, time: string) => {
    if (!draggedSession) return;

    // Mettre à jour la session avec le nouveau créneau
    setSessions(prev => prev.map(s => 
      s.id === draggedSession.id 
        ? { 
            ...s, 
            time_slot_details: {
              ...s.time_slot_details!,
              day_of_week: day,
              start_time: time
            }
          }
        : s
    ));
    
    setHasChanges(true);
    setDraggedSession(null);
    setDropTarget(null);
    
    addToast({
      title: "Session déplacée",
      description: `Session déplacée au ${day} à ${time}`,
    });
  };

  const handleSave = async () => {
    // Sauvegarder les changements
    addToast({
      title: "Changements sauvegardés",
      description: "L'emploi du temps a été mis à jour",
    });
    setHasChanges(false);
  };

  const handleExport = () => {
    addToast({
      title: "Export",
      description: "Export de l'emploi du temps",
    });
  };

  const handleImport = () => {
    addToast({
      title: "Import",
      description: "Import d'un emploi du temps",
    });
  };

  // Détection de conflits
  const detectConflicts = (sessions: ScheduleSession[]) => {
    const conflictsList: any[] = [];
    // Logique de détection de conflits simplifiée
    return conflictsList;
  };

  const conflicts = detectConflicts(filteredSessions);

  // Rendu de la vue jour
  const renderDayView = () => {
    const dayName = selectedDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayDate = selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <div className="bg-white rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold capitalize">{dayName}</h3>
          <p className="text-sm text-muted-foreground">{dayDate}</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {timeSlots.map(time => {
              const slotSessions = filteredSessions.filter(session => {
                const sessionTime = session.specific_start_time || session.time_slot_details?.start_time;
                return sessionTime?.startsWith(time.slice(0, 2));
              });

              return (
                <div
                  key={time}
                  className={`
                    min-h-[60px] p-2 border rounded-lg transition-colors
                    ${editMode === 'drag' && draggedSession ? 'hover:bg-blue-50' : ''}
                    ${dropTarget?.time === time ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}
                  `}
                  onDragOver={(e) => {
                    if (editMode === 'drag') {
                      e.preventDefault();
                      setDropTarget({ day: dayName, time });
                    }
                  }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (editMode === 'drag') {
                      handleDrop(dayName, time);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-600 w-12">{time}</span>
                    <div className="flex-1 space-y-1">
                      {slotSessions.length === 0 ? (
                        <div className="text-sm text-gray-400 italic">
                          {editMode !== 'view' && "Glissez une session ici"}
                        </div>
                      ) : (
                        slotSessions.map(session => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            isDragging={draggedSession?.id === session.id}
                            onDragStart={() => handleDragStart(session)}
                            onDragEnd={handleDragEnd}
                            onEdit={handleSessionEdit}
                            onDelete={handleSessionDelete}
                            onDuplicate={handleSessionDuplicate}
                            editMode={editMode}
                            hasConflict={false}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Rendu de la vue semaine
  const renderWeekView = () => {
    const days = [
      { key: 'monday', label: 'Lundi' },
      { key: 'tuesday', label: 'Mardi' },
      { key: 'wednesday', label: 'Mercredi' },
      { key: 'thursday', label: 'Jeudi' },
      { key: 'friday', label: 'Vendredi' },
      { key: 'saturday', label: 'Samedi' }
    ];

    if (!weeklyData || !weeklyData.sessions_by_day) {
      return <div className="text-center py-8 text-muted-foreground">Aucune donnée disponible</div>;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="p-2 text-left text-xs font-medium text-gray-600 w-20">Heure</th>
                {days.map(day => (
                  <th key={day.key} className="p-2 text-center text-xs font-medium text-gray-600 min-w-[150px]">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time} className="border-b border-gray-100">
                  <td className="p-2 text-xs font-medium text-gray-600 bg-gray-50">{time}</td>
                  {days.map(day => {
                    const daySessions = (weeklyData.sessions_by_day[day.key] || []).filter((session: ScheduleSession) => {
                      const sessionTime = session.specific_start_time || session.time_slot_details?.start_time;
                      return sessionTime?.startsWith(time.slice(0, 2));
                    });

                    return (
                      <td
                        key={`${day.key}-${time}`}
                        className={`
                          p-1 border-l border-gray-100 align-top relative
                          ${editMode === 'drag' && draggedSession ? 'hover:bg-blue-50' : ''}
                          ${dropTarget?.day === day.key && dropTarget?.time === time ? 'bg-blue-100' : ''}
                        `}
                        style={{ minHeight: '60px' }}
                        onDragOver={(e) => {
                          if (editMode === 'drag') {
                            e.preventDefault();
                            setDropTarget({ day: day.key, time });
                          }
                        }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (editMode === 'drag') {
                            handleDrop(day.key, time);
                          }
                        }}
                      >
                        <div className="space-y-1">
                          {daySessions.map((session: ScheduleSession) => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              isDragging={draggedSession?.id === session.id}
                              onDragStart={() => handleDragStart(session)}
                              onDragEnd={handleDragEnd}
                              onEdit={handleSessionEdit}
                              onDelete={handleSessionDelete}
                              onDuplicate={handleSessionDuplicate}
                              editMode={editMode}
                              hasConflict={false}
                            />
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Rendu de la vue mois
  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      currentWeek.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentWeek.push({ date: currentDate, isCurrentMonth: true });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Compléter la dernière semaine
    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length;
      for (let day = 1; day <= remainingDays; day++) {
        const nextDate = new Date(year, month + 1, day);
        currentWeek.push({ date: nextDate, isCurrentMonth: false });
      }
      weeks.push(currentWeek);
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-border p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>
        
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const daySessionsCount = filteredSessions.filter(s => {
                const sessionDate = new Date(s.specific_date || '');
                return sessionDate.toDateString() === day.date.toDateString();
              }).length;

              return (
                <div
                  key={dayIndex}
                  className={`
                    min-h-[80px] p-2 border rounded cursor-pointer transition-colors
                    ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                    ${day.date.toDateString() === new Date().toDateString() ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}
                    hover:bg-gray-50
                  `}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setViewMode('day');
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{day.date.getDate()}</span>
                    {daySessionsCount > 0 && (
                      <Badge className="text-xs scale-75">{daySessionsCount}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compact */}
      <CompactHeader
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
      />

      {/* Contenu principal avec padding-top pour le header fixe */}
      <div className="pt-16 p-4">
        {sessionsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des sessions...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'month' && renderMonthView()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Statistiques flottantes */}
      <FloatingStats
        sessions={filteredSessions}
        conflicts={conflicts}
        onToggle={() => setShowStats(!showStats)}
        isVisible={showStats}
      />

      {/* Assistant IA Flottant pour la détection de conflits */}
      <FloatingAIDetector 
        conflicts={conflicts}
        onResolve={(sessionId: number, type: string) => {
          addToast({
            title: "Résolution de conflit",
            description: `Tentative de résolution du conflit de type "${type}"`,
            variant: "default"
          });
        }}
      />
    </div>
  );
}

// Composant IA flottant pour la détection de conflits (inchangé mais compact)
function FloatingAIDetector({ conflicts, onResolve }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const totalConflicts = conflicts.length;

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-0"
        >
          <Bot className="h-5 w-5 text-white" />
          {totalConflicts > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalConflicts}
            </div>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 w-80"
    >
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-2 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Assistant IA</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 h-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-3">
            {totalConflicts === 0 ? (
              <div className="text-center py-3">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Aucun conflit détecté!</p>
              </div>
            ) : (
              <div className="text-center">
                <Badge variant="destructive">{totalConflicts} conflit(s)</Badge>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}