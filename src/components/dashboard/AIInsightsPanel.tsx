'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  BarChart3,
  Lightbulb,
  Shield,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { mlService } from '@/lib/api/services/ml';

interface AIInsight {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
  priority: number;
}

interface AIInsightsPanelProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AIInsightsPanel({ 
  className = "",
  autoRefresh = true,
  refreshInterval = 120000 // 2 minutes
}: AIInsightsPanelProps) {
  const { addToast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [anomaliesData, setAnomaliesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadAIInsights = async () => {
    setIsLoading(true);
    try {
      // Charger les analyses IA en parallèle
      const [workload, anomalies, recommendations] = await Promise.all([
        mlService.analyzeWorkload().catch(() => null),
        mlService.detectAnomalies().catch(() => null),
        mlService.getPersonalizedRecommendations({ type: 'admin' }).catch(() => null)
      ]);

      setWorkloadData(workload);
      setAnomaliesData(anomalies);

      // Générer les insights basés sur les données
      const newInsights: AIInsight[] = [];

      // Insights sur les anomalies
      if (anomalies && anomalies.total_anomalies > 0) {
        newInsights.push({
          type: anomalies.total_anomalies > 5 ? 'error' : 'warning',
          title: `${anomalies.total_anomalies} anomalies détectées`,
          message: `Risque global: ${Math.round(anomalies.risk_score || 0)}%. Intervention recommandée.`,
          priority: anomalies.total_anomalies > 5 ? 1 : 2,
          action: () => {
            // Redirection vers la page d'optimisation
            window.location.href = '/schedule?tab=optimization';
          },
          actionLabel: 'Optimiser'
        });
      } else if (anomalies) {
        newInsights.push({
          type: 'success',
          title: 'Aucune anomalie détectée',
          message: 'Vos emplois du temps sont optimaux.',
          priority: 3
        });
      }

      // Insights sur la charge de travail
      if (workload && workload.overall_balance) {
        const balance = workload.overall_balance;
        if (balance < 70) {
          newInsights.push({
            type: 'warning',
            title: `Déséquilibre de charge: ${balance}%`,
            message: `${workload.teachers?.filter((t: any) => t.balance_score < 70).length || 0} enseignants surchargés.`,
            priority: 2,
            action: () => {
              addToast({
                title: "Analyse de charge",
                description: "Consultez le hub IA pour plus de détails",
                variant: "default"
              });
            },
            actionLabel: 'Voir détails'
          });
        } else if (balance >= 85) {
          newInsights.push({
            type: 'success',
            title: `Excellent équilibre: ${balance}%`,
            message: 'La charge de travail est bien répartie entre les enseignants.',
            priority: 3
          });
        }
      }

      // Insights sur les recommandations
      if (recommendations && recommendations.recommendations) {
        const highPriorityRecs = Object.entries(recommendations.recommendations)
          .filter(([key, recs]) => Array.isArray(recs) && recs.length > 0);
        
        if (highPriorityRecs.length > 0) {
          newInsights.push({
            type: 'info',
            title: `${highPriorityRecs.length} recommandations disponibles`,
            message: 'L\'IA a identifié des opportunités d\'amélioration.',
            priority: 3,
            action: () => {
              window.location.href = '/ai';
            },
            actionLabel: 'Voir hub IA'
          });
        }
      }

      // Trier par priorité
      newInsights.sort((a, b) => a.priority - b.priority);
      setInsights(newInsights);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Erreur lors du chargement des insights IA:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de charger les insights IA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAIInsights();

    if (autoRefresh) {
      const interval = setInterval(loadAIInsights, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      default: return 'default';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Insights IA
                <Sparkles className="w-4 h-4 text-purple-500" />
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Mise à jour: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAIInsights}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && insights.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-muted-foreground">Analyse IA en cours...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métriques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">Équilibre</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {workloadData?.overall_balance || 0}%
                </div>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-600">Anomalies</span>
                </div>
                <div className="text-lg font-bold text-red-600">
                  {anomaliesData?.total_anomalies || 0}
                </div>
              </div>
              
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">Score</span>
                </div>
                <div className="text-lg font-bold text-emerald-600">
                  {Math.round((workloadData?.overall_balance || 0) * (anomaliesData?.total_anomalies ? 0.8 : 1))}%
                </div>
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Alert variant={getAlertVariant(insight.type)} className="relative">
                    <div className="flex items-start gap-3">
                      {getIcon(insight.type)}
                      <div className="flex-1">
                        <AlertTitle className="text-sm font-medium">
                          {insight.title}
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                          {insight.message}
                        </AlertDescription>
                      </div>
                      {insight.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={insight.action}
                          className="text-xs"
                        >
                          {insight.actionLabel}
                        </Button>
                      )}
                    </div>
                  </Alert>
                </motion.div>
              ))}
            </AnimatePresence>

            {insights.length === 0 && !isLoading && (
              <div className="text-center py-6 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun insight disponible pour le moment</p>
                <p className="text-xs mt-1">L'IA analyse vos données...</p>
              </div>
            )}

            {/* Lien vers le hub IA */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => window.location.href = '/ai'}
              >
                <Brain className="w-4 h-4 mr-2" />
                Accéder au Hub IA complet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIInsightsPanel;