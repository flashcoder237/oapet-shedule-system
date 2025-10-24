'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, MapPin, Users, Monitor, Building, Zap, Wifi, Volume2, Presentation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';
import { roomService } from '@/lib/api/services/rooms';
import type { Room, RoomStats } from '@/types/api';
import RoomModal from '@/components/modals/RoomModal';

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [buildings, setBuildings] = useState<Array<{ id: string; name: string }>>([]);
  const [floors, setFloors] = useState<string[]>(['all']);

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { addToast } = useToast();

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [roomsData, statsData] = await Promise.all([
          roomService.getRooms({}),
          roomService.getRoomStats()
        ]);

        const roomsArray = roomsData.results || [];
        setRooms(roomsArray);
        setStats(statsData);

        // Extraire les bâtiments uniques
        const uniqueBuildings = new Set(roomsArray.map(r => r.building?.toString()).filter(Boolean));
        const buildingsList = [
          { id: 'all', name: 'Tous les bâtiments' },
          ...Array.from(uniqueBuildings).map(id => ({
            id,
            name: `Bâtiment ${id}`
          }))
        ];
        setBuildings(buildingsList);

        // Extraire les étages uniques
        const uniqueFloors = new Set(roomsArray.map(r => r.floor?.toString()).filter(Boolean));
        setFloors(['all', ...Array.from(uniqueFloors).sort()]);

      } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
        addToast({
          title: "Erreur",
          description: "Impossible de charger les salles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addToast]);

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
        const updatedRoom = await roomService.updateRoom(selectedRoom.id!, roomData);
        setRooms(prevRooms => prevRooms.map(room => room.id === selectedRoom.id ? updatedRoom : room));
      } else {
        const newRoom = await roomService.createRoom(roomData);
        setRooms(prevRooms => [...prevRooms, newRoom]);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

    try {
      await roomService.deleteRoom(roomId);
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));

      addToast({
        title: "Succès",
        description: "Salle supprimée avec succès",
      });
    } catch (error) {
      addToast({
        title: "Erreur",
        description: "Impossible de supprimer la salle",
        variant: "destructive",
      });
    }
  };

  // Filtrage des salles
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm ||
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding = selectedBuilding === 'all' ||
      String(room.building) === String(selectedBuilding);

    const matchesFloor = selectedFloor === 'all' ||
      String(room.floor) === String(selectedFloor);

    return matchesSearch && matchesBuilding && matchesFloor;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBuilding, selectedFloor]);

  if (isLoading) {
    return <PageLoading message="Chargement des salles..." />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Salles</h1>
          <p className="text-muted-foreground">
            Gérez les salles et leurs équipements
          </p>
        </div>
        <Button onClick={handleAddRoom} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle Salle
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Salles</p>
                  <p className="text-2xl font-bold">{stats.total_rooms || rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Monitor className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disponibles</p>
                  <p className="text-2xl font-bold">{stats.available_rooms || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_rooms > 0
                      ? `${Math.round((stats.available_rooms / stats.total_rooms) * 100)}% libres`
                      : '0% libres'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupées</p>
                  <p className="text-2xl font-bold">{stats.occupied_rooms || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_rooms > 0
                      ? `${Math.round((stats.occupied_rooms / stats.total_rooms) * 100)}% occupées`
                      : '0% occupées'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacité Totale</p>
                  <p className="text-2xl font-bold">{stats.total_capacity || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>

            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {floors.map(floor => (
                <option key={floor} value={floor}>
                  {floor === 'all' ? 'Tous les étages' : `Étage ${floor}`}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des salles */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Salles ({filteredRooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Code</th>
                  <th className="text-left p-4 font-semibold">Nom</th>
                  <th className="text-left p-4 font-semibold">Bâtiment</th>
                  <th className="text-left p-4 font-semibold">Étage</th>
                  <th className="text-left p-4 font-semibold">Capacité</th>
                  <th className="text-left p-4 font-semibold">Équipements</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRooms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      Aucune salle trouvée
                    </td>
                  </tr>
                ) : (
                  paginatedRooms.map((room, index) => (
                    <motion.tr
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold">
                          {room.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{room.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{room.building}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{room.floor}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">{room.capacity}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {room.has_projector && (
                            <Badge variant="outline" className="text-xs">
                              <Presentation className="w-3 h-3 mr-1" />
                              Projecteur
                            </Badge>
                          )}
                          {room.has_computer && (
                            <Badge variant="outline" className="text-xs">
                              <Monitor className="w-3 h-3 mr-1" />
                              PC
                            </Badge>
                          )}
                          {room.has_audio_system && (
                            <Badge variant="outline" className="text-xs">
                              <Volume2 className="w-3 h-3 mr-1" />
                              Audio
                            </Badge>
                          )}
                          {room.has_whiteboard && (
                            <Badge variant="outline" className="text-xs">
                              Tableau
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {room.is_active ? (
                          <Badge className="bg-green-500 text-white">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRoom(room.id!)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredRooms.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredRooms.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="salles"
        />
      )}

      {/* Modal de création/édition */}
      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        room={selectedRoom}
        onSave={handleSaveRoom}
      />
    </div>
  );
}
