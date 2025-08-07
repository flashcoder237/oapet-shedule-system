'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  MapPin,
  BookOpen,
  Zap,
  RefreshCw,
  Eye,
  Target,
  Settings,
  ArrowRight,
  Lightbulb,
  Activity,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { mlService } from '@/lib/api/services/ml';

interface ConflictData {
  id: string;
  type: 'teacher_conflict' | 'room_conflict' | 'time_conflict' | 'capacity_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_sessions: any[];
  suggestions: string[];
  auto_resolvable: boolean;
  confidence_score: number;
}

interface RealTimeConflictDetectorProps {
  scheduleData?: any;
  onConflictResolved?: (conflictId: string) => void;
  onAutoResolve?: (conflictId: string) => void;
  autoDetect?: boolean;
  className?: string;
}

export function RealTimeConflictDetector({
  scheduleData,
  onConflictResolved,
  onAutoResolve,
  autoDetect = true,
  className = ""
}: RealTimeConflictDetectorProps) {
  const { addToast } = useToast();
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [overallRisk, setOverallRisk] = useState(0);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  const detectConflicts = async (scheduleDataToAnalyze?: any) => {
    setIsAnalyzing(true);
    try {
      // Utiliser les services ML pour détecter les anomalies et conflits
      const [anomalies, workload, optimization] = await Promise.all([
        mlService.detectAnomalies(scheduleDataToAnalyze || scheduleData).catch(() => null),
        mlService.analyzeWorkload(scheduleDataToAnalyze || scheduleData).catch(() => null),
        mlService.getOptimalScheduleRecommendations().catch(() => null)
      ]);

      const detectedConflicts: ConflictData[] = [];

      // Traiter les anomalies détectées
      if (anomalies && anomalies.anomalies) {
        anomalies.anomalies.forEach((anomaly: any, index: number) => {
          detectedConflicts.push({
            id: `anomaly_${index}`,
            type: getConflictType(anomaly.type),
            severity: getSeverityFromScore(anomaly.severity_score || 0.5),
            title: `Anomalie: ${anomaly.type}`,
            description: anomaly.description || 'Anomalie détectée dans la planification',
            affected_sessions: anomaly.affected_sessions || [],
            suggestions: anomaly.suggestions || [],
            auto_resolvable: anomaly.auto_resolvable || false,
            confidence_score: anomaly.confidence_score || 0.7
          });
        });
      }

      // Traiter les déséquilibres de charge
      if (workload && workload.teachers) {
        workload.teachers.forEach((teacher: any, index: number) => {
          if (teacher.balance_score < 60) {
            detectedConflicts.push({
              id: `workload_${index}`,
              type: 'teacher_conflict',
              severity: teacher.balance_score < 40 ? 'critical' : 'high',
              title: `Surcharge: ${teacher.teacher}`,
              description: `Équilibre de charge à ${teacher.balance_score}%. ${teacher.overloaded_days.length} jours surchargés.`,
              affected_sessions: [],
              suggestions: teacher.recommendations || [],
              auto_resolvable: true,
              confidence_score: 0.8
            });
          }
        });
      }

      setConflicts(detectedConflicts);
      setOverallRisk(anomalies?.risk_score || 0);
      // Extract recommendations from optimization response
      const suggestions = [];
      if (optimization?.recommendations) {
        if (Array.isArray(optimization.recommendations)) {
          suggestions.push(...optimization.recommendations);
        } else {
          // Handle object structure with conflict_resolution array
          if (optimization.recommendations.conflict_resolution) {
            suggestions.push(...optimization.recommendations.conflict_resolution);
          }
        }
      }
      setOptimizationSuggestions(suggestions);
      setLastAnalysis(new Date());

      // Notifier si des conflits critiques sont trouvés
      const criticalConflicts = detectedConflicts.filter(c => c.severity === 'critical');
      if (criticalConflicts.length > 0) {
        addToast({
          title: `${criticalConflicts.length} conflit(s) critique(s) détecté(s)`,
          description: "Intervention immédiate recommandée",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erreur lors de la détection de conflits:', error);
      addToast({
        title: "Erreur de détection",
        description: "Impossible d'analyser les conflits",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConflictType = (type: string): ConflictData['type'] => {
    if (type.includes('teacher')) return 'teacher_conflict';
    if (type.includes('room')) return 'room_conflict';
    if (type.includes('time')) return 'time_conflict';
    if (type.includes('capacity')) return 'capacity_conflict';
    return 'time_conflict';
  };

  const getSeverityFromScore = (score: number): ConflictData['severity'] => {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'teacher_conflict': return <Users className="w-4 h-4" />;
      case 'room_conflict': return <MapPin className="w-4 h-4" />;
      case 'time_conflict': return <Clock className="w-4 h-4" />;
      case 'capacity_conflict': return <BarChart3 className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAutoResolve = async (conflict: ConflictData) => {
    try {
      // Simuler la résolution automatique
      addToast({
        title: "Résolution automatique",
        description: `Tentative de résolution du conflit: ${conflict.title}`,
        variant: "default"
      });

      // Appeler l'optimisation ML
      const optimization = await mlService.getOptimalScheduleRecommendations({
        focus_conflicts: [conflict.id],
        auto_resolve: true
      });

      if (optimization && optimization.recommendations) {
        setConflicts(prev => prev.filter(c => c.id !== conflict.id));
        onConflictResolved?.(conflict.id);
        onAutoResolve?.(conflict.id);
        
        addToast({
          title: "Conflit résolu",
          description: "Le conflit a été résolu automatiquement",
          variant: "default"
        });
      }
    } catch (error) {
      addToast({
        title: "Échec de résolution",
        description: "Impossible de résoudre automatiquement ce conflit",
        variant: "destructive"
      });
    }
  };

  const handleIgnoreConflict = (conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    addToast({
      title: "Conflit ignoré",
      description: "Le conflit a été retiré de la liste",
      variant: "default"
    });
  };

  useEffect(() => {
    if (autoDetect && scheduleData) {
      detectConflicts(scheduleData);
    }
  }, [scheduleData, autoDetect]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (autoDetect) {
      const interval = setInterval(() => {
        detectConflicts();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoDetect]);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Détection de Conflits IA
                <Zap className="w-4 h-4 text-orange-500" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {lastAnalysis ? `Dernière analyse: ${lastAnalysis.toLocaleTimeString()}` : 'Aucune analyse'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={overallRisk > 70 ? 'destructive' : overallRisk > 40 ? 'default' : 'secondary'}>
              Risque: {overallRisk}%
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => detectConflicts()}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-muted-foreground">Analyse des conflits en cours...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Résumé des conflits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {conflicts.filter(c => c.severity === 'critical').length}
                </div>
                <div className="text-xs text-red-600">Critiques</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {conflicts.filter(c => c.severity === 'high').length}
                </div>
                <div className="text-xs text-orange-600">Élevés</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {conflicts.filter(c => c.severity === 'medium').length}
                </div>
                <div className="text-xs text-yellow-600">Moyens</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {conflicts.filter(c => c.severity === 'low').length}
                </div>
                <div className="text-xs text-blue-600">Faibles</div>
              </div>
            </div>

            {/* Liste des conflits */}
            <AnimatePresence>
              {conflicts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conflicts.map((conflict, index) => (
                    <motion.div
                      key={conflict.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getSeverityColor(conflict.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getConflictIcon(conflict.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{conflict.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(conflict.confidence_score * 100)}% confiance
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {conflict.description}
                            </p>
                            
                            {conflict.suggestions.length > 0 && (
                              <div className="mt-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <Lightbulb className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs font-medium text-yellow-600">Suggestions</span>
                                </div>
                                <div className="space-y-1">
                                  {conflict.suggestions.slice(0, 2).map((suggestion, idx) => (
                                    <div key={idx} className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                      • {suggestion}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 ml-2">
                          {conflict.auto_resolvable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAutoResolve(conflict)}
                              className="text-xs"
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              Auto-résoudre
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIgnoreConflict(conflict.id)}
                            className="text-xs"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium text-emerald-600">Aucun conflit détecté</p>
                  <p className="text-sm">Votre planification semble optimale</p>
                </div>
              )}
            </AnimatePresence>

            {/* Suggestions d'optimisation globale */}
            {optimizationSuggestions.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Optimisations possibles</span>
                </div>
                <div className="space-y-1">
                  {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RealTimeConflictDetector;