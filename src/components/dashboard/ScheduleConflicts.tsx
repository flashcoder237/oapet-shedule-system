// src/components/dashboard/ScheduleConflicts.tsx
'use client';

import { AlertTriangle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScheduleConflicts() {
  // Exemple de données de conflits d'horaires
  const conflicts = [
    {
      id: 1,
      type: 'room',
      courses: ['Anatomie', 'Physiologie'],
      details: 'Salle A101, Lundi 10:00-12:00',
      icon: MapPin,
      iconColor: 'text-red-500'
    },
    {
      id: 2,
      type: 'professor',
      courses: ['Biochimie', 'Biologie cellulaire'],
      details: 'Dr. Kamga, Mardi 14:00-16:00',
      icon: User,
      iconColor: 'text-orange-500'
    },
    {
      id: 3,
      type: 'time',
      courses: ['Immunologie', 'TP Microbiologie'],
      details: 'L2 Médecine, Jeudi 08:00-10:00',
      icon: Clock,
      iconColor: 'text-amber-500'
    }
  ];
  
  return (
    <div className="space-y-4">
      {conflicts.map(conflict => (
        <div key={conflict.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-700">
                Conflit de {conflict.type === 'room' ? 'salle' : conflict.type === 'professor' ? 'professeur' : 'horaire'}
              </h4>
              <p className="text-sm text-red-600 mt-1">
                <span className="font-semibold">{conflict.courses[0]}</span> et <span className="font-semibold">{conflict.courses[1]}</span>
              </p>
              <div className="flex items-center text-xs text-red-500 mt-2">
                <conflict.icon className="h-3.5 w-3.5 mr-1" />
                <span>{conflict.details}</span>
              </div>
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" className="text-xs border-red-300 text-red-700 hover:bg-red-100">
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