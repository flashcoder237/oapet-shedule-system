'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, BookOpen, User, Clock,
  Users, Calendar, Building, Download, Upload, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading, LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import { courseService } from '@/lib/api/services/courses';
import CourseModal from '@/components/modals/CourseModal';
import { Badge } from '@/components/ui/badge';
import type { Course, CourseStats } from '@/types/api';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [departments, setDepartments] = useState<Array<{ id: number | string; name: string }>>([]);
  const [levels, setLevels] = useState<string[]>(['all']);

  const { addToast } = useToast();

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [coursesData, statsData, departmentsData] = await Promise.all([
          courseService.getCourses(),
          courseService.getCoursesStats(),
          courseService.getDepartments()
        ]);

        const coursesArray = coursesData.results || [];
        setCourses(coursesArray);
        setStats(statsData);

        // Extraire les départements réels
        const deptResults = departmentsData.results || departmentsData || [];
        const deptMap = new Map(deptResults.map((d: any) => [d.id, d.name]));

        // Créer une liste de départements avec nom
        const uniqueDeptIds = new Set(coursesArray.map(c => c.department).filter(Boolean));
        const deptList = [
          { id: 'all', name: 'Tous les départements' },
          ...Array.from(uniqueDeptIds).map(id => ({
            id,
            name: deptMap.get(id) || `Département ${id}`
          }))
        ];
        setDepartments(deptList);

        // Extraire les niveaux réels
        const uniqueLevels = new Set(coursesArray.map(c => c.level).filter(Boolean));
        setLevels(['all', ...Array.from(uniqueLevels).sort()]);

      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
        addToast({
          title: "Erreur",
          description: "Impossible de charger les cours",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addToast]);

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
        await courseService.updateCourse(selectedCourse.id!, courseData);
      } else {
        await courseService.createCourse(courseData);
      }

      // Recharger les cours
      const coursesData = await courseService.getCourses();
      setCourses(coursesData.results || []);

    } catch (error: any) {
      throw error; // Propager l'erreur pour que le modal la gère
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));

      addToast({
        title: "Succès",
        description: "Cours supprimé avec succès",
        variant: "default",
      });
    } catch (error) {
      addToast({
        title: "Erreur",
        description: "Impossible de supprimer le cours",
        variant: "destructive",
      });
    }
  };

  // Filtrage des cours
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm ||
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === 'all' ||
      Number(course.department) === Number(selectedDepartment) ||
      String(course.department) === String(selectedDepartment);

    const matchesLevel = selectedLevel === 'all' ||
      course.level === selectedLevel;

    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const getCourseTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CM': 'bg-blue-500',
      'TD': 'bg-green-500',
      'TP': 'bg-purple-500',
      'CONF': 'bg-orange-500',
      'EXAM': 'bg-red-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getCourseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CM': 'Cours Magistral',
      'TD': 'Travaux Dirigés',
      'TP': 'Travaux Pratiques',
      'CONF': 'Conférence',
      'EXAM': 'Examen',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return <PageLoading message="Chargement des cours..." />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cours</h1>
          <p className="text-muted-foreground">
            Gérez les cours et modules de formation
          </p>
        </div>
        <Button onClick={handleAddCourse} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Cours
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cours</p>
                  <p className="text-2xl font-bold">{stats.total_courses || courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cours Actifs</p>
                  <p className="text-2xl font-bold">{stats.active_courses || courses.filter(c => c.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enseignants</p>
                  <p className="text-2xl font-bold">{stats.total_teachers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Heures</p>
                  <p className="text-2xl font-bold">{stats.total_hours || 0}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'Tous les niveaux' : level}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des cours */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Cours ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Code</th>
                  <th className="text-left p-4 font-semibold">Nom</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Niveau</th>
                  <th className="text-left p-4 font-semibold">Crédits</th>
                  <th className="text-left p-4 font-semibold">Heures</th>
                  <th className="text-left p-4 font-semibold">Étudiants</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-muted-foreground">
                      Aucun cours trouvé
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, index) => (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold">
                          {course.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{course.name}</p>
                          {course.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getCourseTypeColor(course.course_type)} text-white`}>
                          {getCourseTypeLabel(course.course_type)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{course.level}</Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{course.credits}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{course.total_hours}h total</div>
                          <div className="text-muted-foreground">
                            {course.hours_per_week}h/semaine
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{course.max_students}</span>
                      </td>
                      <td className="p-4">
                        {course.is_active ? (
                          <Badge className="bg-green-500 text-white">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id!)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        course={selectedCourse}
        onSave={handleSaveCourse}
      />
    </div>
  );
}
