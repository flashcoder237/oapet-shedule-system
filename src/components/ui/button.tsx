// src/components/ui/button.tsx
'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed position-relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md",
        outline: "border border-subtle bg-transparent hover:bg-accent-subtle/50 hover:border-accent text-accent",
        secondary: "bg-tertiary text-white hover:bg-tertiary-hover shadow-sm hover:shadow-md",
        ghost: "hover:bg-secondary-muted/50 hover:text-primary text-secondary",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-hover",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, children, ...props }, ref) => {
    return (
      <motion.button
        className={buttonVariants({ variant, size, className })}
        whileHover={{ 
          scale: 1.02,
          y: -1,
        }}
        whileTap={{ 
          scale: 0.98,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Chargement...</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
        
        {/* Effet de shimmer au hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{
            translateX: "200%",
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
        />
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
