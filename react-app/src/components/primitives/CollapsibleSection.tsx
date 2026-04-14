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
        return () => observer.disconnect();
      }
    }
  }, [isCollapsed]);

  return (
    <section style={styles.section}>
      <button
        style={styles.header}
        onClick={() => setCollapse(id, !isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls={`content-${id}`}
        data-test={`section-header-${id}`}
      >
        <span style={styles.headerContent}>
          <span style={styles.icon}>
            {isCollapsed ? '▶️' : '▼'} {icon}
          </span>
          <span style={styles.title}>{title}</span>
        </span>
      </button>

      <div
        id={`content-${id}`}
        ref={contentRef}
        style={{
          ...styles.content,
          maxHeight: height,
          overflow: isCollapsed ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #374151',
  },
  header: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#1f2937',
    border: 'none',
    borderBottom: '1px solid #374151',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    textAlign: 'left',
  },
  icon: {
    fontSize: '16px',
    minWidth: '24px',
  },
  title: {
    flex: 1,
  },
  content: {
    transition: 'max-height 0.3s ease-in-out',
    overflow: 'hidden',
  },
};
