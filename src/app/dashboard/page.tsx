// src/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, CardSkeleton, LoadingSpinner } from '@/components/ui/loading';
import ScheduleCalendar from '@/components/dashboard/ScheduleCalendar';
import RecentActivities from '@/components/dashboard/RecentActivities';
import RoomOccupancyChart from '@/components/dashboard/RoomOccupancyChart';
import ScheduleConflicts from '@/components/dashboard/ScheduleConflicts';
import { useAuth } from '@/lib/auth/context';
import { courseService } from '@/lib/api/services/courses';
import type { DashboardStats } from '@/types/api';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { user } = useAuth();

  // Chargement des données du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await courseService.getCoursesStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulation d'une requête de rafraîchissement
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period);
    setIsLoading(true);
    // Simulation du chargement des nouvelles données
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <PageLoading 
        message="Chargement du tableau de bord..." 
        variant="detailed"
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-3xl font-bold text-primary">Tableau de bord</h2>
          <p className="text-secondary mt-1">
            Bienvenue {user?.full_name || 'Utilisateur'} - Aperçu général de votre système
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={selectedPeriod === 'today' ? 'default' : 'outline'}
            onClick={() => handlePeriodChange('today')}
            disabled={isLoading}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Aujourd'hui
          </Button>
          <Button 
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => handlePeriodChange('week')}
            disabled={isLoading}
          >
            Cette semaine
          </Button>
          <Button 
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => handlePeriodChange('month')}
            disabled={isLoading}
          >
            Ce mois
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard
          title="Cours programmés"
          value={stats?.total_courses.toString() || "0"}
          change="+12% vs semaine dernière"
          trend="up"
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <StatCard
          title="Salles disponibles"
          value={`${stats?.total_rooms || 0} salles`}
          change={`${stats?.system_utilization || 0}% d'occupation`}
          trend="neutral"
          icon={<MapPin className="h-6 w-6" />}
        />
        
        <StatCard
          title="Enseignants actifs"
          value={stats?.total_teachers.toString() || "0"}
          change="+3 ce mois"
          trend="up"
          icon={<Users className="h-6 w-6" />}
        />
        
        <StatCard
          title="Conflits d'horaires"
          value={stats?.unresolved_conflicts.toString() || "0"}
          change="-5 depuis hier"
          trend="down"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {/* Calendar */}
        <Card className="col-span-2" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Emploi du temps</CardTitle>
              <Link href="/schedule" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center transition-colors">
                Voir tout
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardSkeleton rows={5} showHeader={false} />
            ) : (
              <ScheduleCalendar />
            )}
          </CardContent>
        </Card>
        
        {/* Recent Activities */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activités récentes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                loading={isRefreshing}
              >
                <Activity className="mr-1 h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isRefreshing ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <RecentActivities />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Conflicts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        {/* Room Occupancy Chart */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Occupation des salles</CardTitle>
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-1 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardSkeleton rows={6} showHeader={false} />
            ) : (
              <RoomOccupancyChart />
            )}
          </CardContent>
        </Card>
        
        {/* Schedule Conflicts */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conflits d'horaires</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <AlertTriangle className="mr-1 h-4 w-4" />
                Résoudre
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardSkeleton rows={4} showHeader={false} />
            ) : (
              <ScheduleConflicts />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary-subtle to-accent-subtle border-primary/20" hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Actions rapides</h3>
                <p className="text-secondary text-sm">Accès rapide aux fonctionnalités les plus utilisées</p>
              </div>
              <div className="flex gap-3">
                <Button size="sm" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Nouveau cours
                </Button>
                <Button size="sm" variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  Réserver salle
                </Button>
                <Button size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planifier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}