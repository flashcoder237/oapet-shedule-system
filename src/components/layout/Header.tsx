// src/components/layout/Header.tsx
'use client';

import { Bell, Settings, User, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Fonction pour obtenir le titre de la page en fonction du pathname
  const getPageTitle = () => {
    if (pathname === '/') return 'Accueil';
    if (pathname === '/dashboard') return 'Tableau de bord';
    if (pathname.startsWith('/courses')) return 'Gestion des cours';
    if (pathname.startsWith('/rooms')) return 'Gestion des salles';
    if (pathname.startsWith('/schedule')) return 'Emplois du temps';
    if (pathname.startsWith('/users')) return 'Utilisateurs';
    if (pathname.startsWith('/departments')) return 'Départements';
    if (pathname.startsWith('/settings')) return 'Paramètres';
    return 'Système de gestion des emplois du temps';
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          className="mr-4 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              3
            </span>
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 font-medium border-b border-gray-200">Notifications</div>
              <div className="max-h-64 overflow-y-auto">
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-100">
                  <p className="text-sm font-medium">Modification de salle</p>
                  <p className="text-xs text-gray-500">Le cours de Anatomie a changé de salle</p>
                  <p className="text-xs text-gray-400">Il y a 10 minutes</p>
                </a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-100">
                  <p className="text-sm font-medium">Conflit d'horaire détecté</p>
                  <p className="text-xs text-gray-500">Veuillez vérifier l'emploi du temps</p>
                  <p className="text-xs text-gray-400">Il y a 1 heure</p>
                </a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  <p className="text-sm font-medium">Nouveau cours ajouté</p>
                  <p className="text-xs text-gray-500">Cours de Biochimie ajouté à votre emploi du temps</p>
                  <p className="text-xs text-gray-400">Hier</p>
                </a>
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <a href="#" className="text-sm text-primary hover:underline">Voir toutes les notifications</a>
              </div>
            </div>
          )}
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="Menu utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={18} />
            </div>
            <span className="hidden md:inline text-sm font-medium">Dr. Kamga</span>
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profil
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Paramètres
                </div>
              </Link>
              <div className="border-t border-gray-100 my-1"></div>
              <Link href="/auth/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                Déconnexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}