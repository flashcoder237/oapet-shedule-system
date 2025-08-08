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
  GripVertical,
  GraduationCap
} from 'lucide-react';

// Import the API types
import { ScheduleSession as ApiScheduleSession, Teacher, Course, Room, TimeSlot } from '@/types/api';
import { scheduleService } from '@/lib/api/services/schedules';

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

// Composant Header flottant comme l'assistant IA
function FloatingHeader({ 
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
  curricula,
  conflicts,
  addToast
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 z-50"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 shadow-xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 p-0 transition-all duration-300 border-2 border-white/20"
        >
          <motion.div
            animate={{ 
              rotate: isHovered ? 360 : 0,
              scale: isHovered ? 1.1 : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            <Calendar className="h-7 w-7 text-white" />
          </motion.div>
        </Button>
        
        {/* Tooltip animé */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap pointer-events-none"
        >
          Ouvrir les contrôles
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 100, y: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 100, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-24 right-6 z-50 w-96"
    >
      <Card className="shadow-2xl border-2 border-blue-200/50 backdrop-blur-sm bg-white/95">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-2 pt-3 relative overflow-hidden">
          {/* Effet de brillance animé */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          />
          
          <div className="flex items-center justify-between relative">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Calendar className="h-5 w-5 text-blue-600" />
              </motion.div>
              <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Emplois du temps
              </CardTitle>
            </motion.div>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-red-100 transition-colors duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors duration-200" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Sélection de classe */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <GraduationCap className="h-4 w-4 text-blue-500" />
              </motion.div>
              Classe
            </label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="w-full transition-all duration-200 hover:border-blue-400 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {curricula.map((c: Curriculum) => (
                  <SelectItem key={c.code} value={c.code} className="hover:bg-blue-50">
                    <span className="font-medium">{c.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Navigation temporelle */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Clock className="h-4 w-4 text-green-500" />
              </motion.div>
              Date
            </label>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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
              </motion.div>

              <Input 
                type="date" 
                value={scheduleService.formatDate(selectedDate)}
                onChange={(e) => onDateChange(new Date(e.target.value))}
                className="flex-1 transition-all duration-200 hover:border-blue-400 focus:ring-blue-500"
              />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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
              </motion.div>
            </div>
          </motion.div>

          {/* Mode de vue */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Eye className="h-4 w-4 text-purple-500" />
              </motion.div>
              Vue
            </label>
            <div className="flex bg-muted rounded-lg p-1 gap-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-blue-100"
                  onClick={() => onViewModeChange('day')}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Jour
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-blue-100"
                  onClick={() => onViewModeChange('week')}
                >
                  <CalendarRange className="w-4 h-4 mr-2" />
                  Semaine
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-blue-100"
                  onClick={() => onViewModeChange('month')}
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Mois
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Mode édition */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Settings className="h-4 w-4 text-orange-500" />
              </motion.div>
              Mode
            </label>
            <div className="flex bg-muted rounded-lg p-1 gap-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant={editMode === 'view' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-green-100"
                  onClick={() => onEditModeChange('view')}
                  title="Mode consultation"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Vue
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant={editMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-yellow-100"
                  onClick={() => onEditModeChange('edit')}
                  title="Mode édition"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Éditer
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant={editMode === 'drag' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-purple-100"
                  onClick={() => onEditModeChange('drag')}
                  title="Mode glisser-déposer"
                >
                  <Move className="w-4 h-4 mr-1" />
                  Drag
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {editMode !== 'view' && hasChanges && (
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                  onClick={onSave}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                  </motion.div>
                  Sauvegarder
                </Button>
              </motion.div>
            )}

            {conflicts && conflicts.length > 0 && (
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Afficher les détails des conflits
                    const conflictDetails = conflicts.map((c: any) => 
                      `• ${c.description}\n  ${c.details || 'Détails non disponibles'}`
                    ).join('\n\n');
                    
                    addToast({
                      title: `${conflicts.length} conflits détectés`,
                      description: conflicts.length > 0 ? conflicts[0].description : "Conflits trouvés",
                      variant: "destructive"
                    });
                    
                    // Log pour debug
                    console.log('Conflits détectés:', conflicts);
                  }}
                  title={`${conflicts.length} conflits détectés`}
                  className="transition-all duration-200 hover:bg-red-50 hover:border-red-300 border-red-200"
                >
                  <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                  <span className="text-red-600 font-semibold">{conflicts.length}</span>
                </Button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={onExport}
                title="Exporter"
                className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <Download className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={onImport}
                title="Importer"
                className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Composant de filtres au-dessus du tableau
function FiltersSection({ 
  sessions, 
  filteredSessions, 
  onFilterChange,
  activeFilter,
  searchTerm,
  onSearchChange 
}: any) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filterOptions = [
    { value: 'all', label: 'Tous', count: sessions.length },
    { value: 'CM', label: 'CM', count: sessions.filter((s: ScheduleSession) => s.session_type === 'CM').length },
    { value: 'TD', label: 'TD', count: sessions.filter((s: ScheduleSession) => s.session_type === 'TD').length },
    { value: 'TP', label: 'TP', count: sessions.filter((s: ScheduleSession) => s.session_type === 'TP').length },
    { value: 'EXAM', label: 'Examens', count: sessions.filter((s: ScheduleSession) => s.session_type === 'EXAM').length }
  ];

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filtres et recherche</h3>
        <Badge variant="secondary">
          {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par cours, enseignant, salle..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtres par type */}
        <div className="flex gap-2">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(option.value as FilterType)}
              className="relative"
            >
              {option.label}
              <Badge 
                variant={filter === option.value ? 'secondary' : 'default'}
                className="ml-2 text-xs"
              >
                {option.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant de stats flottantes comme l'assistant IA
function FloatingStats({ sessions, conflicts }: any) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-40 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 p-0"
        >
          <BarChart3 className="h-6 w-6 text-white" />
          {conflicts.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {conflicts.length}
            </div>
          )}
        </Button>
      </motion.div>
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
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-40 right-6 z-50 w-80"
    >
      <Card className="shadow-2xl border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-2 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-800">Sessions</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.CM}</div>
              <div className="text-xs text-green-800">CM</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{stats.TD}</div>
              <div className="text-xs text-purple-800">TD</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{stats.TP}</div>
              <div className="text-xs text-orange-800">TP</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
              <div className="text-xl font-bold text-red-600">{stats.EXAM}</div>
              <div className="text-xs text-red-800">Examens</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{stats.conflicts}</div>
              <div className="text-xs text-yellow-800">Conflits</div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Total étudiants</span>
              </div>
              <span className="font-bold text-gray-900">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Taux d'occupation</span>
              </div>
              <span className="font-bold text-gray-900">
                {sessions.length > 0 ? Math.round((stats.totalStudents / sessions.length) * 100) / 100 : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
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
  const [backendConflicts, setBackendConflicts] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedSession, setDraggedSession] = useState<ScheduleSession | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: string; time: string; y?: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Fonction pour détecter les conflits via le backend
  const detectConflictsFromBackend = async () => {
    if (!weeklyData || !weeklyData.sessions_by_day) return [];
    
    try {
      // Trouver un schedule ID à partir des sessions
      const allSessions = Object.values(weeklyData.sessions_by_day).flat();
      if (allSessions.length === 0) return [];
      
      const firstSession = allSessions[0] as any;
      if (!firstSession.schedule) return [];
      
      const response = await fetch(`${API_BASE_URL}/schedules/schedules/${firstSession.schedule}/detect_conflicts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Erreur lors de la détection des conflits:', response.status);
        return [];
      }
      
      const conflictData = await response.json();
      console.log('Conflits détectés par le backend:', conflictData);
      
      return conflictData.conflicts || [];
    } catch (error) {
      console.error('Erreur lors de la détection des conflits:', error);
      return [];
    }
  };

  const loadWeeklyData = async () => {
    if (!selectedCurriculum) return;
    
    setSessionsLoading(true);
    try {
      const weekStart = scheduleService.getWeekStart(selectedDate);
      // Utiliser l'API backend pour récupérer toute la semaine
      const data = await scheduleService.getWeeklySessionsFromAPI({
        week_start: weekStart,
        curriculum: selectedCurriculum
      });
      
      setWeeklyData(data);
      setSessions(Object.values(data.sessions_by_day).flat() as ScheduleSession[]);
      setFilteredSessions(Object.values(data.sessions_by_day).flat() as ScheduleSession[]);
      
      // Détecter les conflits via le backend
      const conflicts = await detectConflictsFromBackend();
      setBackendConflicts(conflicts);
      
      // Debug: afficher les données reçues
      const allSessions = Object.values(data.sessions_by_day).flat();
      if (allSessions.length > 0) {
        console.log('Sample session data:', allSessions[0]);
        console.log('Days in data:', allSessions.map((s: any) => s.time_slot_details?.day_of_week).filter((d: any) => d));
        console.log('Backend conflicts:', conflicts);
        console.log('Total sessions loaded:', allSessions.length);
      }
      
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
      setSessions(data.results || []);
      setFilteredSessions(data.results || []);
      
      // Debug: afficher les données reçues
      if (data.results && data.results.length > 0) {
        console.log('Daily session data:', data.results[0]);
        console.log('Session dates:', data.results.map((s: any) => s.specific_date).filter((d: any) => d));
      }
      
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

  // Fonction pour calculer l'heure d'accrochage basée sur la position Y
  const getSnapTime = (mouseY: number, containerTop: number) => {
    const relativeY = mouseY - containerTop;
    const startHour = 7;
    const snapInterval = 15; // 15 minutes
    
    // Calculer le créneau le plus proche (en multiples de 15 minutes)
    // Chaque pixel = 1 minute, donc relativeY = minutes depuis le début
    const totalMinutes = Math.max(0, relativeY);
    const snapMinutes = Math.round(totalMinutes / snapInterval) * snapInterval;
    
    const hour = startHour + Math.floor(snapMinutes / 60);
    const minute = snapMinutes % 60;
    
    // S'assurer que l'heure est dans la plage valide (7h-21h)
    if (hour < 7) return "07:00";
    if (hour >= 21) return "20:45";
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Fonction pour vérifier les chevauchements
  const checkForOverlap = (newDay: string, newStartTime: string, newEndTime: string, excludeSessionId: number) => {
    const allSessions = Object.values(weeklyData?.sessions_by_day || {}).flat() as ScheduleSession[];
    
    return allSessions.some(session => {
      if (session.id === excludeSessionId) return false; // Exclure la session qu'on déplace
      
      const sessionDay = session.time_slot_details?.day_of_week;
      const sessionStart = session.specific_start_time || session.time_slot_details?.start_time;
      const sessionEnd = session.specific_end_time || session.time_slot_details?.end_time;
      
      if (sessionDay !== newDay || !sessionStart || !sessionEnd) return false;
      
      // Convertir les heures en minutes pour comparaison
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const newStart = parseTime(newStartTime);
      const newEnd = parseTime(newEndTime);
      const existingStart = parseTime(sessionStart);
      const existingEnd = parseTime(sessionEnd);
      
      // Vérifier le chevauchement
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const handleDrop = (day: string, time: string, mouseY?: number, containerTop?: number) => {
    if (!draggedSession) return;

    // Utiliser la position précise si disponible, sinon utiliser l'heure par défaut
    let dropTime = time;
    if (mouseY !== undefined && containerTop !== undefined) {
      dropTime = getSnapTime(mouseY, containerTop);
    }

    // Calculer l'heure de fin basée sur la durée de la session originale
    const originalDuration = getSessionDurationMinutes(draggedSession);
    const dropStartMinutes = (() => {
      const [hours, minutes] = dropTime.split(':').map(Number);
      return hours * 60 + minutes;
    })();
    const dropEndMinutes = dropStartMinutes + originalDuration;
    const dropEndHours = Math.floor(dropEndMinutes / 60);
    const dropEndMins = dropEndMinutes % 60;
    const dropEndTime = `${dropEndHours.toString().padStart(2, '0')}:${dropEndMins.toString().padStart(2, '0')}`;

    // Vérifier les chevauchements
    if (checkForOverlap(day, dropTime, dropEndTime, draggedSession.id)) {
      addToast({
        title: "Déplacement impossible",
        description: "Ce créneau chevauche avec une autre session",
        variant: "destructive"
      });
      setDraggedSession(null);
      setDropTarget(null);
      return;
    }

    // Créer la session mise à jour
    const updatedSession = {
      ...draggedSession,
      time_slot_details: {
        ...draggedSession.time_slot_details!,
        day_of_week: day,
        start_time: dropTime
      },
      specific_start_time: dropTime,
      specific_end_time: dropEndTime
    };

    // Mettre à jour toutes les structures de données
    setSessions(prev => prev.map(s => 
      s.id === draggedSession.id ? updatedSession : s
    ));

    setFilteredSessions(prev => prev.map(s => 
      s.id === draggedSession.id ? updatedSession : s
    ));

    // Mettre à jour weeklyData.sessions_by_day pour l'affichage immédiat
    setWeeklyData(prev => {
      if (!prev) return prev;
      
      const newSessionsByDay = { ...prev.sessions_by_day };
      
      // Retirer la session de son ancien jour
      Object.keys(newSessionsByDay).forEach(dayKey => {
        newSessionsByDay[dayKey] = newSessionsByDay[dayKey].filter(s => s.id !== draggedSession.id);
      });
      
      // Ajouter la session au nouveau jour
      if (!newSessionsByDay[day]) {
        newSessionsByDay[day] = [];
      }
      newSessionsByDay[day].push(updatedSession);
      
      return {
        ...prev,
        sessions_by_day: newSessionsByDay
      };
    });
    
    setHasChanges(true);
    setDraggedSession(null);
    setDropTarget(null);
    
    addToast({
      title: "Session déplacée",
      description: `Session déplacée au ${day} à ${dropTime}`,
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

  // Gestion des filtres et recherche
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    applyFilters(filter, searchTerm);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    applyFilters(activeFilter, term);
  };

  const applyFilters = (filter: FilterType, search: string) => {
    let filtered = sessions;

    // Filtre par type
    if (filter !== 'all') {
      filtered = filtered.filter(session => session.session_type === filter);
    }

    // Filtre par recherche
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(session => 
        session.course_details?.name?.toLowerCase().includes(searchLower) ||
        session.course_details?.code?.toLowerCase().includes(searchLower) ||
        session.teacher_details?.user_details?.first_name?.toLowerCase().includes(searchLower) ||
        session.teacher_details?.user_details?.last_name?.toLowerCase().includes(searchLower) ||
        session.room_details?.code?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSessions(filtered);
  };

  // Appliquer les filtres quand les sessions changent
  useEffect(() => {
    applyFilters(activeFilter, searchTerm);
  }, [sessions, activeFilter, searchTerm]);

  // Détection de conflits
  const detectConflicts = (sessions: ScheduleSession[]) => {
    const conflictsList: any[] = [];
    
    // Créer des maps pour détecter les conflits
    const roomTimeSlots = new Map<string, ScheduleSession[]>();
    const teacherTimeSlots = new Map<string, ScheduleSession[]>();
    const curriculumTimeSlots = new Map<string, ScheduleSession[]>();
    
    // Organiser les sessions par salle, enseignant et curriculum
    sessions.forEach(session => {
      const startTime = session.specific_start_time || session.time_slot_details?.start_time;
      const endTime = session.specific_end_time || session.time_slot_details?.end_time;
      const dayOfWeek = session.time_slot_details?.day_of_week;
      const sessionDate = session.specific_date;
      
      if (!startTime || !endTime || !dayOfWeek) return;
      
      // Créer une clé unique pour le créneau (jour + heure ou date spécifique + heure)
      const timeKey = sessionDate ? 
        `${sessionDate}-${startTime}-${endTime}` : 
        `${dayOfWeek}-${startTime}-${endTime}`;
      
      // Conflits de salle
      if (session.room_details?.code) {
        const roomKey = `${session.room_details.code}-${timeKey}`;
        if (!roomTimeSlots.has(roomKey)) {
          roomTimeSlots.set(roomKey, []);
        }
        roomTimeSlots.get(roomKey)!.push(session);
      }
      
      // Conflits d'enseignant
      if (session.teacher_details?.employee_id) {
        const teacherKey = `${session.teacher_details.employee_id}-${timeKey}`;
        if (!teacherTimeSlots.has(teacherKey)) {
          teacherTimeSlots.set(teacherKey, []);
        }
        teacherTimeSlots.get(teacherKey)!.push(session);
      }
      
      // Conflits de curriculum (même classe) - utiliser le curriculum depuis les détails du schedule
      const curriculumCode = (session as any).schedule_details?.curriculum_details?.code || 
                            selectedCurriculum;
      if (curriculumCode) {
        const curriculumKey = `${curriculumCode}-${timeKey}`;
        if (!curriculumTimeSlots.has(curriculumKey)) {
          curriculumTimeSlots.set(curriculumKey, []);
        }
        curriculumTimeSlots.get(curriculumKey)!.push(session);
      }
    });
    
    // Détecter les conflits de salle
    roomTimeSlots.forEach((sessionsInRoom, key) => {
      if (sessionsInRoom.length > 1) {
        const [roomCode] = key.split('-');
        conflictsList.push({
          id: `room-${key}`,
          type: 'room',
          severity: 'critical',
          description: `Conflit de salle ${roomCode}`,
          details: `${sessionsInRoom.length} cours programmés en même temps`,
          sessions: sessionsInRoom,
          resource: roomCode
        });
      }
    });
    
    // Détecter les conflits d'enseignant
    teacherTimeSlots.forEach((sessionsForTeacher, key) => {
      if (sessionsForTeacher.length > 1) {
        const [teacherId] = key.split('-');
        const teacherName = sessionsForTeacher[0].teacher_details?.user_details?.full_name ||
                           `${sessionsForTeacher[0].teacher_details?.user_details?.first_name || ''} ${sessionsForTeacher[0].teacher_details?.user_details?.last_name || ''}`.trim();
        conflictsList.push({
          id: `teacher-${key}`,
          type: 'teacher',
          severity: 'high',
          description: `Conflit d'enseignant ${teacherName || teacherId}`,
          details: `${sessionsForTeacher.length} cours programmés en même temps`,
          sessions: sessionsForTeacher,
          resource: teacherId
        });
      }
    });
    
    // Détecter les conflits de curriculum (étudiants)
    curriculumTimeSlots.forEach((sessionsForCurriculum, key) => {
      if (sessionsForCurriculum.length > 1) {
        const [curriculumCode] = key.split('-');
        conflictsList.push({
          id: `curriculum-${key}`,
          type: 'curriculum',
          severity: 'high',
          description: `Conflit de classe ${curriculumCode}`,
          details: `${sessionsForCurriculum.length} cours programmés en même temps pour la même classe`,
          sessions: sessionsForCurriculum,
          resource: curriculumCode
        });
      }
    });
    
    return conflictsList;
  };

  // Combiner les conflits frontend et backend
  const frontendConflicts = detectConflicts(filteredSessions);
  const allConflicts = [...frontendConflicts, ...backendConflicts];
  const conflicts = allConflicts;

  // Helper function pour vérifier si une session a un conflit
  const hasSessionConflict = (sessionId: string) => {
    return conflicts.some(conflict => 
      conflict.sessions && conflict.sessions.some((s: any) => s.id === sessionId)
    );
  };

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
                // Vérifier que c'est le bon jour
                const sessionDate = session.specific_date;
                const isCorrectDay = sessionDate ? 
                  new Date(sessionDate).toDateString() === selectedDate.toDateString() : true;
                
                // Vérifier l'heure
                const sessionTime = session.specific_start_time || session.time_slot_details?.start_time;
                const timeMatches = sessionTime?.startsWith(time.slice(0, 2));
                
                return isCorrectDay && timeMatches;
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
                            hasConflict={hasSessionConflict(session.id.toString())}
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

  // Fonction utilitaire pour calculer la durée d'une session en minutes
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

  // Fonction pour convertir les minutes en pixels (1 minute = 1 pixel)
  const getSessionHeightPixels = (session: ScheduleSession) => {
    const durationMinutes = getSessionDurationMinutes(session);
    return Math.max(durationMinutes, 60); // Minimum 60px de hauteur
  };

  // Rendu de la vue semaine avec positioning absolu pour les durées réelles
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

    // Créer une grille de temps de 7h à 21h (14 heures * 60 minutes = 840 minutes)
    const startHour = 7;
    const endHour = 21;
    const totalMinutes = (endHour - startHour) * 60;

    // Fonction pour calculer la position Y d'une session
    const getSessionTopPosition = (session: ScheduleSession) => {
      const startTime = session.specific_start_time || session.time_slot_details?.start_time;
      if (startTime) {
        const [hour, min] = startTime.split(':').map(Number);
        const sessionStartMinutes = hour * 60 + min;
        const gridStartMinutes = startHour * 60;
        return sessionStartMinutes - gridStartMinutes; // Position en minutes depuis 7h
      }
      return 0;
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-0" style={{ minWidth: '1000px' }}>
            {/* En-tête avec les jours */}
            <div className="p-2 text-left text-xs font-medium text-gray-600 bg-gray-50 border-b">
              Heure
            </div>
            {days.map(day => (
              <div key={day.key} className="p-2 text-center text-xs font-medium text-gray-600 bg-gray-50 border-b border-l">
                {day.label}
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
            {days.map(day => (
              <div
                key={day.key}
                className="relative border-l border-gray-200"
                style={{ height: `${totalMinutes}px` }}
                onDragOver={(e) => {
                  if (editMode === 'drag') {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relativeY = e.clientY - rect.top;
                    const snapTime = getSnapTime(e.clientY, rect.top);
                    setDropTarget({ day: day.key, time: snapTime, y: relativeY });
                  }
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (editMode === 'drag') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleDrop(day.key, '08:00', e.clientY, rect.top);
                  }
                }}
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
                          ? 'border-gray-300' // Ligne d'heure plus marquée
                          : isHalfHour 
                            ? 'border-gray-200' // Ligne de demi-heure
                            : 'border-gray-100' // Ligne de quart d'heure plus légère
                      }`}
                      style={{ top: `${i * 15}px` }} // Ligne toutes les 15 minutes
                    />
                  );
                })}

                {/* Indicateur de drop position */}
                {editMode === 'drag' && draggedSession && dropTarget?.day === day.key && dropTarget.y !== undefined && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ 
                      top: `${Math.round(dropTarget.y / 15) * 15}px`, // Snap à la grille de 15px
                      height: '2px'
                    }}
                  >
                    <div className="h-full bg-blue-500 rounded-full shadow-lg opacity-80"></div>
                    <div className="absolute -left-2 -top-1 w-4 h-4 bg-blue-500 rounded-full shadow-lg opacity-80"></div>
                    <div className="absolute -right-2 -top-1 w-4 h-4 bg-blue-500 rounded-full shadow-lg opacity-80"></div>
                  </div>
                )}

                {/* Sessions positionnées selon leur heure et durée réelles */}
                {(weeklyData.sessions_by_day[day.key] || []).map((session: ScheduleSession) => {
                  const topPosition = getSessionTopPosition(session);
                  const height = getSessionHeightPixels(session);
                  
                  // Ne pas afficher les sessions en dehors de la plage horaire
                  if (topPosition < 0 || topPosition >= totalMinutes) return null;

                  return (
                    <div
                      key={session.id}
                      className="absolute left-1 right-1 z-10"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`
                      }}
                    >
                      <SessionCard
                        session={session}
                        isDragging={draggedSession?.id === session.id}
                        onDragStart={() => handleDragStart(session)}
                        onDragEnd={handleDragEnd}
                        onEdit={handleSessionEdit}
                        onDelete={handleSessionDelete}
                        onDuplicate={handleSessionDuplicate}
                        editMode={editMode}
                        hasConflict={hasSessionConflict(session.id.toString())}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
      {/* Header flottant */}
      <FloatingHeader
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
        conflicts={conflicts}
        addToast={addToast}
      />

      {/* Contenu principal */}
      <div className="p-4">
        {!sessionsLoading && selectedCurriculum && (
          <FiltersSection
            sessions={sessions}
            filteredSessions={filteredSessions}
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}

        {/* Section Conflits */}
        {!sessionsLoading && conflicts.length > 0 && (
          <div className="mb-4">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {conflicts.slice(0, 3).map((conflict: any, index: number) => (
                    <div key={conflict.id || index} className="text-xs text-red-600 bg-white/50 p-2 rounded border">
                      <div className="font-medium">{conflict.description}</div>
                      {conflict.details && (
                        <div className="text-red-500 mt-1">{conflict.details}</div>
                      )}
                    </div>
                  ))}
                  {conflicts.length > 3 && (
                    <div className="text-xs text-red-500 text-center py-1">
                      ... et {conflicts.length - 3} autre{conflicts.length - 3 > 1 ? 's' : ''} conflit{conflicts.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
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