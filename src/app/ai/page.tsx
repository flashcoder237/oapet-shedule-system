'use client';

import React, { useState, useEffect } from 'react';
import { AIHub } from '@/components/ai/AIHub';
import { PageLoading } from '@/components/ui/loading';
import { scheduleService } from '@/lib/api/services/schedules';
import { courseService } from '@/lib/api/services/courses';
import { roomService } from '@/lib/api/services/rooms';
import { occurrenceService } from '@/lib/api/services/occurrences';
import { useToast } from '@/components/ui/use-toast';

export default function AIPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      console.log('=== CHARGEMENT DES DONNÉES POUR IA ===');

      // Charger toutes les données en parallèle
      const [schedulesRes, coursesRes, teachersRes, roomsRes] = await Promise.all([
        scheduleService.getSchedules(),
        courseService.getCourses(),
        courseService.getTeachers(),
        roomService.getRooms()
      ]);

      console.log('Schedules chargés:', schedulesRes.results?.length || 0);
      console.log('Cours chargés:', coursesRes.results?.length || 0);
      console.log('Enseignants chargés:', teachersRes.results?.length || 0);
      console.log('Salles chargées:', roomsRes.results?.length || 0);

      // Prendre le schedule actif ou le plus récent
      const activeSchedule = schedulesRes.results?.find((s: any) => s.is_published) ||
                            schedulesRes.results?.[0];

      let occurrencesData = null;
      if (activeSchedule) {
        console.log('Schedule actif trouvé:', activeSchedule.id, '-', activeSchedule.name);

        // Charger les occurrences du schedule actif
        try {
          const today = new Date();
          const startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1); // 1 mois avant
          const endDate = new Date(today);
          endDate.setMonth(today.getMonth() + 2); // 2 mois après

          const occurrences = await occurrenceService.getOccurrences({
            schedule: activeSchedule.id,
            date_from: occurrenceService.formatDate(startDate),
            date_to: occurrenceService.formatDate(endDate),
            page_size: 1000 // Charger beaucoup d'occurrences
          });

          occurrencesData = occurrences.results || [];
          console.log('Occurrences chargées:', occurrencesData.length);
        } catch (error) {
          console.warn('Erreur lors du chargement des occurrences:', error);
        }
      }

      // Agréger les données pour l'IA
      const aggregated = {
        schedules: schedulesRes.results || [],
        activeSchedule: activeSchedule,
        courses: coursesRes.results || [],
        teachers: teachersRes.results || [],
        rooms: roomsRes.results || [],
        occurrences: occurrencesData || [],

        // Statistiques
        stats: {
          total_schedules: schedulesRes.results?.length || 0,
          total_courses: coursesRes.results?.length || 0,
          total_teachers: teachersRes.results?.length || 0,
          total_rooms: roomsRes.results?.length || 0,
          total_occurrences: occurrencesData?.length || 0,
        }
      };

      console.log('Données agrégées:', aggregated.stats);

      setScheduleData(activeSchedule);
      setAggregatedData(aggregated);

    } catch (error) {
      console.error('=== ERREUR CHARGEMENT DONNÉES IA ===');
      console.error('Error:', error);

      addToast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données pour l'analyse IA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageLoading
        message="Chargement des données pour l'intelligence artificielle..."
        variant="detailed"
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Affichage des statistiques chargées */}
      {aggregatedData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📊 Données chargées pour l'IA
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs text-blue-700">
            <div>
              <span className="font-medium">{aggregatedData.stats.total_schedules}</span> emplois du temps
            </div>
            <div>
              <span className="font-medium">{aggregatedData.stats.total_courses}</span> cours
            </div>
            <div>
              <span className="font-medium">{aggregatedData.stats.total_teachers}</span> enseignants
            </div>
            <div>
              <span className="font-medium">{aggregatedData.stats.total_rooms}</span> salles
            </div>
            <div>
              <span className="font-medium">{aggregatedData.stats.total_occurrences}</span> sessions
            </div>
            <div>
              <span className="font-medium">{aggregatedData.activeSchedule?.name || 'Aucun'}</span>
            </div>
          </div>
        </div>
      )}

      <AIHub
        defaultTab="analysis"
        userType="admin"
        scheduleData={aggregatedData}
        enableAutoRefresh={false}
      />
    </div>
  );
}