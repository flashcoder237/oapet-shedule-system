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
    const response = await apiClient.post<SendMessageResponse>('/chatbot/send/', data);
    return response.data;
  },

  /**
   * Récupère toutes les conversations de l'utilisateur
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/chatbot/conversations/');
    return response.data;
  },

  /**
   * Récupère une conversation spécifique
   */
  async getConversation(id: number): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(`/chatbot/conversations/${id}/`);
    return response.data;
  },

  /**
   * Récupère la conversation active
   */
  async getActiveConversation(): Promise<Conversation | null> {
    try {
      const response = await apiClient.get<Conversation>('/chatbot/active/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Crée une nouvelle conversation
   */
  async createConversation(title?: string): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/chatbot/conversations/', {
      title: title || `Conversation du ${new Date().toLocaleDateString('fr-FR')}`,
    });
    return response.data;
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
    const response = await apiClient.get<ChatbotAnalytics>('/chatbot/analytics/');
    return response.data;
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
