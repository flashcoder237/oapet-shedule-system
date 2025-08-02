'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Download, Eye, Grid, List, Clock, MapPin, User, Edit, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { scheduleService } from '@/lib/api/services/schedules';
import type { Schedule } from '@/types/api';

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<string[]>(['all']);
  const [rooms, setRooms] = useState<string[]>(['all']);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Jours de la semaine
  const weekDays = [
    { short: 'Lun', full: 'Lundi' },
    { short: 'Mar', full: 'Mardi' },
    { short: 'Mer', full: 'Mercredi' },
    { short: 'Jeu', full: 'Jeudi' },
    { short: 'Ven', full: 'Vendredi' },
    { short: 'Sam', full: 'Samedi' }
  ];

  // Créneaux horaires
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', 
    '16:00', '17:00', '18:00'
  ];

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const schedulesData = await scheduleService.getSchedules();
        setSchedules(schedulesData);
        
        // Extraire les classes et salles uniques
        const uniqueClasses = ['all', ...new Set(schedulesData.map(s => s.class_level || 'Non défini'))];
        const uniqueRooms = ['all', ...new Set(schedulesData.map(s => s.room_name || 'Non défini'))];
        
        setClasses(uniqueClasses);
        setRooms(uniqueRooms);
        
      } catch (error) {
        console.error('Erreur lors du chargement des emplois du temps:', error);
        setError('Erreur lors du chargement des données');
        toast({
          title: "Erreur",
          description: "Impossible de charger les emplois du temps. Vérifiez votre connexion.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Filtrer les sessions
  const filteredSessions = schedules.filter(schedule => {
    const matchesClass = selectedClass === 'all' || (schedule.class_level || 'Non défini') === selectedClass;
    const matchesRoom = selectedRoom === 'all' || (schedule.room_name || 'Non défini') === selectedRoom;
    return matchesClass && matchesRoom;
  });

  // Obtenir les sessions pour un jour et heure spécifiques
  const getSessionsForTimeSlot = (day: string, hour: string) => {
    return filteredSessions.filter(session => {
      const sessionStart = parseInt(session.startTime.split(':')[0]);
      const sessionEnd = parseInt(session.endTime.split(':')[0]);
      const currentHour = parseInt(hour.split(':')[0]);
      
      return session.day === day && currentHour >= sessionStart && currentHour < sessionEnd;
    });
  };

  // Calculer la hauteur d'une session
  const getSessionHeight = (duration: number) => {
    return duration * 60; // 60px par heure
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'conflict': return '⚠️';
      default: return '';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
  };

  if (isLoading) {
    return (
      <PageLoading 
        message="Chargement des emplois du temps..." 
        variant="detailed"
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* En-tête */}
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Emploi du Temps</h1>
          <p className="text-secondary mt-1">Planification et gestion des cours avec IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle session
          </Button>
        </div>
      </motion.div>

      {/* Contrôles et filtres */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Navigation semaine */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h2 className="font-semibold text-lg">Semaine du {formatWeekRange(currentWeek)}</h2>
            <p className="text-sm text-gray-500">
              {currentWeek.getFullYear()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Aujourd'hui
          </Button>
        </div>

        {/* Filtres et vue */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="all">Toutes les classes</option>
            {classes.slice(1).map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="all">Toutes les salles</option>
            {rooms.slice(1).map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vue grille de l'emploi du temps */}
      {viewMode === 'grid' && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 px-2 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaire
                  </th>
                  {weekDays.map(day => (
                    <th key={day.full} className="px-3 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      {day.full}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(time => (
                  <tr key={time} className="h-16">
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100 bg-gray-50">
                      {time}
                    </td>
                    {weekDays.map(day => {
                      const sessions = getSessionsForTimeSlot(day.full, time);
                      
                      return (
                        <td key={`${day.full}-${time}`} className="px-2 py-1 border-r border-gray-100 relative h-16">
                          {sessions.map(session => {
                            const isFirstHour = parseInt(time.split(':')[0]) === parseInt(session.startTime.split(':')[0]);
                            
                            if (!isFirstHour) return null;
                            
                            return (
                              <div
                                key={session.id}
                                className={`absolute inset-x-1 p-2 rounded border ${session.color} cursor-pointer hover:shadow-md transition-shadow z-10`}
                                style={{
                                  height: `${getSessionHeight(session.duration) - 8}px`,
                                  top: '4px'
                                }}
                                title="Cliquer pour voir les détails"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-xs truncate">
                                    {session.courseName}
                                  </p>
                                  <span className="text-xs">
                                    {getStatusIcon(session.status)}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{session.startTime}-{session.endTime}</span>
                                  </div>
                                  <div className="flex items-center text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">{session.room}</span>
                                  </div>
                                  <div className="flex items-center text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    <span className="truncate">{session.professor}</span>
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {session.class} ({session.studentsCount} ét.)
                                  </div>
                                </div>
                              </div>
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
        </Card>
      )}

      {/* Vue liste */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {weekDays.map(day => {
            const daySessions = filteredSessions.filter(session => session.day === day.full);
            
            return (
              <Card key={day.full} className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {day.full}
                  <span className="ml-2 text-sm text-gray-500">
                    ({daySessions.length} session{daySessions.length > 1 ? 's' : ''})
                  </span>
                </h3>
                
                {daySessions.length === 0 ? (
                  <p className="text-gray-500 italic">Aucun cours programmé</p>
                ) : (
                  <div className="space-y-3">
                    {daySessions
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(session => (
                        <div key={session.id} className={`p-4 rounded-lg border ${session.color.replace('text-', 'hover:text-')} cursor-pointer hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{session.courseName}</h4>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {session.courseCode}
                                </span>
                                <span className="text-sm">
                                  {getStatusIcon(session.status)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>{session.startTime} - {session.endTime}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>{session.room}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>{session.professor}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-500">{session.class} ({session.studentsCount} étudiants)</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 ml-4">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Légende des statuts */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Légende des statuts</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            <span>Confirmé</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⏳</span>
            <span>En attente</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>Conflit détecté</span>
          </div>
        </div>
      </Card>
    </div>
  );
}