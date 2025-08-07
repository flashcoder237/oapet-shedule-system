'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Settings, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Save,
  Download,
  Eye,
  Zap,
  Target,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface GenerationConstraints {
  preferredTimeSlots: string[];
  avoidTimeSlots: string[];
  maxHoursPerDay: number;
  lunchBreakDuration: number;
  prioritizeTeacherPreferences: boolean;
  allowRoomConflicts: boolean;
  balanceWorkload: boolean;
}

interface GenerationResult {
  success: boolean;
  scheduleId: string;
  conflicts: ConflictInfo[];
  metrics: ScheduleMetrics;
  suggestions: string[];
}

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group' | 'time_preference';
  severity: 'high' | 'medium' | 'low';
  message: string;
  sessionId: string;
  suggestions: string[];
}

interface ScheduleMetrics {
  totalHours: number;
  utilizationRate: number;
  conflictScore: number;
  balanceScore: number;
  teacherSatisfaction: number;
  roomUtilization: number;
}

interface AIScheduleGeneratorProps {
  selectedClass: string;
  onScheduleGenerated: (scheduleId: string) => void;
  onPreview: (schedule: any) => void;
}

export function AIScheduleGenerator({ 
  selectedClass, 
  onScheduleGenerated, 
  onPreview 
}: AIScheduleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [constraints, setConstraints] = useState<GenerationConstraints>({
    preferredTimeSlots: ['09:00-17:00'],
    avoidTimeSlots: ['12:00-13:00'],
    maxHoursPerDay: 8,
    lunchBreakDuration: 60,
    prioritizeTeacherPreferences: true,
    allowRoomConflicts: false,
    balanceWorkload: true
  });

  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!selectedClass) {
      addToast({
        title: "Erreur",
        description: "Veuillez sélectionner une classe",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationResult(null);

    try {
      // Simulation d'appel API IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: GenerationResult = {
        success: true,
        scheduleId: `schedule_${Date.now()}`,
        conflicts: [
          {
            type: 'teacher',
            severity: 'medium',
            message: 'Prof. Martin a un conflit le mardi 14h-16h',
            sessionId: 'session_1',
            suggestions: ['Déplacer vers 16h-18h', 'Assigner un autre enseignant']
          },
          {
            type: 'room',
            severity: 'low',
            message: 'Salle A101 occupée le vendredi 10h-12h',
            sessionId: 'session_2',
            suggestions: ['Utiliser la salle A102', 'Décaler d\'une heure']
          }
        ],
        metrics: {
          totalHours: 24,
          utilizationRate: 85,
          conflictScore: 7.5,
          balanceScore: 92,
          teacherSatisfaction: 88,
          roomUtilization: 75
        },
        suggestions: [
          'Optimiser les créneaux du vendredi après-midi',
          'Regrouper les cours de TP pour minimiser les déplacements',
          'Prévoir des pauses plus longues entre les cours magistraux'
        ]
      };

      setGenerationResult(mockResult);
      
      addToast({
        title: "Emploi du temps généré avec succès",
        description: `${mockResult.conflicts.length} conflits détectés - Score de qualité: ${mockResult.metrics.balanceScore}%`,
        variant: mockResult.conflicts.length === 0 ? "default" : "destructive"
      });

    } catch (error) {
      addToast({
        title: "Erreur lors de la génération",
        description: "Impossible de générer l'emploi du temps",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSchedule = () => {
    if (generationResult) {
      onScheduleGenerated(generationResult.scheduleId);
      addToast({
        title: "Emploi du temps accepté",
        description: "L'emploi du temps a été sauvegardé",
        variant: "default"
      });
    }
  };

  const getMetricColor = (value: number, type: 'positive' | 'negative' = 'positive') => {
    if (type === 'positive') {
      if (value >= 90) return 'text-emerald-600 bg-emerald-50';
      if (value >= 70) return 'text-blue-600 bg-blue-50';
      if (value >= 50) return 'text-amber-600 bg-amber-50';
      return 'text-red-600 bg-red-50';
    } else {
      if (value <= 2) return 'text-emerald-600 bg-emerald-50';
      if (value <= 5) return 'text-blue-600 bg-blue-50';
      if (value <= 8) return 'text-amber-600 bg-amber-50';
      return 'text-red-600 bg-red-50';
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                Génération IA
                <Sparkles className="w-5 h-5 text-primary" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Créez automatiquement un emploi du temps optimisé
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {showAdvancedSettings ? 'Masquer' : 'Paramètres'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Paramètres avancés */}
        <AnimatePresence>
          {showAdvancedSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 rounded-lg p-4 space-y-4"
            >
              <h4 className="font-semibold text-foreground mb-3">Contraintes de génération</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Heures max par jour
                  </label>
                  <Input
                    type="number"
                    min="4"
                    max="12"
                    value={constraints.maxHoursPerDay}
                    onChange={(e) => setConstraints(prev => ({
                      ...prev,
                      maxHoursPerDay: parseInt(e.target.value)
                    }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Pause déjeuner (minutes)
                  </label>
                  <Select 
                    value={constraints.lunchBreakDuration.toString()}
                    onValueChange={(value) => setConstraints(prev => ({
                      ...prev,
                      lunchBreakDuration: parseInt(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="90">1h30</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-foreground">Options d'optimisation</h5>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={constraints.prioritizeTeacherPreferences}
                      onChange={(e) => setConstraints(prev => ({
                        ...prev,
                        prioritizeTeacherPreferences: e.target.checked
                      }))}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">Prioriser les préférences des enseignants</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={constraints.balanceWorkload}
                      onChange={(e) => setConstraints(prev => ({
                        ...prev,
                        balanceWorkload: e.target.checked
                      }))}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">Équilibrer la charge de travail</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!constraints.allowRoomConflicts}
                      onChange={(e) => setConstraints(prev => ({
                        ...prev,
                        allowRoomConflicts: !e.target.checked
                      }))}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">Éviter les conflits de salles</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton de génération */}
        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedClass}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Générer l'emploi du temps
              </>
            )}
          </Button>
          
          {!selectedClass && (
            <p className="text-sm text-muted-foreground mt-2">
              Sélectionnez d'abord une classe dans les filtres
            </p>
          )}
        </div>

        {/* Indicateur de progression */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 rounded-lg p-4 text-center"
          >
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Génération IA en cours...</p>
                <p className="text-xs text-muted-foreground">
                  Optimisation des créneaux et résolution des conflits
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Résultats de génération */}
        <AnimatePresence>
          {generationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Métriques de qualité */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Métriques de qualité
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${getMetricColor(generationResult.metrics.balanceScore)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-medium">Équilibre</span>
                    </div>
                    <div className="text-lg font-bold">{generationResult.metrics.balanceScore}%</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${getMetricColor(generationResult.metrics.utilizationRate)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Utilisation</span>
                    </div>
                    <div className="text-lg font-bold">{generationResult.metrics.utilizationRate}%</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${getMetricColor(generationResult.metrics.conflictScore, 'negative')}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">Conflits</span>
                    </div>
                    <div className="text-lg font-bold">{generationResult.metrics.conflictScore}</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${getMetricColor(generationResult.metrics.teacherSatisfaction)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Satisfaction</span>
                    </div>
                    <div className="text-lg font-bold">{generationResult.metrics.teacherSatisfaction}%</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${getMetricColor(generationResult.metrics.roomUtilization)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-medium">Salles</span>
                    </div>
                    <div className="text-lg font-bold">{generationResult.metrics.roomUtilization}%</div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Total</span>
                    </div>
                    <div className="text-lg font-bold">{generationResult.metrics.totalHours}h</div>
                  </div>
                </div>
              </div>

              {/* Conflits détectés */}
              {generationResult.conflicts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Conflits détectés ({generationResult.conflicts.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {generationResult.conflicts.map((conflict, index) => (
                      <div key={index} className="bg-white rounded p-3 border border-amber-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-amber-800">{conflict.message}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {conflict.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  conflict.severity === 'high' ? 'border-red-300 text-red-700' :
                                  conflict.severity === 'medium' ? 'border-amber-300 text-amber-700' :
                                  'border-blue-300 text-blue-700'
                                }`}
                              >
                                {conflict.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {conflict.suggestions.length > 0 && (
                          <div className="mt-2 text-xs text-amber-700">
                            <p className="font-medium">Suggestions:</p>
                            <ul className="list-disc list-inside">
                              {conflict.suggestions.map((suggestion, idx) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions d'amélioration */}
              {generationResult.suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Suggestions d'amélioration
                  </h4>
                  
                  <ul className="space-y-1">
                    {generationResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => onPreview(generationResult)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Aperçu
                </Button>
                
                <Button
                  onClick={handleAcceptSchedule}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Accepter
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Régénérer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}