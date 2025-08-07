// src/components/calendar/InteractiveCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  BookOpen,
  User,
  Plus,
  Filter,
  Search,
  Grid3x3,
  List,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Tag,
  Share2,
  Download,
  Printer,
  Settings,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Bell,
  Moon,
  Sun,
  Cloud,
  Compass
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'course' | 'exam' | 'meeting' | 'break' | 'event';
  professor?: string;
  room?: string;
  participants?: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface InteractiveCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventAdd?: (date: Date) => void;
  view?: 'month' | 'week' | 'day';
  editable?: boolean;
}

export default function InteractiveCalendar({
  events = [],
  onEventClick,
  onDateClick,
  onEventAdd,
  view: initialView = 'month',
  editable = true
}: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    professor: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const eventsToUse = events;
    
    let filtered = eventsToUse.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.professor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.room?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || event.type === filters.type;
      const matchesStatus = filters.status === 'all' || event.status === filters.status;
      const matchesProfessor = filters.professor === 'all' || event.professor === filters.professor;

      return matchesSearch && matchesType && matchesStatus && matchesProfessor;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, filters]);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'course': return <BookOpen className="w-3 h-3" />;
      case 'exam': return <Target className="w-3 h-3" />;
      case 'meeting': return <Users className="w-3 h-3" />;
      case 'break': return <Cloud className="w-3 h-3" />;
      case 'event': return <Star className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getStatusIcon = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case 'pending': return <Clock className="w-3 h-3 text-amber-500" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3 text-destructive" />;
      default: return <Info className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-amber-500';
      case 'low': return 'border-l-emerald-500';
      default: return 'border-l-border';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    onEventClick?.(event);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Jours du mois */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === day.date.toDateString();

          return (
            <motion.div
              key={index}
              className={`
                min-h-[80px] p-1 border border-border cursor-pointer
                ${!day.isCurrentMonth ? 'bg-muted text-muted-foreground' : 'bg-card'}
                ${isToday ? 'bg-primary-subtle/20 border-primary' : ''}
                ${isSelected ? 'ring-2 ring-primary' : ''}
                hover:bg-primary-subtle/10 transition-colors
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDateClick(day.date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                  {day.date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <motion.div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded border-l-2 ${event.color} bg-card/80
                      ${getPriorityColor(event.priority)} cursor-pointer
                      hover:bg-card transition-colors
                    `}
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {getEventIcon(event.type)}
                      <span className="truncate flex-1">{event.title}</span>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-2 h-2" />
                      <span>{event.startTime}</span>
                    </div>
                  </motion.div>
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-xs text-center text-muted-foreground cursor-pointer hover:text-primary">
                    +{dayEvents.length - 2} autres
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    const timeSlots = Array.from({ length: 14 }, (_, i) => {
      const hour = 7 + i;
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* En-tête vide pour la colonne des heures */}
        <div className="p-2"></div>
        
        {/* En-têtes des jours */}
        {weekDates.map(date => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div
              key={date.toISOString()}
              className={`p-2 text-center ${isToday ? 'bg-primary text-primary-foreground rounded' : ''}`}
            >
              <div className="text-sm font-medium">{weekDays[date.getDay()]}</div>
              <div className="text-lg font-bold">{date.getDate()}</div>
            </div>
          );
        })}
        
        {/* Grille horaire */}
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            {/* Colonne des heures */}
            <div className="p-2 text-sm text-muted-foreground border-r border-border text-right">
              {time}
            </div>
            
            {/* Colonnes des jours */}
            {weekDates.map(date => {
              const dayEvents = getEventsForDate(date).filter(event => {
                const eventHour = parseInt(event.startTime.split(':')[0]);
                const slotHour = parseInt(time.split(':')[0]);
                return eventHour === slotHour;
              });

              return (
                <div
                  key={`${date.toISOString()}-${time}`}
                  className="min-h-[60px] border border-border p-1 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleDateClick(date)}
                >
                  {dayEvents.map(event => (
                    <motion.div
                      key={event.id}
                      className={`
                        ${event.color} text-white p-2 rounded mb-1 cursor-pointer
                        border-l-4 ${getPriorityColor(event.priority)}
                      `}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className="font-medium text-xs">{event.title}</div>
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <MapPin className="w-2 h-2" />
                        <span>{event.room}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendrier Interactif
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Filtres */}
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filtres
            </Button>

            {/* Vues */}
            <div className="flex border rounded overflow-hidden">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className="rounded-none"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Actions */}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Exporter
            </Button>
            
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Événement
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl font-bold text-primary">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground">Cours</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-muted-foreground">Examens</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground">Réunions</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
        </motion.div>
      </CardContent>

      {/* Modal d'événement */}
      <AnimatePresence>
        {showEventModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedEvent.status)}
                  <Button variant="ghost" size="sm" onClick={() => setShowEventModal(false)}>
                    ✕
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                
                {selectedEvent.professor && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.professor}</span>
                  </div>
                )}
                
                {selectedEvent.room && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.room}</span>
                  </div>
                )}
                
                {selectedEvent.participants && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.participants} participants</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Partager
                </Button>
                <Button size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Voir détails
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}