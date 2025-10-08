'use client';

/**
 * Panneau d'analytics pour le chatbot
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  MessageSquare,
  TrendingUp,
  Star,
  Clock,
  Target,
} from 'lucide-react';
import { chatbotService } from '@/lib/api/services/chatbot';

interface ChatbotAnalyticsProps {
  conversationId?: number;
}

export default function ChatbotAnalytics({ conversationId }: ChatbotAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [conversationId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await chatbotService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const stats = [
    {
      icon: MessageSquare,
      label: 'Conversations totales',
      value: analytics.total_conversations,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Messages envoyés',
      value: analytics.total_messages,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Clock,
      label: 'Cette semaine',
      value: analytics.recent_conversations,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: Star,
      label: 'Satisfaction',
      value: `${analytics.average_rating}/5`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Analytics du Chatbot
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Statistiques d'utilisation et performances
          </p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Top intentions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Questions les plus fréquentes
          </h3>
        </div>

        {analytics.top_intents && analytics.top_intents.length > 0 ? (
          <div className="space-y-3">
            {analytics.top_intents.map((intent: any, index: number) => {
              const total = analytics.total_messages;
              const percentage = total > 0 ? (intent.count / total) * 100 : 0;

              return (
                <div key={intent.intent}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {intent.intent}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {intent.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de données d'intention
          </p>
        )}
      </div>

      {/* Graphique de satisfaction */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Taux de satisfaction
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-end gap-1 h-32">
              {[1, 2, 3, 4, 5].map((rating) => {
                const height = rating === Math.round(analytics.average_rating) ? 100 : (rating / 5) * 60;
                return (
                  <div
                    key={rating}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: rating * 0.1 }}
                      className={`w-full rounded-t ${
                        rating === Math.round(analytics.average_rating)
                          ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {rating}★
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">
              {analytics.average_rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              sur 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Conseils d'amélioration */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          💡 Conseils d'amélioration
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {analytics.average_rating < 4 && (
            <li>• Le taux de satisfaction peut être amélioré. Enrichissez la base de connaissances.</li>
          )}
          {analytics.total_conversations < 10 && (
            <li>• Encouragez les utilisateurs à utiliser le chatbot pour obtenir plus de données.</li>
          )}
          {analytics.top_intents.length > 0 && (
            <li>
              • Focus sur l'intention "{analytics.top_intents[0].intent}" qui représente la majorité des questions.
            </li>
          )}
          <li>• Continuez à analyser les feedbacks pour améliorer les réponses.</li>
        </ul>
      </div>
    </div>
  );
}
