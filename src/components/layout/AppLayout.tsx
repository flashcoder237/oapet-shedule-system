// src/components/layout/AppLayout.tsx
'use client';

import { useAuth } from '@/lib/auth/context';
import LoginForm from '@/components/auth/LoginForm';
import Sidebar from './Sidebar';
import Header from './Header';
import { LoadingSpinner } from '@/components/ui/loading';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Afficher le spinner de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-subtle via-accent-subtle to-tertiary-muted/20">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Afficher le formulaire de login si non authentifié
  if (!isAuthenticated) {
    return <LoginForm />;
   }

  // Afficher l'interface principale si authentifié
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}