'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  User,
  Building,
  Brain,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParallaxCard, AnimatedProgress, NotificationBadge } from '@/components/ui/interactive-elements';
import { mlService } from '@/lib/api/services/ml';
import { useToast } from '@/components/ui/use-toast';
import type { Course } from '@/types/api';

interface AIPrediction {
  difficulty_score: number;
  complexity_level: string;
  priority: number;
  recommendations: string[];
  success_rate?: number;
  risk_level?: 'low' | 'medium' | 'high';
  optimization_score?: number;
}

interface CourseCardWithAIProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export function CourseCardWithAI({ 
  course, 
  onEdit, 
  onDelete, 
  getStatusColor, 
  getStatusText 
}: CourseCardWithAIProps) {
  const { addToast } = useToast();
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIDetails, setShowAIDetails] = useState(false);

  useEffect(() => {
    loadAIPredictions();
  }, [course.id]);

  const loadAIPredictions = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      // Prédiction de difficulté
      const difficultyPrediction = await mlService.predictCourseDifficulty({
        course_name: course.name,
        lectures: course.hours_per_week || 2,
        min_days: Math.ceil((course.hours_per_week || 2) / 2),
        students: course.max_students || 50,
        teacher: `teacher_${course.teacher}`,
        total_courses: 50,
        total_rooms: 20,
        total_days: 5,
        periods_per_day: 6,
        lecture_density: (course.hours_per_week || 2) / 30,
        student_lecture_ratio: (course.max_students || 50) / (course.hours_per_week || 2),
        course_room_ratio: 2.5,
        utilization_pressure: 0.7
      }).catch(() => null);

      // Simulation prédiction de succès (à implémenter dans l'API)
      const mockSuccessPrediction = {
        success_rate: 0.75 + Math.random() * 0.2, // 75-95%
        risk_level: (difficultyPrediction?.complexity_level === 'Élevée' ? 'high' : 
                    difficultyPrediction?.complexity_level === 'Moyenne' ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        optimization_score: 70 + Math.random() * 25 // 70-95%
      };

      if (difficultyPrediction) {
        setAiPrediction({
          ...difficultyPrediction,
          ...mockSuccessPrediction,
          risk_level: mockSuccessPrediction.risk_level
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prédictions IA:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyBadgeVariant = (level: string) => {
    switch (level) {
      case 'Élevée': return 'destructive';
      case 'Moyenne': return 'default';
      case 'Faible': return 'secondary';
      default: return 'outline';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-emerald-600 bg-emerald-50';
    if (rate >= 0.6) return 'text-blue-600 bg-blue-50';
    if (rate >= 0.4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'medium': return <Target className="w-3 h-3 text-orange-500" />;
      case 'low': return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      default: return <BarChart3 className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className="relative"
    >
      <ParallaxCard className="group h-full">
        <Card hover interactive className="h-full relative overflow-hidden">
          {/* Badges IA en haut à droite */}
          {aiPrediction && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <Badge 
                variant={getDifficultyBadgeVariant(aiPrediction.complexity_level)}
                className="text-xs flex items-center gap-1 shadow-sm"
              >
                <Brain className="w-3 h-3" />
                {aiPrediction.complexity_level}
              </Badge>
              
              {aiPrediction.success_rate && (
                <div className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${getSuccessRateColor(aiPrediction.success_rate)}`}>
                  {getRiskIcon(aiPrediction.risk_level)}
                  {Math.round(aiPrediction.success_rate * 100)}% succès
                </div>
              )}
            </div>
          )}

          {/* Badge d'analyse en cours */}
          {isAnalyzing && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="outline" className="text-xs animate-pulse">
                <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                Analyse IA...
              </Badge>
            </div>
          )}

          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-16"> {/* Espace pour les badges */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                    {course.name}
                  </h3>
                  <span className="text-sm text-secondary bg-accent-muted px-2 py-1 rounded-lg">
                    {course.code}
                  </span>
                </div>
                <div className="flex items-center text-secondary mb-2">
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm">{course.teacher}</span>
                </div>
                <div className="flex items-center text-secondary">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="text-sm">{course.department}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(course)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(String(course.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor(course.is_active ? 'active' : 'inactive')}`}>
              {getStatusText(course.is_active ? 'active' : 'inactive')}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-secondary mr-2" />
                <div>
                  <p className="text-xs text-tertiary">Crédits</p>
                  <p className="text-sm font-medium text-primary">{course.credits || 0}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-secondary mr-2" />
                <div>
                  <p className="text-xs text-tertiary">Étudiants</p>
                  <p className="text-sm font-medium text-primary">{course.enrollments_count || 0}</p>
                </div>
              </div>
            </div>

            {/* Panel IA détaillé */}
            {aiPrediction && (
              <div className="mb-4">
                <button
                  onClick={() => setShowAIDetails(!showAIDetails)}
                  className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium text-sm text-blue-800">
                        Insights IA
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Score: {Math.round(aiPrediction.difficulty_score * 100)}%
                      </Badge>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-blue-600 transition-transform ${showAIDetails ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {showAIDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 bg-white border border-blue-200 rounded-lg"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">Priorité</span>
                        </div>
                        <span className="text-sm font-bold text-purple-600">
                          {aiPrediction.priority}/3
                        </span>
                      </div>
                      
                      {aiPrediction.optimization_score && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Zap className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-medium text-orange-600">Optimisation</span>
                          </div>
                          <span className="text-sm font-bold text-orange-600">
                            {Math.round(aiPrediction.optimization_score)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {aiPrediction.recommendations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <Lightbulb className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-600">Recommandations</span>
                        </div>
                        <div className="space-y-1">
                          {aiPrediction.recommendations.slice(0, 2).map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-subtle">
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="mr-1 h-3 w-3" />
                Planning
              </Button>
              <NotificationBadge count={course.enrollments_count || 0} max={999}>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="mr-1 h-3 w-3" />
                  Étudiants
                </Button>
              </NotificationBadge>
            </div>

            {/* Barre de progression pour la performance prédite */}
            {aiPrediction?.success_rate && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>Performance prédite</span>
                  <span>{Math.round(aiPrediction.success_rate * 100)}%</span>
                </div>
                <AnimatedProgress 
                  value={aiPrediction.success_rate * 100} 
                  className="h-1"
                  color={`bg-gradient-to-r ${
                    aiPrediction.success_rate >= 0.8 ? 'from-emerald-400 to-emerald-600' :
                    aiPrediction.success_rate >= 0.6 ? 'from-blue-400 to-blue-600' :
                    aiPrediction.success_rate >= 0.4 ? 'from-orange-400 to-orange-600' :
                    'from-red-400 to-red-600'
                  }`}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </ParallaxCard>
    </motion.div>
  );
}

export default CourseCardWithAI;