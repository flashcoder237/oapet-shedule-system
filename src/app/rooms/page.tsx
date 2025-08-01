// src/app/rooms/page.tsx
import Link from 'next/link';
import { 
  Building, 
  MapPin, 
  Users, 
  Plus, 
  Filter, 
  Search,
  ArrowUpDown
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoomOccupancyStats from '@/components/rooms/RoomOccupancyStats';
import RoomFilters from '@/components/rooms/RoomFilters';
import RoomsList from '@/components/rooms/RoomsList';

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des salles</h2>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle salle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total des salles</p>
              <h3 className="text-2xl font-bold">30</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salles disponibles</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Capacité moyenne</p>
              <h3 className="text-2xl font-bold">75 places</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Room Occupancy Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Taux d'occupation par bâtiment</h3>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
        </div>
        <RoomOccupancyStats />
      </Card>

      {/* Room Filters and List */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Liste des salles</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher une salle" 
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Trier
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <RoomFilters />
            </div>
            <div className="lg:col-span-3">
              <RoomsList />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}