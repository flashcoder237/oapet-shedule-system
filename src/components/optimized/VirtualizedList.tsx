// src/components/optimized/VirtualizedList.tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onLoadMore?: () => void;
  loading?: boolean;
  hasNextPage?: boolean;
  className?: string;
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onLoadMore,
  loading = false,
  hasNextPage = false,
  className = '',
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);

    // Load more when near bottom
    if (
      onLoadMore &&
      hasNextPage &&
      !loading &&
      scrollTop + containerHeight >= totalHeight - itemHeight * 3
    ) {
      onLoadMore();
    }
  }, [onLoadMore, hasNextPage, loading, containerHeight, totalHeight, itemHeight]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.startIndex + index;
              return (
                <motion.div
                  key={actualIndex}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  style={{ height: itemHeight }}
                  className="flex items-center"
                >
                  {renderItem(item, actualIndex)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Chargement...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}