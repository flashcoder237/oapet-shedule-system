'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Users, BookOpen, MapPin, Target, Zap, Brain, Shuffle } from 'lucide-react';
import { Card, CardContent, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, CardSkeleton, LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { scheduleService } from '@/lib/api/services/schedules';
import { mlService } from '@/lib/api/services/ml';
import DragDropScheduler from '@/components/scheduling/DragDropScheduler';

export default function SchedulePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState(null);
  const [optimizationResults, setOptimizationResults] = useState<{
    optimized_schedule: any;
    conflicts_resolved: number;
    optimization_score: number;
    suggestions: string[];
  } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  const { addToast } = useToast();

  // Animations Framer Motion (simplifiées)
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Charger les données pour la période sélectionnée
  };

  const handleOptimizeSchedule = async () => {
    setIsOptimizing(true);
    try {
      // Appel au service ML pour optimiser
      const result = await mlService.optimizeSchedule({
        constraints: {
          avoid_conflicts: true,
          balance_workload: true,
          prefer_morning_sessions: false
        }
      });
      
      setOptimizationResults(result);
      addToast({
        title: "Optimisation réussie",
        description: "L'emploi du temps a été optimisé avec succès",
      });
    } catch (error) {
      addToast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser l'emploi du temps",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Emploi du Temps</h1>
          <p className="text-secondary mt-1">Planification et gestion des cours avec IA</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowOptimizer(!showOptimizer)}
          >
            <Brain className="w-4 h-4 mr-2" />
            IA Optimizer
          </Button>
          <Button onClick={handleOptimizeSchedule} disabled={isOptimizing}>
            {isOptimizing ? (
              <LoadingSpinner className="w-4 h-4 mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? 'Optimisation...' : 'Optimiser'}
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau cours
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Cours planifiés"
          value="156"
          change="+12 cette semaine"
          trend="up"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          title="Conflits détectés"
          value={conflicts.length.toString()}
          change="À résoudre"
          trend={conflicts.length > 0 ? "down" : "neutral"}
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="Salles utilisées"
          value="89%"
          change="Taux d'occupation"
          trend="up"
          icon={<MapPin className="h-6 w-6" />}
        />
        <StatCard
          title="Score IA"
          value="94%"
          change="Optimisation"
          trend="up"
          icon={<Brain className="h-6 w-6" />}
        />
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Période d'affichage</h3>
              <div className="flex gap-2">
                <Button 
                  variant={selectedPeriod === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodChange('today')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Aujourd'hui
                </Button>
                <Button 
                  variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodChange('week')}
                >
                  Cette semaine
                </Button>
                <Button 
                  variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodChange('month')}
                >
                  Ce mois
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimizer Panel */}
      {showOptimizer && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Optimiseur IA</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Contraintes</h4>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Éviter les conflits</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Équilibrer la charge</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">Préférer le matin</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Priorités</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Satisfaction profs:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Utilisation salles:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Actions</h4>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Optimiser maintenant
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Simuler changements
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planificateur principal */}
      <Card>
        <CardContent className="p-6">
          <DragDropScheduler
            onConflictDetected={(conflicts) => setConflicts(conflicts)}
            readOnly={false}
            showConflicts={true}
            enableAutoScheduling={true}
            view={selectedPeriod as 'day' | 'week' | 'month'}
          />
        </CardContent>
      </Card>

      {/* Conflits détectés */}
      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Conflits détectés</h4>
                <p className="text-sm text-red-600 mt-1">
                  {conflicts.length} conflit(s) nécessitent votre attention
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Résoudre automatiquement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}