'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Users, Monitor, Calendar, Building, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, CardSkeleton, LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { roomService } from '@/lib/api/services/rooms';
import type { Room, RoomStats } from '@/types/api';
import RoomOccupancyStats from '@/components/rooms/RoomOccupancyStats';

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [buildings, setBuildings] = useState<string[]>(['all']);
  const [error, setError] = useState<string | null>(null);
  
  const { addToast } = useToast();

  // Animations Framer Motion (simplifiées pour éviter les erreurs)
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Salles</h1>
          <p className="text-secondary mt-1">Gérez les salles de cours et leurs disponibilités</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle salle
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Salles totales"
          value={stats?.total_rooms?.toString() || "0"}
          change="+2 ce mois"
          trend="up"
          icon={<Building className="h-6 w-6" />}
        />
        <StatCard
          title="Disponibles"
          value={stats?.available_rooms?.toString() || "0"}
          change={`${stats ? Math.round((stats.available_rooms / stats.total_rooms) * 100) : 0}% libres`}
          trend="neutral"
          icon={<Monitor className="h-6 w-6" />}
        />
        <StatCard
          title="Occupées"
          value={stats?.occupied_rooms?.toString() || "0"}
          change={`${stats ? Math.round((stats.occupied_rooms / stats.total_rooms) * 100) : 0}% occupées`}
          trend="neutral"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Maintenance"
          value={stats?.maintenance_rooms?.toString() || "0"}
          change="En cours"
          trend="down"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-secondary" />
              <input
                type="text"
                placeholder="Rechercher une salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tous les bâtiments</option>
              <option value="A">Bâtiment A</option>
              <option value="B">Bâtiment B</option>
              <option value="C">Bâtiment C</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des salles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Skeleton loading
          Array(6).fill(0).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-sm text-secondary">{room.code}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-secondary mr-2" />
                    <span>Étage {room.floor}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-secondary mr-2" />
                    <span>{room.capacity} places</span>
                  </div>
                  {room.has_projector && (
                    <div className="flex items-center text-sm">
                      <Monitor className="h-4 w-4 text-secondary mr-2" />
                      <span>Projecteur</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    Planning
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Monitor className="mr-1 h-3 w-3" />
                    État
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Composant statistiques d'occupation */}
      <RoomOccupancyStats />
    </div>
  );
}