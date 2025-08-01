'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Mail, Shield, Building, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Données exemple des utilisateurs
  const users = [
    {
      id: '1',
      name: 'Dr. Jean Kamga',
      email: 'j.kamga@fmedudouala.cm',
      role: 'professor',
      department: 'Médecine',
      departmentId: 'med',
      isActive: true,
      lastLogin: '2024-01-15 09:30',
      coursesCount: 3,
      avatar: '/avatars/kamga.jpg',
      phone: '+237 6XX XX XX XX',
      specialization: 'Anatomie'
    },
    {
      id: '2',
      name: 'Dr. Marie Mbarga',
      email: 'm.mbarga@fmedudouala.cm',
      role: 'professor',
      department: 'Médecine',
      departmentId: 'med',
      isActive: true,
      lastLogin: '2024-01-14 16:45',
      coursesCount: 2,
      avatar: '/avatars/mbarga.jpg',
      phone: '+237 6XX XX XX XX',
      specialization: 'Biochimie'
    },
    {
      id: '3',
      name: 'Prof. Paul Nkeng',
      email: 'p.nkeng@fmedudouala.cm',
      role: 'professor',
      department: 'Médecine',
      departmentId: 'med',
      isActive: true,
      lastLogin: '2024-01-15 08:15',
      coursesCount: 4,
      avatar: '/avatars/nkeng.jpg',
      phone: '+237 6XX XX XX XX',
      specialization: 'Physiologie'
    },
    {
      id: '4',
      name: 'Admin Système',
      email: 'admin@fmedudouala.cm',
      role: 'admin',
      department: 'Administration',
      departmentId: 'admin',
      isActive: true,
      lastLogin: '2024-01-15 10:00',
      coursesCount: 0,
      avatar: '/avatars/admin.jpg',
      phone: '+237 6XX XX XX XX',
      specialization: 'Gestion système'
    },
    {
      id: '5',
      name: 'Secrétaire Pédagogique',
      email: 'secretaire@fmedudouala.cm',
      role: 'staff',
      department: 'Pédagogie',
      departmentId: 'ped',
      isActive: true,
      lastLogin: '2024-01-14 17:30',
      coursesCount: 0,
      avatar: '/avatars/secretary.jpg',
      phone: '+237 6XX XX XX XX',
      specialization: 'Secrétariat'
    },
    {
      id: '6',
      name: 'Dr. Sophie Talla',
      email: 's.talla@fmedudouala.cm',
      role: 'professor',
      department: 'Médecine',
      departmentId: 'med',
      isActive: false,
      lastLogin: '2024-01-10 14:20',
      coursesCount: 1,
      avatar: '/avatars/talla.jpg',
      phone: '+237 6XX XX XX XX',
      specialization: 'Microbiologie'
    }
  ];

  const roles = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'professor', label: 'Professeur' },
    { value: 'staff', label: 'Personnel' }
  ];

  const departments = [
    { value: 'all', label: 'Tous les départements' },
    { value: 'Médecine', label: 'Médecine' },
    { value: 'Pharmacie', label: 'Pharmacie' },
    { value: 'Dentaire', label: 'Dentaire' },
    { value: 'Administration', label: 'Administration' },
    { value: 'Pédagogie', label: 'Pédagogie' }
  ];

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-600" />;
      case 'professor': return <User className="h-4 w-4 text-blue-600" />;
      case 'staff': return <UserCheck className="h-4 w-4 text-green-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'professor': return 'Professeur';
      case 'staff': return 'Personnel';
      default: return 'Utilisateur';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'professor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    return `Il y a ${diffDays - 1} jours`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-700 hover:bg-green-700-dark">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total utilisateurs</p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Actifs</p>
              <h3 className="text-2xl font-bold">{users.filter(u => u.isActive).length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Professeurs</p>
              <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'professor').length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-red-100 rounded-full">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Administrateurs</p>
              <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou spécialisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {departments.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {user.email}
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

            {/* Badges de statut et rôle */}
            <div className="flex gap-2 mb-4">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span className="ml-1">{getRoleLabel(user.role)}</span>
              </div>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Building className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Département</p>
                  <p className="text-sm font-medium">{user.department}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Spécialisation</p>
                  <p className="text-sm font-medium">{user.specialization}</p>
                </div>
              </div>

              {user.role === 'professor' && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">Cours enseignés</p>
                    <p className="text-sm font-medium">{user.coursesCount} cours</p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">Dernière connexion</p>
                <p className="text-sm font-medium">{formatLastLogin(user.lastLogin)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="mr-1 h-3 w-3" />
                Contact
              </Button>
              {user.isActive ? (
                <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                  <UserX className="mr-1 h-3 w-3" />
                  Désactiver
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="flex-1 text-green-600 border-green-200 hover:bg-green-50">
                  <UserCheck className="mr-1 h-3 w-3" />
                  Activer
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-600 mb-4">
            Aucun utilisateur ne correspond à vos critères de recherche.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setSelectedRole('all');
            setSelectedDepartment('all');
          }}>
            Réinitialiser les filtres
          </Button>
        </Card>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter un nouvel utilisateur</h2>
            <p className="text-gray-600 mb-4">Formulaire d'ajout d'utilisateur à implémenter</p>
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