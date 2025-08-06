// src/components/ui/progress.tsx
'use client';

import * as React from "react";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    value, 
    max = 100, 
    className = '', 
    variant = 'default',
    size = 'md',
    showLabel = false,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    };

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500'
    };

    return (
      <div className={`space-y-1 ${className}`} ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Progression</span>
            <span className="text-primary font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        
        <div className={`bg-primary-subtle rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <motion.div
            className={`h-full rounded-full ${variantClasses[variant]}`}
            initial={{ width: 0 }}
            animate={{ width: animated ? `${percentage}%` : `${percentage}%` }}
            transition={{ 
              duration: animated ? 1 : 0,
              ease: "easeOut"
            }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  animated?: boolean;
}

const CircularProgress = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  className = '',
  variant = 'default',
  showLabel = true,
  animated = true
}: CircularProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626'
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-primary-subtle"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset 
          }}
          transition={{ 
            duration: animated ? 1 : 0,
            ease: "easeOut"
          }}
        />
      </svg>
      
      {showLabel && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm font-medium text-primary">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

interface StepperProps {
  steps: Array<{
    label: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Stepper = ({ 
  steps, 
  orientation = 'horizontal',
  className = '' 
}: StepperProps) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`${isHorizontal ? 'flex items-center' : 'flex flex-col'} ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <motion.div
            className={`flex ${isHorizontal ? 'flex-col items-center' : 'items-center gap-3'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Step circle */}
            <motion.div
              className={`
                relative flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium text-sm
                ${step.completed 
                  ? 'bg-primary border-primary text-white' 
                  : step.current 
                    ? 'border-primary text-primary bg-primary-subtle' 
                    : 'border-border text-muted-foreground bg-background'
                }
              `}
              whileHover={{ scale: 1.05 }}
              layout
            >
              {step.completed ? (
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <span>{index + 1}</span>
              )}
              
              {step.current && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Step content */}
            <div className={`${isHorizontal ? 'text-center mt-2' : 'flex-1'}`}>
              <motion.p
                className={`text-sm font-medium ${
                  step.completed || step.current ? 'text-primary' : 'text-muted-foreground'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {step.label}
              </motion.p>
              {step.description && (
                <motion.p
                  className="text-xs text-secondary mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <motion.div
              className={`
                ${isHorizontal 
                  ? 'h-0.5 w-12 mx-2' 
                  : 'w-0.5 h-8 ml-4 my-2'
                }
                ${steps[index + 1]?.completed ? 'bg-primary' : 'bg-muted'}
              `}
              initial={{ scaleX: isHorizontal ? 0 : 1, scaleY: isHorizontal ? 1 : 0 }}
              animate={{ scaleX: 1, scaleY: 1 }}
              transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export { Progress, CircularProgress, Stepper };