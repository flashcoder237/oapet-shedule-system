'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Building, Users, BookOpen, User, Mail, Phone, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Données exemple des départements
  const departments = [
    {
      id: 'med',
      name: 'Médecine',
      fullName: 'Département de Médecine',
      headOfDepartment: 'Prof. Jean-Claude Mbanya',
      headId: 'prof1',
      headEmail: 'jc.mbanya@fmedudouala.cm',
      headPhone: '+237 6XX XX XX XX',
      professorsCount: 35,
      studentsCount: 450,
      coursesCount: 125,
      classesCount: 8,
      description: 'Formation médicale générale et spécialisée, recherche biomédicale',
      establishedYear: 1993,
      building: 'Bâtiment Principal A-C',
      budget: '2,500,000,000 FCFA',
      isActive: true
    },
    {
      id: 'phar',
      name: 'Pharmacie',
      fullName: 'Département de Pharmacie',
      headOfDepartment: 'Dr. Marie-Claire Okalla',
      headId: 'prof2',
      headEmail: 'mc.okalla@fmedudouala.cm',
      headPhone: '+237 6XX XX XX XX',
      professorsCount: 18,
      studentsCount: 200,
      coursesCount: 68,
      classesCount: 4,
      description: 'Formation pharmaceutique, recherche en sciences pharmaceutiques',
      establishedYear: 1998,
      building: 'Bâtiment D',
      budget: '1,200,000,000 FCFA',
      isActive: true
    },
    {
      id: 'dent',
      name: 'Dentaire',
      fullName: 'Département de Chirurgie Dentaire',
      headOfDepartment: 'Dr. Paul Ndom',
      headId: 'prof3',
      headEmail: 'p.ndom@fmedudouala.cm',
      headPhone: '+237 6XX XX XX XX',
      professorsCount: 12,
      studentsCount: 120,
      coursesCount: 45,
      classesCount: 3,
      description: 'Formation en chirurgie dentaire et soins bucco-dentaires',
      establishedYear: 2005,
      building: 'Bâtiment E',
      budget: '800,000,000 FCFA',
      isActive: true
    },
    {
      id: 'nur',
      name: 'Sciences Infirmières',
      fullName: 'Département des Sciences Infirmières',
      headOfDepartment: 'Dr. Françoise Mballa',
      headId: 'prof4',
      headEmail: 'f.mballa@fmedudouala.cm',
      headPhone: '+237 6XX XX XX XX',
      professorsCount: 15,
      studentsCount: 180,
      coursesCount: 52,
      classesCount: 4,
      description: 'Formation en sciences infirmières et soins de santé',
      establishedYear: 2010,
      building: 'Bâtiment F',
      budget: '600,000,000 FCFA',
      isActive: true
    },
    {
      id: 'bio',
      name: 'Sciences Biomédicales',
      fullName: 'Département des Sciences Biomédicales',
      headOfDepartment: 'Prof. André Essomba',
      headId: 'prof5',
      headEmail: 'a.essomba@fmedudouala.cm',
      headPhone: '+237 6XX XX XX XX',
      professorsCount: 22,
      studentsCount: 95,
      coursesCount: 38,
      classesCount: 2,
      description: 'Recherche biomédicale et formation en sciences fondamentales',
      establishedYear: 2015,
      building: 'Laboratoires de Recherche',
      budget: '1,500,000,000 FCFA',
      isActive: true
    }
  ];

  // Filtrer les départements
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBudget = (budget: string) => {
    return budget.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const calculateAge = (establishedYear: number) => {
    return new Date().getFullYear() - establishedYear;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Départements</h1>
          <p className="text-gray-600 mt-1">Gérez les départements et leurs responsables</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-700 hover:bg-green-700-dark">
          <Plus className="mr-2 h-4 w-4" />
          Créer un département
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Départements</p>
              <h3 className="text-2xl font-bold">{departments.length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Professeurs</p>
              <h3 className="text-2xl font-bold">
                {departments.reduce((sum, dept) => sum + dept.professorsCount, 0)}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Étudiants</p>
              <h3 className="text-2xl font-bold">
                {departments.reduce((sum, dept) => sum + dept.studentsCount, 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cours</p>
              <h3 className="text-2xl font-bold">
                {departments.reduce((sum, dept) => sum + dept.coursesCount, 0)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher un département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des départements */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredDepartments.map(dept => (
          <Card key={dept.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* En-tête du département */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-600">{dept.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Créé en {dept.establishedYear} • {calculateAge(dept.establishedYear)} ans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Informations du chef de département */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Chef de Département</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{dept.headOfDepartment}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-blue-600">{dept.headEmail}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{dept.headPhone}</span>
                </div>
              </div>
            </div>

            {/* Statistiques du département */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dept.professorsCount}</div>
                <div className="text-xs text-blue-600">Professeurs</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dept.studentsCount}</div>
                <div className="text-xs text-purple-600">Étudiants</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{dept.coursesCount}</div>
                <div className="text-xs text-yellow-600">Cours</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dept.classesCount}</div>
                <div className="text-xs text-green-600">Classes</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-600">{dept.description}</p>
            </div>

            {/* Informations supplémentaires */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Localisation:</span>
                <span className="font-medium">{dept.building}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget annuel:</span>
                <span className="font-medium text-green-600">{formatBudget(dept.budget)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="mr-1 h-3 w-3" />
                Professeurs
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <BookOpen className="mr-1 h-3 w-3" />
                Cours
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Building className="mr-1 h-3 w-3" />
                Détails
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredDepartments.length === 0 && (
        <Card className="p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun département trouvé</h3>
          <p className="text-gray-600 mb-4">
            Aucun département ne correspond à votre recherche.
          </p>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Réinitialiser la recherche
          </Button>
        </Card>
      )}

      {/* Modal de création */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Créer un nouveau département</h2>
            <p className="text-gray-600 mb-4">Formulaire de création de département à implémenter</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button className="bg-green-700 hover:bg-green-700-dark">
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}