// src/components/ui/nature-elements.tsx
'use client';

import { motion } from 'framer-motion';
import { Leaf, TreePine, Flower, Sun } from 'lucide-react';

interface LeafDecoratorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LeafDecorator = ({ className = '', size = 'md' }: LeafDecoratorProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={`text-primary/20 ${sizeClasses[size]} ${className}`}
      animate={{ 
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Leaf className="w-full h-full" />
    </motion.div>
  );
};

interface OrganicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'leaf' | 'wood' | 'stone';
}

export const OrganicCard = ({ 
  children, 
  className = '', 
  variant = 'leaf' 
}: OrganicCardProps) => {
  const variantClasses = {
    leaf: 'bg-gradient-to-br from-primary-subtle to-primary-muted/50 border-primary/10',
    wood: 'bg-gradient-to-br from-accent-subtle to-accent-muted/50 border-accent/10',
    stone: 'bg-gradient-to-br from-secondary-muted/20 to-tertiary-muted/20 border-secondary/10'
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-6 ${variantClasses[variant]} ${className}`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(26, 77, 58, 0.1), 0 10px 10px -5px rgba(26, 77, 58, 0.04)"
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
    >
      {/* Motif organique en arrière-plan */}
      <div className="absolute top-2 right-2 opacity-10">
        <LeafDecorator size="lg" />
      </div>
      <div className="absolute bottom-2 left-2 opacity-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <TreePine className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
      
      {children}
    </motion.div>
  );
};

interface GrowthIndicatorProps {
  value: number;
  max?: number;
  label?: string;
}

export const GrowthIndicator = ({ 
  value, 
  max = 100, 
  label = "Croissance" 
}: GrowthIndicatorProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-secondary flex items-center gap-1">
          <Leaf className="w-3 h-3" />
          {label}
        </span>
        <span className="text-sm font-medium text-primary">{Math.round(percentage)}%</span>
      </div>
      
      <div className="h-2 bg-primary-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Effet de brillance */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
            animate={{ translateX: "200%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

interface SeasonalBackgroundProps {
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  className?: string;
}

export const SeasonalBackground = ({ 
  season = 'spring', 
  className = '' 
}: SeasonalBackgroundProps) => {
  const seasonConfigs = {
    spring: {
      colors: 'from-primary-subtle via-accent-subtle to-tertiary-muted/20',
      icons: [Leaf, Flower],
      animation: { duration: 6, ease: "easeInOut" }
    },
    summer: {
      colors: 'from-accent-subtle via-tertiary-muted/30 to-primary-subtle',
      icons: [Sun, Leaf],
      animation: { duration: 4, ease: "linear" }
    },
    autumn: {
      colors: 'from-accent-muted via-accent-subtle to-primary-muted',
      icons: [Leaf, TreePine],
      animation: { duration: 8, ease: "easeInOut" }
    },
    winter: {
      colors: 'from-tertiary-muted/20 via-secondary-muted/10 to-primary-subtle',
      icons: [TreePine],
      animation: { duration: 10, ease: "easeInOut" }
    }
  };

  const config = seasonConfigs[season];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.colors} opacity-50`}
        animate={{ 
          background: [
            `linear-gradient(45deg, var(--primary-subtle), var(--accent-subtle))`,
            `linear-gradient(135deg, var(--accent-subtle), var(--tertiary-muted))`,
            `linear-gradient(225deg, var(--tertiary-muted), var(--primary-subtle))`,
            `linear-gradient(315deg, var(--primary-subtle), var(--accent-subtle))`
          ]
        }}
        transition={{ 
          duration: config.animation.duration * 2,
          repeat: Infinity,
          ease: config.animation.ease
        }}
      />
      
      {/* Éléments décoratifs flottants */}
      {Array.from({ length: 3 }).map((_, i) => {
        const Icon = config.icons[i % config.icons.length];
        return (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: config.animation.duration + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: config.animation.ease
            }}
          >
            <Icon className="w-8 h-8 text-primary" />
          </motion.div>
        );
      })}
    </div>
  );
};

export const NatureDivider = () => (
  <div className="flex items-center justify-center py-4">
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Leaf className="w-4 h-4 text-primary/40" />
      </motion.div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent w-24" />
      <motion.div
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <Flower className="w-4 h-4 text-accent/40" />
      </motion.div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent w-24" />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <TreePine className="w-4 h-4 text-tertiary/40" />
      </motion.div>
    </motion.div>
  </div>
);