'use client';

import React from 'react';
import { EnhancedScheduleManager } from '@/components/scheduling/EnhancedScheduleManager';
import { useEnhancedSchedules } from '@/hooks/useEnhancedSchedules';

export default function EnhancedSchedulesPage() {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Avancée des Emplois du Temps</h1>
          <p className="text-gray-600 mt-2">
            Interface complète pour gérer, organiser et optimiser les emplois du temps de la faculté de médecine.
          </p>
        </div>

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
      </div>
    </div>
  );
}