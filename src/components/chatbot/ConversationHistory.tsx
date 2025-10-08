'use client';

/**
 * Panneau d'historique des conversations
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { chatbotService, Conversation } from '@/lib/api/services/chatbot';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ConversationHistoryProps {
  onSelectConversation: (conversationId: number) => void;
  currentConversationId: number | null;
}

export default function ConversationHistory({
  onSelectConversation,
  currentConversationId,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await chatbotService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Supprimer cette conversation ?')) return;

    try {
      await chatbotService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: 'Conversation supprimée',
        description: 'La conversation a été supprimée avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la conversation.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Historique</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Aucune conversation</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                currentConversationId === conversation.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {conversation.title}
                  </h4>
                  {conversation.last_message_preview && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                      {conversation.last_message_preview.content}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(conversation.updated_at)}
                    </span>
                    <span>{conversation.message_count} messages</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Nouvelle conversation */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={() => onSelectConversation(0)} // 0 = nouvelle conversation
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>
    </div>
  );
}
