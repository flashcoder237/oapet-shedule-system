'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, BookOpen, User, Clock, Users, Calendar, Building, X } from 'lucide-react';
import { Card, CardContent, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, CardSkeleton, LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { courseService } from '@/lib/api/services/courses';
import CourseModal from '@/components/modals/CourseModal';
import CourseCardWithAI from '@/components/courses/CourseCardWithAI';
import { ImportExport } from '@/components/ui/ImportExport';
import {
  ParallaxCard,
  AnimatedProgress,
  NotificationBadge,
  MagneticButton
} from '@/components/ui/interactive-elements';
import type { Course, CourseStats } from '@/types/api';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [departments, setDepartments] = useState<string[]>(['all']);
  const [error, setError] = useState<string | null>(null);
  
  const { addToast } = useToast();
  const levels = ['all', 'L1', 'L2', 'L3', 'L4', 'M1', 'M2'];

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Charger les cours et statistiques en parallèle
        const [coursesData, statsData] = await Promise.all([
          courseService.getCourses(),
          courseService.getCoursesStats()
        ]);
        
        setCourses(coursesData.results || []);
        setStats(statsData);
        
        // Extraire les départements uniques
        const uniqueDepartments = ['all', ...new Set((coursesData.results || []).map(course => String(course.department)))];
        setDepartments(uniqueDepartments);
        
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
        setError('Erreur lors du chargement des données');
        addToast({
          title: "Erreur",
          description: "Impossible de charger les cours. Vérifiez votre connexion.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addToast]);

  // Recherche avec délai
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const searchTimer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(searchTimer);
    }
  }, [searchTerm]);

  // Fonctions pour gérer les modales
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (selectedCourse) {
        // Mise à jour existante
        await courseService.updateCourse(selectedCourse.id!, courseData);
        setCourses(prev => prev.map(course => 
          course.id === selectedCourse.id ? { ...course, ...courseData } : course
        ));
        addToast({
          title: "Succès",
          description: "Cours mis à jour avec succès",
        });
      } else {
        // Nouveau cours
        const newCourse = await courseService.createCourse(courseData);
        setCourses(prev => [...prev, newCourse]);
        addToast({
          title: "Succès",
          description: "Cours créé avec succès",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de sauvegarder le cours",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    try {
      await courseService.deleteCourse(Number(courseId));
      setCourses(prev => prev.filter(course => course.id !== Number(courseId)));
      addToast({
        title: "Succès",
        description: "Cours supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de supprimer le cours",
        variant: "destructive",
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || String(course.department) === selectedDepartment;
    const matchesLevel = selectedLevel === 'all' || course.level?.includes(selectedLevel);
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-muted text-foreground border-border';
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
        <div className="flex gap-2">
          <ImportExport
            exportEndpoint="/courses/courses/export/"
            importEndpoint="/courses/courses/import_data/"
            resourceName="courses"
            onImportSuccess={() => window.location.reload()}
            size="default"
            variant="outline"
          />
          <Button onClick={handleAddCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un cours
          </Button>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard
          title="Total des cours"
          value={stats?.total_courses?.toString() || "0"}
          change={`+${courses.length} chargés`}
          trend="up"
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <StatCard
          title="Cours actifs"
          value={courses.filter(c => c.is_active).length.toString()}
          change={`${Math.round((courses.filter(c => c.is_active).length / courses.length) * 100)}% du total`}
          trend="neutral"
          icon={<Calendar className="h-6 w-6" />}
        />
        
        <StatCard
          title="Enseignants"
          value={stats?.total_teachers?.toString() || new Set(courses.map(c => c.teacher)).size.toString()}
          change={`${departments.length - 1} départements`}
          trend="up"
          icon={<User className="h-6 w-6" />}
        />

        <StatCard
          title="Étudiants"
          value={courses.reduce((sum, course) => sum + (course.enrollments_count || 0), 0).toString()}
          change="Total inscrit"
          trend="neutral"
          icon={<Users className="h-6 w-6" />}
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
              <CourseCardWithAI
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modales */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        course={selectedCourse}
        onSave={handleSaveCourse}
      />
    </motion.div>
  );
}