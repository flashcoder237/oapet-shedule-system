'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, X, Users, Activity } from 'lucide-react';
import { ScheduleSession } from '@/types/api';

interface FloatingStatsProps {
  sessions: ScheduleSession[];
  conflicts: any[];
}

export function FloatingStats({ sessions, conflicts }: FloatingStatsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-28 left-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 p-0"
        >
          <BarChart3 className="h-6 w-6 text-white" />
          {conflicts.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {conflicts.length}
            </div>
          )}
        </Button>
      </motion.div>
    );
  }

  const stats = {
    total: sessions.length,
    CM: sessions.filter((s: ScheduleSession) => s.session_type === 'CM').length,
    TD: sessions.filter((s: ScheduleSession) => s.session_type === 'TD').length,
    TP: sessions.filter((s: ScheduleSession) => s.session_type === 'TP').length,
    EXAM: sessions.filter((s: ScheduleSession) => s.session_type === 'EXAM').length,
    totalStudents: sessions.reduce((sum: number, s: ScheduleSession) => sum + s.expected_students, 0),
    conflicts: conflicts.length
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -100, y: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      className="fixed bottom-28 left-6 z-40 w-80"
    >
      <Card className="shadow-2xl border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-2 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-800">Sessions</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.CM}</div>
              <div className="text-xs text-green-800">CM</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{stats.TD}</div>
              <div className="text-xs text-purple-800">TD</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{stats.TP}</div>
              <div className="text-xs text-orange-800">TP</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
              <div className="text-xl font-bold text-red-600">{stats.EXAM}</div>
              <div className="text-xs text-red-800">Examens</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{stats.conflicts}</div>
              <div className="text-xs text-yellow-800">Conflits</div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Total étudiants</span>
              </div>
              <span className="font-bold text-gray-900">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Taux d'occupation</span>
              </div>
              <span className="font-bold text-gray-900">
                {sessions.length > 0 ? Math.round((stats.totalStudents / sessions.length) * 100) / 100 : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}