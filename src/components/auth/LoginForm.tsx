// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(credentials);
      onSuccess?.();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-secondary/20 relative overflow-hidden p-4" suppressHydrationWarning>
      {/* Fond animé avec formes géométriques */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cercles flottants */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(139, 195, 74, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255, 152, 0, 0.12) 0%, transparent 70%)',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Vagues décoratives */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Carte principale avec effet glassmorphism */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Barre décorative supérieure */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient" />
          
          <div className="p-8 sm:p-10">
            {/* Header avec icône améliorée */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  type: "spring", 
                  stiffness: 200,
                  damping: 12
                }}
                className="relative w-24 h-24 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-lg">
                  <LogIn className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-accent" />
                </motion.div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3"
              >
                Bienvenue
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-sm"
              >
                Connectez-vous pour accéder au système de gestion
              </motion.p>
            </div>

            {/* Message d'erreur amélioré */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Formulaire avec design amélioré */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                    placeholder="Entrez votre identifiant"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                    placeholder="Entrez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-all hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group mt-8"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Se connecter</span>
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </div>

          {/* Footer décoratif */}
          <div className="px-8 pb-8 pt-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300" />
              <span>Système sécurisé</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300" />
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}