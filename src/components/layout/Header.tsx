// src/components/layout/Header.tsx
'use client';

import { Bell, Settings, User, Menu, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationCenter } from '@/components/ui/notifications';
import { useAuth } from '@/lib/auth/context';

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
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

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const notificationBadgeVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    pulse: { 
      scale: [1, 1.2, 1]
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-elevated backdrop-blur-sm sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-subtle"
    >
      <div className="flex items-center gap-4">
        <motion.button 
          className="lg:hidden p-2 rounded-xl hover:bg-primary-muted transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          <Menu size={20} className="text-secondary" />
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-xl font-bold text-primary tracking-tight">{getPageTitle()}</h1>
          <p className="text-sm text-secondary">Gérez efficacement votre système</p>
        </motion.div>
      </div>

      {/* Barre de recherche centrale */}
      <motion.div 
        className="hidden md:flex items-center bg-primary-subtle/50 rounded-xl px-4 py-2 min-w-64 max-w-md flex-1 mx-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Search size={16} className="text-secondary mr-3" />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="bg-transparent flex-1 outline-none text-sm placeholder-secondary"
        />
      </motion.div>
      
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationCenter />
        
        {/* User Menu */}
        <div className="relative">
          <motion.button 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-muted transition-colors"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Menu utilisateur"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-primary">{user?.full_name || user?.username || 'Utilisateur'}</p>
              <p className="text-xs text-secondary">{user?.profile?.role || 'Utilisateur'}</p>
            </div>
            <motion.div
              animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-secondary" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div 
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-56 surface-elevated rounded-xl shadow-xl border border-subtle z-50"
              >
                <div className="p-2">
                  <Link href="/profile">
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-subtle/50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <User size={16} className="text-secondary" />
                      <span className="text-sm font-medium">Profil</span>
                    </motion.div>
                  </Link>
                  <Link href="/settings">
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-subtle/50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <Settings size={16} className="text-secondary" />
                      <span className="text-sm font-medium">Paramètres</span>
                    </motion.div>
                  </Link>
                </div>
                <div className="border-t border-subtle m-2"></div>
                <div className="p-2">
                  <motion.button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-4 h-4 rounded bg-red-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded"></div>
                    </div>
                    <span className="text-sm font-medium">Déconnexion</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}