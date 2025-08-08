'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2,
  Lightbulb,
  Zap,
  Clock,
  Users,
  MapPin,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group' | 'equipment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
  suggestion?: string;
  sessionIds: string[];
}

interface AIAnalysis {
  totalConflicts: number;
  conflictsByType: Record<string, number>;
  suggestions: {
    id: string;
    type: 'optimization' | 'conflict_resolution' | 'efficiency';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    estimatedTime: string;
  }[];
  score: number; // Score de qualité de l'emploi du temps sur 100
}

interface AIConflictDetectorProps {
  conflicts: ConflictInfo[];
  isVisible: boolean;
  onToggleVisibility: () => void;
  onResolveConflict: (conflictId: string) => Promise<void>;
  onApplySuggestion: (suggestionId: string) => Promise<void>;
}

export function AIConflictDetector({
  conflicts,
  isVisible,
  onToggleVisibility,
  onResolveConflict,
  onApplySuggestion
}: AIConflictDetectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  // Simulation de l'analyse IA
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'une analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAnalysis: AIAnalysis = {
      totalConflicts: conflicts.length,
      conflictsByType: {
        'teacher': conflicts.filter(c => c.type === 'teacher').length,
        'room': conflicts.filter(c => c.type === 'room').length,
        'student_group': conflicts.filter(c => c.type === 'student_group').length,
        'equipment': conflicts.filter(c => c.type === 'equipment').length,
      },
      suggestions: [
        {
          id: '1',
          type: 'optimization',
          title: 'Réorganisation des créneaux matinaux',
          description: 'Déplacer 3 cours magistraux vers les créneaux de 10h-12h pour optimiser l\'utilisation des amphithéâtres.',
          impact: 'high',
          estimatedTime: '5 min'
        },
        {
          id: '2',
          type: 'conflict_resolution',
          title: 'Résolution automatique des conflits de salles',
          description: 'Réassigner automatiquement les salles en conflit vers des salles disponibles de capacité similaire.',
          impact: 'high',
          estimatedTime: '2 min'
        },
        {
          id: '3',
          type: 'efficiency',
          title: 'Équilibrage de la charge enseignants',
          description: 'Redistribuer les cours pour éviter les surcharges d\'enseignement sur certains créneaux.',
          impact: 'medium',
          estimatedTime: '10 min'
        }
      ],
      score: Math.max(20, 100 - conflicts.length * 5)
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (isVisible && !analysis) {
      runAIAnalysis();
    }
  }, [isVisible]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher': return Users;
      case 'room': return MapPin;
      case 'student_group': return BookOpen;
      case 'equipment': return Clock;
      default: return AlertTriangle;
    }
  };

  if (!isVisible) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggleVisibility}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="sm"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-h-[80vh] overflow-hidden"
      >
        <Card className="shadow-2xl border-2 border-blue-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Assistant IA</CardTitle>
                  <p className="text-xs text-gray-600">Détection de conflits intelligente</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onToggleVisibility}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
              >
                <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {isAnalyzing ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                      <p className="text-sm text-gray-600">Analyse de l'emploi du temps en cours...</p>
                      <div className="mt-3">
                        <Progress value={66} className="h-2" />
                      </div>
                    </div>
                  ) : analysis ? (
                    <>
                      {/* Score de qualité */}
                      <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}/100
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Score de qualité</p>
                        <div className="mt-2">
                          <Progress value={analysis.score} className="h-2" />
                        </div>
                      </div>

                      {/* Résumé des conflits */}
                      {analysis.totalConflicts > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <h3 className="font-semibold text-sm">
                              {analysis.totalConflicts} conflit(s) détecté(s)
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(analysis.conflictsByType).map(([type, count]) => {
                              if (count === 0) return null;
                              const Icon = getTypeIcon(type);
                              return (
                                <div key={type} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                                  <Icon className="h-4 w-4 text-red-600" />
                                  <span className="text-xs font-medium">{type}: {count}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="space-y-2">
                            {conflicts.slice(0, 3).map((conflict, index) => (
                              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(conflict.severity)}`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-xs font-medium mb-1">{conflict.message}</p>
                                    {conflict.suggestion && (
                                      <p className="text-xs opacity-75 flex items-start gap-1">
                                        <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        {conflict.suggestion}
                                      </p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {conflict.severity}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            
                            {conflicts.length > 3 && (
                              <p className="text-xs text-gray-500 text-center">
                                et {conflicts.length - 3} autre(s) conflit(s)...
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-700">Aucun conflit détecté!</p>
                          <p className="text-xs text-gray-600">Votre emploi du temps est optimisé</p>
                        </div>
                      )}

                      {/* Suggestions IA */}
                      {analysis.suggestions.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <h3 className="font-semibold text-sm">Suggestions d'amélioration</h3>
                          </div>
                          
                          <div className="space-y-2">
                            {analysis.suggestions.map((suggestion) => (
                              <div key={suggestion.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-xs font-semibold text-purple-900">{suggestion.title}</h4>
                                  <Badge 
                                    variant={suggestion.impact === 'high' ? 'destructive' : 
                                            suggestion.impact === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {suggestion.impact}
                                  </Badge>
                                </div>
                                <p className="text-xs text-purple-700 mb-3">{suggestion.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-purple-600 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {suggestion.estimatedTime}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 px-3 text-xs border-purple-300 hover:bg-purple-100"
                                    onClick={() => onApplySuggestion(suggestion.id)}
                                  >
                                    Appliquer
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions rapides */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          onClick={runAIAnalysis}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Re-analyser
                        </Button>
                        {analysis.totalConflicts > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              // Résoudre tous les conflits automatiquement
                              conflicts.forEach(conflict => {
                                onResolveConflict(conflict.type);
                              });
                            }}
                          >
                            Auto-résoudre
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Button onClick={runAIAnalysis} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Bot className="h-4 w-4 mr-2" />
                        Lancer l'analyse IA
                      </Button>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}