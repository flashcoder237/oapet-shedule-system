// src/components/dashboard/ScheduleConflicts.tsx
'use client';

import { AlertTriangle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleConflictsProps {
  conflicts?: any[];
}

export default function ScheduleConflicts({ conflicts = [] }: ScheduleConflictsProps) {
  // Les conflits viennent maintenant des props
  
  if (conflicts.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Aucun conflit détecté</h3>
        <p className="text-muted-foreground">Tous les horaires semblent compatibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.map(conflict => (
        <div key={conflict.id} className="border border-destructive/20 rounded-lg p-3 bg-destructive/10">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-destructive/20 mr-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-destructive">
                Conflit de {conflict.type === 'room' ? 'salle' : conflict.type === 'professor' ? 'professeur' : 'horaire'}
              </h4>
              <p className="text-sm text-destructive mt-1">
                {conflict.description || 'Conflit détecté'}
              </p>
              <div className="flex items-center text-xs text-destructive/80 mt-2">
                {conflict.type === 'room' && <MapPin className="h-3.5 w-3.5 mr-1" />}
                {conflict.type === 'professor' && <User className="h-3.5 w-3.5 mr-1" />}
                {conflict.type === 'time' && <Clock className="h-3.5 w-3.5 mr-1" />}
                <span>{conflict.details || 'Détails non disponibles'}</span>
              </div>
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                  Résoudre
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}