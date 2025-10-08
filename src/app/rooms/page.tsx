'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Users, Monitor, Calendar, Building, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, CardSkeleton, LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { roomService } from '@/lib/api/services/rooms';
import { ImportExport } from '@/components/ui/ImportExport';
import type { Room, RoomStats } from '@/types/api';
import RoomOccupancyStats from '@/components/rooms/RoomOccupancyStats';
import RoomModal from '@/components/modals/RoomModal';

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [buildings, setBuildings] = useState<string[]>(['all']);
  const [error, setError] = useState<string | null>(null);
  
  const { addToast } = useToast();

  // Chargement des données
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [roomsData, statsData] = await Promise.all([
          roomService.getRooms({ search: searchTerm, building: selectedBuilding !== 'all' ? selectedBuilding : undefined }).catch(() => ({ results: [], count: 0 })),
          roomService.getRoomStats().catch(() => null)
        ]);
        
        setRooms(roomsData.results || []);
        setStats(statsData);
        
        // Extraire les bâtiments uniques
        const uniqueBuildings = ['all', ...new Set((roomsData.results || []).map(room => room.building?.toString()).filter(Boolean))];
        setBuildings(uniqueBuildings);
        
      } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [searchTerm, selectedBuilding]);

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (roomData: any) => {
    try {
      if (selectedRoom) {
        // Update existing room
        const updatedRoom = await roomService.updateRoom(selectedRoom.id!, roomData);
        setRooms(prev => prev.map(room => room.id === selectedRoom.id ? updatedRoom : room));
      } else {
        // Create new room
        const newRoom = await roomService.createRoom(roomData);
        setRooms(prev => [...prev, newRoom]);
      }
      setShowRoomModal(false);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    
    try {
      await roomService.deleteRoom(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomId));
      addToast({
        title: "Succès",
        description: "Salle supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de supprimer la salle",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || room.building?.toString() === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Salles</h1>
          <p className="text-secondary mt-1">Gérez les salles de cours et leurs disponibilités</p>
        </div>

        <div className="flex gap-3">
          <ImportExport
            exportEndpoint="/rooms/rooms/export/"
            importEndpoint="/rooms/rooms/import_data/"
            resourceName="rooms"
            onImportSuccess={() => window.location.reload()}
            size="sm"
            variant="outline"
          />
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          <Button onClick={handleAddRoom}>
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
              {buildings.map(building => (
                <option key={building} value={building}>
                  {building === 'all' ? 'Tous les bâtiments' : `Bâtiment ${building}`}
                </option>
              ))}
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
          filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-sm text-secondary">{room.code}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditRoom(room)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteRoom(room.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-secondary mr-2" />
                    <span>Bâtiment {room.building} - Étage {room.floor}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-secondary mr-2" />
                    <span>{room.capacity} places</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.has_projector && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Projecteur
                      </span>
                    )}
                    {room.has_computer && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Ordinateur
                      </span>
                    )}
                    {room.has_audio_system && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Audio
                      </span>
                    )}
                    {room.has_whiteboard && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Tableau
                      </span>
                    )}
                  </div>
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

      {/* Room Modal */}
      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        room={selectedRoom}
        onSave={handleSaveRoom}
      />

      {/* Empty state */}
      {!isLoading && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucune salle trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedBuilding !== 'all' 
              ? 'Aucune salle ne correspond à vos critères de recherche.' 
              : 'Aucune salle n\'est encore enregistrée.'}
          </p>
          <Button onClick={handleAddRoom}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une salle
          </Button>
        </div>
      )}

      {/* Composant statistiques d'occupation */}
      <RoomOccupancyStats />
    </div>
  );
}