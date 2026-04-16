'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useUiStore } from '@/store/uiStore';

export interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
  icon = '📋',
}: CollapsibleSectionProps) {
  const collapseState = useUiStore(s => s.collapseState);
  const setCollapse = useUiStore(s => s.setCollapse);

  const isCollapsed = collapseState[id] ?? !defaultOpen;
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | string>('auto');

  // Update height on mount and when collapsed state changes
  useEffect(() => {
    if (contentRef.current) {
      if (isCollapsed) {
        setHeight(0);
      } else {
        setHeight(contentRef.current.scrollHeight);
        // Recalculate height if content changes
        const observer = new ResizeObserver(() => {
          if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
          }
        });
        observer.observe(contentRef.current);

        // Dispatch resize event after animation completes (300ms) for ECharts to recalculate
        const resizeTimeout = setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 300);

        return () => {
          clearTimeout(resizeTimeout);
          observer.disconnect();
        };
      }
    }
  }, [isCollapsed]);

  return (
    <section className="mb-5 rounded-lg overflow-hidden border border-border/50">
      <button
        className="w-full px-4 py-4 bg-slate-800/50 border-b border-border/50 cursor-pointer flex justify-between items-center text-text text-sm font-semibold transition-colors hover:bg-slate-700/50"
        onClick={() => setCollapse(id, !isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls={`content-${id}`}
        data-test={`section-header-${id}`}
      >
        <span className="flex items-center gap-3 flex-1 text-left">
          <span className="text-base min-w-6">
            {isCollapsed ? '▶️' : '▼'} {icon}
          </span>
          <span className="flex-1">{title}</span>
        </span>
      </button>

      <div
        id={`content-${id}`}
        ref={contentRef}
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: height,
          overflow: isCollapsed ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
    </section>
  );
}
