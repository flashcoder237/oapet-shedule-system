// src/components/rooms/RoomOccupancyStats.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function RoomOccupancyStats() {
  const chartRef = useRef(null);
  
  // Données d'exemple pour l'occupation des bâtiments
  const data = [
    { building: 'Bâtiment A', rooms: 10, occupiedRooms: 8, occupancyRate: 80 },
    { building: 'Bâtiment B', rooms: 8, occupiedRooms: 6, occupancyRate: 75 },
    { building: 'Bâtiment C', rooms: 6, occupiedRooms: 3, occupancyRate: 50 },
    { building: 'Amphi', rooms: 2, occupiedRooms: 2, occupancyRate: 100 },
    { building: 'Laboratoire', rooms: 4, occupiedRooms: 3, occupancyRate: 75 }
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
        .domain(data.map(d => d.building))
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
        .attr('x', d => x(d.building))
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
        .attr('x', d => x(d.building) + x.bandwidth() / 2)
        .attr('y', d => y(d.occupancyRate) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.occupancyRate + '%')
        .style('font-size', '11px')
        .style('font-weight', 'bold');
      
      // Ajouter des infos supplémentaires en bas de chaque barre
      svg.selectAll('.room-info')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'room-info')
        .attr('x', d => x(d.building) + x.bandwidth() / 2)
        .attr('y', height + 25)
        .attr('text-anchor', 'middle')
        .text(d => `${d.occupiedRooms}/${d.rooms}`)
        .style('font-size', '10px');
    }
  }, []);
  
  return (
    <div className="h-[300px]" ref={chartRef}></div>
  );
}

// src/components/rooms/RoomFilters.tsx
'use client';

import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoomFilters() {
  const [expanded, setExpanded] = useState(true);
  const [filters, setFilters] = useState({
    building: [],
    capacity: '',
    features: []
  });
  
  // Buildings options
  const buildings = ['Bâtiment A', 'Bâtiment B', 'Bâtiment C', 'Amphi', 'Laboratoire'];
  
  // Features options
  const features = ['Projecteur', 'Tableau interactif', 'Ordinateurs', 'Wifi', 'Climatisation', 'Laboratoire'];
  
  // Handle filter change
  const handleBuildingChange = (building) => {
    if (filters.building.includes(building)) {
      setFilters({...filters, building: filters.building.filter(b => b !== building)});
    } else {
      setFilters({...filters, building: [...filters.building, building]});
    }
  };
  
  const handleFeatureChange = (feature) => {
    if (filters.features.includes(feature)) {
      setFilters({...filters, features: filters.features.filter(f => f !== feature)});
    } else {
      setFilters({...filters, features: [...filters.features, feature]});
    }
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </h4>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="space-y-4">
          {/* Building Filter */}
          <div>
            <h5 className="text-sm font-medium mb-2">Bâtiment</h5>
            <div className="space-y-1">
              {buildings.map(building => (
                <div key={building} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`building-${building}`}
                    checked={filters.building.includes(building)}
                    onChange={() => handleBuildingChange(building)}
                    className="mr-2"
                  />
                  <label htmlFor={`building-${building}`} className="text-sm">{building}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Capacity Filter */}
          <div>
            <h5 className="text-sm font-medium mb-2">Capacité</h5>
            <select
              value={filters.capacity}
              onChange={(e) => setFilters({...filters, capacity: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Toutes les capacités</option>
              <option value="0-30">Petite (0-30 places)</option>
              <option value="31-60">Moyenne (31-60 places)</option>
              <option value="61-100">Grande (61-100 places)</option>
              <option value="101+">Très grande (101+ places)</option>
            </select>
          </div>
          
          {/* Features Filter */}
          <div>
            <h5 className="text-sm font-medium mb-2">Équipements</h5>
            <div className="space-y-1">
              {features.map(feature => (
                <div key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`feature-${feature}`}
                    checked={filters.features.includes(feature)}
                    onChange={() => handleFeatureChange(feature)}
                    className="mr-2"
                  />
                  <label htmlFor={`feature-${feature}`} className="text-sm">{feature}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 flex space-x-2">
            <Button variant="outline" size="sm" className="w-1/2">
              Réinitialiser
            </Button>
            <Button size="sm" className="w-1/2">
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// src/components/rooms/RoomsList.tsx
'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Users, 
  Monitor, 
  Wifi, 
  ThermometerSnowflake, 
  Edit, 
  Trash2,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RoomsList() {
  // Exemple de données de salles
  const roomsData = [
    {
      id: '1',
      name: 'A101',
      building: 'Bâtiment A',
      capacity: 40,
      features: ['Projecteur', 'Tableau interactif', 'Wifi'],
      occupancyRate: 80,
      availability: 'Disponible dans 2h'
    },
    {
      id: '2',
      name: 'B202',
      building: 'Bâtiment B',
      capacity: 60,
      features: ['Projecteur', 'Wifi', 'Climatisation'],
      occupancyRate: 70,
      availability: 'Occupée'
    },
    {
      id: '3',
      name: 'Amphi A',
      building: 'Amphi',
      capacity: 200,
      features: ['Projecteur', 'Sono', 'Wifi', 'Climatisation'],
      occupancyRate: 95,
      availability: 'Disponible demain'
    },
    {
      id: '4',
      name: 'C305',
      building: 'Bâtiment C',
      capacity: 30,
      features: ['Ordinateurs', 'Wifi'],
      occupancyRate: 40,
      availability: 'Disponible'
    },
    {
      id: '5',
      name: 'Labo Chimie',
      building: 'Laboratoire',
      capacity: 25,
      features: ['Équipement scientifique', 'Lavabos'],
      occupancyRate: 60,
      availability: 'Disponible'
    }
  ];

  // Function to get feature icon
  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'Projecteur':
        return <Monitor className="h-4 w-4" />;
      case 'Wifi':
        return <Wifi className="h-4 w-4" />;
      case 'Climatisation':
        return <ThermometerSnowflake className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {roomsData.map(room => (
        <div key={room.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg 
                ${room.occupancyRate > 80 ? 'bg-red-100' : 
                  room.occupancyRate > 50 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <MapPin className={`h-6 w-6 
                  ${room.occupancyRate > 80 ? 'text-red-600' : 
                    room.occupancyRate > 50 ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className="font-medium text-lg">{room.name}</h3>
                <p className="text-sm text-gray-500">{room.building}</p>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm">{room.capacity} places</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {room.features.slice(0, 3).map(feature => (
                    <span key={feature} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs">
                      {getFeatureIcon(feature)}
                      <span className="ml-1">{feature}</span>
                    </span>
                  ))}
                  {room.features.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs">
                      +{room.features.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-medium 
                ${room.availability === 'Disponible' ? 'text-green-600' : 
                  room.availability === 'Occupée' ? 'text-red-600' : 'text-amber-600'}`}>
                {room.availability}
              </span>
              <div className="mt-2 flex space-x-2">
                <Link href={`/rooms/${room.id}/schedule`}>
                  <Button variant="outline" size="sm" className="p-1">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/rooms/${room.id}/edit`}>
                  <Button variant="outline" size="sm" className="p-1">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="p-1 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className={`h-2 rounded-full 
                  ${room.occupancyRate > 80 ? 'bg-red-500' : 
                    room.occupancyRate > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                style={{ width: `${room.occupancyRate}%` }}
              />
            </div>
            <span className="ml-2 text-xs font-medium">{room.occupancyRate}%</span>
          </div>
          <div className="mt-3 flex justify-end">
            <Link href={`/rooms/${room.id}`}>
              <Button variant="ghost" size="sm" className="text-primary flex items-center">
                Détails
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
      <div className="mt-4 flex justify-center">
        <Button variant="outline">Charger plus</Button>
      </div>
    </div>
  );
}