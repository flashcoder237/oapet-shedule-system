// src/components/ui/loading.tsx
'use client';

import { motion } from 'framer-motion';
import { Loader2, RotateCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'skeleton';
  className?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`bg-primary rounded-full ${sizeClasses[size]} ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      />
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex items-end gap-1 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-primary rounded-full"
            animate={{
              height: ['8px', '20px', '8px']
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Loader2 className={`${sizeClasses[size]} text-primary`} />
    </motion.div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) => {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse";
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined)
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
};

interface PageLoadingProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}

const PageLoading = ({ 
  message = "Chargement en cours...",
  variant = 'default' 
}: PageLoadingProps) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative"
        >
          <div className="w-20 h-20 bg-primary-subtle rounded-full flex items-center justify-center">
            <LoadingSpinner size="xl" />
          </div>
          <motion.div
            className="absolute inset-0 border-4 border-primary-light rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ borderTopColor: 'transparent' }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h3 className="text-lg font-semibold text-primary">Chargement</h3>
          <p className="text-secondary text-sm">{message}</p>
        </motion.div>

        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <LoadingSpinner variant="dots" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-64 space-y-4"
    >
      <LoadingSpinner size="lg" />
      <motion.p 
        className="text-secondary text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

interface CardSkeletonProps {
  rows?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

const CardSkeleton = ({ 
  rows = 3, 
  showHeader = true, 
  showFooter = false 
}: CardSkeletonProps) => (
  <motion.div 
    className="card rounded-xl border border-subtle p-6 space-y-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {showHeader && (
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" height="20px" />
        <Skeleton variant="text" width="40%" height="14px" />
      </div>
    )}
    
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="text" lines={1} />
      ))}
    </div>

    {showFooter && (
      <div className="flex gap-2 pt-4">
        <Skeleton variant="rectangular" width="80px" height="32px" />
        <Skeleton variant="rectangular" width="80px" height="32px" />
      </div>
    )}
  </motion.div>
);

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
  <motion.div 
    className="surface rounded-xl border border-subtle overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Header */}
    <div className="p-4 border-b border-subtle bg-primary-subtle/20">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="70%" height="16px" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-subtle">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div 
          key={rowIndex}
          className="p-4 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: rowIndex * 0.05 }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              width={colIndex === 0 ? "80%" : "60%"} 
              height="16px" 
            />
          ))}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Composant de chargement global pour l'application
const AppLoading = () => (
  <motion.div 
    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-surface rounded-xl p-8 shadow-xl border border-subtle max-w-sm w-full mx-4"
    >
      <div className="text-center space-y-4">
        <motion.div
          className="w-16 h-16 mx-auto bg-primary-subtle rounded-full flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            backgroundColor: ["rgb(254, 242, 242)", "rgb(252, 226, 226)", "rgb(254, 242, 242)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <LoadingSpinner size="lg" />
        </motion.div>
        
        <div>
          <h3 className="text-lg font-semibold text-primary">FMSP-UDo</h3>
          <p className="text-sm text-secondary mt-1">Initialisation du système...</p>
        </div>
        
        <motion.div 
          className="h-1 bg-primary-subtle rounded-full overflow-hidden"
          initial={{ width: 0 }}
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ x: [-100, 200] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "50%" }}
          />
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

export {
  LoadingSpinner,
  Skeleton,
  PageLoading,
  CardSkeleton,
  TableSkeleton,
  AppLoading
};