'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lightbulb, 
  Star,
  CheckCircle,
  Users,
  BookOpen,
  Calendar,
  Settings,
  RefreshCw,
  Brain,
  Target,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePersonalizedRecommendations } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';

interface PersonalizedRecommendationsProps {
  defaultUserType?: 'student' | 'teacher' | 'admin';
  userPreferences?: any;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PersonalizedRecommendations({ 
  defaultUserType = 'student',
  userPreferences,
  autoRefresh = false, 
  refreshInterval = 300000 // 5 minutes
}: PersonalizedRecommendationsProps) {
  const { data, loading, error, getRecommendations } = usePersonalizedRecommendations();
  const { addToast } = useToast();
  const [userType, setUserType] = useState<'student' | 'teacher' | 'admin'>(defaultUserType);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Génération initiale
    handleGetRecommendations();

    // Auto-refresh si activé
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleGetRecommendations(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [userType, autoRefresh, refreshInterval]);

  const handleGetRecommendations = async (isAutoRefresh = false) => {
    try {
      await getRecommendations({
        type: userType,
        preferences: userPreferences
      });
      setLastUpdate(new Date());
      
      if (!isAutoRefresh) {
        addToast({
          title: "Recommandations générées",
          description: `Recommandations personnalisées pour ${userType}`,
          variant: "default"
        });
      }
    } catch (error) {
      addToast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return <Users className="w-5 h-5" />;
      case 'admin':
        return <Settings className="w-5 h-5" />;
      case 'student':
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'teacher':
        return 'text-blue-600 bg-blue-50';
      case 'admin':
        return 'text-purple-600 bg-purple-50';
      case 'student':
      default:
        return 'text-emerald-600 bg-emerald-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schedule_optimization':
      case 'global_optimization':
        return <Calendar className="w-4 h-4" />;
      case 'room_preferences':
      case 'resource_management':
        return <Settings className="w-4 h-4" />;
      case 'workload_balance':
      case 'performance_metrics':
        return <TrendingUp className="w-4 h-4" />;
      case 'schedule_preferences':
      case 'study_optimization':
        return <Target className="w-4 h-4" />;
      case 'social_learning':
        return <Users className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading && !data) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary animate-pulse" />
            Recommandations personnalisées IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Génération en cours...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="border-2 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-destructive" />
            Erreur de recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => handleGetRecommendations()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                Recommandations IA personnalisées
                <Brain className="w-5 h-5 text-primary" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Score de personnalisation: {data ? Math.round(data.personalization_score * 100) : 0}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGetRecommendations()}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sélecteur de type d'utilisateur */}
        <div className="bg-muted/50 rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Type d'utilisateur
          </label>
          <Select value={userType} onValueChange={(value: 'student' | 'teacher' | 'admin') => setUserType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Étudiant
                </div>
              </SelectItem>
              <SelectItem value="teacher">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Enseignant
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Administrateur
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Score de personnalisation */}
        {data && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">Score de personnalisation</h4>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getUserTypeColor(data.user_type)}`}>
                <Award className="w-4 h-4" />
                <span className="font-bold">{Math.round(data.personalization_score * 100)}%</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${data.personalization_score * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Recommandations par catégorie */}
        {data && Object.keys(data.recommendations).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommandations pour {data.user_type}
            </h4>
            
            <AnimatePresence>
              {Object.entries(data.recommendations).map(([category, recommendations]: [string, any], index: number) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/50 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getUserTypeColor(data.user_type)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    <h5 className="font-medium text-foreground capitalize">
                      {category.replace(/_/g, ' ')}
                    </h5>
                    <Badge variant="outline" className="text-xs">
                      {Array.isArray(recommendations) ? recommendations.length : 0} conseils
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {Array.isArray(recommendations) ? recommendations.map((recommendation: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
                      >
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{recommendation}</span>
                      </motion.div>
                    )) : (
                      <div className="text-sm text-muted-foreground">
                        Aucune recommandation disponible
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Message si pas de recommandations */}
        {data && Object.keys(data.recommendations).length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Lightbulb className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-800 mb-2">Aucune recommandation</h4>
            <p className="text-blue-600 text-sm">
              L'IA n'a pas trouvé de recommandations spécifiques pour le moment
            </p>
          </div>
        )}

        {/* Métadonnées */}
        {data && (
          <div className="text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center justify-between">
              <span>Généré le {new Date(data.generated_at).toLocaleString()}</span>
              <span>IA: {data.model_used}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}