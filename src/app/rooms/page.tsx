'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const { toast } = useToast();

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Charger les salles et statistiques en parallèle
        const [roomsData, statsData] = await Promise.all([
          roomService.getRooms(),
          roomService.getRoomsStats()
        ]);
        
        setRooms(roomsData);
        setStats(statsData);
        
        // Extraire les bâtiments uniques
        const uniqueBuildings = ['all', ...new Set(roomsData.map(room => room.building))];
        setBuildings(uniqueBuildings);
        
      } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
        setError('Erreur lors du chargement des données');
        toast({
          title: "Erreur",
          description: "Impossible de charger les salles. Vérifiez votre connexion.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Recherche avec délai
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const searchTimer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(searchTimer);
    }
  }, [searchTerm]);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || room.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Occupée';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <PageLoading 
        message="Chargement des salles..." 
        variant="detailed"
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* En-tête */}
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Salles</h1>
          <p className="text-secondary mt-1">Gérez les salles de cours et leurs disponibilités</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une salle
        </Button>
      </motion.div>

      {/* Statistiques */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard
          title="Total des salles"
          value={stats?.total_rooms?.toString() || rooms.length.toString()}
          change={`${buildings.length - 1} bâtiments`}
          trend="up"
          icon={<MapPin className="h-6 w-6" />}
        />
        
        <StatCard
          title="Disponibles"
          value={rooms.filter(r => r.status === 'available').length.toString()}
          change={`${Math.round((rooms.filter(r => r.status === 'available').length / rooms.length) * 100)}% du total`}
          trend="up"
          icon={<MapPin className="h-6 w-6" />}
        />
        
        <StatCard
          title="Occupées"
          value={rooms.filter(r => r.status === 'occupied').length.toString()}
          change="Actuellement en cours"
          trend="neutral"
          icon={<Users className="h-6 w-6" />}
        />

        <StatCard
          title="Maintenance"
          value={rooms.filter(r => r.status === 'maintenance').length.toString()}
          change="Hors service"
          trend="down"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </motion.div>

      {/* Statistiques d'occupation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Taux d'occupation par salle</h3>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
        </div>
        <RoomOccupancyStats />
      </Card>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tous les bâtiments</option>
            {buildings.slice(1).map(building => (
              <option key={building} value={building}>{building}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Liste des salles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <Card key={room.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {room.building}
                </p>
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

            {/* Statut */}
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border mb-3 ${getStatusColor(room.status)}`}>
              {getStatusText(room.status)}
            </div>

            {/* Capacité */}
            <div className="flex items-center mb-3">
              <Users className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">Capacité: {room.capacity} personnes</span>
            </div>

            {/* Taux d'occupation */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Taux d'occupation</span>
                <span className="font-medium">{room.occupancyRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${room.occupancyRate > 80 ? 'bg-red-500' : room.occupancyRate > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${room.occupancyRate}%` }}
                ></div>
              </div>
            </div>

            {/* État actuel */}
            <div className="mb-4">
              {room.status === 'occupied' && room.currentCourse && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">En cours:</p>
                  <p className="text-sm text-red-600">{room.currentCourse}</p>
                </div>
              )}
              {room.status === 'available' && room.nextBooking && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Prochaine réservation:</p>
                  <p className="text-sm text-green-600">{room.nextBooking}</p>
                </div>
              )}
              {room.status === 'maintenance' && room.maintenanceReason && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium">Maintenance:</p>
                  <p className="text-sm text-yellow-600">{room.maintenanceReason}</p>
                </div>
              )}
            </div>

            {/* Équipements */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Équipements:</p>
              <div className="flex flex-wrap gap-1">
                {room.features.map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="mr-1 h-3 w-3" />
                Planning
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Monitor className="mr-1 h-3 w-3" />
                Détails
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une nouvelle salle</h2>
            <p className="text-gray-600 mb-4">Formulaire d'ajout de salle à implémenter</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button className="bg-green-700 hover:bg-green-700-dark">
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}