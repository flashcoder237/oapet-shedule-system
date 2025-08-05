'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Mail, Shield, Building, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeachers } from '@/hooks/useCourses';
import { LoadingSpinner } from '@/components/ui/loading';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const { teachers, loading, error, fetchTeachers } = useTeachers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des utilisateurs</p>
          <Button onClick={() => fetchTeachers()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  // Toutes les données viennent maintenant du backend
  const users = teachers;

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

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.user_details?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_details?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_details?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || selectedRole === 'professor'; // Teachers are professors
    const matchesDepartment = selectedDepartment === 'all' || user.department_name === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'professor': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'professor': return <User className="w-4 h-4" />;
      case 'staff': return <Building className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
          <p className="text-secondary mt-1">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Filtre par rôle */}
          <div className="lg:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par département */}
          <div className="lg:w-48">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">
                    {user.user_details?.first_name} {user.user_details?.last_name}
                  </h3>
                  <p className="text-sm text-secondary">{user.user_details?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.is_active ? (
                  <UserCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <UserX className="w-5 h-5 text-red-500" />
                )}
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Rôle:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeColor('professor')}`}>
                  {getRoleIcon('professor')}
                  Professeur
                </span>
              </div>

              {user.department_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Département:</span>
                  <span className="text-sm font-medium">{user.department_name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Statut:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">ID Employé:</span>
                <span className="text-sm font-medium">{user.employee_id}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos filtres ou d'ajouter un nouvel utilisateur.</p>
        </div>
      )}
    </div>
  );
}