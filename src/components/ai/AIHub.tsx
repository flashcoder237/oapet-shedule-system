'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Shield, 
  BarChart3,
  User,
  Lightbulb,
  TrendingUp,
  Settings,
  RefreshCw,
  Zap,
  Target,
  Eye,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkloadAnalysis } from './WorkloadAnalysis';
import { AnomalyDetection } from './AnomalyDetection';
import { RoomOccupancyPredictor } from './RoomOccupancyPredictor';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import { 
  useWorkloadAnalysis,
  useAnomalyDetection,
  useRoomOccupancyPrediction,
  usePersonalizedRecommendations,
  useOptimalScheduleRecommendations,
  useStudentPreferencesAnalysis,
  useCourseSuccessPrediction
} from '@/hooks/useAI';

interface AIHubProps {
  defaultTab?: string;
  userType?: 'student' | 'teacher' | 'admin';
  scheduleData?: any;
  enableAutoRefresh?: boolean;
}

export function AIHub({ 
  defaultTab = 'analysis',
  userType = 'student',
  scheduleData,
  enableAutoRefresh = false
}: AIHubProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hook pour les services IA
  const workloadAnalysis = useWorkloadAnalysis();
  const anomalyDetection = useAnomalyDetection();
  const roomOccupancy = useRoomOccupancyPrediction();
  const personalizedRecs = usePersonalizedRecommendations();
  const optimalSchedule = useOptimalScheduleRecommendations();
  const studentPrefs = useStudentPreferencesAnalysis();
  const courseSuccess = useCourseSuccessPrediction();

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        workloadAnalysis.analyze(scheduleData),
        anomalyDetection.detect(scheduleData),
        roomOccupancy.predict(),
        personalizedRecs.getRecommendations({ type: userType }),
        optimalSchedule.getRecommendations(),
        studentPrefs.analyze(),
        courseSuccess.predict()
      ]);
    } catch (error) {
      console.error('Erreur lors du refresh global:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const aiServices = [
    {
      id: 'analysis',
      title: 'Analyse de charge',
      icon: Activity,
      description: 'Équilibre de la charge de travail des enseignants',
      color: 'text-blue-600 bg-blue-50',
      count: workloadAnalysis.data?.teachers?.length || 0,
      status: workloadAnalysis.loading ? 'loading' : workloadAnalysis.error ? 'error' : 'ready'
    },
    {
      id: 'anomalies',
      title: 'Détection d\'anomalies',
      icon: Shield,
      description: 'Détection intelligente des problèmes d\'emploi du temps',
      color: 'text-red-600 bg-red-50',
      count: anomalyDetection.data?.total_anomalies || 0,
      status: anomalyDetection.loading ? 'loading' : anomalyDetection.error ? 'error' : 'ready'
    },
    {
      id: 'occupancy',
      title: 'Prédiction d\'occupation',
      icon: BarChart3,
      description: 'Prévision d\'occupation des salles en temps réel',
      color: 'text-emerald-600 bg-emerald-50',
      count: roomOccupancy.data?.predictions?.length || 0,
      status: roomOccupancy.loading ? 'loading' : roomOccupancy.error ? 'error' : 'ready'
    },
    {
      id: 'recommendations',
      title: 'Recommandations personnalisées',
      icon: User,
      description: 'Conseils adaptés à votre profil',
      color: 'text-purple-600 bg-purple-50',
      count: personalizedRecs.data ? Object.keys(personalizedRecs.data.recommendations || {}).length : 0,
      status: personalizedRecs.loading ? 'loading' : personalizedRecs.error ? 'error' : 'ready'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return <Eye className="w-4 h-4 text-red-500" />;
      case 'ready':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du hub IA */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  Hub Intelligence Artificielle
                  <Zap className="w-6 h-6 text-primary" />
                </CardTitle>
                <p className="text-muted-foreground">
                  Analyse et optimisation intelligente de vos emplois du temps
                </p>
              </div>
            </div>

            <Button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="bg-primary hover:bg-primary/90"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Actualiser tout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Aperçu des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                activeTab === service.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setActiveTab(service.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.color}`}>
                    <service.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <Badge variant="outline" className="text-xs">
                      {service.count}
                    </Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">
                  {service.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Services IA détaillés */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analyse
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Occupation
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Recommandations
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="analysis" className="space-y-4">
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WorkloadAnalysis 
                scheduleData={scheduleData}
                autoRefresh={enableAutoRefresh}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <motion.div
              key="anomalies"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AnomalyDetection 
                scheduleData={scheduleData}
                autoDetect={enableAutoRefresh}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-4">
            <motion.div
              key="occupancy"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <RoomOccupancyPredictor 
                autoRefresh={enableAutoRefresh}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PersonalizedRecommendations 
                defaultUserType={userType}
                autoRefresh={enableAutoRefresh}
              />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Statistiques globales */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Statistiques IA globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workloadAnalysis.data?.overall_balance || 0}%
              </div>
              <div className="text-sm text-blue-600">Équilibre global</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {anomalyDetection.data?.risk_score || 0}%
              </div>
              <div className="text-sm text-red-600">Score de risque</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {personalizedRecs.data ? Math.round(personalizedRecs.data.personalization_score * 100) : 0}%
              </div>
              <div className="text-sm text-emerald-600">Personnalisation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}