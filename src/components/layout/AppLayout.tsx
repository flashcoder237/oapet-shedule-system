'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import LoginForm from '@/components/auth/LoginForm';
import Sidebar from './Sidebar';
import Header from './Header';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import EnhancedChatbotWidget from '@/components/chatbot/EnhancedChatbotWidget';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto bg-background relative">
          {/* Content */}
          <div className="relative z-10 p-6 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Elements Container */}
      <div className="fixed bottom-0 right-0 z-50 p-6 flex flex-col-reverse items-end gap-4 pointer-events-none">
        {/* All floating elements - each with pointer-events-auto */}
        <div className="pointer-events-auto">
          <EnhancedChatbotWidget />
        </div>
      </div>
    </div>
  );
}