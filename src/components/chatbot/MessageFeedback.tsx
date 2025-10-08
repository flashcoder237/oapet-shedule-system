'use client';

/**
 * Composant de feedback pour les messages du chatbot
 */
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { chatbotService } from '@/lib/api/services/chatbot';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface MessageFeedbackProps {
  messageId: number;
  initialRating?: number;
}

export default function MessageFeedback({ messageId, initialRating }: MessageFeedbackProps) {
  const [rating, setRating] = useState<number | null>(initialRating || null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRating = async (newRating: number) => {
    if (rating === newRating) return; // Déjà noté

    setRating(newRating);
    setIsSubmitting(true);

    try {
      await chatbotService.sendFeedback(messageId, newRating, comment);
      toast({
        title: 'Merci pour votre feedback !',
        description: 'Votre avis nous aide à améliorer le chatbot.',
      });

      // Afficher le champ commentaire pour les notes basses
      if (newRating <= 3) {
        setShowComment(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre feedback.',
        variant: 'destructive',
      });
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !rating) return;

    setIsSubmitting(true);
    try {
      await chatbotService.sendFeedback(messageId, rating, comment);
      toast({
        title: 'Commentaire envoyé',
        description: 'Merci pour votre retour détaillé !',
      });
      setShowComment(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le commentaire.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Notation par étoiles */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRating(star)}
            disabled={isSubmitting}
            className={`p-1 rounded transition-colors ${
              rating && star <= rating
                ? 'text-yellow-500'
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
            }`}
          >
            <Star
              className="w-4 h-4"
              fill={rating && star <= rating ? 'currentColor' : 'none'}
            />
          </motion.button>
        ))}
      </div>

      {/* Boutons Utile/Pas utile (alternative) */}
      {!rating && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Cette réponse est-elle utile ?</span>
          <button
            onClick={() => handleRating(5)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600"
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Oui</span>
          </button>
          <button
            onClick={() => handleRating(2)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600"
          >
            <ThumbsDown className="w-3 h-3" />
            <span>Non</span>
          </button>
        </div>
      )}

      {/* Champ de commentaire pour les notes basses */}
      {showComment && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment pouvons-nous améliorer cette réponse ?"
            className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            rows={3}
          />
          <button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !comment.trim()}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
