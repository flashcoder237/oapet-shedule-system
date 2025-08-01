'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function RoomOccupancyStats() {
  const chartRef = useRef<HTMLDivElement>(null);
  
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
      const getColor = (rate: number) => {
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
        .attr('x', d => x(d.building) || 0)
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
        .attr('x', d => (x(d.building) || 0) + x.bandwidth() / 2)
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
        .attr('x', d => (x(d.building) || 0) + x.bandwidth() / 2)
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