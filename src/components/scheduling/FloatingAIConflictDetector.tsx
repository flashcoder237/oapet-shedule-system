'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Minimize2, 
  Maximize2,
  Zap,
  Clock,
  Users,
  MapPin,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ConflictInfo {
  type: 'teacher' | 'room' | 'student_group';
  severity: 'high' | 'medium' | 'low';
  message: string;
  conflictWith?: string;
}

interface SessionConflict {
  sessionId: string;
  conflicts: ConflictInfo[];
}

interface FloatingAIConflictDetectorProps {
  sessions: any[];
  isVisible?: boolean;
  onResolveConflict: (sessionId: string, conflictType: string) => void;
  onAutoResolve: () => void;
  className?: string;
}

export function FloatingAIConflictDetector({
  sessions = [],
  isVisible = true,
  onResolveConflict,
  onAutoResolve,
  className = ''
}: FloatingAIConflictDetectorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFloating, setShowFloating] = useState(true);
  
  // Calculer les conflits
  const conflicts = sessions.filter(session => session.conflicts && session.conflicts.length > 0);
  const totalConflicts = conflicts.reduce((sum, session) => sum + session.conflicts.length, 0);
  const criticalConflicts = conflicts.reduce((sum, session) => 
    sum + session.conflicts.filter((c: ConflictInfo) => c.severity === 'high').length, 0
  );

  const runAutoAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulation d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    onAutoResolve();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher': return Users;
      case 'room': return MapPin;
      case 'student_group': return Clock;
      default: return AlertTriangle;
    }
  };

  if (!isVisible || !showFloating) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setShowFloating(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="sm"
        >
          <Bot className="h-6 w-6 text-white" />
          {totalConflicts > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {totalConflicts}
            </div>
          )}
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
        className={`fixed bottom-6 right-6 z-50 w-80 max-h-[70vh] overflow-hidden ${className}`}
      >
        <Card className="shadow-2xl border-2 border-blue-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Assistant IA</h3>
                  <p className="text-xs text-gray-600">Détection de conflits</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowFloating(false)}
                >
                  <X className="h-3 w-3" />
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
                <CardContent className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
                  {totalConflicts === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700">Aucun conflit!</p>
                      <p className="text-xs text-gray-600">Planning optimisé</p>
                    </div>
                  ) : (
                    <>
                      {/* Résumé des conflits */}
                      <div className="text-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {totalConflicts}
                        </div>
                        <p className="text-sm text-red-700">
                          Conflit{totalConflicts > 1 ? 's' : ''} détecté{totalConflicts > 1 ? 's' : ''}
                        </p>
                        {criticalConflicts > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {criticalConflicts} critique{criticalConflicts > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Liste des conflits */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {conflicts.slice(0, 5).map((session: any) => 
                          session.conflicts.map((conflict: ConflictInfo, index: number) => {
                            const Icon = getTypeIcon(conflict.type);
                            return (
                              <div
                                key={`${session.id}-${index}`}
                                className={`p-2 rounded-lg border text-xs ${getSeverityColor(conflict.severity)}`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <Icon className="h-3 w-3 flex-shrink-0" />
                                    <span className="font-medium">{conflict.type}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {conflict.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs mb-2">{conflict.message}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => onResolveConflict(session.id, conflict.type)}
                                >
                                  Résoudre
                                </Button>
                              </div>
                            );
                          })
                        )}
                        
                        {totalConflicts > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            ... et {totalConflicts - 5} autre(s) conflit(s)
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      onClick={runAutoAnalysis}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      Re-analyser
                    </Button>
                    
                    {totalConflicts > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={runAutoAnalysis}
                        disabled={isAnalyzing}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-résoudre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}