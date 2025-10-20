'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  X,
} from 'lucide-react';
import { Schedule } from '@/types/api';

interface ScheduleStatsPanelProps {
  schedules: Schedule[];
  onClose: () => void;
}

export function ScheduleStatsPanel({ schedules, onClose }: ScheduleStatsPanelProps) {
  // Calcul des statistiques
  const totalSchedules = schedules.length;
  const publishedSchedules = schedules.filter((s) => s.is_published).length;
  const draftSchedules = totalSchedules - publishedSchedules;
  const totalSessions = schedules.reduce((sum, s) => sum + (s.sessions_count || 0), 0);
  const totalConflicts = schedules.reduce((sum, s) => sum + (s.conflicts_count || 0), 0);

  const stats = [
    {
      label: 'Total emplois du temps',
      value: totalSchedules,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Publiés',
      value: publishedSchedules,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Brouillons',
      value: draftSchedules,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Sessions totales',
      value: totalSessions,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Conflits détectés',
      value: totalConflicts,
      icon: AlertTriangle,
      color: totalConflicts > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: totalConflicts > 0 ? 'bg-red-100' : 'bg-green-100',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Statistiques</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
