// src/lib/api/services/settings.ts
import { apiClient } from '../client';

export interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    avatar: string;
    department: string;
    position: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    scheduleChanges: boolean;
    deadlineReminders: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAlerts: boolean;
    deviceManagement: boolean;
  };
  appearance: {
    theme: string;
    colorScheme: string;
    fontSize: string;
    compactMode: boolean;
    showAnimations: boolean;
    language: string;
  };
  system: {
    autoSave: boolean;
    backupFrequency: string;
    cacheSize: string;
    debugMode: boolean;
    analyticsEnabled: boolean;
    performanceMode: boolean;
  };
}

export const settingsService = {
  // Récupérer tous les paramètres utilisateur
  async getUserSettings(): Promise<UserSettings> {
    // TODO: Implémenter l'endpoint backend /users/settings/
    // Pour l'instant, utiliser les paramètres par défaut
    return this.getDefaultSettings();

    /* Décommenter quand le backend sera prêt:
    try {
      return await apiClient.get('/users/settings/');
    } catch (error) {
      // Fallback sur les paramètres par défaut
      return this.getDefaultSettings();
    }
    */
  },

  // Sauvegarder les paramètres utilisateur
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    // TODO: Implémenter l'endpoint backend /users/settings/
    console.log('⚠️ Sauvegarde locale uniquement (backend non implémenté)');
    const currentSettings = this.loadFromLocalStorage() || this.getDefaultSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    this.saveToLocalStorage(updatedSettings);
    return updatedSettings;

    /* Décommenter quand le backend sera prêt:
    return apiClient.patch('/users/settings/', settings);
    */
  },

  // Sauvegarder une section spécifique
  async updateSettingsSection(section: keyof UserSettings, data: any): Promise<UserSettings> {
    // TODO: Implémenter l'endpoint backend /users/settings/
    console.log('⚠️ Sauvegarde locale uniquement (backend non implémenté)');
    const currentSettings = this.loadFromLocalStorage() || this.getDefaultSettings();
    const updatedSettings = { ...currentSettings, [section]: data };
    this.saveToLocalStorage(updatedSettings);
    return updatedSettings;

    /* Décommenter quand le backend sera prêt:
    return apiClient.patch('/users/settings/', { [section]: data });
    */
  },

  // Réinitialiser aux paramètres par défaut
  async resetToDefault(section?: keyof UserSettings): Promise<UserSettings> {
    // TODO: Implémenter l'endpoint backend /users/settings/reset/
    console.log('⚠️ Réinitialisation locale uniquement (backend non implémenté)');
    const defaultSettings = this.getDefaultSettings();
    if (section) {
      const currentSettings = this.loadFromLocalStorage() || defaultSettings;
      const updatedSettings = { ...currentSettings, [section]: defaultSettings[section] };
      this.saveToLocalStorage(updatedSettings);
      return updatedSettings;
    }
    this.saveToLocalStorage(defaultSettings);
    return defaultSettings;

    /* Décommenter quand le backend sera prêt:
    if (section) {
      return apiClient.post(`/users/settings/reset/${section}/`);
    }
    return apiClient.post('/users/settings/reset/');
    */
  },

  // Exporter les paramètres
  async exportSettings(): Promise<Blob> {
    // TODO: Implémenter l'endpoint backend /users/settings/export/
    console.log('⚠️ Export local uniquement (backend non implémenté)');
    const settings = this.loadFromLocalStorage() || this.getDefaultSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    return blob;

    /* Décommenter quand le backend sera prêt:
    const response = await apiClient.get('/users/settings/export/', {
      responseType: 'blob'
    });
    return response as Blob;
    */
  },

  // Importer les paramètres
  async importSettings(file: File): Promise<UserSettings> {
    // TODO: Implémenter l'endpoint backend /users/settings/import/
    console.log('⚠️ Import local uniquement (backend non implémenté)');
    const text = await file.text();
    const settings = JSON.parse(text) as UserSettings;
    this.saveToLocalStorage(settings);
    return settings;

    /* Décommenter quand le backend sera prêt:
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/settings/import/', formData);
    */
  },

  // Paramètres par défaut
  getDefaultSettings(): UserSettings {
    return {
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        avatar: '',
        department: '',
        position: '',
        language: 'fr'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        scheduleChanges: true,
        deadlineReminders: true,
        systemUpdates: false,
        weeklyDigest: true
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAlerts: true,
        deviceManagement: true
      },
      appearance: {
        theme: 'light',
        colorScheme: 'blue',
        fontSize: 'medium',
        compactMode: false,
        showAnimations: true,
        language: 'fr'
      },
      system: {
        autoSave: true,
        backupFrequency: 'daily',
        cacheSize: '500MB',
        debugMode: false,
        analyticsEnabled: true,
        performanceMode: false
      }
    };
  },

  // Valider les paramètres
  validateSettings(settings: Partial<UserSettings>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.profile?.email && !this.isValidEmail(settings.profile.email)) {
      errors.push('Email invalide');
    }

    if (settings.profile?.phone && !this.isValidPhone(settings.profile.phone)) {
      errors.push('Numéro de téléphone invalide');
    }

    if (settings.security?.sessionTimeout && 
        (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480)) {
      errors.push('Délai d\'expiration de session invalide (5-480 minutes)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Utilitaires de validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Gestion du cache local
  saveToLocalStorage(settings: UserSettings): void {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Impossible de sauvegarder les paramètres en local:', error);
    }
  },

  loadFromLocalStorage(): UserSettings | null {
    try {
      const stored = localStorage.getItem('userSettings');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Impossible de charger les paramètres locaux:', error);
      return null;
    }
  },

  clearLocalStorage(): void {
    try {
      localStorage.removeItem('userSettings');
    } catch (error) {
      console.warn('Impossible de vider le cache des paramètres:', error);
    }
  },

  // Synchronisation offline/online
  async syncSettings(): Promise<UserSettings> {
    const localSettings = this.loadFromLocalStorage();
    if (localSettings) {
      try {
        // Essayer de synchroniser avec le serveur
        return await this.updateUserSettings(localSettings);
      } catch (error) {
        console.warn('Synchronisation impossible, utilisation des paramètres locaux');
        return localSettings;
      }
    }
    return this.getUserSettings();
  }
};