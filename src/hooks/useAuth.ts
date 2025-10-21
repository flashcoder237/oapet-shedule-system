// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
  profile?: {
    role: string;
    phone?: string;
    language?: string;
    timezone?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/users/auth/me/', {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Token invalide, déconnecter
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/login');
  };

  // Fonctions de vérification des rôles
  const isAdmin = () => {
    return user?.is_staff || user?.is_superuser || user?.role === 'admin';
  };

  const isTeacher = () => {
    return user?.role === 'teacher' || user?.profile?.role === 'teacher';
  };

  const isStudent = () => {
    return user?.role === 'student' || user?.profile?.role === 'student';
  };

  const isDepartmentHead = () => {
    return user?.role === 'department_head' || user?.profile?.role === 'department_head';
  };

  const isScheduler = () => {
    return user?.role === 'scheduler' || user?.profile?.role === 'scheduler';
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    const userRole = user.role || user.profile?.role || '';
    return roles.includes(userRole) || user.is_staff || user.is_superuser;
  };

  const canManageUsers = () => {
    return isAdmin() || isDepartmentHead() || isScheduler();
  };

  const canManageSchedules = () => {
    return isAdmin() || isDepartmentHead() || isScheduler();
  };

  const canManageCourses = () => {
    return isAdmin() || isDepartmentHead();
  };

  const canManageRooms = () => {
    return isAdmin();
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isTeacher,
    isStudent,
    isDepartmentHead,
    isScheduler,
    hasRole,
    canManageUsers,
    canManageSchedules,
    canManageCourses,
    canManageRooms,
  };
}
