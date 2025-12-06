"use client";

import { useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  loadingElement?: React.ReactNode;
  emptyElement?: React.ReactNode;
  className?: string;
  gap?: number;
}

export function VirtualList<T extends { _id: string }>({
  items,
  renderItem,
  estimateSize = 200,
  overscan = 5,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  loadingElement,
  emptyElement,
  className = "",
  gap = 12,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: (index) => items[index]._id,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // 無限スクロール検知
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore || isLoading || !onLoadMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore, isLoading, onLoadMore]
  );

  if (items.length === 0 && !isLoading) {
    return <>{emptyElement}</>;
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: "100%", contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLast = virtualItem.index === items.length - 1;
          return (
            <div
              key={virtualItem.key}
              ref={(el) => {
                virtualizer.measureElement(el);
                if (isLast) {
                  lastItemRef(el);
                }
              }}
              data-index={virtualItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
                paddingBottom: `${gap}px`,
              }}
            >
              {renderItem(items[virtualItem.index], virtualItem.index)}
            </div>
          );
        })}
      </div>

      {isLoading && loadingElement && (
        <div className="py-4 text-center">{loadingElement}</div>
      )}
    </div>
  );
}
