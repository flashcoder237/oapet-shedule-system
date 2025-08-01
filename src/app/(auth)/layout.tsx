// src/app/(auth)/layout.tsx
import '../globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';

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
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}