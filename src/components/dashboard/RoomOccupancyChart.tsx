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

