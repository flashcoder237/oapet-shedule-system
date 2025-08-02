'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, BookOpen, User, Clock, Users, Calendar, Building, X } from 'lucide-react';
import { Card, CardContent, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, CardSkeleton, LoadingSpinner } from '@/components/ui/loading';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Example course data
  const courses = [
    {
      id: '1',
      name: 'Anatomie Generale',
      code: 'ANAT101',
      professor: 'Dr. Kamga',
      professorId: 'prof1',
      department: 'Medecine',
      departmentId: 'med',
      classes: ['L1 Medecine', 'L2 Medecine'],
      classIds: ['l1med', 'l2med'],
      durationHours: 60,
      studentsCount: 120,
      requiredFeatures: ['Projecteur', 'Tableau interactif'],
      preferredRooms: ['A101', 'Amphi A'],
      sessionsPerWeek: 2,
      status: 'active',
      nextSession: 'Lundi 08:00 - Salle A101'
    },
    {
      id: '2',
      name: 'Biochimie Metabolique',
      code: 'BIOC201',
      professor: 'Dr. Mbarga',
      professorId: 'prof2',
      department: 'Medecine',
      departmentId: 'med',
      classes: ['L2 Medecine'],
      classIds: ['l2med'],
      durationHours: 45,
      studentsCount: 80,
      requiredFeatures: ['Projecteur', 'Ordinateurs'],
      preferredRooms: ['B201', 'Labo Bio'],
      sessionsPerWeek: 3,
      status: 'active',
      nextSession: 'Mardi 10:00 - Salle B201'
    }
  ];

  const departments = ['all', 'Medecine', 'Pharmacie', 'Dentaire'];
  const levels = ['all', 'L1', 'L2', 'L3', 'L4', 'M1', 'M2'];

  // Simulation du chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulation de recherche avec délai
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const searchTimer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(searchTimer);
    }
  }, [searchTerm]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.professor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchesLevel = selectedLevel === 'all' || course.classes.some(cls => cls.includes(selectedLevel));
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'suspended': return 'Suspendu';
      case 'completed': return 'Termine';
      default: return 'En attente';
    }
  };

  if (isLoading) {
    return (
      <PageLoading 
        message="Chargement des cours..." 
        variant="detailed"
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Cours</h1>
          <p className="text-secondary mt-1">Gérez les cours, professeurs et planifications</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un cours
        </Button>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard
          title="Total des cours"
          value="152"
          change="+8 ce mois"
          trend="up"
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <StatCard
          title="Cours actifs"
          value="138"
          change="91% du total"
          trend="neutral"
          icon={<Calendar className="h-6 w-6" />}
        />
        
        <StatCard
          title="Professeurs"
          value="45"
          change="+2 ce mois"
          trend="up"
          icon={<User className="h-6 w-6" />}
        />

        <StatCard
          title="Heures/semaine"
          value="1,240h"
          change="Planning complet"
          trend="neutral"
          icon={<Clock className="h-6 w-6" />}
        />
      </motion.div>

      <motion.div 
        className="flex flex-col md:flex-row gap-4"
        variants={itemVariants}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher un cours, code ou professeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-subtle rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-surface transition-all"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-3 border border-subtle rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-surface transition-all"
          >
            <option value="all">Tous les départements</option>
            {departments.slice(1).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <AnimatePresence>
          {isSearching ? (
            // Skeleton pendant la recherche
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardSkeleton rows={4} showFooter />
              </motion.div>
            ))
          ) : (
            filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Card hover interactive className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{course.name}</h3>
                          <span className="text-sm text-secondary bg-accent-muted px-2 py-1 rounded-lg">
                            {course.code}
                          </span>
                        </div>
                        <div className="flex items-center text-secondary mb-2">
                          <User className="h-4 w-4 mr-1" />
                          <span className="text-sm">{course.professor}</span>
                        </div>
                        <div className="flex items-center text-secondary">
                          <Building className="h-4 w-4 mr-1" />
                          <span className="text-sm">{course.department}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-secondary mr-2" />
                        <div>
                          <p className="text-xs text-tertiary">Durée totale</p>
                          <p className="text-sm font-medium text-primary">{course.durationHours}h</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-secondary mr-2" />
                        <div>
                          <p className="text-xs text-tertiary">Étudiants</p>
                          <p className="text-sm font-medium text-primary">{course.studentsCount}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-subtle">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        Planning
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Users className="mr-1 h-3 w-3" />
                        Étudiants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="surface-elevated rounded-xl p-6 w-full max-w-md border border-subtle"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary">Ajouter un nouveau cours</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-secondary mb-6">Formulaire d'ajout de cours à implémenter</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button className="flex-1">
                  Ajouter
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}