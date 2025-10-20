'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { classService } from '@/lib/api/services/classes'
import type { ClassCourse, Course, StudentClass } from '@/lib/api/services/classes'

export default function ClassCoursesPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [studentClass, setStudentClass] = useState<StudentClass | null>(null)
  const [classCourses, setClassCourses] = useState<ClassCourse[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])

  useEffect(() => {
    if (classId) {
      fetchClass()
      fetchClassCourses()
      fetchAvailableCourses()
    }
  }, [classId])

  const fetchClass = async () => {
    try {
      const data = await classService.getClass(parseInt(classId))
      setStudentClass(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchClassCourses = async () => {
    try {
      const data = await classService.getClassCourses(parseInt(classId))
      setClassCourses(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCourses = async () => {
    try {
      const data = await classService.getAvailableCourses()
      setAvailableCourses(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleAddCourses = async () => {
    if (selectedCourses.length === 0) return

    try {
      await classService.assignCoursesBulk(parseInt(classId), {
        courses: selectedCourses,
        is_mandatory: true,
        semester: studentClass?.semester || 'S1'
      })

      fetchClassCourses()
      setShowModal(false)
      setSelectedCourses([])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleRemoveCourse = async (courseId: number) => {
    if (!confirm('Retirer ce cours de la classe ?')) return

    try {
      await classService.removeCourse(parseInt(classId), courseId)
      fetchClassCourses()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  const assignedCourseIds = classCourses.map(cc => cc.course)
  const unassignedCourses = availableCourses.filter(
    c => !assignedCourseIds.includes(c.id)
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/gestion-classes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Retour aux classes
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Cours de la classe {studentClass?.code}
            </h1>
            <p className="text-gray-600 mt-2">
              {studentClass?.name} - {studentClass?.student_count} étudiants
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Ajouter des cours
          </button>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom du cours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Enseignant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Effectif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucun cours assigné à cette classe
                </td>
              </tr>
            ) : (
              classCourses.map((cc) => (
                <tr key={cc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{cc.course_code}</td>
                  <td className="px-6 py-4">{cc.course_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      {cc.course_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {cc.teacher_name}
                  </td>
                  <td className="px-6 py-4">
                    {cc.effective_student_count} étudiants
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveCourse(cc.course)}
                      className="text-red-600 hover:text-red-800"
                      title="Retirer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout de cours */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Ajouter des cours</h2>

            <div className="space-y-2 mb-6">
              {unassignedCourses.length === 0 ? (
                <p className="text-gray-500">Tous les cours sont déjà assignés</p>
              ) : (
                unassignedCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center gap-3 p-4 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCourses([...selectedCourses, course.id])
                        } else {
                          setSelectedCourses(
                            selectedCourses.filter((id) => id !== course.id)
                          )
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{course.code} - {course.name}</div>
                      <div className="text-sm text-gray-600">
                        {course.course_type} - {course.teacher_name}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedCourses([])
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCourses}
                disabled={selectedCourses.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter ({selectedCourses.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
