'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkloadAnalysis } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';

interface WorkloadAnalysisProps {
  scheduleData?: any;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function WorkloadAnalysis({ 
  scheduleData, 
  autoRefresh = false, 
  refreshInterval = 30000 
}: WorkloadAnalysisProps) {
  const { data, loading, error, analyze } = useWorkloadAnalysis();
  const { addToast } = useToast();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Analyse initiale
    handleAnalyze();

    // Auto-refresh si activé
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleAnalyze(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [scheduleData, autoRefresh, refreshInterval]);

  const handleAnalyze = async (isAutoRefresh = false) => {
    try {
      await analyze(scheduleData);
      setLastRefresh(new Date());
      
      if (!isAutoRefresh) {
        addToast({
          title: "Analyse de charge terminée",
          description: "Les données de charge de travail ont été mises à jour",
          variant: "default"
        });
      }
    } catch (error) {
      addToast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    }
  };

  const getBalanceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBalanceIcon = (score: number) => {
    if (score >= 75) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (loading && !data) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Analyse de charge de travail IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Analyse en cours...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="border-2 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Erreur d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => handleAnalyze()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                Analyse de charge IA
                <Zap className="w-5 h-5 text-primary" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Équilibre: {data.overall_balance}% • Modèle: {data.model_used}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {lastRefresh.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAnalyze()}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score global */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-foreground">Équilibre global</h4>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getBalanceColor(data.overall_balance)}`}>
              {getBalanceIcon(data.overall_balance)}
              <span className="font-bold">{data.overall_balance}%</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${data.overall_balance}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Détail par enseignant */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Analyse par enseignant ({data.teachers.length})
          </h4>
          
          <AnimatePresence>
            {data.teachers.map((teacher: any, index: number) => (
              <motion.div
                key={teacher.teacher}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 rounded-lg p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h5 className="font-medium text-foreground">{teacher.teacher}</h5>
                    <Badge variant="outline">{teacher.total_hours}h/semaine</Badge>
                  </div>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${getBalanceColor(teacher.balance_score)}`}>
                    {teacher.balance_score >= 75 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {teacher.balance_score}%
                  </div>
                </div>

                {/* Répartition par jour */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {Object.entries(teacher.daily_hours).map(([day, hours]) => {
                    const hoursNum = Number(hours);
                    return (
                    <div key={day} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1 capitalize">
                        {day.substring(0, 3)}
                      </div>
                      <div className={`text-sm font-medium px-2 py-1 rounded ${
                        hoursNum > 8 ? 'bg-red-100 text-red-700' : 
                        hoursNum > 6 ? 'bg-amber-100 text-amber-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {hoursNum}h
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Jours surchargés */}
                {teacher.overloaded_days.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-amber-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Jours surchargés: {teacher.overloaded_days.join(', ')}
                    </p>
                  </div>
                )}

                {/* Recommandations */}
                {teacher.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Recommandations IA:</p>
                    {teacher.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        • {rec}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Métadonnées */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-between">
            <span>Analysé le {new Date(data.analyzed_at).toLocaleString()}</span>
            <span>IA: {data.model_used}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}