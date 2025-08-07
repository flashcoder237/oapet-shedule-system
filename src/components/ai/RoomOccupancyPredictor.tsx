'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  TrendingUp, 
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Brain,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoomOccupancyPrediction } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';

interface RoomOccupancyPredictorProps {
  defaultRoomId?: string;
  defaultDateRange?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RoomOccupancyPredictor({ 
  defaultRoomId,
  defaultDateRange = 'Aujourd\'hui',
  autoRefresh = false, 
  refreshInterval = 120000 
}: RoomOccupancyPredictorProps) {
  const { data, loading, error, predict } = useRoomOccupancyPrediction();
  const { addToast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<string>(defaultRoomId || 'all');
  const [dateRange, setDateRange] = useState<string>(defaultDateRange);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Prédiction initiale
    handlePredict();

    // Auto-refresh si activé
    if (autoRefresh) {
      const interval = setInterval(() => {
        handlePredict(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [selectedRoom, dateRange, autoRefresh, refreshInterval]);

  const handlePredict = async (isAutoRefresh = false) => {
    try {
      const roomId = selectedRoom === 'all' ? undefined : selectedRoom;
      await predict(roomId, dateRange);
      setLastUpdate(new Date());
      
      if (!isAutoRefresh) {
        addToast({
          title: "Prédiction terminée",
          description: `Occupation prédite pour ${data?.predictions.length || 0} salle(s)`,
          variant: "default"
        });
      }
    } catch (error) {
      addToast({
        title: "Erreur de prédiction",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    }
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return 'text-red-600 bg-red-50';
    if (occupancy >= 70) return 'text-amber-600 bg-amber-50';
    if (occupancy >= 40) return 'text-blue-600 bg-blue-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getOccupancyLevel = (occupancy: number) => {
    if (occupancy >= 90) return 'Très élevée';
    if (occupancy >= 70) return 'Élevée';
    if (occupancy >= 40) return 'Modérée';
    return 'Faible';
  };

  const rooms = [
    { id: 'all', name: 'Toutes les salles' },
    { id: 'A101', name: 'Salle A101' },
    { id: 'A102', name: 'Salle A102' },
    { id: 'B201', name: 'Salle B201' },
    { id: 'B202', name: 'Salle B202' },
    { id: 'C301', name: 'Salle C301' },
    { id: 'D405', name: 'Salle D405' },
    { id: 'Amphi 1', name: 'Amphithéâtre 1' },
    { id: 'Amphi 2', name: 'Amphithéâtre 2' }
  ];

  if (loading && !data) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary animate-pulse" />
            Prédiction d'occupation IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Prédiction en cours...</span>
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
            <AlertCircle className="w-5 h-5 text-destructive" />
            Erreur de prédiction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => handlePredict()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                Prédiction d'occupation IA
                <Brain className="w-5 h-5 text-primary" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {data?.predictions.length || 0} salle(s) analysée(s) • {data?.date_range}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePredict()}
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
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Salle
            </label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Période
            </label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aujourd'hui">Aujourd'hui</SelectItem>
                <SelectItem value="Demain">Demain</SelectItem>
                <SelectItem value="Cette semaine">Cette semaine</SelectItem>
                <SelectItem value="Semaine prochaine">Semaine prochaine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prédictions par salle */}
        {data && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Prédictions d'occupation
            </h4>
            
            <AnimatePresence>
              {data.predictions.map((prediction: any, index: number) => (
                <motion.div
                  key={prediction.room}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/50 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <h5 className="font-medium text-foreground">{prediction.room}</h5>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getOccupancyColor(prediction.average_occupancy)}`}>
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">{prediction.average_occupancy}%</span>
                      <span className="text-xs">({getOccupancyLevel(prediction.average_occupancy)})</span>
                    </div>
                  </div>

                  {/* Graphique d'occupation par heure */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Occupation prévue par heure</p>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                      {Object.entries(prediction.hourly_predictions).map(([hour, occupancy]) => {
                        const occupancyRate = Number(occupancy);
                        return (
                        <div key={hour} className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            {hour}
                          </div>
                          <div 
                            className={`h-8 rounded text-xs flex items-center justify-center font-medium ${getOccupancyColor(occupancyRate * 100)}`}
                            style={{ 
                              height: `${Math.max(20, occupancyRate * 40)}px`,
                              minHeight: '20px'
                            }}
                          >
                            {Math.round(occupancyRate * 100)}%
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>

                  {/* Créneaux de pointe et disponibles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prediction.peak_hours.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Heures de pointe
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.peak_hours.map((hour: string) => (
                            <Badge key={hour} variant="destructive" className="text-xs">
                              {hour}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {prediction.available_slots.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                        <p className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Créneaux disponibles
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.available_slots.map((hour: string) => (
                            <Badge key={hour} className="text-xs bg-emerald-100 text-emerald-700">
                              {hour}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Utilisation de la capacité */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Utilisation de la capacité:</span>
                      <span className="font-medium">{prediction.capacity_utilization}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Métadonnées */}
        {data && (
          <div className="text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center justify-between">
              <span>Prédit le {new Date(data.predicted_at).toLocaleString()}</span>
              <span>IA: {data.model_used}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}