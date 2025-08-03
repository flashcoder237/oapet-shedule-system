// src/components/ui/interactive-elements.tsx
'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Heart, Star, ThumbsUp, Share2, Bookmark, Eye } from 'lucide-react';

// Bouton avec effet magnétique
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  strength = 0.2 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// Carte avec effet de parallax
interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function ParallaxCard({ 
  children, 
  className = '', 
  intensity = 15 
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-1, 1], [intensity, -intensity]);
  const rotateY = useTransform(x, [-1, 1], [-intensity, intensity]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const normalizedX = (mouseX / width) * 2 - 1;
    const normalizedY = (mouseY / height) * 2 - 1;
    
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// Indicateur de progression avec animation fluide
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showValue?: boolean;
  animated?: boolean;
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className = '', 
  color = 'bg-primary',
  showValue = true,
  animated = true
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0,
            ease: "easeOut" 
          }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
      </div>
      {showValue && (
        <motion.span
          className="absolute right-0 -top-6 text-xs font-medium text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
}

// Bouton d'action flottant avec ripple effect
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FloatingActionButton({ 
  icon, 
  onClick, 
  className = '',
  size = 'md' 
}: FloatingActionButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleId = useRef(0);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: rippleId.current++, x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
    
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        bg-primary text-white rounded-full
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {icon}
      
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ 
            width: 100, 
            height: 100, 
            opacity: 0 
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
}

// Switch animé avec états visuels
interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedSwitch({ 
  checked, 
  onChange, 
  label, 
  disabled = false,
  size = 'md' 
}: AnimatedSwitchProps) {
  const sizes = {
    sm: { width: 'w-8', height: 'h-4', thumb: 'w-3 h-3' },
    md: { width: 'w-11', height: 'h-6', thumb: 'w-5 h-5' },
    lg: { width: 'w-14', height: 'h-8', thumb: 'w-7 h-7' }
  };

  const currentSize = sizes[size];

  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div
        className={`
          relative ${currentSize.width} ${currentSize.height}
          rounded-full transition-colors duration-200
          ${checked ? 'bg-primary' : 'bg-gray-300'}
          ${disabled ? '' : 'hover:shadow-md'}
        `}
      >
        <motion.div
          className={`
            absolute top-0.5 ${currentSize.thumb}
            bg-white rounded-full shadow-sm
            flex items-center justify-center
          `}
          initial={false}
          animate={{
            x: checked ? `calc(100% + 2px)` : '2px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="w-1 h-1 bg-gray-400 rounded-full"
            animate={{
              scale: checked ? 0 : 1,
              opacity: checked ? 0 : 1
            }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-primary select-none">
          {label}
        </span>
      )}
    </label>
  );
}

// Badge de notification avec animation
interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
  showZero?: boolean;
  max?: number;
  pulse?: boolean;
}

export function NotificationBadge({ 
  count, 
  children, 
  showZero = false, 
  max = 99,
  pulse = true 
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  const shouldShow = count > 0 || showZero;

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              ...(pulse && count > 0 ? {
                scale: [1, 1.2, 1],
                transition: {
                  scale: {
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }
              } : {})
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          >
            {displayCount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Effet de typing pour le texte
interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
}

export function TypingText({ 
  text, 
  speed = 50, 
  className = '',
  cursor = true 
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else if (cursor) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [displayText, text, speed, cursor]);

  return (
    <span className={className}>
      {displayText}
      {cursor && showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

// Hover card avec informations supplémentaires
interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function HoverCard({ 
  trigger, 
  content, 
  side = 'top',
  delay = 200 
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  const sideClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${sideClasses[side]}`}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}