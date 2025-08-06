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
  CalendarRange
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type FilterType = 'all' | 'CM' | 'TD' | 'TP' | 'EXAM';

// Define formatWeekRange outside component to ensure it's always accessible
const formatWeekRange = (currentWeek: Date) => {
  const startOfWeek = new Date(currentWeek);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  startOfWeek.setDate(diff);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short' 
  };
  
  return `${startOfWeek.toLocaleDateString('fr-FR', options)} - ${endOfWeek.toLocaleDateString('fr-FR', options)}`;
};

type ViewMode = 'week' | 'day';

export default function SchedulePage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  // Nouveau système de vues
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date('2025-08-05'));
  const [currentWeek, setCurrentWeek] = useState(new Date('2025-08-05'));
  
  // Données structurées
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  
  const { addToast } = useToast();


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
      console.log('Curricula reçus:', data);
      setCurricula(data.results || data);
      
      if ((data.results || data).length > 0) {
        const firstCurriculum = (data.results || data)[0];
        console.log('Premier curriculum sélectionné:', firstCurriculum);
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

  const loadSessions = async () => {
    if (!selectedCurriculum) return;
    
    setSessionsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedules/sessions/?curriculum=${selectedCurriculum}&date=${selectedDate}`
      );
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      setSessions(data.results || []);
      
      if ((data.results || []).length > 0) {
        addToast({
          title: "Sessions chargées",
          description: `${(data.results || []).length} session(s) trouvée(s)`,
        });
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

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM
  };


  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'CM': return 'bg-primary/10 border-primary/30 text-primary';
      case 'TD': return 'bg-accent/10 border-accent/30 text-accent';
      case 'TP': return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'EXAM': return 'bg-red-100 border-red-300 text-red-700';
      default: return 'bg-secondary/10 border-secondary/30 text-secondary-600';
    }
  };

  const getSessionTypeName = (type: string) => {
    switch (type) {
      case 'CM': return 'Cours Magistral';
      case 'TD': return 'Travaux Dirigés';
      case 'TP': return 'Travaux Pratiques';
      case 'EXAM': return 'Examen';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSessionStats = () => {
    return {
      total: sessions.length,
      CM: sessions.filter(s => s.session_type === 'CM').length,
      TD: sessions.filter(s => s.session_type === 'TD').length,
      TP: sessions.filter(s => s.session_type === 'TP').length,
      EXAM: sessions.filter(s => s.session_type === 'EXAM').length,
      totalStudents: sessions.reduce((sum, s) => sum + s.expected_students, 0),
      totalHours: sessions.reduce((total, s) => {
        const start = s.specific_start_time || s.time_slot_details?.start_time || '00:00';
        const end = s.specific_end_time || s.time_slot_details?.end_time || '00:00';
        const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
        const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
        return total + ((endMinutes - startMinutes) / 60);
      }, 0)
    };
  };

  // Créer un planning en tableau avec créneaux horaires
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    return slots;
  };

  const renderWeeklyScheduleTable = () => {
    if (!weeklyData || !weeklyData.sessions_by_day) {
      return <div className="text-center py-8 text-gray-500">Aucune donnée hebdomadaire disponible</div>;
    }
    
    const days = [
      { key: 'monday', label: 'Lundi' },
      { key: 'tuesday', label: 'Mardi' },
      { key: 'wednesday', label: 'Mercredi' },
      { key: 'thursday', label: 'Jeudi' },
      { key: 'friday', label: 'Vendredi' },
      { key: 'saturday', label: 'Samedi' },
      { key: 'sunday', label: 'Dimanche' }
    ];
    
    const timeSlots = getTimeSlots();
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="p-4 text-left font-semibold text-gray-700 bg-secondary/10 sticky left-0 z-10">
                Horaires
              </th>
              {days.map(day => (
                <th key={day.key} className="p-4 text-center font-semibold text-gray-700 bg-secondary/10 min-w-48">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length: 11}, (_, i) => i + 8).map(hour => (
              <tr key={hour} className="border-b border-gray-100 hover:bg-secondary/5 transition-colors">
                <td className="p-4 font-medium text-gray-600 bg-secondary/5 sticky left-0 z-10 border-r">
                  <div className="text-lg font-bold text-primary">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="text-sm text-gray-500">
                    {(hour + 1).toString().padStart(2, '0')}:00
                  </div>
                </td>
                {days.map(day => {
                  const daySessions = weeklyData.sessions_by_day[day.key] || [];
                  const hourSessions = daySessions.filter((session: ScheduleSession) => {
                    const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
                    return startTime.startsWith(hour.toString().padStart(2, '0'));
                  });
                  
                  return (
                    <td key={day.key} className="p-2 align-top">
                      {hourSessions.length > 0 ? (
                        <div className="space-y-1">
                          {hourSessions.map((session: ScheduleSession) => {
                            const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
                            const endTime = session.specific_end_time || session.time_slot_details?.end_time || '';
                            
                            return (
                              <motion.div
                                key={session.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`p-2 rounded-lg border-l-4 text-sm cursor-pointer transition-all hover:shadow-md ${
                                  session.session_type === 'CM' ? 'border-l-primary bg-primary/5 hover:bg-primary/10' :
                                  session.session_type === 'TD' ? 'border-l-accent bg-accent/5 hover:bg-accent/10' :
                                  session.session_type === 'TP' ? 'border-l-orange-500 bg-orange-50 hover:bg-orange-100' :
                                  'border-l-red-500 bg-red-50 hover:bg-red-100'
                                }`}
                              >
                                <div className="font-semibold text-gray-900 mb-1 text-xs">
                                  {session.course_details?.code || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-600 mb-1">
                                  {formatTime(startTime)}-{formatTime(endTime)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {session.room_details?.code || 'N/A'}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-12"></div>
                      )}
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

  const renderScheduleTable = () => {
    const timeSlots = getTimeSlots();
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="p-4 text-left font-semibold text-gray-700 bg-secondary/10 sticky left-0 z-10">
                Horaires
              </th>
              <th className="p-4 text-center font-semibold text-gray-700 bg-secondary/10 min-w-96">
                Planning du {formatDate(typeof selectedDate === 'string' ? selectedDate : selectedDate.toISOString().split('T')[0])}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Regrouper les créneaux par heure pour une meilleure lisibilité */}
            {Array.from({length: 11}, (_, i) => i + 8).map(hour => {
              const hourSessions = filteredSessions.filter(session => {
                const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
                return startTime.startsWith(hour.toString().padStart(2, '0'));
              });

              return (
                <tr key={hour} className="border-b border-gray-100 hover:bg-secondary/5 transition-colors">
                  <td className="p-4 font-medium text-gray-600 bg-secondary/5 sticky left-0 z-10 border-r">
                    <div className="text-lg font-bold text-primary">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="text-sm text-gray-500">
                      {(hour + 1).toString().padStart(2, '0')}:00
                    </div>
                  </td>
                  <td className="p-2">
                    {hourSessions.length > 0 ? (
                      <div className="space-y-2">
                        {hourSessions.map((session) => {
                          const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
                          const endTime = session.specific_end_time || session.time_slot_details?.end_time || '';
                          
                          return (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                session.session_type === 'CM' ? 'border-l-primary bg-primary/5 hover:bg-primary/10' :
                                session.session_type === 'TD' ? 'border-l-accent bg-accent/5 hover:bg-accent/10' :
                                session.session_type === 'TP' ? 'border-l-orange-500 bg-orange-50 hover:bg-orange-100' :
                                'border-l-red-500 bg-red-50 hover:bg-red-100'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {session.course_details?.name || 'Cours non défini'}
                                    </h4>
                                    <Badge className={getSessionTypeColor(session.session_type)}>
                                      {session.session_type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-gray-600 mb-2">
                                    {session.course_details?.code || 'Code non défini'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-primary font-bold text-lg">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">
                                    {session.teacher_details?.user ? 
                                      `${session.teacher_details.user.first_name} ${session.teacher_details.user.last_name}` : 
                                      'Enseignant non défini'
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">
                                    {session.room_details ? 
                                      `${session.room_details.code} - ${session.room_details.name}` : 
                                      'Salle non définie'
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">
                                    {session.expected_students} étudiants
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-gray-400 text-sm">
                        Aucun cours programmé
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
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
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground variant="schedule" intensity="low" />
      
      <div className="relative z-10 space-y-8 p-6">
        {/* Header moderne */}
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
                  Gestion centralisée des plannings académiques - {viewMode === 'week' ? `Semaine du ${formatWeekRange(currentWeek)}` : `Jour du ${typeof selectedDate === 'string' ? selectedDate : selectedDate.toISOString().split('T')[0]}`}
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
          {/* Statistiques condensées */}
          {sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <MicroCard className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(() => {
                    const stats = getSessionStats();
                    return [
                      { label: 'Sessions', value: stats.total, icon: BookOpen, color: 'var(--primary)' },
                      { label: 'Étudiants', value: stats.totalStudents, icon: Users, color: 'var(--accent)' },
                      { label: 'Heures', value: Math.round(stats.totalHours), icon: Clock, color: 'var(--primary-light)' },
                      { label: 'CM', value: stats.CM, icon: Target, color: 'var(--primary)' },
                      { label: 'TD', value: stats.TD, icon: Activity, color: 'var(--accent)' },
                      { label: 'TP', value: stats.TP, icon: Zap, color: 'var(--accent-light)' }
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                        >
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </MicroCard>
            </motion.div>
          )}

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
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Vue
                  </label>
                  <div className="flex bg-secondary/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('week')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'week'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      Jour
                    </button>
                  </div>
                </div>
                
                {/* Sélection classe */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
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
                            <div className="text-xs text-gray-500">
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
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
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
                          className="p-2 rounded-md hover:bg-secondary/10 text-gray-500 hover:text-gray-700"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const nextWeek = new Date(currentWeek);
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            setCurrentWeek(nextWeek);
                          }}
                          className="p-2 rounded-md hover:bg-secondary/10 text-gray-500 hover:text-gray-700"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
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

          {/* Tableau des emplois du temps */}
          {selectedCurriculum && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <MicroCard>
                <div className="p-6 border-b border-gray-100">
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
                        <p className="text-gray-600">Chargement des sessions...</p>
                      </div>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mx-auto w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                        <Calendar className="h-12 w-12 text-gray-400" />
                      </div>
                      <h4 className="text-heading text-gray-700 mb-2">
                        {sessions.length === 0 ? 'Aucune session programmée' : 'Aucun résultat'}
                      </h4>
                      <p className="text-body text-gray-500 mb-6">
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
                    viewMode === 'week' ? renderWeeklyScheduleTable() : renderScheduleTable()
                  )}
                </div>
              </MicroCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}