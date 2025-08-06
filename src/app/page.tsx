'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  Search,
  PlayCircle,
  CheckCircle,
  Award
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ModernCard, CardContent, CardHeader, CardTitle } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 200]);
  const y2 = useTransform(scrollY, [0, 300], [0, -200]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      id: 1,
      title: 'Planification Intelligente',
      description: 'IA avancée pour optimiser automatiquement vos emplois du temps, éviter les conflits et maximiser l\'utilisation des ressources.',
      icon: Brain,
      gradient: 'from-primary to-primary-600',
      href: '/schedule',
      stats: '95% optimisation',
      badge: 'IA'
    },
    {
      id: 2,
      title: 'Gestion Centralisée',
      description: 'Interface unifiée pour gérer tous vos utilisateurs avec des rôles personnalisables et un contrôle d\'accès granulaire.',
      icon: Users,
      gradient: 'from-accent to-accent-500',
      href: '/users',
      stats: '1,250+ utilisateurs',
      badge: 'Populaire'
    },
    {
      id: 3,
      title: 'Optimisation Espaces',
      description: 'Suivi temps réel de l\'occupation des salles avec suggestions intelligentes pour optimiser l\'utilisation.',
      icon: MapPin,
      gradient: 'from-success to-success-500',
      href: '/rooms',
      stats: '85% occupation',
      badge: 'Temps réel'
    },
    {
      id: 4,
      title: 'Catalogue de Cours',
      description: 'Gestion complète avec prérequis, crédits et assignation automatique des enseignants qualifiés.',
      icon: BookOpen,
      gradient: 'from-warning to-warning-500',
      href: '/courses',
      stats: '245+ cours',
      badge: 'Nouveau'
    }
  ];

  const stats = [
    { 
      label: 'Étudiants Actifs', 
      value: '1,250', 
      icon: Users, 
      trend: '+12%', 
      trendPositive: true,
      description: 'Ce mois'
    },
    { 
      label: 'Cours Planifiés', 
      value: '245', 
      icon: BookOpen, 
      trend: '+15%', 
      trendPositive: true,
      description: 'Cette semaine'
    },
    { 
      label: 'Taux Satisfaction', 
      value: '98%', 
      icon: Star, 
      trend: '+3%', 
      trendPositive: true,
      description: 'Feedback'
    },
    { 
      label: 'Optimisation IA', 
      value: '95%', 
      icon: Brain, 
      trend: '+8%', 
      trendPositive: true,
      description: 'Algorithme'
    }
  ];

  const quickActions = [
    { 
      title: 'Nouveau Cours', 
      description: 'Créer un cours',
      icon: BookOpen, 
      href: '/courses', 
      gradient: 'from-primary to-primary-600'
    },
    { 
      title: 'Planning', 
      description: 'Voir les horaires',
      icon: Calendar, 
      href: '/schedule', 
      gradient: 'from-accent to-accent-500'
    },
    { 
      title: 'Tableau de Bord', 
      description: 'Analytics & stats',
      icon: BarChart3, 
      href: '/dashboard', 
      gradient: 'from-success to-success-500'
    },
    { 
      title: 'Gestion Salles', 
      description: 'Espaces disponibles',
      icon: MapPin, 
      href: '/rooms', 
      gradient: 'from-warning to-warning-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-700">
        {/* Background Effects */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  <Sparkles className="w-4 h-4" />
                  Université de Douala - FMSP
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Gestion Intelligente des
                <span className="block text-transparent bg-gradient-to-r from-accent-50 to-accent bg-clip-text">
                  Emplois du Temps
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                OAPET révolutionne la planification académique avec l'IA. 
                Optimisez vos ressources et créez des emplois du temps parfaits.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Tableau de Bord
                  </Button>
                </Link>
                
                <Link href="/schedule">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Voir Démo
                  </Button>
                </Link>
              </motion.div>

              {/* Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative max-w-md mx-auto lg:mx-0"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher cours, salles, horaires..."
                    className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex justify-center"
            >
              <ModernCard variant="glass" className="max-w-md w-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Données en Temps Réel</CardTitle>
                      <p className="text-sm text-muted-foreground">Performance du système</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="text-center p-3 rounded-lg bg-background/50"
                      >
                        <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                        <div className={cn(
                          "text-xs font-medium",
                          stat.trendPositive ? "text-success" : "text-destructive"
                        )}>
                          {stat.trend} {stat.description}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </ModernCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Actions Rapides
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Accédez instantanément aux fonctionnalités essentielles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link href={action.href}>
                  <ModernCard className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
                    <CardContent className="p-6 text-center">
                      <div className={cn(
                        "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110",
                        `bg-gradient-to-br ${action.gradient}`
                      )}>
                        <action.icon className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </ModernCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              Intelligence Artificielle
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Fonctionnalités Avancées
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment OAPET transforme la gestion académique avec des technologies de pointe
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link href={feature.href}>
                  <ModernCard className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] h-full overflow-hidden">
                    <div className="relative">
                      {/* Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold text-white",
                          `bg-gradient-to-r ${feature.gradient}`
                        )}>
                          {feature.badge}
                        </div>
                      </div>
                      
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-lg",
                            `bg-gradient-to-br ${feature.gradient}`
                          )}>
                            <feature.icon className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {feature.title}
                            </h3>
                            <div className="text-sm text-muted-foreground mb-1">Performance</div>
                            <div className="text-lg font-bold text-primary">{feature.stats}</div>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {feature.description}
                        </p>
                        
                        <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform">
                          <span className="font-semibold text-sm">Découvrir</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </CardContent>
                    </div>
                  </ModernCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              Sécurisé • Fiable • Innovant
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Prêt à transformer votre 
              <span className="block text-transparent bg-gradient-to-r from-accent-50 to-accent bg-clip-text">
                gestion académique ?
              </span>
            </h2>
            
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez les institutions qui ont choisi OAPET pour optimiser leur planification 
              et offrir une meilleure expérience éducative.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
                  <Star className="w-5 h-5 mr-2" />
                  Commencer Maintenant
                </Button>
              </Link>
              
              <Link href="/schedule">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Voir une Démo
                </Button>
              </Link>
            </div>

            {/* Final Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm mb-1">{stat.label}</div>
                  <div className="text-accent-50 text-xs font-medium">
                    {stat.trend} {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Link href="/courses">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-gradient-to-r from-primary to-primary-600 text-white rounded-full shadow-xl flex items-center justify-center backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-300"
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}