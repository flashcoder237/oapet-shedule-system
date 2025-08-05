// src/components/scheduling/SimpleDragDropScheduler.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface SimpleDragDropSchedulerProps {
  onConflictDetected?: (conflicts: string[]) => void;
  readOnly?: boolean;
  showConflicts?: boolean;
  enableAutoScheduling?: boolean;
  view?: 'day' | 'week' | 'month';
}

export default function SimpleDragDropScheduler({
  onConflictDetected,
  readOnly = false,
  showConflicts = true,
  enableAutoScheduling = true,
  view = 'week'
}: SimpleDragDropSchedulerProps) {
  
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => 7 + i);

  return (
    <div className="h-full">
      <div className="grid grid-cols-7 gap-1 h-full">
        {/* En-tête vide pour la colonne des heures */}
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="text-sm font-medium text-gray-600">Horaire</div>
        </div>
        
        {/* En-têtes des jours */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="p-2 border-b border-gray-200 bg-gray-50 text-center">
            <div className="text-sm font-medium text-gray-900">{day}</div>
          </div>
        ))}
        
        {/* Grille horaire */}
        {timeSlots.map((hour, slotIndex) => (
          <React.Fragment key={slotIndex}>
            {/* Colonne des heures */}
            <div className="p-2 text-xs text-gray-500 border-r border-gray-200 bg-gray-50 text-right">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Colonnes des jours */}
            {weekDays.map((day, dayIndex) => (
              <div
                key={`${dayIndex}-${slotIndex}`}
                className="min-h-[60px] border border-gray-100 p-1 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {/* Contenu vide pour l'instant */}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Message temporaire */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          Planificateur simplifié - Fonctionnalité de drag & drop temporairement désactivée
        </p>
      </div>
    </div>
  );
}