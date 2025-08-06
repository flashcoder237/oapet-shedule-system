// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Star,
  ArrowRight,
  Plus,
  Sparkles,
  Brain,
  Target,
  Zap,
  Shield,
  Globe,
  Activity,
  GraduationCap,
  Search
} from 'lucide-react';

import AnimatedBackground from '@/components/ui/animated-background';
import { MicroButton, MicroCard, FloatingButton } from '@/components/ui/micro-interactions';
import SmartSearch from '@/components/search/SmartSearch';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      id: 1,
      title: 'Planification Intelligente',
      description: 'Algorithmes d\'IA pour créer automatiquement des emplois du temps optimisés, en évitant les conflits et maximisant l\'utilisation des ressources.',
      icon: Brain,
      color: '#3E5C49',
      gradient: 'from-primary to-primary-hover',
      href: '/schedule',
      stats: '95% d\'optimisation'
    },
    {
      id: 2,
      title: 'Gestion Centralisée',
      description: 'Interface unifiée pour gérer étudiants, enseignants, cours et salles avec des rôles et permissions personnalisables.',
      icon: Users,
      color: '#C2571B',
      gradient: 'from-accent to-accent-hover',
      href: '/users',
      stats: '1,250+ utilisateurs'
    },
    {
      id: 3,
      title: 'Optimisation des Espaces',
      description: 'Suivi en temps réel de l\'occupation des salles avec suggestions d\'optimisation pour maximiser l\'utilisation des espaces.',
      icon: MapPin,
      color: '#6B8474',
      gradient: 'from-primary-light to-primary',
      href: '/rooms',
      stats: '85% d\'occupation'
    },
    {
      id: 4,
      title: 'Catalogue de Cours',
      description: 'Gestion complète des cours avec prérequis, crédits, descriptions et assignation automatique des enseignants qualifiés.',
      icon: BookOpen,
      color: '#D67332',
      gradient: 'from-accent-light to-accent',
      href: '/courses',
      stats: '245+ cours actifs'
    },
    {
      id: 5,
      title: 'Analytiques Avancées',
      description: 'Tableaux de bord interactifs avec métriques de performance, rapports automatisés et insights pour la prise de décision.',
      icon: BarChart3,
      color: '#3E5C49',
      gradient: 'from-primary to-primary-active',
      href: '/dashboard',
      stats: 'Temps réel'
    },
    {
      id: 6,
      title: 'Synchronisation Temps Réel',
      description: 'Mises à jour instantanées des changements d\'horaires avec notifications automatiques pour tous les utilisateurs concernés.',
      icon: Zap,
      color: '#C2571B',
      gradient: 'from-accent to-accent-light',
      href: '/schedule',
      stats: '<1s latence'
    }
  ];

  const stats = [
    { label: 'Étudiants Inscrits', value: '1,250+', icon: Users, trend: '+12%' },
    { label: 'Enseignants Actifs', value: '85+', icon: GraduationCap, trend: '+8%' },
    { label: 'Cours Disponibles', value: '245+', icon: BookOpen, trend: '+15%' },
    { label: 'Taux de Satisfaction', value: '98%', icon: Star, trend: '+3%' }
  ];

  const quickActions = [
    { title: 'Nouveau Cours', icon: BookOpen, href: '/courses', color: '#3E5C49' },
    { title: 'Planning', icon: Calendar, href: '/schedule', color: '#C2571B' },
    { title: 'Utilisateurs', icon: Users, href: '/users', color: '#6B8474' },
    { title: 'Salles', icon: MapPin, href: '/rooms', color: '#D67332' }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <AnimatedBackground variant="academic" intensity="low" />
      
      {/* Section Héro - Style bibliotheque-app */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hero-section relative"
      >
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Contenu héro */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  <Sparkles className="w-4 h-4" />
                  Université de Douala - Faculté de Médecine
                </span>
              </div>
              
              <h1 className="text-hero text-white mb-6">
                Système de Gestion des 
                <span className="block text-accent-light">Emplois du Temps Intelligent</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Optimisez votre gestion académique avec OAPET, le système intelligent qui révolutionne 
                la planification des cours grâce à l'intelligence artificielle.
              </p>

              {/* Barre de recherche moderne */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher cours, emplois du temps, salles..."
                    className="
                      w-full pl-12 pr-4 py-4 
                      bg-white/95 backdrop-blur-sm
                      border-2 border-white/20
                      rounded-2xl 
                      text-gray-900 placeholder-gray-500
                      focus:outline-none focus:border-accent-light focus:bg-white
                      hover:border-white/40
                      transition-all duration-300 ease-out
                      shadow-sm hover:shadow-md focus:shadow-lg
                      font-medium
                    "
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <button className="btn-accent inline-flex items-center gap-2 shadow-lg">
                    <BarChart3 className="w-5 h-5" />
                    Accéder au Tableau de Bord
                  </button>
                </Link>
                
                <Link href="/courses">
                  <button className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all">
                    <BookOpen className="w-5 h-5" />
                    Explorer les Cours
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Carte flottante avec statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="floating bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl max-w-md">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Activité en Temps Réel</h3>
                      <p className="text-white/70 text-sm">Données live du système</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {stats.slice(0, 4).map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="text-center"
                      >
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-white/70 text-xs">{stat.label}</div>
                        <div className="text-accent-light text-xs font-medium">{stat.trend}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Section Actions Rapides */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="section-spacing bg-background"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-heading mb-4">Actions Rapides</h2>
            <p className="text-body max-w-2xl mx-auto">
              Accédez rapidement aux fonctionnalités les plus utilisées
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <Link href={action.href}>
                  <div className="card interactive text-center group hover:shadow-lg">
                    <div className="p-6">
                      <div 
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: action.color }}
                      >
                        <action.icon className="w-8 h-8" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{action.title}</h4>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section Fonctionnalités */}
      <div className="section-spacing bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-heading mb-4">
              Une Solution Complète pour Votre Institution
            </h2>
            <p className="text-body max-w-3xl mx-auto">
              Découvrez nos fonctionnalités avancées conçues pour simplifier la gestion académique 
              et optimiser l'utilisation des ressources avec l'intelligence artificielle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link href={feature.href}>
                  <div className="card h-full group cursor-pointer">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: feature.color }}
                        >
                          <feature.icon className="w-7 h-7" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-medium">Performance</div>
                          <div className="text-sm font-semibold text-primary">{feature.stats}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-subheading mb-4 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-body mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform">
                        <span className="font-medium text-sm">En savoir plus</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Statistiques */}
      <div className="section-spacing" style={{ background: 'var(--gradient-primary)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-heading text-white mb-4">
              Performances en Temps Réel
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Découvrez l'impact de OAPET sur votre institution
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm mb-1">{stat.label}</div>
                <div className="text-accent-light text-xs font-medium">{stat.trend} ce mois</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Section CTA */}
      <div className="section-spacing bg-background">
        <div className="max-w-4xl mx-auto text-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Système sécurisé et fiable
              </div>
            </div>
            
            <h2 className="text-hero mb-6">
              Prêt à révolutionner votre 
              <span className="text-primary"> gestion académique ?</span>
            </h2>
            
            <p className="text-body mb-10 max-w-2xl mx-auto">
              Rejoignez les institutions qui ont déjà adopté OAPET pour optimiser 
              leur planification et améliorer l'expérience éducative.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <button className="btn-primary inline-flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Commencer Maintenant
                </button>
              </Link>
              
              <Link href="/about">
                <button className="btn-secondary inline-flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  En Savoir Plus
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bouton flottant pour actions rapides */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/courses">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
}