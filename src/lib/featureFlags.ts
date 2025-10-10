// src/lib/featureFlags.ts

/**
 * Système de feature flags pour la migration progressive vers le nouveau système d'occurrences
 */

export const FEATURE_FLAGS = {
  /**
   * Active le nouveau système d'occurrences au lieu de l'ancien système de sessions
   *
   * false = Ancien système (sessions répétitives)
   * true = Nouveau système (occurrences avec dates spécifiques)
   *
   * Pour activer : Définir NEXT_PUBLIC_USE_OCCURRENCES_SYSTEM=true dans .env.local
   */
  USE_OCCURRENCES_SYSTEM:
    process.env.NEXT_PUBLIC_USE_OCCURRENCES_SYSTEM === 'true',

  /**
   * Active l'optimisation ML lors de la génération d'emploi du temps
   */
  USE_ML_OPTIMIZATION:
    process.env.NEXT_PUBLIC_USE_ML_OPTIMIZATION !== 'false', // Activé par défaut

  /**
   * Affiche les indicateurs de modification sur les occurrences
   */
  SHOW_MODIFICATION_BADGES:
    process.env.NEXT_PUBLIC_SHOW_MODIFICATION_BADGES !== 'false', // Activé par défaut

  /**
   * Active le mode debug avec logs supplémentaires
   */
  DEBUG_MODE:
    process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
} as const;

/**
 * Hook pour vérifier si une feature est activée
 */
export const useFeatureFlag = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Fonction pour logger les messages de debug uniquement si DEBUG_MODE est activé
 */
export const debugLog = (message: string, ...args: any[]) => {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

/**
 * Fonction pour obtenir le système actif
 */
export const getActiveSystem = (): 'occurrences' | 'sessions' => {
  return FEATURE_FLAGS.USE_OCCURRENCES_SYSTEM ? 'occurrences' : 'sessions';
};

export default FEATURE_FLAGS;
