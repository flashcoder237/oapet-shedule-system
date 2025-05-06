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
    { id: 1, day: 'Lundi', startTime: '08:00', endTime: '10:00', course: 'Anatomie', professor: 'Dr. Kamga', room: 'A101', class: 'L2 Médecine', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 2, day: 'Lundi', startTime: '14:00', endTime: '16:00', course: 'Biochimie', professor: 'Dr. Mbarga', room: 'B202', class: 'L1 Médecine', color: 'bg-green-100 border-green-300 text-green-800' },
    { id: 3, day: 'Mardi', startTime: '10:00', endTime: '12:00', course: 'Physiologie', professor: 'Dr. Nkeng', room: 'A101', class: 'L3 Médecine', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { id: 4, day: 'Mercredi', startTime: '08:00', endTime: '10:00', course: 'Pharmacologie', professor: 'Dr. Ebongue', room: 'C305', class: 'L4 Médecine', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { id: 5, day: 'Jeudi', startTime: '16:00', endTime: '18:00', course: 'Pathologie', professor: 'Dr. Simo', room: 'B202', class: 'L3 Médecine', color: 'bg-red-100 border-red-300 text-red-800' },
    { id: 6, day: 'Vendredi', startTime: '12:00', endTime: '14:00', course: 'Immunologie', professor: 'Dr. Edimo', room: 'A101', class: 'L2 Médecine', color: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
  ];
  
  // Fonction pour obtenir les cours pour un jour et une heure spécifiques
  const getScheduleForTimeSlot = (day, time) => {
    return scheduleData.filter(schedule => 
      schedule.day === day && schedule.startTime === time
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 px-2 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Horaire
            </th>
            {weekDays.map(day => (
              <th key={day} className="px-3 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {timeSlots.map(time => (
            <tr key={time}>
              <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                {time}
              </td>
              {weekDays.map(day => {
                const schedules = getScheduleForTimeSlot(day, time);
                
                return (
                  <td key={`${day}-${time}`} className="px-2 py-2 border-r border-gray-100">
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
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
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

// src/components/dashboard/RoomOccupancyChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function RoomOccupancyChart() {
  const chartRef = useRef(null);
  
  // Données d'exemple pour l'occupation des salles
  const data = [
    { room: 'A101', occupancyRate: 85 },
    { room: 'A102', occupancyRate: 65 },
    { room: 'B201', occupancyRate: 90 },
    { room: 'B202', occupancyRate: 70 },
    { room: 'C301', occupancyRate: 40 },
    { room: 'C302', occupancyRate: 55 },
    { room: 'Amphi A', occupancyRate: 95 },
    { room: 'Amphi B', occupancyRate: 80 }
  ];
  
  useEffect(() => {
    if (chartRef.current) {
      // Supprimer tout graphique précédent
      d3.select(chartRef.current).selectAll('*').remove();
      
      // Définir les dimensions et marges du graphique
      const margin = {top: 20, right: 30, bottom: 40, left: 60};
      const width = chartRef.current.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      // Créer l'élément SVG
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Échelle X
      const x = d3.scaleBand()
        .domain(data.map(d => d.room))
        .range([0, width])
        .padding(0.3);
      
      // Échelle Y
      const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
      
      // Fonction pour déterminer la couleur en fonction du taux d'occupation
      const getColor = (rate) => {
        if (rate < 50) return '#10B981'; // Vert
        if (rate < 80) return '#FBBF24'; // Jaune
        return '#EF4444'; // Rouge
      };
      
      // Ajouter les barres
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.room))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.occupancyRate))
        .attr('height', d => height - y(d.occupancyRate))
        .attr('fill', d => getColor(d.occupancyRate))
        .attr('rx', 4);
      
      // Ajouter l'axe X
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .style('font-size', '12px');
      
      // Ajouter l'axe Y
      svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
        .style('font-size', '12px');
      
      // Ajouter les valeurs au-dessus des barres
      svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.room) + x.bandwidth() / 2)
        .attr('y', d => y(d.occupancyRate) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.occupancyRate + '%')
        .style('font-size', '11px')
        .style('font-weight', 'bold');
    }
  }, []);
  
  return (
    <div className="h-[300px]" ref={chartRef}></div>
  );
}

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