// src/components/modals/CourseModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  User, 
  Users, 
  Clock, 
  MapPin, 
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Course {
  id?: string;
  name: string;
  code: string;
  teacher: string;
  department: string;
  level: string;
  credits: number;
  student_count: number;
  description?: string;
  prerequisites?: string[];
  required_equipment?: string[];
  preferred_rooms?: string[];
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  onSave: (course: Course) => Promise<void>;
}

export default function CourseModal({ isOpen, onClose, course, onSave }: CourseModalProps) {
  const [formData, setFormData] = useState<Course>({
    name: '',
    code: '',
    teacher: '',
    department: '',
    level: '',
    credits: 3,
    student_count: 0,
    description: '',
    prerequisites: [],
    required_equipment: [],
    preferred_rooms: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        name: '',
        code: '',
        teacher: '',
        department: '',
        level: '',
        credits: 3,
        student_count: 0,
        description: '',
        prerequisites: [],
        required_equipment: [],
        preferred_rooms: []
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [course, isOpen]);

  const departments = [
    'Médecine',
    'Pharmacie',
    'Dentaire',
    'Sciences Infirmières',
    'Kinésithérapie'
  ];

  const levels = [
    'L1', 'L2', 'L3', 'L4', 'L5', 'L6',
    'M1', 'M2', 'D1', 'D2', 'D3'
  ];

  const equipmentOptions = [
    'Projecteur',
    'Tableau interactif',
    'Ordinateurs',
    'Microscopes',
    'Équipement médical',
    'Laboratoire',
    'Climatisation',
    'Microphone',
    'Enregistrement'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Le nom du cours est requis';
      if (!formData.code.trim()) newErrors.code = 'Le code du cours est requis';
      if (!formData.teacher.trim()) newErrors.teacher = 'L\'enseignant est requis';
      if (!formData.department) newErrors.department = 'Le département est requis';
    }

    if (step === 2) {
      if (!formData.level) newErrors.level = 'Le niveau est requis';
      if (formData.credits < 1 || formData.credits > 10) {
        newErrors.credits = 'Les crédits doivent être entre 1 et 10';
      }
      if (formData.student_count < 0) {
        newErrors.student_count = 'Le nombre d\'étudiants ne peut pas être négatif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayInputChange = (field: keyof Course, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    const current = formData.required_equipment || [];
    const updated = current.includes(equipment)
      ? current.filter(item => item !== equipment)
      : [...current, equipment];
    setFormData(prev => ({ ...prev, required_equipment: updated }));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Nom du cours *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.name ? 'border-red-300' : 'border-primary/20'
          }`}
          placeholder="Ex: Anatomie Générale"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Code du cours *
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.code ? 'border-red-300' : 'border-primary/20'
          }`}
          placeholder="Ex: ANAT101"
        />
        {errors.code && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.code}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Enseignant *
        </label>
        <input
          type="text"
          value={formData.teacher}
          onChange={(e) => handleInputChange('teacher', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.teacher ? 'border-red-300' : 'border-primary/20'
          }`}
          placeholder="Ex: Dr. Kamga"
        />
        {errors.teacher && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.teacher}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Département *
        </label>
        <select
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.department ? 'border-red-300' : 'border-primary/20'
          }`}
        >
          <option value="">Sélectionner un département</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        {errors.department && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.department}
          </p>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Niveau *
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.level ? 'border-red-300' : 'border-primary/20'
            }`}
          >
            <option value="">Sélectionner un niveau</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.level && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.level}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Crédits *
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.credits}
            onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.credits ? 'border-red-300' : 'border-primary/20'
            }`}
          />
          {errors.credits && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.credits}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Nombre d'étudiants
        </label>
        <input
          type="number"
          min="0"
          value={formData.student_count}
          onChange={(e) => handleInputChange('student_count', parseInt(e.target.value) || 0)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.student_count ? 'border-red-300' : 'border-primary/20'
          }`}
          placeholder="0"
        />
        {errors.student_count && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.student_count}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Description du cours..."
        />
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Équipements requis
        </label>
        <div className="grid grid-cols-2 gap-2">
          {equipmentOptions.map(equipment => (
            <label
              key={equipment}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <input
                type="checkbox"
                checked={(formData.required_equipment || []).includes(equipment)}
                onChange={() => handleEquipmentToggle(equipment)}
                className="rounded"
              />
              <span className="text-sm">{equipment}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Prérequis (séparés par des virgules)
        </label>
        <input
          type="text"
          value={(formData.prerequisites || []).join(', ')}
          onChange={(e) => handleArrayInputChange('prerequisites', e.target.value)}
          className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: ANAT100, BIOC101"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Salles préférées (séparées par des virgules)
        </label>
        <input
          type="text"
          value={(formData.preferred_rooms || []).join(', ')}
          onChange={(e) => handleArrayInputChange('preferred_rooms', e.target.value)}
          className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: A101, Amphi A, Labo Bio"
        />
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      {course ? 'Modifier le cours' : 'Nouveau cours'}
                    </h2>
                    <p className="text-secondary text-sm">
                      Étape {currentStep} sur 3
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="flex items-center mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === currentStep
                          ? 'bg-primary text-white'
                          : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step < currentStep ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Form content */}
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isLoading}
                    >
                      Précédent
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  {currentStep < 3 ? (
                    <Button onClick={handleNext} disabled={isLoading}>
                      Suivant
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {course ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}