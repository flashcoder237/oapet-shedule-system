'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Lightbulb
} from 'lucide-react';

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

interface ScheduleSession {
  id: number;
  course_details: {
    name: string;
    code: string;
  };
  teacher_details: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
  room_details: {
    code: string;
    name: string;
  };
  time_slot_details?: {
    start_time: string;
    end_time: string;
    day_of_week: string;
  };
  specific_date?: string;
  specific_start_time?: string;
  specific_end_time?: string;
  session_type: string;
  expected_students: number;
}

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group';
  severity: 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type FilterType = 'all' | 'CM' | 'TD' | 'TP' | 'EXAM';
type ViewMode = 'week' | 'day';

// Composant IA flottant pour la détection de conflits
function FloatingAIDetector({ 
  conflicts, 
  onResolve 
}: { 
  conflicts: Array<{ sessionId: number, conflicts: ConflictInfo[] }>,
  onResolve: (sessionId: number, type: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const totalConflicts = conflicts.reduce((sum, c) => sum + c.conflicts.length, 0);
  const criticalConflicts = conflicts.reduce((sum, c) => 
    sum + c.conflicts.filter(conf => conf.severity === 'high').length, 0
  );

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="sm"
        >
          <Bot className="h-6 w-6 text-white" />
          {totalConflicts > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
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
      className="fixed bottom-6 right-6 z-50 w-96 max-h-[70vh] overflow-hidden"
    >
      <Card className="shadow-2xl border-2 border-blue-200 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Assistant IA</CardTitle>
                <p className="text-xs text-gray-600">Détection de conflits intelligente</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {totalConflicts === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Aucun conflit détecté!</p>
                <p className="text-xs text-gray-600">Votre emploi du temps est optimisé</p>
              </div>
            ) : (
              <>
                <div className="text-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{totalConflicts}</div>
                  <p className="text-sm text-red-700">Conflit(s) détecté(s)</p>
                  {criticalConflicts > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {criticalConflicts} critique(s)
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {conflicts.slice(0, 5).map((sessionConflict) => 
                    sessionConflict.conflicts.map((conflict, idx) => (
                      <div
                        key={`${sessionConflict.sessionId}-${idx}`}
                        className={`p-3 rounded-lg border ${
                          conflict.severity === 'high' ? 'bg-red-50 border-red-200' :
                          conflict.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1">{conflict.message}</p>
                            {conflict.conflictWith && (
                              <p className="text-xs opacity-75">
                                Conflit avec: {conflict.conflictWith}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {conflict.severity}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-6 text-xs"
                          onClick={() => onResolve(sessionConflict.sessionId, conflict.type)}
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Résoudre
                        </Button>
                      </div>
                    ))
                  )}
                  
                  {totalConflicts > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      ... et {totalConflicts - 5} autre(s) conflit(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Re-analyser
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Auto-résoudre
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export default function SchedulePage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date('2025-08-05'));
  const [currentWeek, setCurrentWeek] = useState(new Date('2025-08-05'));
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  
  const { addToast } = useToast();

  // Génération des créneaux horaires détaillés (intervalles de 15 minutes)
  const generateDetailedTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          isHour: minute === 0,
          isMajor: minute === 0 && hour % 2 === 0
        });
      }
    }
    return slots;
  };

  const timeSlots = generateDetailedTimeSlots();

  // Charger les curricula au démarrage
  useEffect(() => {
    loadCurricula();
  }, []);

  // Charger les données quand les paramètres changent
  useEffect(() => {
    if (selectedCurriculum) {
      if (viewMode === 'week') {
        loadWeeklyData();
      } else {
        loadDailyData();
      }
    }
  }, [selectedCurriculum, currentWeek, selectedDate, viewMode]);

  // Filtrer les sessions
  useEffect(() => {
    let allSessions: ScheduleSession[] = [];
    
    if (viewMode === 'week' && weeklyData) {
      allSessions = Object.values(weeklyData.sessions_by_day).flat() as ScheduleSession[];
    } else if (viewMode === 'day' && dailyData) {
      allSessions = dailyData.sessions;
    }
    
    let filtered = allSessions;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(session => session.session_type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.course_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.course_details?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher_details?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher_details?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.room_details?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setSessions(allSessions);
    setFilteredSessions(filtered);
  }, [weeklyData, dailyData, viewMode, searchTerm, filterType]);

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
      const weekStart = scheduleService.getWeekStart(currentWeek);
      const data = await scheduleService.getWeeklySessions({
        week_start: weekStart,
        curriculum: selectedCurriculum
      });
      
      setWeeklyData(data);
      
      addToast({
        title: "Sessions hebdomadaires chargées",
        description: `${data.total_sessions} session(s) trouvée(s) pour la semaine`,
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données hebdomadaires:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de charger les données hebdomadaires",
        variant: "destructive"
      });
      setWeeklyData(null);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadDailyData = async () => {
    if (!selectedCurriculum) return;
    
    setSessionsLoading(true);
    try {
      const dateString = typeof selectedDate === 'string' ? selectedDate : scheduleService.formatDate(selectedDate);
      const data = await scheduleService.getDailySessions({
        date: dateString,
        curriculum: selectedCurriculum
      });
      
      setDailyData(data);
      
      addToast({
        title: "Sessions journalières chargées",
        description: `${data.total_sessions} session(s) trouvée(s) pour le ${dateString}`,
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données journalières:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de charger les données journalières",
        variant: "destructive"
      });
      setDailyData(null);
    } finally {
      setSessionsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'CM': return 'bg-blue-100 border-l-4 border-l-blue-500 text-blue-900';
      case 'TD': return 'bg-green-100 border-l-4 border-l-green-500 text-green-900';
      case 'TP': return 'bg-purple-100 border-l-4 border-l-purple-500 text-purple-900';
      case 'EXAM': return 'bg-red-100 border-l-4 border-l-red-500 text-red-900';
      default: return 'bg-gray-100 border-l-4 border-l-gray-500 text-gray-900';
    }
  };

  // Fonction pour calculer la position et la hauteur d'une session dans la grille
  const getSessionPosition = (session: ScheduleSession) => {
    const startTime = session.specific_start_time || session.time_slot_details?.start_time || '09:00';
    const endTime = session.specific_end_time || session.time_slot_details?.end_time || '10:00';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = (startHour - 7) * 60 + startMin;
    const endMinutes = (endHour - 7) * 60 + endMin;
    
    const startSlot = Math.floor(startMinutes / 15);
    const duration = Math.ceil((endMinutes - startMinutes) / 15);
    
    return { startSlot, duration };
  };

  // Détection de conflits
  const detectConflicts = (sessions: ScheduleSession[]) => {
    const conflictsList: Array<{ sessionId: number, conflicts: ConflictInfo[] }> = [];
    
    for (let i = 0; i < sessions.length; i++) {
      const session1 = sessions[i];
      const sessionConflicts: ConflictInfo[] = [];
      
      for (let j = 0; j < sessions.length; j++) {
        if (i === j) continue;
        
        const session2 = sessions[j];
        
        const day1 = session1.time_slot_details?.day_of_week;
        const day2 = session2.time_slot_details?.day_of_week;
        const start1 = session1.specific_start_time || session1.time_slot_details?.start_time;
        const end1 = session1.specific_end_time || session1.time_slot_details?.end_time;
        const start2 = session2.specific_start_time || session2.time_slot_details?.start_time;
        const end2 = session2.specific_end_time || session2.time_slot_details?.end_time;
        
        if (day1 === day2 && start1 && end1 && start2 && end2) {
          const isOverlapping = (start1 < end2 && start2 < end1);
          
          if (isOverlapping) {
            if (session1.teacher_details?.user?.first_name === session2.teacher_details?.user?.first_name &&
                session1.teacher_details?.user?.last_name === session2.teacher_details?.user?.last_name) {
              sessionConflicts.push({
                type: 'teacher',
                severity: 'high',
                message: `Conflit enseignant: ${session1.teacher_details?.user?.first_name} ${session1.teacher_details?.user?.last_name}`,
                conflictWith: `${session2.course_details?.code} (${start2}-${end2})`
              });
            }
            
            if (session1.room_details?.code === session2.room_details?.code && session1.room_details?.code) {
              sessionConflicts.push({
                type: 'room',
                severity: 'medium',
                message: `Conflit de salle: ${session1.room_details.code}`,
                conflictWith: `${session2.course_details?.code} (${start2}-${end2})`
              });
            }
          }
        }
      }
      
      if (sessionConflicts.length > 0) {
        conflictsList.push({
          sessionId: session1.id,
          conflicts: sessionConflicts
        });
      }
    }
    
    return conflictsList;
  };

  const formatWeekRange = (currentWeek: Date) => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short' 
    };
    
    return `${startOfWeek.toLocaleDateString('fr-FR', options)} - ${endOfWeek.toLocaleDateString('fr-FR', options)}`;
  };

  // Rendu de la grille détaillée
  const renderDetailedGrid = () => {
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="sticky top-0 z-20 bg-white border-b-2 border-primary/20">
              <th className="p-3 text-left font-semibold text-foreground bg-gray-50 sticky left-0 z-30 w-20">
                Horaires
              </th>
              {days.map(day => (
                <th key={day.key} className="p-3 text-center font-semibold text-foreground bg-gray-50 min-w-40 border-l border-gray-200">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr 
                key={slot.time} 
                className={`
                  ${slot.isMajor ? 'border-t-2 border-gray-400' : 
                    slot.isHour ? 'border-t border-gray-300' : 
                    'border-t border-gray-100'}
                  ${slot.isMajor ? 'bg-gray-50' : ''}
                  hover:bg-blue-50/30 transition-colors
                `}
              >
                <td className={`
                  sticky left-0 z-10 border-r border-gray-300
                  ${slot.isMajor ? 'bg-gray-100' : slot.isHour ? 'bg-gray-50' : 'bg-white'}
                  ${slot.isMajor ? 'font-bold text-primary' : slot.isHour ? 'font-semibold' : 'text-gray-400'}
                  text-xs px-2 py-1
                `}>
                  {(slot.isHour || slot.isMajor) && (
                    <div className="text-right font-mono">
                      {slot.time}
                    </div>
                  )}
                </td>
                {days.map(day => {
                  const daySessions = (weeklyData.sessions_by_day[day.key] || []).filter((session: ScheduleSession) => {
                    const sessionStart = session.specific_start_time || session.time_slot_details?.start_time || '';
                    const [sessionHour, sessionMin] = sessionStart.split(':').map(Number);
                    const [slotHour, slotMin] = slot.time.split(':').map(Number);
                    
                    return sessionHour === slotHour && sessionMin === slotMin;
                  });

                  return (
                    <td 
                      key={`${day.key}-${slot.time}`} 
                      className="border-l border-gray-100 relative p-0"
                      style={{ height: '25px', minHeight: '25px' }}
                    >
                      {daySessions.map((session: ScheduleSession) => {
                        const { startSlot, duration } = getSessionPosition(session);
                        const topPosition = 0;
                        const height = duration * 25;

                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`
                              absolute left-1 right-1 rounded shadow-sm
                              ${getSessionTypeColor(session.session_type)}
                              hover:shadow-md hover:z-10 transition-all cursor-pointer
                              overflow-hidden
                            `}
                            style={{
                              top: `${topPosition}px`,
                              height: `${height - 2}px`,
                              minHeight: '23px'
                            }}
                          >
                            <div className="p-1 h-full flex flex-col justify-between text-xs">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold">{session.course_details?.code}</span>
                                  <Badge className="text-xs scale-75">{session.session_type}</Badge>
                                </div>
                                <div className="text-xs opacity-90">
                                  {formatTime(session.specific_start_time || session.time_slot_details?.start_time || '')} - 
                                  {formatTime(session.specific_end_time || session.time_slot_details?.end_time || '')}
                                </div>
                              </div>
                              {duration >= 3 && (
                                <div className="text-xs space-y-0.5 opacity-80">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span>{session.room_details?.code}</span>
                                  </div>
                                  {duration >= 4 && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-2.5 h-2.5" />
                                      <span className="truncate">
                                        {session.teacher_details?.user?.last_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground variant="schedule" intensity="low" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const conflicts = detectConflicts(filteredSessions);

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground variant="schedule" intensity="low" />
      
      <div className="relative z-10 space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-section"
        >
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-hero text-white mb-4 flex items-center gap-3">
                  <Calendar className="w-12 h-12 text-accent-light" />
                  Emplois du Temps
                </h1>
                <p className="text-xl text-white/90">
                  {viewMode === 'week' ? `Semaine du ${formatWeekRange(currentWeek)}` : `${selectedDate}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <MicroButton
                  variant="secondary"
                  icon={Download}
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                >
                  Exporter
                </MicroButton>
                <MicroButton
                  variant="accent"
                  icon={Plus}
                >
                  Nouveau cours
                </MicroButton>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Contrôles principaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <MicroCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Mode de vue */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Vue
                  </label>
                  <div className="flex bg-secondary/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('week')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'week'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                      }`}
                    >
                      <CalendarRange className="w-4 h-4" />
                      Semaine
                    </button>
                    <button
                      onClick={() => setViewMode('day')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'day'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                      }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      Jour
                    </button>
                  </div>
                </div>
                
                {/* Sélection classe */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Classe
                  </label>
                  <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Choisir une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {curricula.map((curriculum) => (
                        <SelectItem key={curriculum.code} value={curriculum.code}>
                          <div>
                            <div className="font-medium">{curriculum.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {curriculum.code} - {curriculum.department.name}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Date */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    {viewMode === 'week' ? 'Semaine du' : 'Date'}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="date" 
                      value={viewMode === 'week' ? scheduleService.formatDate(currentWeek) : (typeof selectedDate === 'string' ? selectedDate : scheduleService.formatDate(selectedDate))}
                      onChange={(e) => {
                        if (viewMode === 'week') {
                          setCurrentWeek(new Date(e.target.value));
                        } else {
                          setSelectedDate(new Date(e.target.value));
                        }
                      }}
                      className="input"
                    />
                    {viewMode === 'week' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const prevWeek = new Date(currentWeek);
                            prevWeek.setDate(prevWeek.getDate() - 7);
                            setCurrentWeek(prevWeek);
                          }}
                          className="p-2 rounded-md hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const nextWeek = new Date(currentWeek);
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            setCurrentWeek(nextWeek);
                          }}
                          className="p-2 rounded-md hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cours, enseignant, salle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                
                {/* Filtre */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Type
                  </label>
                  <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                    <SelectTrigger className="input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="CM">CM</SelectItem>
                      <SelectItem value="TD">TD</SelectItem>
                      <SelectItem value="TP">TP</SelectItem>
                      <SelectItem value="EXAM">Examens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </MicroCard>
          </motion.div>

          {/* Statistiques condensées */}
          {sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <MicroCard className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(() => {
                    const stats = {
                      total: sessions.length,
                      CM: sessions.filter(s => s.session_type === 'CM').length,
                      TD: sessions.filter(s => s.session_type === 'TD').length,
                      TP: sessions.filter(s => s.session_type === 'TP').length,
                      EXAM: sessions.filter(s => s.session_type === 'EXAM').length,
                      totalStudents: sessions.reduce((sum, s) => sum + s.expected_students, 0),
                    };
                    return [
                      { label: 'Sessions', value: stats.total, icon: BookOpen, color: 'var(--primary)' },
                      { label: 'Étudiants', value: stats.totalStudents, icon: Users, color: 'var(--accent)' },
                      { label: 'CM', value: stats.CM, icon: Target, color: 'var(--primary)' },
                      { label: 'TD', value: stats.TD, icon: Activity, color: 'var(--accent)' },
                      { label: 'TP', value: stats.TP, icon: Zap, color: 'var(--accent-light)' },
                      { label: 'Examens', value: stats.EXAM, icon: AlertTriangle, color: 'var(--destructive)' }
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                        >
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </MicroCard>
            </motion.div>
          )}

          {/* Grille d'emploi du temps détaillée */}
          {selectedCurriculum && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <MicroCard>
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-heading flex items-center gap-3">
                      <Eye className="w-6 h-6 text-primary" />
                      {curricula.find(c => c.code === selectedCurriculum)?.name}
                      <Badge className="bg-primary/10 text-primary">
                        {filteredSessions.length} session(s)
                      </Badge>
                    </h3>
                    
                    {searchTerm && (
                      <Badge variant="secondary">
                        Filtré par: "{searchTerm}"
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-0">
                  {sessionsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement des sessions...</p>
                      </div>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mx-auto w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h4 className="text-heading text-foreground mb-2">
                        {sessions.length === 0 ? 'Aucune session programmée' : 'Aucun résultat'}
                      </h4>
                      <p className="text-body text-muted-foreground mb-6">
                        {sessions.length === 0 
                          ? `Aucun cours trouvé pour ${viewMode === 'week' ? 'cette semaine' : 'cette date'} et cette classe`
                          : 'Modifiez vos critères de recherche'
                        }
                      </p>
                      {searchTerm && (
                        <MicroButton 
                          variant="secondary"
                          onClick={() => setSearchTerm('')}
                        >
                          Effacer la recherche
                        </MicroButton>
                      )}
                    </div>
                  ) : (
                    viewMode === 'week' && renderDetailedGrid()
                  )}
                </div>
              </MicroCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Assistant IA Flottant pour la détection de conflits */}
      <FloatingAIDetector 
        conflicts={conflicts}
        onResolve={(sessionId, type) => {
          addToast({
            title: "Résolution de conflit",
            description: `Tentative de résolution du conflit de type "${type}" pour la session ${sessionId}`,
            variant: "default"
          });
        }}
      />
    </div>
  );
}