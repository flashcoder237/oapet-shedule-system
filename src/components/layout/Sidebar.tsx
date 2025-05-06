// src/components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

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
  
  return (
    <aside className={`bg-primary text-white ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 shadow-lg flex flex-col`}>
      <div className={`p-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-b border-primary-dark`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <Image src="/logo-placeholder.png" alt="Logo" width={20} height={20} />
            </div>
            <span className="font-bold text-lg">FM UDouala</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-full hover:bg-primary-dark"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 ${
                    isActive 
                      ? 'bg-primary-dark text-white' 
                      : 'text-white/80 hover:bg-primary-light hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={collapsed ? '' : 'mr-3'} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className={`p-4 border-t border-primary-dark ${collapsed ? 'text-center' : ''}`}>
        <div className="flex items-center">
          {collapsed ? (
            <span className="text-xs">v1.0</span>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-sm font-semibold">Système de gestion</p>
                <p className="text-xs text-white/60">v1.0</p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}