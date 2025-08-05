'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, Clock, MapPin, User, BookOpen, Users, Search, Filter, 
  Grid3x3, List, CalendarDays, Download, Plus, Settings, Eye,
  ChevronLeft, ChevronRight, MoreHorizontal, Zap, TrendingUp
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

type ViewMode = 'grid' | 'list' | 'timeline' | 'calendar';
type FilterType = 'all' | 'CM' | 'TD' | 'TP' | 'EXAM';

export default function SchedulePage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState('2025-08-05');
  const { addToast } = useToast();

  // Charger les curricula au démarrage
  useEffect(() => {
    loadCurricula();
  }, []);

  // Charger les sessions quand un curriculum est sélectionné
  useEffect(() => {
    if (selectedCurriculum) {
      loadSessions();
    }
  }, [selectedCurriculum, selectedDate]);

  // Filtrer les sessions en fonction de la recherche et du filtre
  useEffect(() => {
    let filtered = sessions;
    
    // Filtrer par type de session
    if (filterType !== 'all') {
      filtered = filtered.filter(session => session.session_type === filterType);
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.course_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.course_details.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher_details.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher_details.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.room_details.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSessions(filtered);
  }, [sessions, searchTerm, filterType]);

  const loadCurricula = async () => {
    try {
      console.log('Chargement des curricula...');
      const response = await fetch(`${API_BASE_URL}/courses/curricula/`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Curricula reçus:', data);
      
      setCurricula(data.results || data);
      
      // Sélectionner automatiquement le premier curriculum
      if ((data.results || data).length > 0) {
        setSelectedCurriculum((data.results || data)[0].code);
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

  const loadSessions = async () => {
    if (!selectedCurriculum) return;
    
    setSessionsLoading(true);
    try {
      console.log('Chargement des sessions pour:', selectedCurriculum);
      
      // Récupérer les sessions pour le curriculum sélectionné et la date sélectionnée
      const response = await fetch(
        `${API_BASE_URL}/schedules/sessions/?curriculum=${selectedCurriculum}&date=${selectedDate}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sessions reçues:', data);
      
      setSessions(data.results || []);
      
      if ((data.results || []).length > 0) {
        addToast({
          title: "Sessions chargées",
          description: `${(data.results || []).length} session(s) trouvée(s) pour ${selectedCurriculum}`,
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
      case 'CM': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'TD': return 'bg-green-100 border-green-300 text-green-800';
      case 'TP': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'EXAM': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
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

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getSessionStats = () => {
    const stats = {
      total: sessions.length,
      CM: sessions.filter(s => s.session_type === 'CM').length,
      TD: sessions.filter(s => s.session_type === 'TD').length,
      TP: sessions.filter(s => s.session_type === 'TP').length,
      EXAM: sessions.filter(s => s.session_type === 'EXAM').length,
      totalStudents: sessions.reduce((sum, s) => sum + s.expected_students, 0)
    };
    return stats;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSessions.map((session) => {
        const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
        const endTime = session.specific_end_time || session.time_slot_details?.end_time || '';
        
        return (
          <Card key={session.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4" style={{
            borderLeftColor: session.session_type === 'CM' ? '#3b82f6' : 
                           session.session_type === 'TD' ? '#10b981' :
                           session.session_type === 'TP' ? '#f59e0b' : '#ef4444'
          }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={getSessionTypeColor(session.session_type)}>
                  {getSessionTypeName(session.session_type)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTime(startTime)} - {formatTime(endTime)}
                </div>
              </div>
              <CardTitle className="text-lg">{session.course_details.name}</CardTitle>
              <p className="text-sm text-gray-600">{session.course_details.code}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{session.teacher_details.user.first_name} {session.teacher_details.user.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{session.room_details.code} - {session.room_details.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{session.expected_students} étudiants attendus</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredSessions.map((session) => {
        const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
        const endTime = session.specific_end_time || session.time_slot_details?.end_time || '';
        
        return (
          <Card key={session.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{formatTime(startTime)}</div>
                    <div className="text-sm text-gray-500">{formatTime(endTime)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{session.course_details.name}</h3>
                      <Badge variant="outline" className={getSessionTypeColor(session.session_type)}>
                        {session.session_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {session.teacher_details.user.first_name} {session.teacher_details.user.last_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.room_details.code}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.expected_students}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTimelineView = () => {
    const timeSlots = getTimeSlots();
    
    return (
      <div className="space-y-2">
        {timeSlots.map((timeSlot) => {
          const sessionsAtTime = filteredSessions.filter(session => {
            const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
            return startTime.startsWith(timeSlot.slice(0, 2));
          });
          
          return (
            <div key={timeSlot} className="flex items-start gap-4 py-2">
              <div className="w-16 text-sm font-medium text-gray-600 mt-2">
                {timeSlot}
              </div>
              <div className="flex-1">
                {sessionsAtTime.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {sessionsAtTime.map((session) => {
                      const startTime = session.specific_start_time || session.time_slot_details?.start_time || '';
                      const endTime = session.specific_end_time || session.time_slot_details?.end_time || '';
                      
                      return (
                        <div key={session.id} className={`p-3 rounded-lg border ${getSessionTypeColor(session.session_type)}`}>
                          <div className="font-medium text-sm">{session.course_details.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {formatTime(startTime)} - {formatTime(endTime)} • {session.room_details.code}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-8 border-l-2 border-gray-200 ml-2"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des classes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Gestion des Emplois du Temps
          </h1>
          <p className="text-gray-600 mt-2">
            Centre de contrôle des emplois du temps - {formatDate(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle session
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(() => {
            const stats = getSessionStats();
            return [
              { label: 'Total Sessions', value: stats.total, icon: BookOpen, color: 'blue' },
              { label: 'Cours Magistraux', value: stats.CM, icon: BookOpen, color: 'blue' },
              { label: 'Travaux Dirigés', value: stats.TD, icon: Users, color: 'green' },
              { label: 'Travaux Pratiques', value: stats.TP, icon: Zap, color: 'orange' },
              { label: 'Total Étudiants', value: stats.totalStudents, icon: TrendingUp, color: 'purple' }
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            ));
          })()
          }
        </div>
      )}

      {/* Barre de contrôles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Sélection de classe */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Classe</label>
              <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une classe" />
                </SelectTrigger>
                <SelectContent>
                  {curricula.map((curriculum) => (
                    <SelectItem key={curriculum.code} value={curriculum.code}>
                      <div className="flex flex-col">
                        <span className="font-medium">{curriculum.name}</span>
                        <span className="text-xs text-gray-500">{curriculum.code} - {curriculum.department.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            
            {/* Recherche */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Rechercher un cours, enseignant, salle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filtre */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="w-32">
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
            
            {/* Mode d'affichage */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Vue</label>
              <div className="flex border rounded-md">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-r"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('timeline')}
                  className="rounded-l-none"
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affichage des sessions */}
      {selectedCurriculum && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {curricula.find(c => c.code === selectedCurriculum)?.name}
                <Badge variant="outline">{filteredSessions.length} session(s)</Badge>
              </CardTitle>
              
              {searchTerm && (
                <Badge variant="secondary">
                  Filtré par: "{searchTerm}"
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3">Chargement des sessions...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {sessions.length === 0 ? 'Aucune session programmée' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-500">
                  {sessions.length === 0 
                    ? `Aucune session trouvée pour ${curricula.find(c => c.code === selectedCurriculum)?.name} le ${formatDate(selectedDate)}`
                    : 'Essayez de modifier vos critères de recherche ou filtres'
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')} 
                    className="mt-4"
                  >
                    Effacer la recherche
                  </Button>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'grid' && renderGridView()}
                {viewMode === 'list' && renderListView()}
                {viewMode === 'timeline' && renderTimelineView()}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions rapides et statut */}
      {selectedCurriculum && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cours aujourd'hui</p>
                  <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Étudiants concernés</p>
                  <p className="text-2xl font-bold text-green-600">{getSessionStats().totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Heures de cours</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(sessions.reduce((total, s) => {
                      const start = s.specific_start_time || s.time_slot_details?.start_time || '00:00';
                      const end = s.specific_end_time || s.time_slot_details?.end_time || '00:00';
                      const startHour = parseInt(start.split(':')[0]);
                      const endHour = parseInt(end.split(':')[0]);
                      return total + (endHour - startHour);
                    }, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}