// src/components/dashboard/AdvancedStats.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export default function AdvancedStats() {
  const weeklyStats: StatItem[] = [
    {
      label: 'Taux d\'occupation',
      value: '87%',
      change: '+5%',
      trend: 'up',
      color: 'text-green-600'
    },
    {
      label: 'Heures enseignées',
      value: '342h',
      change: '+12h',
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      label: 'Conflits résolus',
      value: '23',
      change: '-8',
      trend: 'down',
      color: 'text-orange-600'
    },
    {
      label: 'Étudiants présents',
      value: '2,847',
      change: '+127',
      trend: 'up',
      color: 'text-purple-600'
    }
  ];

  const efficiencyMetrics = [
    { name: 'Lundi', value: 85, color: 'bg-blue-500' },
    { name: 'Mardi', value: 92, color: 'bg-green-500' },
    { name: 'Mercredi', value: 78, color: 'bg-yellow-500' },
    { name: 'Jeudi', value: 89, color: 'bg-purple-500' },
    { name: 'Vendredi', value: 95, color: 'bg-green-600' },
    { name: 'Samedi', value: 67, color: 'bg-orange-500' }
  ];

  const performanceCards = [
    {
      title: 'Utilisation IA',
      value: '94%',
      description: 'Prédictions automatiques',
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Optimisation',
      value: '23min',
      description: 'Temps gagné par jour',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Satisfaction',
      value: '4.8/5',
      description: 'Note des enseignants',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques hebdomadaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performances cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center p-4 rounded-lg bg-surface hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center justify-center mb-2">
                    {getTrendIcon(stat.trend)}
                  </div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-secondary mb-1">{stat.label}</div>
                  <div className="text-xs text-tertiary">{stat.change} vs semaine dernière</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Graphique d'efficacité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Efficacité par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {efficiencyMetrics.map((day, index) => (
                <motion.div
                  key={day.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-primary w-20">
                    {day.name}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${day.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${day.value}%` }}
                        transition={{ delay: 0.2 + (0.1 * index), duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-secondary w-12 text-right">
                    {day.value}%
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cartes de performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {performanceCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden"
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {card.value}
                  </div>
                  <div className="text-lg font-medium text-primary mb-1">
                    {card.title}
                  </div>
                  <div className="text-sm text-secondary">
                    {card.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Alertes et notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">Conflit détecté</div>
                  <div className="text-sm text-yellow-600">Salle A101 - Lundi 14h00</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Optimisation réussie</div>
                  <div className="text-sm text-green-600">Planning semaine prochaine généré</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800">Nouveau professeur</div>
                  <div className="text-sm text-blue-600">Dr. Mengue - Cardiologie</div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}