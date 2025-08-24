// src/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { settingsService, type UserSettings } from '@/lib/api/services/settings';
import { useToast } from '@/components/ui/use-toast';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Charger les paramètres au montage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Essayer de charger depuis l'API
      const userSettings = await settingsService.getUserSettings();
      setSettings(userSettings);
      
      // Sauvegarder en local
      settingsService.saveToLocalStorage(userSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      
      // Fallback sur les paramètres locaux
      const localSettings = settingsService.loadFromLocalStorage();
      if (localSettings) {
        setSettings(localSettings);
      } else {
        // Utiliser les paramètres par défaut
        const defaultSettings = settingsService.getDefaultSettings();
        setSettings(defaultSettings);
      }
      
      setError('Impossible de charger les paramètres depuis le serveur');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;

    try {
      // Validation avant sauvegarde
      const validation = settingsService.validateSettings(newSettings);
      if (!validation.isValid) {
        addToast({
          title: "Erreur de validation",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const updatedSettings = { ...settings, ...newSettings };
      
      // Sauvegarder en local immédiatement pour une réactivité
      setSettings(updatedSettings);
      settingsService.saveToLocalStorage(updatedSettings);
      
      // Essayer de sauvegarder sur le serveur
      try {
        const savedSettings = await settingsService.updateUserSettings(newSettings);
        setSettings(savedSettings);
        settingsService.saveToLocalStorage(savedSettings);
        
        addToast({
          title: "Succès",
          description: "Paramètres sauvegardés avec succès",
        });
      } catch (apiError) {
        console.warn('Sauvegarde serveur échouée, sauvegarde locale uniquement');
        addToast({
          title: "Attention",
          description: "Paramètres sauvegardés localement. Synchronisation en attente.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    }
  }, [settings, addToast]);

  const updateSection = useCallback(async (section: keyof UserSettings, data: any) => {
    return updateSettings({ [section]: data });
  }, [updateSettings]);

  const resetSection = useCallback(async (section: keyof UserSettings) => {
    if (!settings) return;

    try {
      const defaultSettings = settingsService.getDefaultSettings();
      const resetData = { [section]: defaultSettings[section] };
      await updateSettings(resetData);
      
      addToast({
        title: "Succès",
        description: `Section ${section} réinitialisée avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de réinitialiser les paramètres",
        variant: "destructive",
      });
    }
  }, [settings, updateSettings, addToast]);

  const resetAllSettings = useCallback(async () => {
    try {
      const defaultSettings = settingsService.getDefaultSettings();
      await updateSettings(defaultSettings);
      
      addToast({
        title: "Succès",
        description: "Tous les paramètres ont été réinitialisés",
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation complète:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de réinitialiser tous les paramètres",
        variant: "destructive",
      });
    }
  }, [updateSettings, addToast]);

  const exportSettings = useCallback(async () => {
    try {
      const blob = await settingsService.exportSettings();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oapet-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast({
        title: "Succès",
        description: "Paramètres exportés avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      
      // Fallback sur l'export local
      if (settings) {
        const blob = new Blob([JSON.stringify(settings, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oapet-settings-local-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addToast({
          title: "Succès",
          description: "Paramètres exportés localement",
        });
      }
    }
  }, [settings, addToast]);

  const importSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      // Valider les paramètres importés
      const validation = settingsService.validateSettings(importedSettings);
      if (!validation.isValid) {
        addToast({
          title: "Erreur d'importation",
          description: `Fichier invalide: ${validation.errors.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      await updateSettings(importedSettings);
      
      addToast({
        title: "Succès",
        description: "Paramètres importés avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      addToast({
        title: "Erreur",
        description: "Impossible d'importer les paramètres. Vérifiez le format du fichier.",
        variant: "destructive",
      });
    }
  }, [updateSettings, addToast]);

  const syncSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const syncedSettings = await settingsService.syncSettings();
      setSettings(syncedSettings);
      
      addToast({
        title: "Succès",
        description: "Paramètres synchronisés avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      addToast({
        title: "Erreur",
        description: "Impossible de synchroniser les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Utilitaires pour accéder aux sections spécifiques
  const getProfileSettings = useCallback(() => {
    return settings?.profile || settingsService.getDefaultSettings().profile;
  }, [settings]);

  const getNotificationSettings = useCallback(() => {
    return settings?.notifications || settingsService.getDefaultSettings().notifications;
  }, [settings]);

  const getSecuritySettings = useCallback(() => {
    return settings?.security || settingsService.getDefaultSettings().security;
  }, [settings]);

  const getAppearanceSettings = useCallback(() => {
    return settings?.appearance || settingsService.getDefaultSettings().appearance;
  }, [settings]);

  const getSystemSettings = useCallback(() => {
    return settings?.system || settingsService.getDefaultSettings().system;
  }, [settings]);

  return {
    // État
    settings,
    isLoading,
    error,
    
    // Actions
    loadSettings,
    updateSettings,
    updateSection,
    resetSection,
    resetAllSettings,
    exportSettings,
    importSettings,
    syncSettings,
    
    // Getters pour sections spécifiques
    getProfileSettings,
    getNotificationSettings,
    getSecuritySettings,
    getAppearanceSettings,
    getSystemSettings,
  };
}