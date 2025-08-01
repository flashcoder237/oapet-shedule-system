// src/components/dashboard/RecentActivities.tsx
'use client';

import { Calendar, Clock, Edit, MapPin, Plus, X } from 'lucide-react';

export default function RecentActivities() {
  // Exemple de données d'activités récentes
  const activities = [
    {
      id: 1,
      type: 'added',
      action: 'Cours ajouté',
      details: 'Neurologie - Dr. Talla',
      time: 'Il y a 10 minutes',
      icon: Plus,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 2,
      type: 'modified',
      action: 'Salle modifiée',
      details: 'Anatomie - A101 → B202',
      time: 'Il y a 45 minutes',
      icon: Edit,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      type: 'cancelled',
      action: 'Cours annulé',
      details: 'Biochimie - Dr. Mbarga',
      time: 'Il y a 2 heures',
      icon: X,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      id: 4,
      type: 'modified',
      action: 'Horaire modifié',
      details: 'Physiologie - 10:00 → 14:00',
      time: 'Il y a 3 heures',
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 5,
      type: 'added',
      action: 'Emploi du temps publié',
      details: 'L2 Médecine - Semaine 10',
      time: 'Il y a 1 jour',
      icon: Calendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];
  
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${activity.iconBg} ${activity.iconColor} mt-1`}>
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-gray-600">{activity.details}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
      <div className="pt-2 text-center">
        <button className="text-sm text-primary hover:underline">
          Voir plus d'activités
        </button>
      </div>
    </div>
  );
}

