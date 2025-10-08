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
import { mlService } from '@/lib/api/services/ml';
import { apiClient } from '@/lib/api/client';

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
  selectedClass?: string;
  onScheduleGenerated?: (scheduleId?: string) => void;
  onPreview?: (schedule: any) => void;
}

export function AIScheduleGenerator({
  selectedClass = '',
  onScheduleGenerated,
  onPreview
}: AIScheduleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPeriodGenerator, setShowPeriodGenerator] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  // États pour la génération par période
  const [periodType, setPeriodType] = useState<'semester' | 'year' | 'custom'>('semester');
  const [academicPeriodId, setAcademicPeriodId] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);
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

  const handleGenerateForPeriod = async () => {
    if (!academicPeriodId || selectedCurriculums.length === 0) {
      addToast({
        title: "Erreur",
        description: "Veuillez sélectionner une période et au moins un cursus",
        variant: "destructive"
      });
      return;
    }

    if (periodType === 'custom' && (!customStartDate || !customEndDate)) {
      addToast({
        title: "Erreur",
        description: "Veuillez spécifier les dates de début et de fin",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data = await apiClient.post<{ message?: string; schedule_ids?: number[]; total_sessions?: number }>('/schedules/schedules/generate_for_period/', {
        period_type: periodType,
        academic_period_id: academicPeriodId,
        start_date: customStartDate,
        end_date: customEndDate,
        curriculum_ids: selectedCurriculums,
      });

      addToast({
        title: "Generation reussie",
        description: data?.message || `${data?.total_sessions || 0} sessions generees avec succes`,
      });
      setShowPeriodGenerator(false);

      // Appeler le callback pour recharger
      if (onScheduleGenerated) {
        onScheduleGenerated();
      }
    } catch (error) {
      addToast({
        title: "Erreur",
        description: "Erreur de communication avec le serveur",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      // Appel à l'API backend pour générer l'emploi du temps avec l'IA
      const result = await mlService.generateSchedule({
        selectedClass,
        constraints
      });

      const generationResult: GenerationResult = {
        success: result.success,
        scheduleId: result.scheduleId,
        conflicts: result.conflicts.map(conflict => ({
          type: conflict.type as 'teacher' | 'room' | 'student_group' | 'time_preference',
          severity: conflict.severity as 'high' | 'medium' | 'low',
          message: conflict.message,
          sessionId: conflict.sessionId,
          suggestions: conflict.suggestions
        })),
        metrics: result.metrics,
        suggestions: result.suggestions
      };

      setGenerationResult(generationResult);

      addToast({
        title: "Emploi du temps généré par IA avec succès",
        description: `${generationResult.conflicts.length} conflits détectés - Score de qualité: ${generationResult.metrics.balanceScore}% (Modèle: ${result.model_used})`,
        variant: generationResult.conflicts.length === 0 ? "default" : "destructive"
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
    if (generationResult && onScheduleGenerated) {
      onScheduleGenerated(generationResult.scheduleId);
      addToast({
        title: "Emploi du temps accepte",
        description: "L'emploi du temps a ete sauvegarde",
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
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPeriodGenerator(!showPeriodGenerator)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {showPeriodGenerator ? 'Masquer' : 'Générer par période'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings className="w-4 h-4 mr-1" />
              {showAdvancedSettings ? 'Masquer' : 'Paramètres'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Générateur par période */}
        <AnimatePresence>
          {showPeriodGenerator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 space-y-4 border-2 border-blue-200 dark:border-blue-800"
            >
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Génération par période
              </h4>

              {/* Type de période */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Type de période
                </label>
                <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">Semestre</SelectItem>
                    <SelectItem value="year">Année académique complète</SelectItem>
                    <SelectItem value="custom">Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Période académique */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Période académique
                </label>
                <Input
                  type="text"
                  placeholder="ID de la période académique"
                  value={academicPeriodId}
                  onChange={(e) => setAcademicPeriodId(e.target.value)}
                />
              </div>

              {/* Dates personnalisées */}
              {periodType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Date de début
                    </label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Date de fin
                    </label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Cursus */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Cursus (IDs séparés par des virgules)
                </label>
                <Input
                  type="text"
                  placeholder="1, 2, 3"
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                    setSelectedCurriculums(ids);
                  }}
                />
              </div>

              {/* Bouton de génération */}
              <Button
                onClick={handleGenerateForPeriod}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer les emplois du temps
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

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
                {onPreview && (
                  <Button
                    onClick={() => onPreview(generationResult)}
                    variant="outline"
                    className="flex-1"
                  >
                  <Eye className="w-4 h-4 mr-1" />
                  Apercu
                </Button>
                )}

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