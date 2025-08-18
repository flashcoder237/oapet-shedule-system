'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  GraduationCap,
  CalendarDays,
  CalendarRange,
  Grid3x3,
  Settings,
  Edit,
  Move,
  Save,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { scheduleService } from '@/lib/api/services/schedules';

interface Curriculum {
  id: number;
  code: string;
  name: string;
  level: string;
  department: {
    name: string;
  };
}

type ViewMode = 'week' | 'day' | 'month';
type EditMode = 'view' | 'edit' | 'drag';

interface FloatingHeaderProps {
  selectedClass: string;
  onClassChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onExport: () => void;
  onImport: () => void;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  onSave: () => void;
  hasChanges: boolean;
  curricula: Curriculum[];
  conflicts: any[];
  addToast: (toast: any) => void;
}

export function FloatingHeader({ 
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
}: FloatingHeaderProps) {
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
                    const conflictDetails = conflicts.map((c: any) => 
                      `• ${c.description}\n  ${c.details || 'Détails non disponibles'}`
                    ).join('\n\n');
                    
                    addToast({
                      title: `${conflicts.length} conflits détectés`,
                      description: conflicts.length > 0 ? conflicts[0].description : "Conflits trouvés",
                      variant: "destructive"
                    });
                    
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