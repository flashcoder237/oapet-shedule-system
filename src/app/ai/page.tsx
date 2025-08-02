// src/app/ai/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  MapPin
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useMLPrediction, useMLModels } from '@/hooks/useML';
import type { MLPredictionRequest } from '@/types/api';

export default function AIPage() {
  const [predictionForm, setPredictionForm] = useState<Partial<MLPredictionRequest>>({
    course_name: '',
    lectures: 3,
    min_days: 2,
    students: 120,
    teacher: '',
    conflict_degree: 0,
    unavailability_count: 0,
  });

  const { predictCourseDifficulty, lastPrediction, loading: predicting, error } = useMLPrediction();
  const { models, loading: modelsLoading } = useMLModels();

  const handleInputChange = (field: keyof MLPredictionRequest, value: any) => {
    setPredictionForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePredict = async () => {
    if (!predictionForm.course_name || !predictionForm.teacher) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      await predictCourseDifficulty(predictionForm as MLPredictionRequest);
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-50 border-red-200';
      case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
      case 3: return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'élevée': return 'text-red-600';
      case 'moyenne': return 'text-orange-600';
      case 'faible': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Brain className="w-8 h-8" />
            Intelligence Artificielle
          </h2>
          <p className="text-secondary mt-1">
            Prédiction de difficulté et optimisation intelligente des emplois du temps
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de prédiction */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prédiction de difficulté
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Nom du cours *
                  </label>
                  <input
                    type="text"
                    value={predictionForm.course_name || ''}
                    onChange={(e) => handleInputChange('course_name', e.target.value)}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Anatomie Générale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Enseignant *
                  </label>
                  <input
                    type="text"
                    value={predictionForm.teacher || ''}
                    onChange={(e) => handleInputChange('teacher', e.target.value)}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Dr. Kamga"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Nombre de cours/semaine
                  </label>
                  <input
                    type="number"
                    value={predictionForm.lectures || 3}
                    onChange={(e) => handleInputChange('lectures', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Jours minimum
                  </label>
                  <input
                    type="number"
                    value={predictionForm.min_days || 2}
                    onChange={(e) => handleInputChange('min_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                    max="7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Nombre d'étudiants
                  </label>
                  <input
                    type="number"
                    value={predictionForm.students || 120}
                    onChange={(e) => handleInputChange('students', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Conflits potentiels
                  </label>
                  <input
                    type="number"
                    value={predictionForm.conflict_degree || 0}
                    onChange={(e) => handleInputChange('conflict_degree', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                  />
                </div>
              </div>

              <Button 
                onClick={handlePredict}
                disabled={predicting}
                className="w-full"
              >
                {predicting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyser la difficulté
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Résultats de la prédiction */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Résultats de l'analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastPrediction ? (
                <div className="space-y-4">
                  {/* Score de difficulté */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {(lastPrediction.difficulty_score * 100).toFixed(1)}%
                    </div>
                    <div className={`text-lg font-semibold ${getComplexityColor(lastPrediction.complexity_level)}`}>
                      Complexité {lastPrediction.complexity_level}
                    </div>
                  </div>

                  {/* Priorité */}
                  <div className={`p-3 rounded-lg border ${getPriorityColor(lastPrediction.priority)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Priorité de planification</span>
                      <span className="font-bold">
                        {lastPrediction.priority === 1 ? 'HAUTE' : 
                         lastPrediction.priority === 2 ? 'MOYENNE' : 'BASSE'}
                      </span>
                    </div>
                  </div>

                  {/* Recommandations */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">Recommandations IA :</h4>
                    <div className="space-y-2">
                      {lastPrediction.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-secondary">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Temps de traitement */}
                  {lastPrediction.processing_time && (
                    <div className="flex items-center gap-2 text-xs text-tertiary">
                      <Clock className="w-3 h-3" />
                      Analysé en {(lastPrediction.processing_time * 1000).toFixed(0)}ms
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Remplissez le formulaire et cliquez sur "Analyser" pour obtenir une prédiction IA</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modèles ML disponibles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Modèles d'intelligence artificielle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <div 
                    key={model.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      model.is_active 
                        ? 'border-primary bg-primary-subtle/20' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary">{model.name}</h4>
                      {model.is_active && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary mb-2">{model.model_type}</p>
                    {model.performance_summary && (
                      <div className="text-xs text-tertiary">
                        Précision: {(model.performance_summary.average_r2 * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}