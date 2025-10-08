'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bell, HelpCircle, X, Menu } from 'lucide-react';
import EnhancedChatbotWidget from '@/components/chatbot/EnhancedChatbotWidget';

type ActiveWidget = 'chatbot' | 'notifications' | 'help' | null;

export default function FloatingMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<ActiveWidget>(null);

  const menuItems = [
    {
      id: 'chatbot' as ActiveWidget,
      icon: MessageCircle,
      label: 'Assistant',
      color: 'from-blue-600 to-purple-600',
      hoverColor: 'hover:from-blue-700 hover:to-purple-700',
    },
    {
      id: 'notifications' as ActiveWidget,
      icon: Bell,
      label: 'Notifications',
      color: 'from-orange-600 to-red-600',
      hoverColor: 'hover:from-orange-700 hover:to-red-700',
    },
    {
      id: 'help' as ActiveWidget,
      icon: HelpCircle,
      label: 'Aide',
      color: 'from-green-600 to-teal-600',
      hoverColor: 'hover:from-green-700 hover:to-teal-700',
    },
  ];

  const handleToggleWidget = (widgetId: ActiveWidget) => {
    if (activeWidget === widgetId) {
      setActiveWidget(null);
    } else {
      setActiveWidget(widgetId);
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: -window.innerHeight + 200,
        bottom: 0,
        left: -window.innerWidth + 200,
        right: 0
      }}
      className="fixed bottom-6 right-6 z-50 cursor-move"
    >
      <div className="absolute bottom-20 right-0 mb-4">
        {activeWidget === 'chatbot' && (
          <EnhancedChatbotWidget
            isOpen={true}
            onClose={() => setActiveWidget(null)}
          />
        )}
        {activeWidget === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-[400px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Notifications</h3>
              <button
                onClick={() => setActiveWidget(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Aucune nouvelle notification</p>
          </motion.div>
        )}
        {activeWidget === 'help' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-[400px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Centre d aide</h3>
              <button
                onClick={() => setActiveWidget(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <a href="#" className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                Documentation
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                Tutoriels video
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                Contacter le support
              </a>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2"
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleToggleWidget(item.id)}
                  className={`flex items-center gap-3 bg-gradient-to-r ${item.color} ${item.hoverColor} text-white px-4 py-3 rounded-full shadow-lg transition-all group`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium pr-2">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            if (activeWidget) {
              setActiveWidget(null);
            } else {
              setIsMenuOpen(!isMenuOpen);
            }
          }}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isMenuOpen || activeWidget
              ? 'bg-gray-800 dark:bg-gray-700'
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          } hover:shadow-xl`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen || activeWidget ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-7 h-7 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="w-7 h-7 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {!isMenuOpen && !activeWidget && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            3
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
