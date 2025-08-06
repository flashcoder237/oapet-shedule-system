'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import LoginForm from '@/components/auth/LoginForm';
import Sidebar from './Sidebar';
import Header from './Header';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Main application layout
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-gray-50 relative">
          {/* Content */}
          <div className="relative z-10 p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}