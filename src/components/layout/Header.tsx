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
      transition={{ duration: 0.2 }}
      className="bg-white sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <motion.button 
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          <Menu size={18} style={{ color: 'var(--text-secondary)' }} />
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{getPageTitle()}</h1>
        </motion.div>
      </div>

      {/* Barre de recherche moderne */}
      <motion.div 
        className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-48 max-w-md flex-1 mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        style={{ backgroundColor: 'var(--surface-elevated)' }}
      >
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} className="mr-2" />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="bg-transparent flex-1 outline-none text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
      </motion.div>
      
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationCenter />
        
        {/* User Menu */}
        <div className="relative">
          <motion.button 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            aria-label="Menu utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.full_name || user?.username || 'Utilisateur'}</p>
            </div>
            <motion.div
              animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div 
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50"
                style={{ 
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div className="py-2">
                  <Link href="/profile">
                    <motion.div 
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <User size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Profil</span>
                    </motion.div>
                  </Link>
                  <Link href="/settings">
                    <motion.div 
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <Settings size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Paramètres</span>
                    </motion.div>
                  </Link>
                </div>
                <div style={{ borderTop: '1px solid var(--border)' }}></div>
                <div className="py-2">
                  <motion.button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-red-600 transition-colors"
                    whileHover={{ x: 2 }}
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