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

interface AdvancedStatsProps {
  stats?: StatItem[];
}

export default function AdvancedStats({ stats = [] }: AdvancedStatsProps) {
  // Les statistiques viennent maintenant des props
  
  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques Avancées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune statistique disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              {stats.map((stat, index) => (
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

      {/* Sections supplémentaires disponibles quand des données sont fournies */}
    </div>
  );
}