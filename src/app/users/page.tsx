'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Mail, Shield, Building, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeachers, useDepartments } from '@/hooks/useCourses';
import { userService } from '@/lib/api/services/users';
import UserModal from '@/components/modals/UserModal';
import { ImportExport } from '@/components/ui/ImportExport';
import type { CreateUserData, UpdateUserData } from '@/lib/api/services/users';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active: boolean;
  department_id?: number;
  department_name?: string;
  employee_id?: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { teachers } = useTeachers();
  const { departments } = useDepartments();
  const { addToast } = useToast();

  // Chargement des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const usersResult = await userService.getUsers({ 
          search: searchTerm, 
          role: selectedRole !== 'all' ? selectedRole : undefined, 
          department: selectedDepartment !== 'all' ? selectedDepartment : undefined 
        }).catch(() => ({ results: [], count: 0 }));
        
        setUsersData(usersResult.results || []);
        
        // Fallback to teachers data if no users found
        if ((!usersResult.results || usersResult.results.length === 0) && teachers && teachers.length > 0) {
          const teachersAsUsers = teachers.map(teacher => ({
            id: teacher.id,
            username: teacher.user_details?.username || `teacher_${teacher.id}`,
            email: teacher.user_details?.email || '',
            first_name: teacher.user_details?.first_name || '',
            last_name: teacher.user_details?.last_name || '',
            role: 'professor',
            is_active: teacher.is_active,
            department_id: teacher.department,
            department_name: teacher.department_name,
            employee_id: teacher.employee_id
          }));
          setUsersData(teachersAsUsers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [searchTerm, selectedRole, selectedDepartment, teachers]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData: CreateUserData | UpdateUserData) => {
    try {
      if (selectedUser) {
        // Update existing user
        const updatedUser = await userService.updateUser(selectedUser.id, userData as UpdateUserData);
        setUsersData(prev => prev.map(user => user.id === selectedUser.id ? updatedUser : user));
      } else {
        // Create new user
        const newUser = await userService.createUser(userData as CreateUserData);
        setUsersData(prev => [...prev, newUser]);
      }
      setShowUserModal(false);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await userService.deleteUser(userId);
      setUsersData(prev => prev.filter(user => user.id !== userId));
      addToast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && (!usersData || usersData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const roles = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'professor', label: 'Professeur' },
    { value: 'staff', label: 'Personnel' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'Tous les départements' },
    ...departments.map(dept => ({ value: dept.name, label: dept.name }))
  ];

  // Filtrage des utilisateurs
  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
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
        <div className="flex gap-2">
          <ImportExport
            exportEndpoint="/courses/teachers/export/"
            importEndpoint="/courses/teachers/import_data/"
            resourceName="teachers"
            onImportSuccess={() => window.location.reload()}
            size="default"
            variant="outline"
          />
          <Button onClick={handleAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Filtre par rôle */}
          <div className="lg:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              {departmentOptions.map(dept => (
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
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-secondary">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.is_active ? (
                  <UserCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <UserX className="w-5 h-5 text-red-500" />
                )}
                <button className="p-1 hover:bg-muted rounded">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Rôle:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeColor(user.role || 'professor')}`}>
                  {getRoleIcon(user.role || 'professor')}
                  {user.role === 'admin' ? 'Administrateur' : user.role === 'staff' ? 'Personnel' : 'Professeur'}
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

              {user.employee_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">ID Employé:</span>
                  <span className="text-sm font-medium">{user.employee_id}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteUser(user.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        departments={departments}
      />

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-muted-foreground">Essayez de modifier vos filtres ou d'ajouter un nouvel utilisateur.</p>
        </div>
      )}
    </div>
  );
}