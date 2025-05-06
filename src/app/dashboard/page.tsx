// src/app/dashboard/page.tsx
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Activity,
  BarChart3
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ScheduleCalendar from '@/components/dashboard/ScheduleCalendar';
import RecentActivities from '@/components/dashboard/RecentActivities';
import RoomOccupancyChart from '@/components/dashboard/RoomOccupancyChart';
import ScheduleConflicts from '@/components/dashboard/ScheduleConflicts';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
        <div className="flex space-x-2">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Aujourd'hui
          </Button>
          <Button variant="outline">Cette semaine</Button>
          <Button variant="outline">Ce mois</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cours programmés</p>
              <h3 className="text-2xl font-bold">152</h3>
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
              <h3 className="text-2xl font-bold">24/30</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Professeurs actifs</p>
              <h3 className="text-2xl font-bold">45</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Conflits d'horaires</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Emploi du temps</h3>
            <Link href="/schedule" className="text-sm text-blue-600 hover:underline flex items-center">
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <ScheduleCalendar />
        </Card>
        
        {/* Recent Activities */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Activités récentes</h3>
            <Button variant="ghost" size="sm">
              <Activity className="mr-1 h-4 w-4" />
              Actualiser
            </Button>
          </div>
          <RecentActivities />
        </Card>
      </div>

      {/* Charts and Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Chart */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Occupation des salles</h3>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-1 h-4 w-4" />
              Filtrer
            </Button>
          </div>
          <RoomOccupancyChart />
        </Card>
        
        {/* Schedule Conflicts */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Conflits d'horaires</h3>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Résoudre
            </Button>
          </div>
          <ScheduleConflicts />
        </Card>
      </div>
    </div>
  );
}