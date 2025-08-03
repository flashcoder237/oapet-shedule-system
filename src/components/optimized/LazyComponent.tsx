// src/components/optimized/LazyComponent.tsx
'use client';

import { useState, useEffect, useRef, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface LazyComponentProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  [key: string]: any;
}

export default function LazyComponent({
  component: Component,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0,
  ...props
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (delay > 0) {
            setTimeout(() => setShouldRender(true), delay);
          } else {
            setShouldRender(true);
          }
          
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, delay]);

  const defaultFallback = (
    <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg animate-pulse">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div ref={elementRef} className="w-full">
      {shouldRender ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Component {...props} />
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}