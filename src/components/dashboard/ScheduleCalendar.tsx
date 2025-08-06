// src/components/dashboard/ScheduleCalendar.tsx
'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function ScheduleCalendar() {
  // Jours de la semaine
  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  
  // Heures de cours
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  
  // Exemple de données d'emploi du temps
  const scheduleData = [
    { id: 1, day: 'Lundi', startTime: '08:00', endTime: '10:00', course: 'Anatomie', professor: 'Dr. Kamga', room: 'A101', class: 'L2 Médecine', color: 'bg-green-100 border-green-300 text-green-800' },
    { id: 2, day: 'Lundi', startTime: '14:00', endTime: '16:00', course: 'Biochimie', professor: 'Dr. Mbarga', room: 'B202', class: 'L1 Médecine', color: 'bg-green-100 border-green-300 text-green-800' },
    { id: 3, day: 'Mardi', startTime: '10:00', endTime: '12:00', course: 'Physiologie', professor: 'Dr. Nkeng', room: 'A101', class: 'L3 Médecine', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { id: 4, day: 'Mercredi', startTime: '08:00', endTime: '10:00', course: 'Pharmacologie', professor: 'Dr. Ebongue', room: 'C305', class: 'L4 Médecine', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { id: 5, day: 'Jeudi', startTime: '16:00', endTime: '18:00', course: 'Pathologie', professor: 'Dr. Simo', room: 'B202', class: 'L3 Médecine', color: 'bg-red-100 border-red-300 text-red-800' },
    { id: 6, day: 'Vendredi', startTime: '12:00', endTime: '14:00', course: 'Immunologie', professor: 'Dr. Edimo', room: 'A101', class: 'L2 Médecine', color: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
  ];
  
  // Fonction pour obtenir les cours pour un jour et une heure spécifiques
  const getScheduleForTimeSlot = (day: string, time: string) => {
    return scheduleData.filter(schedule => 
      schedule.day === day && schedule.startTime === time
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 px-2 py-3 border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Horaire
            </th>
            {weekDays.map(day => (
              <th key={day} className="px-3 py-3 border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {timeSlots.map(time => (
            <tr key={time}>
              <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-foreground border-r border-border">
                {time}
              </td>
              {weekDays.map(day => {
                const schedules = getScheduleForTimeSlot(day, time);
                
                return (
                  <td key={`${day}-${time}`} className="px-2 py-2 border-r border-border">
                    {schedules.length > 0 ? (
                      <div className={`p-2 rounded border ${schedules[0].color}`}>
                        <p className="font-medium text-sm">{schedules[0].course}</p>
                        <div className="flex items-center text-xs mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{schedules[0].class}</span>
                        </div>
                        <div className="flex items-center text-xs mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{schedules[0].room}</span>
                        </div>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

