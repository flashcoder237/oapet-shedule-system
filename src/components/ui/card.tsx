// src/components/ui/card.tsx
'use client';

import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card rounded-xl border border-subtle bg-surface shadow-sm transition-all duration-200 ${
          hover ? 'hover:shadow-lg hover:-translate-y-1' : ''
        } ${
          interactive ? 'cursor-pointer hover:scale-[0.98] active:scale-95' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-2 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-bold leading-none tracking-tight text-primary ${className}`}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-secondary leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div 
    ref={ref} 
    className={`p-6 pt-0 ${className}`} 
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 border-t border-subtle/50 ${className}`}
    {...props}
  >
    {children}
  </div>
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
          <p className="text-3xl font-bold text-primary">
            {value}
          </p>
          {change && (
            <p className={`text-xs flex items-center gap-1 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-secondary'
              }`}
            >
              <span>{change}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-primary-subtle/50 rounded-xl flex items-center justify-center text-primary hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatCard };
