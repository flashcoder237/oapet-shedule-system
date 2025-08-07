'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedScheduleManager } from '@/components/scheduling/EnhancedScheduleManager';
import { ScheduleQuickActions } from '@/components/scheduling/ScheduleQuickActions';
import { useEnhancedSchedules } from '@/hooks/useEnhancedSchedules';
import { 
  Calendar,
  BarChart3,
  Settings,
  Users,
  Building,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ComprehensiveSchedulesPage() {
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
    sendNotification
  } = useEnhancedSchedules();

  const [activeTab, setActiveTab] = useState('overview');

  // Calculer les statistiques
  const scheduleStats = {
    totalSessions: sessions.length,
    conflictsCount: sessions.reduce((count, session) => count + session.conflicts.length, 0),
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
    teachersCount: new Set(sessions.map(s => s.course.teacher.id)).size,
    roomsOccupancy: 75 // Simulé
  };

  const handleQuickAction = async (action: string, params?: any) => {
    console.log('Quick action:', action, params);
    
    switch (action) {
      case 'create-session':
        await createSession({});
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
        // Logique de duplication de semaine
        await new Promise(resolve => setTimeout(resolve, 1000));
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
            <p className="text-gray-600">Chargement de la gestion complète...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Centre de Gestion des Emplois du Temps
          </h1>
          <p className="text-gray-600 mt-2">
            Interface complète pour gérer, analyser et optimiser tous les aspects des emplois du temps de la faculté de médecine OAPET.
          </p>
          
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
              <TrendingUp className="h-4 w-4" />
              {scheduleStats.roomsOccupancy}% Occupation
            </Badge>
          </div>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'Ensemble
            </TabsTrigger>
            <TabsTrigger value="management" className="gap-2">
              <Calendar className="h-4 w-4" />
              Gestion
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytique
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Vue d'Ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <ScheduleQuickActions 
              scheduleStats={scheduleStats}
              onQuickAction={handleQuickAction}
            />
          </TabsContent>

          {/* Gestion */}
          <TabsContent value="management" className="space-y-6">
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
          </TabsContent>

          {/* Analytique */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Utilisation des Salles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AMPHI-MED</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded">
                          <div className="w-20 h-2 bg-blue-500 rounded"></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AMPHI-A</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded">
                          <div className="w-16 h-2 bg-green-500 rounded"></div>
                        </div>
                        <span className="text-sm font-medium">67%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">LABO-ANAT</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded">
                          <div className="w-12 h-2 bg-orange-500 rounded"></div>
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Distribution Horaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">32h</div>
                      <p className="text-sm text-muted-foreground">Cours magistraux</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">18h</div>
                      <p className="text-sm text-muted-foreground">Travaux dirigés</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">24h</div>
                      <p className="text-sm text-muted-foreground">Travaux pratiques</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Charge Enseignants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Mballa</span>
                      <Badge variant="secondary">18h/sem</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Nguema</span>
                      <Badge variant="secondary">16h/sem</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pr. Fotso</span>
                      <Badge variant="secondary">20h/sem</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres Généraux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Durée par défaut des cours</label>
                    <select className="w-full p-2 border rounded">
                      <option>2 heures</option>
                      <option>1.5 heures</option>
                      <option>3 heures</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pause minimum entre cours</label>
                    <select className="w-full p-2 border rounded">
                      <option>30 minutes</option>
                      <option>15 minutes</option>
                      <option>45 minutes</option>
                    </select>
                  </div>
                  <Button className="w-full">Sauvegarder</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conflits détectés</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nouveaux cours</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modifications d'horaires</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <Button className="w-full">Sauvegarder</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}