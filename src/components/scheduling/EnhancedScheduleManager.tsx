'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Copy, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Bot,
  Save,
  Undo2,
  Redo2,
  Plus,
  Download,
  Upload,
  Share,
  Eye,
  EyeOff,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Printer,
  Send,
  Archive,
  Star,
  Bell,
  Calendar as CalendarIcon,
  List,
  Grid,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Play,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AdvancedCalendarView } from './AdvancedCalendarView';

// Types étendus
interface EnhancedScheduleSession {
  id: string;
  course: {
    id: string;
    name: string;
    code: string;
    type: 'CM' | 'TD' | 'TP' | 'EXAM';
    teacher: {
      id: string;
      name: string;
      email: string;
    };
    curriculum: {
      id: string;
      name: string;
      level: string;
    };
  };
  room: {
    id: string;
    code: string;
    name: string;
    capacity: number;
    building: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  expectedStudents: number;
  actualStudents?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  conflicts: ConflictInfo[];
  notes?: string;
  isLocked: boolean;
  priority: 'high' | 'medium' | 'low';
  recurrence?: 'weekly' | 'biweekly' | 'monthly';
}

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group' | 'equipment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
  suggestion?: string;
}

interface EnhancedScheduleManagerProps {
  sessions: EnhancedScheduleSession[];
  onSessionCreate: (session: Partial<EnhancedScheduleSession>) => Promise<void>;
  onSessionUpdate: (id: string, updates: Partial<EnhancedScheduleSession>) => Promise<void>;
  onSessionDelete: (id: string) => Promise<void>;
  onSessionDuplicate: (id: string) => Promise<void>;
  onBulkActions: (action: string, sessionIds: string[]) => Promise<void>;
  onExport: (format: string, filters: any) => Promise<void>;
  onImport: (file: File) => Promise<void>;
  onConflictResolve: (sessionId: string, conflictType: string) => Promise<void>;
  onNotificationSend: (sessionId: string, type: string) => Promise<void>;
  className?: string;
}

export function EnhancedScheduleManager({ 
  sessions, 
  onSessionCreate,
  onSessionUpdate,
  onSessionDelete,
  onSessionDuplicate,
  onBulkActions,
  onExport,
  onImport,
  onConflictResolve,
  onNotificationSend,
  className 
}: EnhancedScheduleManagerProps) {
  const { addToast } = useToast();

  // États du composant
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'grid'>('calendar');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [conflictFilter, setConflictFilter] = useState('all');
  const [selectedCurriculum, setSelectedCurriculum] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showSessionDetails, setShowSessionDetails] = useState<string | null>(null);

  // Sessions filtrées
  const filteredSessions = sessions.filter(session => {
    if (filterText && !session.course.name.toLowerCase().includes(filterText.toLowerCase()) && 
        !session.course.code.toLowerCase().includes(filterText.toLowerCase()) &&
        !session.course.teacher.name.toLowerCase().includes(filterText.toLowerCase())) {
      return false;
    }
    
    if (statusFilter !== 'all' && session.status !== statusFilter) {
      return false;
    }
    
    if (conflictFilter !== 'all') {
      if (conflictFilter === 'with_conflicts' && session.conflicts.length === 0) return false;
      if (conflictFilter === 'no_conflicts' && session.conflicts.length > 0) return false;
    }
    
    if (selectedCurriculum !== 'all' && session.course.curriculum.id !== selectedCurriculum) {
      return false;
    }
    
    if (selectedTeacher !== 'all' && session.course.teacher.id !== selectedTeacher) {
      return false;
    }
    
    if (showConflictsOnly && session.conflicts.length === 0) {
      return false;
    }
    
    return true;
  });

  // Actions de gestion
  const handleBulkAction = async (action: string) => {
    if (selectedSessions.length === 0) {
      addToast({
        title: "Aucune session sélectionnée",
        description: "Veuillez sélectionner au moins une session pour effectuer cette action.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onBulkActions(action, selectedSessions);
      setSelectedSessions([]);
      addToast({
        title: "Action réalisée",
        description: `L'action "${action}" a été appliquée à ${selectedSessions.length} session(s).`,
      });
    } catch (error) {
      addToast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'exécution de l'action.",
        variant: "destructive"
      });
    }
  };

  const handleExport = async (format: string) => {
    const filters = {
      dateRange,
      statusFilter,
      selectedCurriculum,
      selectedTeacher,
      filterText
    };
    
    try {
      await onExport(format, filters);
      addToast({
        title: "Export réussi",
        description: `L'emploi du temps a été exporté au format ${format}.`,
      });
    } catch (error) {
      addToast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export.",
        variant: "destructive"
      });
    }
  };

  // Rendu de la barre d'outils
  const renderToolbar = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Actions principales */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => onSessionCreate({})} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvelle Session
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Créer une nouvelle session de cours</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button 
              variant={isEditMode ? "secondary" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditMode ? "Terminer" : "Éditer"}
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Vues */}
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{zoomLevel}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Actions de groupe */}
          {selectedSessions.length > 0 && (
            <>
              <Badge variant="secondary">
                {selectedSessions.length} sélectionnée(s)
              </Badge>
              
              <Select onValueChange={handleBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Actions groupées" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">Supprimer</SelectItem>
                  <SelectItem value="duplicate">Dupliquer</SelectItem>
                  <SelectItem value="cancel">Annuler</SelectItem>
                  <SelectItem value="reschedule">Reprogrammer</SelectItem>
                  <SelectItem value="notify">Notifier</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {/* Export/Import */}
          <div className="flex items-center gap-2">
            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="ical">iCal</SelectItem>
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Importer un emploi du temps</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Rendu des filtres
  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et Recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Rechercher par cours, code, enseignant..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="gap-2"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="scheduled">Programmé</SelectItem>
              <SelectItem value="ongoing">En cours</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={conflictFilter} onValueChange={setConflictFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Conflits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="with_conflicts">Avec conflits</SelectItem>
              <SelectItem value="no_conflicts">Sans conflit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Curriculum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les curriculums</SelectItem>
              {/* Dynamic curriculum options would go here */}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="conflicts-only"
              checked={showConflictsOnly}
              onCheckedChange={(checked) => setShowConflictsOnly(checked === true)}
            />
            <label htmlFor="conflicts-only" className="text-sm font-medium">
              Afficher uniquement les conflits
            </label>
          </div>

          <Badge variant="outline">
            {filteredSessions.length} session(s) affichée(s)
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Rendu d'une session
  const renderSession = (session: EnhancedScheduleSession) => (
    <Card 
      key={session.id} 
      className={`cursor-pointer transition-all duration-200 ${
        selectedSessions.includes(session.id) ? 'ring-2 ring-blue-500' : ''
      } ${session.conflicts.length > 0 ? 'border-red-200' : ''}`}
      onClick={() => {
        if (selectedSessions.includes(session.id)) {
          setSelectedSessions(prev => prev.filter(id => id !== session.id));
        } else {
          setSelectedSessions(prev => [...prev, session.id]);
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={
              session.course.type === 'EXAM' ? 'destructive' :
              session.course.type === 'TP' ? 'secondary' :
              session.course.type === 'TD' ? 'outline' : 'default'
            }>
              {session.course.type}
            </Badge>
            
            {session.conflicts.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {session.conflicts.length}
              </Badge>
            )}

            <Badge variant="outline">
              {session.status === 'scheduled' && <Clock className="h-3 w-3" />}
              {session.status === 'ongoing' && <Play className="h-3 w-3" />}
              {session.status === 'completed' && <CheckCircle className="h-3 w-3" />}
              {session.status === 'cancelled' && <X className="h-3 w-3" />}
            </Badge>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSessionDetails(session.id);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionDuplicate(session.id);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionDelete(session.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{session.course.name}</h3>
            <p className="text-sm text-muted-foreground">{session.course.code}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{session.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{session.startTime} - {session.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{session.room.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{session.course.teacher.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{session.expectedStudents} étudiants</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{session.course.curriculum.name}</span>
            </div>
          </div>

          {session.conflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Conflits détectés
              </h4>
              {session.conflicts.map((conflict, index) => (
                <div key={index} className="bg-destructive/10 p-2 rounded text-sm">
                  <p className="font-medium">{conflict.type} - {conflict.severity}</p>
                  <p>{conflict.message}</p>
                  {conflict.suggestion && (
                    <p className="text-muted-foreground mt-1">💡 {conflict.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Rendu principal
  return (
    <div className={`space-y-6 ${className}`} style={{ zoom: `${zoomLevel}%` }}>
      {renderToolbar()}
      {renderFilters()}
      
      <div className="grid gap-4">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(renderSession)}
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredSessions.map(renderSession)}
          </div>
        )}
        
        {viewMode === 'calendar' && (
          <AdvancedCalendarView 
            sessions={filteredSessions}
            onSessionMove={(sessionId, newDate, newStartTime) => {
              // Logique de déplacement des sessions
              onSessionUpdate(sessionId, { 
                date: newDate, 
                startTime: newStartTime 
              });
            }}
            onSessionEdit={(session) => setShowSessionDetails(session.id)}
            isEditMode={isEditMode}
            selectedSessions={selectedSessions}
            onSessionSelect={(sessionId) => {
              if (selectedSessions.includes(sessionId)) {
                setSelectedSessions(prev => prev.filter(id => id !== sessionId));
              } else {
                setSelectedSessions(prev => [...prev, sessionId]);
              }
            }}
          />
        )}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune session trouvée</h3>
              <p>Aucune session ne correspond aux critères de filtre sélectionnés.</p>
              <Button 
                onClick={() => {
                  setFilterText('');
                  setStatusFilter('all');
                  setConflictFilter('all');
                  setSelectedCurriculum('all');
                  setShowConflictsOnly(false);
                }}
                className="mt-4"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog pour les détails de session */}
      <Dialog open={!!showSessionDetails} onOpenChange={() => setShowSessionDetails(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la session</DialogTitle>
          </DialogHeader>
          {showSessionDetails && (
            <div className="space-y-6">
              {/* Détails complets de la session seraient ici */}
              <p>Détails complets pour la session {showSessionDetails}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}