'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, BookOpen, Users, Search, GraduationCap, TrendingUp, Building2, X } from 'lucide-react'
import { classService } from '@/lib/api/services/classes'
import { courseService } from '@/lib/api/services/courses'
import type { StudentClass, Department, Curriculum } from '@/lib/api/services/classes'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { ImportExport } from '@/components/ui/ImportExport'

// Niveaux académiques jusqu'au doctorat
const ACADEMIC_LEVELS = [
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2' },
  { value: 'D1', label: 'Doctorat 1' },
  { value: 'D2', label: 'Doctorat 2' },
  { value: 'D3', label: 'Doctorat 3' },
]

export default function ClassesPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [filteredClasses, setFilteredClasses] = useState<StudentClass[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [editingClass, setEditingClass] = useState<StudentClass | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    level: 'L1',
    department: '',
    curriculum: '',
    student_count: 0,
    max_capacity: 50,
    academic_year: '2024-2025',
    semester: 'S1',
    description: '',
    is_active: true
  })

  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    code: '',
    description: ''
  })

  useEffect(() => {
    fetchClasses()
    fetchDepartments()
    fetchCurricula()
  }, [])

  useEffect(() => {
    let filtered = classes

    if (searchQuery) {
      filtered = filtered.filter(
        (cls) =>
          cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.department_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredClasses(filtered)
  }, [searchQuery, classes])

  const fetchClasses = async () => {
    try {
      const data = await classService.getClasses()
      setClasses(data)
      setFilteredClasses(data)
    } catch (error) {
      console.error('Erreur:', error)
      addToast({
        title: 'Erreur',
        description: 'Impossible de charger les classes',
        variant: 'destructive',
      })
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await classService.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Erreur:', error)
      setDepartments([])
    }
  }

  const fetchCurricula = async () => {
    try {
      const data = await classService.getCurricula()
      setCurricula(data)
    } catch (error) {
      console.error('Erreur:', error)
      setCurricula([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      department: parseInt(formData.department),
      curriculum: formData.curriculum ? parseInt(formData.curriculum) : null
    }

    try {
      if (editingClass) {
        const updatedClass = await classService.updateClass(editingClass.id, payload)

        // Update state immediately
        setClasses(prevClasses =>
          prevClasses.map(cls => cls.id === editingClass.id ? updatedClass : cls)
        )

        addToast({
          title: 'Succès',
          description: 'Classe modifiée avec succès',
        })
      } else {
        const newClass = await classService.createClass(payload)

        // Add new class to state immediately
        setClasses(prevClasses => [...prevClasses, newClass])

        addToast({
          title: 'Succès',
          description: 'Classe créée avec succès',
        })
      }

      setShowModal(false)
      resetForm()
    } catch (error: any) {
      console.error('Erreur:', error)
      addToast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    }
  }

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newDepartment = await courseService.createDepartment(departmentFormData)

      // Add new department to state immediately
      setDepartments(prevDepartments => [...prevDepartments, newDepartment])

      addToast({
        title: 'Succès',
        description: 'Département créé avec succès',
      })
      setShowDepartmentModal(false)
      setDepartmentFormData({ name: '', code: '', description: '' })
    } catch (error: any) {
      console.error('Erreur:', error)
      addToast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le département',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (cls: StudentClass) => {
    setEditingClass(cls)
    setFormData({
      code: cls.code,
      name: cls.name,
      level: cls.level,
      department: cls.department.toString(),
      curriculum: cls.curriculum?.toString() || '',
      student_count: cls.student_count,
      max_capacity: cls.max_capacity,
      academic_year: cls.academic_year,
      semester: cls.semester,
      description: '',
      is_active: cls.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette classe ?')) return

    try {
      await classService.deleteClass(id)

      // Remove class from state immediately
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== id))

      addToast({
        title: 'Succès',
        description: 'Classe supprimée',
      })
    } catch (error) {
      console.error('Erreur:', error)
      addToast({
        title: 'Erreur',
        description: 'Impossible de supprimer la classe',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      level: 'L1',
      department: '',
      curriculum: '',
      student_count: 0,
      max_capacity: 50,
      academic_year: '2024-2025',
      semester: 'S1',
      description: '',
      is_active: true
    })
    setEditingClass(null)
  }

  const totalStudents = classes.reduce((sum, c) => sum + c.student_count, 0)
  const totalCapacity = classes.reduce((sum, c) => sum + c.max_capacity, 0)
  const avgOccupancy = classes.length > 0
    ? Math.round(classes.reduce((sum, c) => sum + c.occupancy_rate, 0) / classes.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-primary" />
            Gestion des Classes
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gérez les classes et leurs effectifs
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowDepartmentModal(true)}
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Départements
          </Button>
          <ImportExport
            exportEndpoint="/courses/classes/"
            importEndpoint="/courses/classes/import_data/"
            resourceName="classes"
            onImportSuccess={fetchClasses}
            exportFormats={['csv', 'json', 'excel']}
            importFormats={['csv', 'json', 'excel']}
            useFrontendExport={true}
            templateFields={[
              { key: 'name', label: 'Nom', example: 'Licence 1 Informatique A' },
              { key: 'code', label: 'Code', example: 'L1-INFO-A' },
              { key: 'level', label: 'Niveau', example: 'L1' },
              { key: 'section', label: 'Section', example: 'A' },
              { key: 'department', label: 'Département (ID)', example: '1' },
              { key: 'curriculum', label: 'Programme (ID)', example: '1' },
              { key: 'academic_year', label: 'Année académique', example: '2024-2025' },
              { key: 'student_count', label: 'Nombre d\'étudiants', example: '45' },
              { key: 'max_capacity', label: 'Capacité maximale', example: '50' }
            ]}
          />
          <Button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Classe
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{classes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Classes actives</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Étudiants</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Étudiants inscrits</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capacité Totale</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground mt-1">Places disponibles</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-green-500/20 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux Occupation</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{avgOccupancy}%</div>
              <p className="text-xs text-muted-foreground mt-1">Moyenne</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code, nom ou département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 border-primary/20 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des classes */}
      <Card className="border-primary/10 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Niveau</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Département</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Effectif</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Cours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-foreground mb-1">Aucune classe trouvée</p>
                      <p className="text-sm text-muted-foreground">Commencez par créer votre première classe</p>
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((cls, index) => (
                    <motion.tr
                      key={cls.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{cls.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{cls.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                          {cls.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground">{cls.department_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{cls.student_count}</span>
                          <span className="text-muted-foreground">/ {cls.max_capacity}</span>
                          <Badge
                            variant={
                              cls.occupancy_rate > 90
                                ? 'destructive'
                                : cls.occupancy_rate > 75
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs font-semibold"
                          >
                            {Math.round(cls.occupancy_rate)}%
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">{cls.courses_count || 0} cours</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/gestion-classes/${cls.id}/courses`)}
                            title="Gérer les cours"
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cls)}
                            title="Modifier"
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cls.id)}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal Classe */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-primary/10"
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {editingClass ? 'Modifier la classe' : 'Nouvelle classe'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="hover:bg-primary/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Code *</label>
                    <Input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: INFO-L1-A"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Nom *</label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Informatique L1 Groupe A"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Niveau *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full border border-primary/20 rounded-md px-3 py-2 bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {ACADEMIC_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Département *</label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-primary/20 rounded-md px-3 py-2 bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Sélectionner...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Cursus</label>
                    <select
                      value={formData.curriculum}
                      onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                      className="w-full border border-primary/20 rounded-md px-3 py-2 bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Aucun</option>
                      {curricula.map((curr) => (
                        <option key={curr.id} value={curr.id}>
                          {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Année académique</label>
                    <Input
                      type="text"
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Nombre d'étudiants *</label>
                    <Input
                      type="number"
                      required
                      min="0"
                      value={formData.student_count}
                      onChange={(e) => setFormData({ ...formData, student_count: parseInt(e.target.value) || 0 })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Capacité maximale *</label>
                    <Input
                      type="number"
                      required
                      min="0"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 0 })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Semestre</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full border border-primary/20 rounded-md px-3 py-2 bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="S1">Semestre 1</option>
                      <option value="S2">Semestre 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mt-8">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-primary/20 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">Classe active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 border-primary/20 hover:bg-primary/5"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg"
                  >
                    {editingClass ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Département */}
      <AnimatePresence>
        {showDepartmentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full border border-primary/10"
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    Ajouter un Département
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDepartmentModal(false)
                      setDepartmentFormData({ name: '', code: '', description: '' })
                    }}
                    className="hover:bg-primary/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleDepartmentSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Code du département *</label>
                    <Input
                      type="text"
                      required
                      value={departmentFormData.code}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, code: e.target.value })}
                      placeholder="Ex: INFO"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Nom du département *</label>
                    <Input
                      type="text"
                      required
                      value={departmentFormData.name}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                      placeholder="Ex: Informatique"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Description</label>
                    <Input
                      type="text"
                      value={departmentFormData.description}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                      placeholder="Description du département"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDepartmentModal(false)
                      setDepartmentFormData({ name: '', code: '', description: '' })
                    }}
                    className="flex-1 border-primary/20 hover:bg-primary/5"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg"
                  >
                    Créer le département
                  </Button>
                </div>
              </form>

              {/* Liste des départements existants */}
              {departments.length > 0 && (
                <div className="p-6 pt-0">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Départements existants</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{dept.name}</div>
                          <div className="text-xs text-muted-foreground">{dept.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
