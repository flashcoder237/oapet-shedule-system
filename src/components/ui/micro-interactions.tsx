// src/components/ui/micro-interactions.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MicroButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const MicroButton: React.FC<MicroButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  onClick,
  className = '',
  disabled = false
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const buttonVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98, y: 0 }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'accent':
        return 'btn-accent';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm';
      case 'medium':
        return 'px-4 py-2 text-base';
      case 'large':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        inline-flex items-center gap-2 
        rounded-lg font-medium 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {Icon && (
        <motion.div
          animate={{ rotate: isPressed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
        </motion.div>
      )}
      {children}
    </motion.button>
  );
};

interface MicroCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'flat';
}

export const MicroCard: React.FC<MicroCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  variant = 'default'
}) => {
  const cardVariants = {
    idle: { y: 0, boxShadow: 'var(--shadow-sm)' },
    hover: { 
      y: -4, 
      boxShadow: 'var(--shadow-lg)',
      transition: { duration: 0.2 }
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'card-elevated';
      case 'flat':
        return 'bg-transparent border-0 shadow-none';
      default:
        return 'card';
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover={hover ? "hover" : "idle"}
      onClick={onClick}
      className={`
        ${getVariantClasses()}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

interface FloatingButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  tooltip?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon: Icon,
  onClick,
  tooltip,
  color = 'var(--primary)',
  size = 'medium',
  position = 'bottom-right'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const buttonVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 15 },
    tap: { scale: 0.9, rotate: 0 }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'top-right':
        return 'fixed top-6 right-6';
      case 'top-left':
        return 'fixed top-6 left-6';
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12';
      case 'medium':
        return 'w-14 h-14';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  return (
    <div className={getPositionClasses()}>
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          ${getSizeClasses()}
          rounded-full
          text-white
          shadow-lg
          border-2 border-white/20
          backdrop-blur-sm
          z-50
        `}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
        }}
      >
        <Icon size={getIconSize()} />
      </motion.button>

      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3"
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
              {tooltip}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-y-4 border-y-transparent"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface PulseIndicatorProps {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  color = 'var(--primary)',
  size = 'medium',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-2 h-2';
      case 'medium':
        return 'w-3 h-3';
      case 'large':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`${getSizeClasses()} rounded-full`}
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`absolute inset-0 ${getSizeClasses()} rounded-full`}
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />
    </div>
  );
};

interface LoadingDotsProps {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  color = 'var(--primary)',
  size = 'medium',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-1 h-1';
      case 'medium':
        return 'w-2 h-2';
      case 'large':
        return 'w-3 h-3';
      default:
        return 'w-2 h-2';
    }
  };

  const getGapClasses = () => {
    switch (size) {
      case 'small':
        return 'gap-1';
      case 'medium':
        return 'gap-1.5';
      case 'large':
        return 'gap-2';
      default:
        return 'gap-1.5';
    }
  };

  return (
    <div className={`flex items-center ${getGapClasses()} ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${getSizeClasses()} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
};

export { motion, AnimatePresence };