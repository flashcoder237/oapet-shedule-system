// src/components/ui/card.tsx
'use client';

import * as React from "react";
import { motion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, interactive = false, children, ...props }, ref) => {
    const cardContent = (
      <div
        ref={ref}
        className={`card rounded-xl border border-subtle bg-surface shadow-sm transition-all duration-200 ${
          interactive ? 'cursor-pointer' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );

    if (hover) {
      return (
        <motion.div
          whileHover={{ 
            y: -4,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          whileTap={interactive ? { scale: 0.98 } : {}}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={`flex flex-col space-y-2 p-6 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <motion.h3
    ref={ref}
    className={`text-lg font-bold leading-none tracking-tight text-primary ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.1 }}
    {...props}
  >
    {children}
  </motion.h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <motion.p
    ref={ref}
    className={`text-sm text-secondary leading-relaxed ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    {...props}
  >
    {children}
  </motion.p>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div 
    ref={ref} 
    className={`p-6 pt-0 ${className}`} 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={`flex items-center p-6 pt-0 border-t border-subtle/50 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.4 }}
    {...props}
  >
    {children}
  </motion.div>
));
CardFooter.displayName = "CardFooter";

// Nouvelle variante de carte avec statistiques
const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
  }
>(({ className, title, value, change, trend = 'neutral', icon, ...props }, ref) => (
  <Card ref={ref} className={className} interactive {...props}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-secondary font-medium">{title}</p>
          <motion.p 
            className="text-3xl font-bold text-primary"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {value}
          </motion.p>
          {change && (
            <motion.p 
              className={`text-xs flex items-center gap-1 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-secondary'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>{change}</span>
            </motion.p>
          )}
        </div>
        {icon && (
          <motion.div 
            className="w-12 h-12 bg-primary-subtle/50 rounded-xl flex items-center justify-center text-primary"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatCard };
