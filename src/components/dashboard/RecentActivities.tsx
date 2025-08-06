// src/components/dashboard/RecentActivities.tsx
'use client';

import { Calendar, Clock, Edit, MapPin, Plus, X } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  action: string;
  details: string;
  time: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

export default function RecentActivities({ activities = [] }: RecentActivitiesProps) {
  // Les données viennent maintenant des props ou de l'API
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Aucune activité récente</h3>
        <p className="text-muted-foreground">Les activités récentes apparaîtront ici.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${activity.iconBg} ${activity.iconColor} mt-1`}>
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.details}</p>
            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}