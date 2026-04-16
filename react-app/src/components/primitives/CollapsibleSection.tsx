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
    <section
      className="collapsible mb-3.5"
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}
    >
      <button
        className="w-full cursor-pointer flex justify-between items-center text-text transition-colors hover:opacity-80"
        style={{
          background: 'none',
          border: 'none',
          padding: '16px 16px',
          paddingBottom: isCollapsed ? '16px' : '0',
          margin: 0,
          textAlign: 'left',
        }}
        onClick={() => setCollapse(id, !isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls={`content-${id}`}
        data-test={`section-header-${id}`}
      >
        <h2 style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          {title} <span style={{ fontSize: '.8em', color: 'var(--muted)' }}>{isCollapsed ? '▸' : '▾'}</span>
        </h2>
      </button>

      <div
        id={`content-${id}`}
        ref={contentRef}
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isCollapsed ? 0 : (typeof height === 'number' ? `${height + 40}px` : height),
          overflow: isCollapsed ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
    </section>
  );
}
