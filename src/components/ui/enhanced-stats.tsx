// src/components/ui/enhanced-stats.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Star,
  Target,
  Zap
} from 'lucide-react';

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  target?: number;
  percentage?: number;
}

interface EnhancedStatsProps {
  stats: {
    totalDocuments?: number;
    availableDocuments?: number;
    borrowedDocuments?: number;
    totalAuthors?: number;
    totalUsers?: number;
    totalCourses?: number;
    totalRooms?: number;
    activeSchedules?: number;
  };
  className?: string;
}

export const EnhancedStats: React.FC<EnhancedStatsProps> = ({ stats, className = '' }) => {
  const enhancedStats: StatItem[] = [
    {
      id: 'users',
      title: 'Utilisateurs Actifs',
      value: stats.totalUsers || 1250,
      change: '+12%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'var(--primary)',
      description: 'Étudiants et enseignants',
      target: 1500,
      percentage: ((stats.totalUsers || 1250) / 1500) * 100
    },
    {
      id: 'courses',
      title: 'Cours Disponibles',
      value: stats.totalCourses || 245,
      change: '+8%',
      trend: 'up',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'var(--accent)',
      description: 'Modules d\'enseignement',
      target: 300,
      percentage: ((stats.totalCourses || 245) / 300) * 100
    },
    {
      id: 'schedules',
      title: 'Plannings Actifs',
      value: stats.activeSchedules || 45,
      change: '+15%',
      trend: 'up',
      icon: <Calendar className="w-6 h-6" />,
      color: 'var(--primary-light)',
      description: 'Emplois du temps validés',
      target: 60,
      percentage: ((stats.activeSchedules || 45) / 60) * 100
    },
    {
      id: 'rooms',
      title: 'Salles Gérées',
      value: stats.totalRooms || 32,
      change: 'stable',
      trend: 'stable',
      icon: <MapPin className="w-6 h-6" />,
      color: 'var(--accent-light)',
      description: 'Espaces d\'enseignement',
      target: 40,
      percentage: ((stats.totalRooms || 32) / 40) * 100
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {enhancedStats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="card-elevated group hover:shadow-xl transition-all duration-300"
        >
          <div className="p-6">
            {/* Header avec icône et tendance */}
            <div className="flex items-start justify-between mb-4">
              <div 
                className="p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(stat.trend || 'stable')}
                <span className={`text-sm font-medium ${getTrendColor(stat.trend || 'stable')}`}>
                  {stat.change}
                </span>
              </div>
            </div>

            {/* Valeur principale */}
            <div className="mb-2">
              <div className="text-3xl font-bold text-foreground mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">
                {stat.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </div>

            {/* Barre de progression */}
            {stat.percentage && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progression</span>
                  <span>{Math.round(stat.percentage)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${stat.color}, ${stat.color}dd)`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Objectif */}
            {stat.target && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Objectif: {stat.target.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {stat.target - (typeof stat.value === 'number' ? stat.value : 0)} restant
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface QuickMetricsProps {
  metrics: {
    efficiency: number;
    satisfaction: number;
    utilization: number;
    availability: number;
  };
  className?: string;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, className = '' }) => {
  const quickMetrics = [
    {
      label: 'Efficacité',
      value: metrics.efficiency,
      color: 'var(--primary)',
      icon: <Zap className="w-4 h-4" />
    },
    {
      label: 'Satisfaction',
      value: metrics.satisfaction,
      color: 'var(--accent)',
      icon: <Star className="w-4 h-4" />
    },
    {
      label: 'Utilisation',
      value: metrics.utilization,
      color: 'var(--primary-light)',
      icon: <Activity className="w-4 h-4" />
    },
    {
      label: 'Disponibilité',
      value: metrics.availability,
      color: 'var(--accent-light)',
      icon: <Clock className="w-4 h-4" />
    }
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {quickMetrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="card text-center p-4 hover:shadow-md transition-shadow"
        >
          <div 
            className="inline-flex p-2 rounded-lg mb-2"
            style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
          >
            {metric.icon}
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {metric.value}%
          </div>
          <div className="text-sm text-muted-foreground">
            {metric.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EnhancedStats;