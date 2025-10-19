'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Activity,
  Shield,
  BarChart3,
  User,
  TrendingUp,
  RefreshCw,
  Zap,
  Sparkles,
  Users,
  Calendar,
  BookOpen,
  Home,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
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
  usePersonalizedRecommendations
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Hook pour les services IA
  const workloadAnalysis = useWorkloadAnalysis();
  const anomalyDetection = useAnomalyDetection();
  const roomOccupancy = useRoomOccupancyPrediction();
  const personalizedRecs = usePersonalizedRecommendations();

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lancer automatiquement l'analyse quand les données sont chargées
  useEffect(() => {
    if (scheduleData && !workloadAnalysis.loading && !workloadAnalysis.data) {
      console.log('🚀 Lancement automatique de l\'analyse de charge...');
      workloadAnalysis.analyze(scheduleData);
    }
  }, [scheduleData]);

  // Lancer automatiquement la détection d'anomalies
  useEffect(() => {
    if (scheduleData && !anomalyDetection.loading && !anomalyDetection.data) {
      console.log('🚀 Lancement automatique de la détection d\'anomalies...');
      anomalyDetection.detect(scheduleData);
    }
  }, [scheduleData]);

  // Lancer automatiquement les prédictions d'occupation
  useEffect(() => {
    if (scheduleData && !roomOccupancy.loading && !roomOccupancy.data) {
      console.log('🚀 Lancement automatique des prédictions d\'occupation...');
      roomOccupancy.predict();
    }
  }, [scheduleData]);

  // Lancer automatiquement les recommandations
  useEffect(() => {
    if (!personalizedRecs.loading && !personalizedRecs.data) {
      console.log('🚀 Lancement automatique des recommandations...');
      personalizedRecs.getRecommendations({ type: userType });
    }
  }, [userType]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        workloadAnalysis.analyze(scheduleData),
        anomalyDetection.detect(scheduleData),
        roomOccupancy.predict(),
        personalizedRecs.getRecommendations({ type: userType })
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
      description: 'Équilibre de la charge de travail',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      count: workloadAnalysis.data?.teachers?.length || 0,
      metric: workloadAnalysis.data?.overall_balance || 0,
      metricLabel: '% équilibre',
      status: workloadAnalysis.loading ? 'loading' : workloadAnalysis.error ? 'error' : 'ready'
    },
    {
      id: 'anomalies',
      title: 'Détection d\'anomalies',
      icon: Shield,
      description: 'Problèmes détectés par IA',
      gradient: 'from-red-500 to-orange-500',
      bgGradient: 'from-red-50 to-orange-50',
      count: anomalyDetection.data?.total_anomalies || 0,
      metric: anomalyDetection.data?.risk_score || 0,
      metricLabel: '% risque',
      status: anomalyDetection.loading ? 'loading' : anomalyDetection.error ? 'error' : 'ready'
    },
    {
      id: 'occupancy',
      title: 'Occupation des salles',
      icon: BarChart3,
      description: 'Prédictions en temps réel',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      count: roomOccupancy.data?.predictions?.length || 0,
      metric: roomOccupancy.data?.overall_occupancy || 0,
      metricLabel: '% occupation',
      status: roomOccupancy.loading ? 'loading' : roomOccupancy.error ? 'error' : 'ready'
    },
    {
      id: 'recommendations',
      title: 'Recommandations IA',
      icon: User,
      description: 'Conseils personnalisés',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      count: personalizedRecs.data ? Object.keys(personalizedRecs.data.recommendations || {}).length : 0,
      metric: personalizedRecs.data ? Math.round(personalizedRecs.data.personalization_score * 100) : 0,
      metricLabel: '% précision',
      status: personalizedRecs.loading ? 'loading' : personalizedRecs.error ? 'error' : 'ready'
    }
  ];

  // Statistiques des données du backend
  const backendStats = [
    {
      label: 'Emplois du temps',
      value: scheduleData?.stats?.total_schedules || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%'
    },
    {
      label: 'Enseignants',
      value: scheduleData?.stats?.total_teachers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+5%'
    },
    {
      label: 'Cours',
      value: scheduleData?.stats?.total_courses || 0,
      icon: BookOpen,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: '+8%'
    },
    {
      label: 'Salles',
      value: scheduleData?.stats?.total_rooms || 0,
      icon: Home,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '0%'
    },
    {
      label: 'Sessions planifiées',
      value: scheduleData?.stats?.total_occurrences || 0,
      icon: Clock,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      trend: '+24%'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'ready':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Hero avec gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary p-8 text-white shadow-2xl"
      >
        {/* Motifs de fond animés */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  Hub Intelligence Artificielle
                  <Sparkles className="w-8 h-8" />
                </h1>
                <p className="text-white/90 text-lg">
                  Analyse et optimisation intelligente des emplois du temps
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <Button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 text-white"
                size="lg"
              >
                {isRefreshing ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 mr-2" />
                )}
                Actualiser tout
              </Button>
              <div className="text-white/80 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {currentTime.toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Statistiques du backend en ligne */}
          <div className="grid grid-cols-5 gap-4">
            {backendStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {stat.trend}
                    {stat.trend.startsWith('+') ? (
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80 text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cartes des services IA - Design moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setActiveTab(service.id)}
          >
            <Card
              className={`relative overflow-hidden border-2 transition-all duration-300 ${
                activeTab === service.id
                  ? 'border-primary shadow-xl shadow-primary/20'
                  : 'border-border hover:border-primary/50 hover:shadow-lg'
              }`}
            >
              {/* Gradient de fond */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-50`} />

              <CardContent className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                  </div>
                </div>

                {/* Titre et description */}
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>

                {/* Métriques */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {service.metric}
                      <span className="text-sm text-muted-foreground ml-1">
                        {service.metricLabel}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {service.count} élément{service.count > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Indicateur actif */}
                {activeTab === service.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contenu des services IA */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-muted/50">
          {aiServices.map((service) => (
            <TabsTrigger
              key={service.id}
              value={service.id}
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <service.icon className="w-4 h-4" />
              <span className="hidden md:inline">{service.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="analysis" className="space-y-4 mt-6">
          <motion.div
            key="analysis-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WorkloadAnalysis
              scheduleData={scheduleData}
              autoRefresh={enableAutoRefresh}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4 mt-6">
          <motion.div
            key="anomalies-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AnomalyDetection
              scheduleData={scheduleData}
              autoDetect={enableAutoRefresh}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4 mt-6">
          <motion.div
            key="occupancy-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RoomOccupancyPredictor
              autoRefresh={enableAutoRefresh}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <motion.div
            key="recommendations-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PersonalizedRecommendations
              defaultUserType={userType}
              autoRefresh={enableAutoRefresh}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Résumé global des analyses IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
              Résumé des analyses IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Équilibre global */}
              <motion.div
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
                whileHover={{ scale: 1.05 }}
              >
                <Activity className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {workloadAnalysis.data?.overall_balance || 0}%
                </div>
                <div className="text-sm font-medium text-blue-700">Équilibre de charge</div>
                <div className="text-xs text-blue-600 mt-2">
                  {workloadAnalysis.data?.teachers?.length || 0} enseignant(s) analysé(s)
                </div>
              </motion.div>

              {/* Score de risque */}
              <motion.div
                className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {anomalyDetection.data?.risk_score || 0}%
                </div>
                <div className="text-sm font-medium text-red-700">Score de risque</div>
                <div className="text-xs text-red-600 mt-2">
                  {anomalyDetection.data?.total_anomalies || 0} anomalie(s) détectée(s)
                </div>
              </motion.div>

              {/* Score de personnalisation */}
              <motion.div
                className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {personalizedRecs.data ? Math.round(personalizedRecs.data.personalization_score * 100) : 0}%
                </div>
                <div className="text-sm font-medium text-emerald-700">Précision IA</div>
                <div className="text-xs text-emerald-600 mt-2">
                  {personalizedRecs.data ? Object.keys(personalizedRecs.data.recommendations || {}).length : 0} recommandation(s)
                </div>
              </motion.div>
            </div>

            {/* Informations sur le schedule actif */}
            {scheduleData?.activeSchedule && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 bg-white/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {scheduleData.activeSchedule.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Emploi du temps actif
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {scheduleData.activeSchedule.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
