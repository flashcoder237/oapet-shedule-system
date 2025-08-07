'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedScheduleManager } from '@/components/scheduling/EnhancedScheduleManager';
import { ScheduleQuickActions } from '@/components/scheduling/ScheduleQuickActions';
import { useEnhancedSchedules } from '@/hooks/useEnhancedSchedules';
import { 
  Calendar,
  Clock,
  Users,
  Building,
  AlertTriangle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export default function CompleteSchedulesPage() {
  const {
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    duplicateSession,
    bulkActions,
    exportData,
    importData,
    resolveConflict,
    sendNotification,
    loadSessions
  } = useEnhancedSchedules();

  // Calculer les statistiques
  const scheduleStats = {
    totalSessions: sessions.length,
    conflictsCount: sessions.reduce((count, session) => count + session.conflicts.length, 0),
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
    teachersCount: new Set(sessions.map(s => s.course.teacher.id)).size,
    roomsOccupancy: Math.round((sessions.length / 100) * 100) // Calcul approximatif
  };

  const handleQuickAction = async (action: string, params?: any) => {
    console.log('Quick action:', action, params);
    
    switch (action) {
      case 'create-session':
        const newSession = {
          course: {
            id: '1',
            name: 'Nouveau Cours',
            code: 'NEW-001',
            type: 'CM' as const,
            teacher: {
              id: '1',
              name: 'Dr. Nouveau',
              email: 'nouveau@oapet.edu.cm'
            },
            curriculum: {
              id: '1',
              name: 'Nouveau Curriculum',
              level: 'L1'
            }
          },
          room: {
            id: '1',
            code: 'SALLE-NEW',
            name: 'Nouvelle Salle',
            capacity: 50,
            building: 'Nouveau Bâtiment'
          },
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '10:00',
          expectedStudents: 30,
          status: 'scheduled' as const,
          conflicts: [],
          isLocked: false,
          priority: 'medium' as const
        };
        await createSession(newSession);
        break;
        
      case 'detect-conflicts':
        // Simulation de détection de conflits
        await new Promise(resolve => setTimeout(resolve, 1500));
        break;
        
      case 'optimize-schedule':
        // Simulation d'optimisation
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
        
      case 'export-pdf':
        await exportData('pdf', {});
        break;
        
      case 'duplicate-week':
        // Simulation de duplication de semaine
        const weekSessions = sessions.filter(s => {
          const sessionDate = new Date(s.date);
          const today = new Date();
          const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
          const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
          return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
        });
        
        for (const session of weekSessions) {
          await duplicateSession(session.id);
        }
        break;
        
      case 'sync-calendar':
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
        
      case 'send-notifications':
        await new Promise(resolve => setTimeout(resolve, 800));
        break;
        
      default:
        await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des emplois du temps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={() => loadSessions()} 
                  variant="outline" 
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Emplois du Temps OAPET - Faculté de Médecine
              </h1>
              <p className="text-gray-600 mt-2">
                Gestion complète des emplois du temps avec vue calendrier avancée et actions groupées
              </p>
            </div>
            
            <Button onClick={() => loadSessions()} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {scheduleStats.totalSessions} Sessions
            </Badge>
            <Badge variant={scheduleStats.conflictsCount > 0 ? "destructive" : "secondary"} className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {scheduleStats.conflictsCount} Conflits
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Users className="h-4 w-4" />
              {scheduleStats.teachersCount} Enseignants
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Building className="h-4 w-4" />
              {scheduleStats.roomsOccupancy}% Occupation
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {scheduleStats.upcomingSessions} À venir
            </Badge>
          </div>
        </div>

        {/* Actions rapides si nous avons des sessions */}
        {sessions.length > 0 && (
          <ScheduleQuickActions 
            scheduleStats={scheduleStats}
            onQuickAction={handleQuickAction}
          />
        )}

        {/* Gestionnaire principal */}
        <EnhancedScheduleManager
          sessions={sessions}
          onSessionCreate={createSession}
          onSessionUpdate={updateSession}
          onSessionDelete={deleteSession}
          onSessionDuplicate={duplicateSession}
          onBulkActions={bulkActions}
          onExport={exportData}
          onImport={importData}
          onConflictResolve={resolveConflict}
          onNotificationSend={sendNotification}
        />

        {/* Message si aucune session */}
        {sessions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2 text-gray-600">Aucun emploi du temps trouvé</h3>
                <p className="text-gray-500 mb-6">
                  Commencez par créer votre premier emploi du temps ou vérifiez que le backend est en marche.
                </p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => createSession({})}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Créer une session
                  </Button>
                  <Button 
                    onClick={() => loadSessions()}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Recharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}