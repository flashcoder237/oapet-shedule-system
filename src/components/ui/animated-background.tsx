// src/components/ui/animated-background.tsx
'use client';

import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'books' | 'academic' | 'schedule' | 'subtle';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'academic',
  intensity = 'low',
  className = ''
}) => {
  const getPatternStyle = () => {
    const baseOpacity = {
      low: 0.03,
      medium: 0.05,
      high: 0.08
    }[intensity];

    switch (variant) {
      case 'books':
        return {
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(62, 92, 73, ${baseOpacity}) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(194, 87, 27, ${baseOpacity * 0.7}) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(243, 238, 217, ${baseOpacity * 0.5}) 0%, transparent 50%)
          `,
          backgroundSize: '400px 400px, 300px 300px, 200px 200px',
          animation: 'float-books 20s ease-in-out infinite'
        };
      
      case 'academic':
        return {
          backgroundImage: `
            linear-gradient(45deg, rgba(62, 92, 73, ${baseOpacity}) 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, rgba(194, 87, 27, ${baseOpacity * 0.6}) 0%, transparent 40%),
            conic-gradient(from 45deg at 30% 70%, rgba(243, 238, 217, ${baseOpacity * 0.4}) 0deg, transparent 90deg)
          `,
          backgroundSize: '800px 800px, 600px 600px, 400px 400px',
          animation: 'drift-academic 25s linear infinite'
        };
      
      case 'schedule':
        return {
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              rgba(62, 92, 73, ${baseOpacity * 0.3}) 0px,
              transparent 2px,
              transparent 20px,
              rgba(194, 87, 27, ${baseOpacity * 0.2}) 22px,
              transparent 24px,
              transparent 40px
            ),
            radial-gradient(circle at 50% 50%, rgba(243, 238, 217, ${baseOpacity * 0.4}) 0%, transparent 70%)
          `,
          backgroundSize: '200px 200px, 1000px 1000px',
          animation: 'grid-flow 30s linear infinite'
        };
      
      case 'subtle':
      default:
        return {
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(62, 92, 73, ${baseOpacity * 0.5}) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(194, 87, 27, ${baseOpacity * 0.4}) 0%, transparent 50%)
          `,
          backgroundSize: '1200px 1200px, 800px 800px',
          animation: 'gentle-drift 40s ease-in-out infinite'
        };
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 pointer-events-none z-0 ${className}`}
        style={getPatternStyle()}
      />
      
      <style jsx>{`
        @keyframes float-books {
          0%, 100% {
            background-position: 0% 0%, 100% 100%, 50% 50%;
          }
          25% {
            background-position: 30% 10%, 70% 90%, 60% 40%;
          }
          50% {
            background-position: 10% 30%, 90% 70%, 40% 60%;
          }
          75% {
            background-position: 20% 20%, 80% 80%, 70% 30%;
          }
        }
        
        @keyframes drift-academic {
          0% {
            background-position: 0% 0%, 0% 0%, 0% 0%;
          }
          100% {
            background-position: 100% 100%, -100% 100%, 100% -100%;
          }
        }
        
        @keyframes grid-flow {
          0% {
            background-position: 0% 0%, 50% 50%;
          }
          100% {
            background-position: 200px 200px, 50% 50%;
          }
        }
        
        @keyframes gentle-drift {
          0%, 100% {
            background-position: 0% 0%, 100% 100%;
          }
          50% {
            background-position: 100% 0%, 0% 100%;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;