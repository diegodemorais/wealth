'use client';

import { ReactNode } from 'react';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

export interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  summary?: ReactNode;  // shown in header when collapsed
  className?: string;
}

export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
  icon,
  summary,
  className,
}: CollapsibleSectionProps) {
  const collapseState = useUiStore(s => s.collapseState);
  const setCollapse = useUiStore(s => s.setCollapse);

  const isCollapsed = collapseState[id] ?? !defaultOpen;
  const isOpen = !isCollapsed;

  const handleOpenChange = (open: boolean) => {
    setCollapse(id, !open);
    // Dispatch resize for ECharts after animation
    if (open) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn(
        'collapsible mb-3.5 overflow-hidden',
        'bg-card border border-border rounded-[var(--radius-md)]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      <CollapsibleTrigger
        asChild
        data-test={`section-header-${id}`}
        aria-controls={`content-${id}`}
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
        >
          <h2 style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            {icon && <span className="mr-2 inline-flex align-middle">{icon}</span>}{title}{' '}
            <span style={{ fontSize: '.8em', color: 'var(--muted)' }}>
              {isCollapsed ? '▸' : '▾'}
            </span>
          </h2>
          {isCollapsed && summary && (
            <div style={{ flexShrink: 0 }}>{summary}</div>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent id={`content-${id}`}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
