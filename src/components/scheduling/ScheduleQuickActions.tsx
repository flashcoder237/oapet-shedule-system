'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarPlus,
  Copy,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Settings,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Mail,
  Bell,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

interface ScheduleQuickActionsProps {
  scheduleStats: {
    totalSessions: number;
    conflictsCount: number;
    completedSessions: number;
    upcomingSessions: number;
    teachersCount: number;
    roomsOccupancy: number;
  };
  onQuickAction: (action: string, params?: any) => Promise<void>;
  className?: string;
}

export function ScheduleQuickActions({ 
  scheduleStats, 
  onQuickAction, 
  className 
}: ScheduleQuickActionsProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string, params?: any) => {
    setLoading(action);
    try {
      await onQuickAction(action, params);
      addToast({
        title: "Action réussie",
        description: `L'action "${action}" a été exécutée avec succès.`,
      });
    } catch (error) {
      addToast({
        title: "Erreur",
        description: `Impossible d'exécuter l'action "${action}".`,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const quickActions = [
    {
      id: 'create-session',
      title: 'Nouvelle Session',
      description: 'Créer une nouvelle session de cours',
      icon: CalendarPlus,
      color: 'bg-blue-500',
      action: () => handleAction('create-session')
    },
    {
      id: 'duplicate-week',
      title: 'Dupliquer la Semaine',
      description: 'Dupliquer la semaine courante vers une autre période',
      icon: Copy,
      color: 'bg-green-500',
      action: () => handleAction('duplicate-week')
    },
    {
      id: 'detect-conflicts',
      title: 'Détecter les Conflits',
      description: 'Analyser et détecter tous les conflits d\'horaires',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      action: () => handleAction('detect-conflicts'),
      badge: scheduleStats.conflictsCount > 0 ? scheduleStats.conflictsCount : undefined
    },
    {
      id: 'optimize-schedule',
      title: 'Optimiser l\'Emploi du Temps',
      description: 'Optimiser automatiquement la répartition des cours',
      icon: Zap,
      color: 'bg-purple-500',
      action: () => handleAction('optimize-schedule')
    },
    {
      id: 'export-pdf',
      title: 'Export PDF',
      description: 'Exporter l\'emploi du temps au format PDF',
      icon: Download,
      color: 'bg-red-500',
      action: () => handleAction('export-pdf')
    },
    {
      id: 'import-data',
      title: 'Importer des Données',
      description: 'Importer un emploi du temps depuis un fichier',
      icon: Upload,
      color: 'bg-indigo-500',
      action: () => handleAction('import-data')
    },
    {
      id: 'sync-calendar',
      title: 'Synchroniser Calendrier',
      description: 'Synchroniser avec les calendriers externes',
      icon: RefreshCw,
      color: 'bg-teal-500',
      action: () => handleAction('sync-calendar')
    },
    {
      id: 'send-notifications',
      title: 'Envoyer Notifications',
      description: 'Notifier les enseignants et étudiants',
      icon: Bell,
      color: 'bg-yellow-500',
      action: () => handleAction('send-notifications')
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const stats = [
    {
      title: 'Sessions Total',
      value: scheduleStats.totalSessions,
      icon: Calendar,
      color: 'text-blue-600',
      description: 'Sessions programmées'
    },
    {
      title: 'Conflits',
      value: scheduleStats.conflictsCount,
      icon: AlertTriangle,
      color: scheduleStats.conflictsCount > 0 ? 'text-red-600' : 'text-green-600',
      description: 'Conflits détectés'
    },
    {
      title: 'Sessions Terminées',
      value: scheduleStats.completedSessions,
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Cours déjà donnés'
    },
    {
      title: 'Sessions à Venir',
      value: scheduleStats.upcomingSessions,
      icon: Clock,
      color: 'text-orange-600',
      description: 'Prochains cours'
    },
    {
      title: 'Enseignants',
      value: scheduleStats.teachersCount,
      icon: Users,
      color: 'text-purple-600',
      description: 'Enseignants impliqués'
    },
    {
      title: 'Occupation Salles',
      value: `${scheduleStats.roomsOccupancy}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      description: 'Taux d\'occupation'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Vue d'Ensemble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TooltipProvider>
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 relative"
                        onClick={action.action}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`p-3 rounded-full ${action.color} bg-opacity-10 relative`}>
                              <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                              {action.badge && (
                                <Badge 
                                  variant="destructive" 
                                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                >
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{action.title}</h3>
                            </div>
                            {loading === action.id && (
                              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Alertes et Notifications */}
      {scheduleStats.conflictsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">
                    {scheduleStats.conflictsCount} conflit(s) détecté(s)
                  </h3>
                  <p className="text-sm text-orange-600">
                    Des conflits d'horaires ont été détectés. Cliquez pour les résoudre.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction('resolve-conflicts')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Résoudre
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Suggestions d'Optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Suggestions d'Optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">Optimiser les créneaux</p>
                <p className="text-sm text-blue-600">
                  Certains créneaux pourraient être mieux répartis pour éviter les heures creuses.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAction('optimize-time-slots')}
              >
                Appliquer
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-900">Répartition des enseignants</p>
                <p className="text-sm text-green-600">
                  La charge de travail pourrait être mieux équilibrée entre les enseignants.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAction('balance-teachers')}
              >
                Équilibrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}