// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Système de gestion des emplois du temps - Faculté de Médécine UDouala',
  description: 'Application de gestion des emplois du temps avec flexibilité des salles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ToastProvider />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-4 bg-gray-50">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}