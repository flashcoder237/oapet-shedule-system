'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  Building,
  Zap,
  Eye,
  ArrowRight,
  Info,
  HelpCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Wand2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { mlService } from '@/lib/api/services/ml';

interface FormField {
  name: string;
  value: any;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  label: string;
  required?: boolean;
}

interface FormSuggestion {
  field: string;
  type: 'improvement' | 'warning' | 'error' | 'optimization';
  message: string;
  suggestion: string;
  confidence: number;
  auto_applicable?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  suggestions: FormSuggestion[];
  predictions?: {
    difficulty_score?: number;
    success_probability?: number;
    risk_level?: 'low' | 'medium' | 'high';
  };
}

interface SmartFormAssistantProps {
  formData: Record<string, any>;
  formFields: FormField[];
  formType: 'course' | 'schedule' | 'teacher' | 'room';
  onFieldSuggestion?: (field: string, value: any) => void;
  onValidationChange?: (result: ValidationResult) => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function SmartFormAssistant({
  formData,
  formFields,
  formType,
  onFieldSuggestion,
  onValidationChange,
  className = "",
  isOpen = true,
  onToggle
}: SmartFormAssistantProps) {
  const { addToast } = useToast();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<FormSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'predictions' | 'help'>('suggestions');
  const [autoSuggestionsEnabled, setAutoSuggestionsEnabled] = useState(true);

  useEffect(() => {
    if (autoSuggestionsEnabled) {
      const timer = setTimeout(() => {
        analyzeForm();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, autoSuggestionsEnabled]);

  const analyzeForm = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFormData();
      setValidation(analysis);
      setSuggestions(analysis.suggestions);
      onValidationChange?.(analysis);
    } catch (error) {
      console.error('Erreur lors de l\'analyse du formulaire:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFormData = async (): Promise<ValidationResult> => {
    const suggestions: FormSuggestion[] = [];
    let score = 100;
    let predictions: any = {};

    // Analyse spécifique selon le type de formulaire
    if (formType === 'course') {
      // Validation du nom du cours
      if (formData.name && formData.name.length < 3) {
        suggestions.push({
          field: 'name',
          type: 'warning',
          message: 'Le nom du cours est très court',
          suggestion: 'Utilisez un nom plus descriptif (minimum 10 caractères)',
          confidence: 0.8
        });
        score -= 10;
      }

      // Suggestions sur les crédits
      if (formData.credits) {
        if (formData.credits > 8) {
          suggestions.push({
            field: 'credits',
            type: 'warning',
            message: 'Nombre de crédits élevé détecté',
            suggestion: 'Les cours avec plus de 6 crédits nécessitent souvent plus de ressources',
            confidence: 0.9
          });
        }
      }

      // Prédiction IA si possible
      if (formData.name && formData.credits) {
        try {
          const aiPrediction = await mlService.predictCourseDifficulty({
            course_name: formData.name,
            lectures: formData.hours_per_week || 2,
            min_days: Math.ceil((formData.hours_per_week || 2) / 2),
            students: formData.max_students || 50,
            teacher: `teacher_${formData.teacher || 'default'}`,
            total_courses: 50,
            total_rooms: 20,
            total_days: 5,
            periods_per_day: 6,
            lecture_density: (formData.hours_per_week || 2) / 30,
            student_lecture_ratio: (formData.max_students || 50) / (formData.hours_per_week || 2),
            course_room_ratio: 2.5,
            utilization_pressure: 0.7
          });

          predictions = {
            difficulty_score: aiPrediction.difficulty_score,
            success_probability: 1 - (aiPrediction.difficulty_score || 0),
            risk_level: aiPrediction.difficulty_score > 0.7 ? 'high' : 
                      aiPrediction.difficulty_score > 0.4 ? 'medium' : 'low'
          };

          if (aiPrediction.recommendations) {
            aiPrediction.recommendations.forEach((rec: string) => {
              suggestions.push({
                field: 'general',
                type: 'optimization',
                message: 'Recommandation IA',
                suggestion: rec,
                confidence: 0.85
              });
            });
          }
        } catch (error) {
          // Ignore AI prediction errors
        }
      }
    }

    // Validation générale des champs requis
    formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        suggestions.push({
          field: field.name,
          type: 'error',
          message: `Le champ "${field.label}" est requis`,
          suggestion: 'Veuillez remplir ce champ obligatoire',
          confidence: 1.0
        });
        score -= 20;
      }
    });

    // Suggestions d'amélioration automatiques
    generateAutoSuggestions(formData, formType).forEach(suggestion => {
      suggestions.push(suggestion);
    });

    const isValid = suggestions.filter(s => s.type === 'error').length === 0;

    return {
      isValid,
      score: Math.max(0, score),
      suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
      predictions
    };
  };

  const generateAutoSuggestions = (data: any, type: string): FormSuggestion[] => {
    const suggestions: FormSuggestion[] = [];

    if (type === 'course') {
      // Suggestion sur la description
      if (data.name && (!data.description || data.description.length < 20)) {
        suggestions.push({
          field: 'description',
          type: 'improvement',
          message: 'Description recommandée',
          suggestion: 'Ajoutez une description détaillée pour améliorer la compréhension du cours',
          confidence: 0.7,
          auto_applicable: false
        });
      }

      // Suggestion sur les heures par semaine
      if (data.credits && !data.hours_per_week) {
        const suggestedHours = Math.ceil(data.credits * 1.5);
        suggestions.push({
          field: 'hours_per_week',
          type: 'improvement',
          message: 'Heures par semaine recommandées',
          suggestion: `Basé sur ${data.credits} crédits, nous recommandons ${suggestedHours} heures/semaine`,
          confidence: 0.8,
          auto_applicable: true
        });
      }

      // Suggestion sur le nombre maximum d'étudiants
      if (!data.max_students && data.credits) {
        const suggestedMax = data.credits > 4 ? 30 : 50;
        suggestions.push({
          field: 'max_students',
          type: 'improvement',
          message: 'Capacité d\'étudiants suggérée',
          suggestion: `Pour un cours de ${data.credits} crédits, nous recommandons max ${suggestedMax} étudiants`,
          confidence: 0.75,
          auto_applicable: true
        });
      }
    }

    return suggestions;
  };

  const applySuggestion = (suggestion: FormSuggestion) => {
    if (!suggestion.auto_applicable) {
      addToast({
        title: "Suggestion",
        description: suggestion.suggestion,
        variant: "default"
      });
      return;
    }

    // Application automatique des suggestions
    if (suggestion.field === 'hours_per_week' && formData.credits) {
      const suggestedValue = Math.ceil(formData.credits * 1.5);
      onFieldSuggestion?.(suggestion.field, suggestedValue);
    } else if (suggestion.field === 'max_students' && formData.credits) {
      const suggestedValue = formData.credits > 4 ? 30 : 50;
      onFieldSuggestion?.(suggestion.field, suggestedValue);
    }

    addToast({
      title: "Suggestion appliquée",
      description: `${suggestion.message} - ${suggestion.suggestion}`,
      variant: "default"
    });
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'improvement': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'optimization': return <Target className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-orange-500 bg-orange-50';
      case 'improvement': return 'border-l-blue-500 bg-blue-50';
      case 'optimization': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 shadow-lg"
      >
        <Brain className="w-4 h-4 mr-2" />
        Assistant IA
        {suggestions.filter(s => s.type === 'error').length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {suggestions.filter(s => s.type === 'error').length}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Assistant Formulaire IA
                <Sparkles className="w-4 h-4 text-blue-500" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {validation ? `Score de qualité: ${validation.score}%` : 'En attente d\'analyse'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={validation?.isValid ? 'default' : 'destructive'}>
              {validation?.isValid ? 'Valide' : 'À corriger'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSuggestionsEnabled(!autoSuggestionsEnabled)}
            >
              <Wand2 className={`w-4 h-4 ${autoSuggestionsEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
            </Button>
            {onToggle && (
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Onglets */}
        <div className="flex border-b mb-4">
          <Button
            variant={activeTab === 'suggestions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('suggestions')}
            className="rounded-none border-0"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Suggestions ({suggestions.length})
          </Button>
          {validation?.predictions && (
            <Button
              variant={activeTab === 'predictions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('predictions')}
              className="rounded-none border-0"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Prédictions
            </Button>
          )}
          <Button
            variant={activeTab === 'help' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('help')}
            className="rounded-none border-0"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Aide
          </Button>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 animate-pulse text-blue-500" />
              <span className="text-muted-foreground">Analyse en cours...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'suggestions' && (
              <AnimatePresence>
                {suggestions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-l-4 ${getSuggestionColor(suggestion.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{suggestion.message}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(suggestion.confidence * 100)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Champ: {suggestion.field}
                              </p>
                              <p className="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                {suggestion.suggestion}
                              </p>
                            </div>
                          </div>
                          
                          {suggestion.auto_applicable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applySuggestion(suggestion)}
                              className="text-xs ml-2"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Appliquer
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                    <p className="font-medium text-emerald-600">Formulaire optimal</p>
                    <p className="text-sm">Aucune suggestion d'amélioration</p>
                  </div>
                )}
              </AnimatePresence>
            )}

            {activeTab === 'predictions' && validation?.predictions && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Difficulté</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {validation.predictions.difficulty_score ? 
                        Math.round(validation.predictions.difficulty_score * 100) : 'N/A'}%
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-emerald-800">Succès</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {validation.predictions.success_probability ? 
                        Math.round(validation.predictions.success_probability * 100) : 'N/A'}%
                    </div>
                  </div>
                </div>

                {validation.predictions.risk_level && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Niveau de risque: <strong>{validation.predictions.risk_level}</strong>
                      {validation.predictions.risk_level === 'high' && 
                        ' - Surveillez de près ce cours'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {activeTab === 'help' && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Comment utiliser l'assistant IA?
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• L'assistant analyse automatiquement vos saisies</li>
                    <li>• Les suggestions s'affichent en temps réel</li>
                    <li>• Cliquez sur "Appliquer" pour les suggestions auto-applicables</li>
                    <li>• Le score de qualité indique la complétude du formulaire</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                  <h4 className="font-medium text-blue-800 mb-2">Types de suggestions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span><strong>Erreurs:</strong> Champs obligatoires manquants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span><strong>Avertissements:</strong> Valeurs potentiellement problématiques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-500" />
                      <span><strong>Améliorations:</strong> Suggestions d'optimisation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span><strong>IA:</strong> Recommandations basées sur l'analyse prédictive</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeForm}
            disabled={isAnalyzing}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ré-analyser
          </Button>
          {validation && !validation.isValid && (
            <Button size="sm" className="flex-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Corriger automatiquement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartFormAssistant;