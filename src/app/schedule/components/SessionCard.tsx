'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  MoreVertical,
  GripVertical,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { ScheduleSession } from '@/types/api';

type EditMode = 'view' | 'edit' | 'drag';

interface SessionCardProps {
  session: ScheduleSession;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onEdit: (session: ScheduleSession) => void;
  onDelete: (sessionId: number) => void;
  onDuplicate: (session: ScheduleSession) => void;
  editMode: EditMode;
  hasConflict?: boolean;
}

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

export function SessionCard({ 
  session, 
  isDragging, 
  onDragStart, 
  onDragEnd,
  onEdit,
  onDelete,
  onDuplicate,
  editMode,
  hasConflict
}: SessionCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'CM': return 'bg-blue-100 border-l-4 border-l-blue-500 text-blue-900';
      case 'TD': return 'bg-green-100 border-l-4 border-l-green-500 text-green-900';
      case 'TP': return 'bg-purple-100 border-l-4 border-l-purple-500 text-purple-900';
      case 'EXAM': return 'bg-red-100 border-l-4 border-l-red-500 text-red-900';
      default: return 'bg-gray-100 border-l-4 border-l-gray-500 text-gray-900';
    }
  };

  const getConflictOverlay = () => {
    if (!hasConflict) return '';
    return 'ring-2 ring-red-500 ring-opacity-60 bg-red-50 bg-opacity-50';
  };

  return (
    <div
      className={`
        relative p-2 rounded-lg shadow-sm cursor-pointer w-full h-full border-l-4
        ${getSessionTypeColor(session.session_type)}
        ${getConflictOverlay()}
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
        ${editMode === 'edit' || editMode === 'drag' ? 'cursor-move hover:shadow-lg hover:scale-102' : ''}
        transition-all duration-200
      `}
      draggable={editMode === 'edit' || editMode === 'drag'}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {(editMode === 'edit' || editMode === 'drag') && (
        <GripVertical className="absolute left-1 top-1 w-3 h-3 opacity-50" />
      )}

      <div className="flex flex-col h-full overflow-visible">
        <div
          className="font-bold text-sm break-words"
          title={session.course_details?.code}
        >
          {session.course_details?.code}
          {hasConflict && <span className="text-red-600 ml-1">⚠</span>}
        </div>

        <div
          className="text-xs opacity-90 break-words mt-1 line-clamp-2"
          title={session.course_details?.name}
        >
          {session.course_details?.name}
        </div>
        
        <div className="text-xs space-y-0.5 opacity-80 mt-auto">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {session.specific_start_time?.slice(0, 5)} - {session.specific_end_time?.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{session.room_details?.code}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span
              className="truncate"
              title={session.teacher_details?.user_details?.last_name}
            >
              {session.teacher_details?.user_details?.last_name}
            </span>
          </div>
        </div>

        {hasConflict && (
          <div className="flex items-center gap-1 mt-1 text-red-600 bg-red-100 px-1 py-0.5 rounded animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-medium">Conflit!</span>
          </div>
        )}
      </div>

      {/* Menu contextuel */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-border z-50"
          >
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
                setShowMenu(false);
              }}
            >
              <Edit className="w-3 h-3" />
              Modifier
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(session);
                setShowMenu(false);
              }}
            >
              <Copy className="w-3 h-3" />
              Dupliquer
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
                setShowMenu(false);
              }}
            >
              <Trash2 className="w-3 h-3" />
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}