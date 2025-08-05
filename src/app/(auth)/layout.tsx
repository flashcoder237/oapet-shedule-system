// src/app/(auth)/layout.tsx
import '../globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import { AuthProvider } from '@/lib/auth/context';
import { NotificationProvider } from '@/components/ui/notifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Authentification - Système de gestion des emplois du temps',
  description: 'Connexion et inscription au système de gestion des emplois du temps',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ToastProvider>
          <NotificationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NotificationProvider>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}