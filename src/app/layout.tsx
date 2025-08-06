// src/app/layout.tsx
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import { NotificationProvider } from '@/components/ui/notifications';

export const metadata = {
  title: 'OAPET Schedule System - Système de gestion des emplois du temps avec IA',
  description: 'Application de gestion des emplois du temps universitaire avec intelligence artificielle - Université de Douala',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ToastProvider>
          <NotificationProvider>
            <AuthProvider>
              <AppLayoutWrapper>
                {children}
              </AppLayoutWrapper>
            </AuthProvider>
          </NotificationProvider>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}