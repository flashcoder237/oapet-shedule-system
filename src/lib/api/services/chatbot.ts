/**
 * Service API pour le chatbot
 */
import { apiClient } from '../client';

export interface Message {
  id: number;
  conversation: number;
  sender: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  context_data?: any;
  has_attachments?: boolean;
  attachments?: any[];
}

export interface Conversation {
  id: number;
  user: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages?: Message[];
  message_count?: number;
  last_message?: {
    content: string;
    sender: string;
    timestamp: string;
  };
}

export interface SendMessageRequest {
  message: string;
  conversation_id?: number;
}

export interface SendMessageResponse {
  conversation_id: number;
  user_message: Message;
  bot_response: Message;
}

export interface ChatbotAnalytics {
  total_conversations: number;
  total_messages: number;
  recent_conversations: number;
  top_intents: Array<{ intent: string; count: number }>;
  average_rating: number;
}

export const chatbotService = {
  /**
   * Envoie un message au chatbot
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return await apiClient.post<SendMessageResponse>('/chatbot/send/', data);
  },

  /**
   * Récupère toutes les conversations de l'utilisateur
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<any>('/chatbot/conversations/');
    // L'API retourne un objet paginé avec results
    return response.results || response || [];
  },

  /**
   * Récupère une conversation spécifique
   */
  async getConversation(id: number): Promise<Conversation> {
    return await apiClient.get<Conversation>(`/chatbot/conversations/${id}/`);
  },

  /**
   * Récupère la conversation active
   */
  async getActiveConversation(): Promise<Conversation | null> {
    try {
      return await apiClient.get<Conversation>('/chatbot/active/');
    } catch (error: any) {
      // Si pas de conversation active, retourner null
      if (error.message?.includes('No active conversation') ||
          error.message?.includes('404') ||
          error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Crée une nouvelle conversation
   */
  async createConversation(title?: string): Promise<Conversation> {
    return await apiClient.post<Conversation>('/chatbot/conversations/', {
      title: title || `Conversation du ${new Date().toLocaleDateString('fr-FR')}`,
    });
  },

  /**
   * Archive une conversation
   */
  async archiveConversation(id: number): Promise<void> {
    await apiClient.post(`/chatbot/conversations/${id}/archive/`);
  },

  /**
   * Restaure une conversation
   */
  async restoreConversation(id: number): Promise<void> {
    await apiClient.post(`/chatbot/conversations/${id}/restore/`);
  },

  /**
   * Supprime une conversation
   */
  async deleteConversation(id: number): Promise<void> {
    await apiClient.post('/chatbot/clear/', { conversation_id: id });
  },

  /**
   * Supprime toutes les conversations
   */
  async clearHistory(): Promise<void> {
    await apiClient.post('/chatbot/clear/', {});
  },

  /**
   * Récupère les statistiques du chatbot
   */
  async getAnalytics(): Promise<ChatbotAnalytics> {
    return await apiClient.get<ChatbotAnalytics>('/chatbot/analytics/');
  },

  /**
   * Envoie un feedback sur une réponse
   */
  async sendFeedback(messageId: number, rating: number, comment?: string): Promise<void> {
    await apiClient.post('/chatbot/feedback/', {
      message: messageId,
      rating,
      comment,
    });
  },
};
