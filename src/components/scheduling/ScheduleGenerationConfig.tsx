// src/components/scheduling/ScheduleGenerationConfig.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Trash2,
  Plus,
  Settings,
  Play,
  Eye,
  CheckCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ScheduleGenerationConfigProps {
  scheduleId: number;
  onConfigSaved?: () => void;
}

interface ConfigData {
  id?: number;
  schedule: number;
  start_date: string;
  end_date: string;
  recurrence_type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  flexibility_level: 'rigid' | 'balanced' | 'flexible';
  allow_conflicts: boolean;
  max_sessions_per_day: number;
  respect_teacher_preferences: boolean;
  respect_room_preferences: boolean;
  optimization_priority: 'teacher' | 'room' | 'balanced';
  excluded_dates: string[];
  special_weeks: SpecialWeek[];
}

interface SpecialWeek {
  start_date: string;
  end_date: string;
  type: string;
  suspend_regular_classes: boolean;
}

const ScheduleGenerationConfig: React.FC<ScheduleGenerationConfigProps> = ({
  scheduleId,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<ConfigData>({
    schedule: scheduleId,
    start_date: '',
    end_date: '',
    recurrence_type: 'weekly',
    flexibility_level: 'balanced',
    allow_conflicts: false,
    max_sessions_per_day: 4,
    respect_teacher_preferences: true,
    respect_room_preferences: true,
    optimization_priority: 'balanced',
    excluded_dates: [],
    special_weeks: [],
  });

  const [newExcludedDate, setNewExcludedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, [scheduleId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/schedules/generation-configs/?schedule=${scheduleId}`);
      if (response.data.results && response.data.results.length > 0) {
        setConfig(response.data.results[0]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement de la config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (config.id) {
        await axios.put(`/api/schedules/generation-configs/${config.id}/`, config);
        setSuccess('Configuration mise à jour avec succès');
      } else {
        await axios.post('/api/schedules/generation-configs/', config);
        setSuccess('Configuration créée avec succès');
      }

      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (previewMode: boolean = false) => {
    try {
      setGenerating(true);
      setError(null);
      setGenerationResult(null);

      const response = await axios.post('/api/schedules/generation/generate/', {
        schedule_id: scheduleId,
        preview_mode: previewMode,
        force_regenerate: false,
        preserve_modifications: true,
      });

      setGenerationResult(response.data);

      if (!previewMode && response.data.success) {
        setSuccess(`${response.data.occurrences_created} occurrences générées avec succès !`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const addExcludedDate = () => {
    if (newExcludedDate && !config.excluded_dates.includes(newExcludedDate)) {
      setConfig({
        ...config,
        excluded_dates: [...config.excluded_dates, newExcludedDate],
      });
      setNewExcludedDate('');
    }
  };

  const removeExcludedDate = (date: string) => {
    setConfig({
      ...config,
      excluded_dates: config.excluded_dates.filter((d) => d !== date),
    });
  };

  if (loading && !config.start_date) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Configuration de génération</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="relative">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {success && (
          <Alert className="relative bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={() => setSuccess(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Période */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Période de génération</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date de début</label>
              <Input
                type="date"
                value={config.start_date}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    start_date: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date de fin</label>
              <Input
                type="date"
                value={config.end_date}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    end_date: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Récurrence */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Paramètres de récurrence</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de récurrence</label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'weekly', label: 'Hebdomadaire' },
                { value: 'biweekly', label: 'Bihebdomadaire' },
                { value: 'monthly', label: 'Mensuel' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrence_type"
                    value={option.value}
                    checked={config.recurrence_type === option.value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        recurrence_type: e.target.value as any,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Flexibilité */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Niveau de flexibilité</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'rigid', label: 'Rigide (respect strict)' },
              { value: 'balanced', label: 'Équilibré' },
              { value: 'flexible', label: 'Flexible (optimisation max)' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="flexibility_level"
                  value={option.value}
                  checked={config.flexibility_level === option.value}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      flexibility_level: e.target.value as any,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contraintes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contraintes et préférences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Max sessions par jour</label>
              <Input
                type="number"
                value={config.max_sessions_per_day}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    max_sessions_per_day: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priorité d&apos;optimisation</label>
              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  { value: 'teacher', label: 'Enseignant' },
                  { value: 'room', label: 'Salle' },
                  { value: 'balanced', label: 'Équilibré' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="optimization_priority"
                      value={option.value}
                      checked={config.optimization_priority === option.value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          optimization_priority: e.target.value as any,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={config.respect_teacher_preferences}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    respect_teacher_preferences: checked === true,
                  })
                }
              />
              <span className="text-sm">Respecter les préférences des enseignants</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={config.respect_room_preferences}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    respect_room_preferences: checked === true,
                  })
                }
              />
              <span className="text-sm">Respecter les préférences de salles</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={config.allow_conflicts}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    allow_conflicts: checked === true,
                  })
                }
              />
              <span className="text-sm">Autoriser les conflits (non recommandé)</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Jours exclus */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Jours fériés / exclus</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <Input
                type="date"
                value={newExcludedDate}
                onChange={(e) => setNewExcludedDate(e.target.value)}
                placeholder="Ajouter une date à exclure"
              />
            </div>
            <div className="md:col-span-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={addExcludedDate}
                disabled={!newExcludedDate}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {config.excluded_dates.map((date) => (
              <Badge key={date} variant="secondary" className="gap-2">
                {new Date(date).toLocaleDateString('fr-FR')}
                <button
                  onClick={() => removeExcludedDate(date)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSaveConfig}
            disabled={loading}
            loading={loading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {config.id ? 'Mettre à jour' : 'Sauvegarder'} la configuration
          </Button>

          <Button
            variant="outline"
            onClick={() => handleGenerate(true)}
            disabled={generating || !config.start_date || !config.end_date}
            loading={generating}
          >
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>

          <Button
            variant="default"
            onClick={() => handleGenerate(false)}
            disabled={generating || !config.start_date || !config.end_date}
            loading={generating}
          >
            <Play className="mr-2 h-4 w-4" />
            Générer l&apos;emploi du temps
          </Button>
        </div>

        {/* Résultat de génération */}
        {generationResult && (
          <Alert
            variant={generationResult.success ? 'default' : 'destructive'}
            className={generationResult.success ? 'bg-green-50 text-green-900 border-green-200' : ''}
          >
            <AlertDescription>
              <h4 className="font-semibold mb-2">{generationResult.message}</h4>
              {generationResult.success && (
                <div className="space-y-1 text-sm">
                  <p>Occurrences créées: {generationResult.occurrences_created}</p>
                  <p>Conflits détectés: {generationResult.conflicts_detected}</p>
                  <p>
                    Temps de génération: {generationResult.generation_time?.toFixed(2)}s
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleGenerationConfig;
