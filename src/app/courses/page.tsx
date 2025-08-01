'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, BookOpen, User, Clock, Users, Calendar, Building } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Example course data
  const courses = [
    {
      id: '1',
      name: 'Anatomie Generale',
      code: 'ANAT101',
      professor: 'Dr. Kamga',
      professorId: 'prof1',
      department: 'Medecine',
      departmentId: 'med',
      classes: ['L1 Medecine', 'L2 Medecine'],
      classIds: ['l1med', 'l2med'],
      durationHours: 60,
      studentsCount: 120,
      requiredFeatures: ['Projecteur', 'Tableau interactif'],
      preferredRooms: ['A101', 'Amphi A'],
      sessionsPerWeek: 2,
      status: 'active',
      nextSession: 'Lundi 08:00 - Salle A101'
    },
    {
      id: '2',
      name: 'Biochimie Metabolique',
      code: 'BIOC201',
      professor: 'Dr. Mbarga',
      professorId: 'prof2',
      department: 'Medecine',
      departmentId: 'med',
      classes: ['L2 Medecine'],
      classIds: ['l2med'],
      durationHours: 45,
      studentsCount: 80,
      requiredFeatures: ['Projecteur', 'Ordinateurs'],
      preferredRooms: ['B201', 'Labo Bio'],
      sessionsPerWeek: 3,
      status: 'active',
      nextSession: 'Mardi 10:00 - Salle B201'
    }
  ];

  const departments = ['all', 'Medecine', 'Pharmacie', 'Dentaire'];
  const levels = ['all', 'L1', 'L2', 'L3', 'L4', 'M1', 'M2'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.professor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchesLevel = selectedLevel === 'all' || course.classes.some(cls => cls.includes(selectedLevel));
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'suspended': return 'Suspendu';
      case 'completed': return 'Termine';
      default: return 'En attente';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Cours</h1>
          <p className="text-gray-600 mt-1">Gerez les cours, professeurs et planifications</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-700 hover:bg-green-700-dark">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un cours
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total des cours</p>
              <h3 className="text-2xl font-bold">152</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cours actifs</p>
              <h3 className="text-2xl font-bold">138</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Professeurs</p>
              <h3 className="text-2xl font-bold">45</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Heures/semaine</p>
              <h3 className="text-2xl font-bold">1,240h</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher un cours, code ou professeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tous les departements</option>
            {departments.slice(1).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map(course => (
          <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {course.code}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm">{course.professor}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="text-sm">{course.department}</span>
                </div>
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

            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border mb-3 ${getStatusColor(course.status)}`}>
              {getStatusText(course.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Duree totale</p>
                  <p className="text-sm font-medium">{course.durationHours}h</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Etudiants</p>
                  <p className="text-sm font-medium">{course.studentsCount}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="mr-1 h-3 w-3" />
                Planning
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="mr-1 h-3 w-3" />
                Etudiants
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter un nouveau cours</h2>
            <p className="text-gray-600 mb-4">Formulaire d'ajout de cours a implementer</p>
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