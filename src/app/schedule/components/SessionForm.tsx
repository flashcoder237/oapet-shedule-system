'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Save, Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { ScheduleSession, Course, Teacher, Room } from '@/types/api';

interface SessionFormData {
  id?: number;
  course: number | string;
  teacher: number | string;
  room: number | string;
  day: string;
  startTime: string;
  endTime: string;
  sessionType: 'CM' | 'TD' | 'TP' | 'EXAM';
  expectedStudents: number;
  notes?: string;
}

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: SessionFormData) => void;
  editingSession?: ScheduleSession | null;
  courses: Course[];
  teachers: Teacher[];
  rooms: Room[];
}

const DAYS = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' }
];

const SESSION_TYPES = [
  { value: 'CM', label: 'Cours Magistral (CM)' },
  { value: 'TD', label: 'Travaux Dirigés (TD)' },
  { value: 'TP', label: 'Travaux Pratiques (TP)' },
  { value: 'EXAM', label: 'Examen' }
];

export function SessionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingSession, 
  courses, 
  teachers, 
  rooms 
}: SessionFormProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    course: '',
    teacher: '',
    room: '',
    day: '',
    startTime: '',
    endTime: '',
    sessionType: 'CM',
    expectedStudents: 30,
    notes: ''
  });

  useEffect(() => {
    if (editingSession) {
      setFormData({
        id: editingSession.id,
        course: editingSession.course || '',
        teacher: editingSession.teacher || '',
        room: editingSession.room || '',
        day: editingSession.time_slot_details?.day_of_week || '',
        startTime: editingSession.specific_start_time || '',
        endTime: editingSession.specific_end_time || '',
        sessionType: editingSession.session_type as 'CM' | 'TD' | 'TP' | 'EXAM',
        expectedStudents: editingSession.expected_students || 30,
        notes: editingSession.notes || ''
      });
    } else {
      // Reset form for new session
      setFormData({
        course: '',
        teacher: '',
        room: '',
        day: '',
        startTime: '',
        endTime: '',
        sessionType: 'CM',
        expectedStudents: 30,
        notes: ''
      });
    }
  }, [editingSession, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof SessionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {editingSession ? 'Modifier la session' : 'Nouvelle session'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cours et type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Cours
                  </Label>
                  <Select 
                    value={formData.course.toString()} 
                    onValueChange={(value) => handleChange('course', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type de session</Label>
                  <Select 
                    value={formData.sessionType} 
                    onValueChange={(value) => handleChange('sessionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enseignant et salle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    Enseignant
                  </Label>
                  <Select 
                    value={formData.teacher.toString()} 
                    onValueChange={(value) => handleChange('teacher', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.user_details?.first_name} {teacher.user_details?.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    Salle
                  </Label>
                  <Select 
                    value={formData.room.toString()} 
                    onValueChange={(value) => handleChange('room', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.code} - {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Jour et horaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Jour</Label>
                  <Select 
                    value={formData.day} 
                    onValueChange={(value) => handleChange('day', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Heure de début
                  </Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Heure de fin
                  </Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Nombre d'étudiants */}
              <div className="space-y-2">
                <Label>Nombre d'étudiants attendus</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.expectedStudents}
                  onChange={(e) => handleChange('expectedStudents', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Input
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Remarques particulières..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingSession ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}