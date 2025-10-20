'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Info,
  MapPin,
  Clock,
  Users,
  RefreshCw,
  Eye,
  Lightbulb,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnomalyDetection } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';

interface AnomalyDetectionProps {
  scheduleData?: any;
  autoDetect?: boolean;
  refreshInterval?: number;
}

export function AnomalyDetection({ 
  scheduleData, 
  autoDetect = false, 
  refreshInterval = 60000 
}: AnomalyDetectionProps) {
  const { data, loading, error, detect } = useAnomalyDetection();
  const { addToast } = useToast();
  const [lastScan, setLastScan] = useState<Date>(new Date());

  useEffect(() => {
    // Détection initiale
    handleDetect();

    // Auto-détection si activé
    if (autoDetect) {
      const interval = setInterval(() => {
        handleDetect(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [scheduleData, autoDetect, refreshInterval]);

  const handleDetect = async (isAutoScan = false) => {
    try {
      await detect(scheduleData);
      setLastScan(new Date());
      
      if (!isAutoScan) {
        addToast({
          title: "Scan d'anomalies terminé",
          description: data ? `${data.total_anomalies} anomalie(s) détectée(s)` : "Scan terminé",
          variant: data?.total_anomalies > 0 ? "destructive" : "default"
        });
      }
    } catch (error) {
      addToast({
        title: "Erreur de détection",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'low':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 75) return 'text-red-600 bg-red-50';
    if (riskScore >= 50) return 'text-amber-600 bg-amber-50';
    if (riskScore >= 25) return 'text-blue-600 bg-blue-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  if (loading && !data) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
            Détection d'anomalies IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Scan en cours...</span>
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
            Erreur de détection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => handleDetect()} variant="outline">
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                Détection d'anomalies IA
                <Brain className="w-5 h-5 text-primary" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.total_anomalies} anomalie(s) détectée(s) • Risque: {data.risk_score}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {lastScan.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDetect()}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score de risque */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-foreground">Score de risque</h4>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getRiskLevelColor(data.risk_score)}`}>
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold">{data.risk_score}%</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                data.risk_score >= 75 ? 'bg-red-500' :
                data.risk_score >= 50 ? 'bg-amber-500' :
                data.risk_score >= 25 ? 'bg-blue-500' :
                'bg-emerald-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${data.risk_score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Liste des anomalies */}
        {data.total_anomalies === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-semibold text-emerald-800 mb-2">Aucune anomalie détectée</h4>
            <p className="text-emerald-600 text-sm">
              L'emploi du temps semble bien structuré selon l'analyse IA
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Anomalies détectées ({data.total_anomalies})
            </h4>

            <AnimatePresence>
              {data.anomalies && data.anomalies.map((anomaly: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/50 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${getSeverityColor(anomaly.severity)}`}>
                        {getSeverityIcon(anomaly.severity)}
                        {anomaly.severity.toUpperCase()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {anomaly.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <h5 className="font-medium text-foreground mb-2">
                    {anomaly.description}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{anomaly.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{anomaly.time}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-amber-800 text-sm">
                      <strong>Impact:</strong> {anomaly.impact}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Recommandations IA */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recommandations IA
            </h4>

            <ul className="space-y-2">
              {data.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Métadonnées */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-between">
            <span>Détecté le {new Date(data.detected_at).toLocaleString()}</span>
            <span>IA: {data.model_used}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}