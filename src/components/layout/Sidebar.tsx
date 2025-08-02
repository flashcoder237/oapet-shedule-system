// src/components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  MapPin, 
  Calendar, 
  Users, 
  Building, 
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cours', href: '/courses', icon: BookOpen },
    { name: 'Salles', href: '/rooms', icon: MapPin },
    { name: 'Emplois du temps', href: '/schedule', icon: Calendar },
    { name: 'Utilisateurs', href: '/users', icon: Users },
    { name: 'Départements', href: '/departments', icon: Building },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 72 }
  };

  const logoVariants = {
    expanded: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, delay: 0.1 }
    },
    collapsed: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const textVariants = {
    expanded: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, delay: 0.1 }
    },
    collapsed: { 
      opacity: 0, 
      x: -10,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.aside 
      variants={sidebarVariants}
      animate={collapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-primary text-white shadow-xl flex flex-col relative overflow-hidden"
    >
      {/* Effet de gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 relative z-10">
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              variants={logoVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">FMSP-UDo</span>
                <p className="text-xs text-white/70">Management System</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={18} />
          </motion.div>
        </motion.button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <motion.li 
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={`nav-item flex items-center relative rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } ${collapsed ? 'justify-center p-3' : 'px-4 py-3'}`}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Indicateur actif */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <item.icon size={20} className={collapsed ? '' : 'mr-3'} />
                    </motion.div>
                    
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          variants={textVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="font-medium text-sm"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <motion.div 
        className="p-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {collapsed ? (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <span className="text-xs text-white/60">v1.0</span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-footer"
              variants={textVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-1"
            >
              <p className="text-sm font-medium">Système de gestion</p>
              <p className="text-xs text-white/60">Version 1.0.0</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/50">© 2024 FMSP-UDo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
}