// src/components/auth/RoleGuard.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoading } from '@/components/ui/loading';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export default function RoleGuard({
  children,
  allowedRoles = [],
  requireAdmin = false,
  requireAuth = true,
  fallback
}: RoleGuardProps) {
  const { user, loading, isAuthenticated, isAdmin, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Vérifier l'authentification
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Vérifier les permissions admin
    if (requireAdmin && !isAdmin()) {
      router.push('/dashboard');
      return;
    }

    // Vérifier les rôles autorisés
    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, user, requireAuth, requireAdmin, allowedRoles]);

  if (loading) {
    return <PageLoading message="Vérification des permissions..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin()) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  return <>{children}</>;
}
