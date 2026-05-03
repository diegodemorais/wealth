'use client';

import React, { useId, useRef, useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tooltip — lightweight popover primitive (sem dep Radix).
 *
 * Por que não Radix? `@radix-ui/react-tooltip` não está nas deps;
 * adicionar (~30KB) por uso só de tooltip é desproporcional. Esta
 * implementação cobre o essencial:
 *   - hover (mouse) e focus (keyboard) abrem
 *   - tap em mobile alterna (open/close)
 *   - aria-describedby liga trigger ao popover
 *   - ESC fecha
 *   - lazy mount: popover só vai ao DOM quando aberto (perf)
 *   - posicionamento auto: tenta top primeiro, flips para bottom se sem espaço
 *
 * Uso direto:
 *   <Tooltip content="Texto explicativo">
 *     <Info size={14} />
 *   </Tooltip>
 *
 * Ou como ícone padrão (Info):
 *   <TooltipInfo content="..." />
 */

export interface TooltipProps {
  /** Conteúdo do popover (string ou ReactNode) */
  content: React.ReactNode;
  /** Trigger element — botão clicável envolvendo o filho */
  children: React.ReactNode;
  /** Lado preferido (default: 'top'). Faz flip se não couber. */
  side?: 'top' | 'bottom';
  /** Largura máxima do popover em px (default 240) */
  maxWidth?: number;
  /** data-testid no popover (não no trigger) */
  'data-testid'?: string;
  /** Classe extra no botão trigger */
  className?: string;
  /** Label acessível do trigger (default: "Mais informações") */
  ariaLabel?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  maxWidth = 240,
  'data-testid': dataTestId,
  className,
  ariaLabel = 'Mais informações',
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [actualSide, setActualSide] = useState<'top' | 'bottom'>(side);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Auto-flip top↔bottom se não couber na viewport
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;
    if (side === 'top' && spaceTop < 80 && spaceBottom > spaceTop) {
      setActualSide('bottom');
    } else if (side === 'bottom' && spaceBottom < 80 && spaceTop > spaceBottom) {
      setActualSide('top');
    } else {
      setActualSide(side);
    }
  }, [open, side]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Click fora fecha (mobile tap-toggle)
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        popoverRef.current &&
        !popoverRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const onToggle = useCallback(() => setOpen(o => !o), []);
  const onShow = useCallback(() => setOpen(true), []);
  const onHide = useCallback(() => setOpen(false), []);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={onShow}
        onMouseLeave={onHide}
        onFocus={onShow}
        onBlur={onHide}
        onClick={onToggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          'inline-flex items-center justify-center cursor-help text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm',
          className,
        )}
        style={{ background: 'transparent', border: 'none', padding: 0 }}
      >
        {children}
      </button>
      {open && (
        <div
          ref={popoverRef}
          id={id}
          role="tooltip"
          data-testid={dataTestId}
          style={{
            position: 'absolute',
            zIndex: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            [actualSide === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
            maxWidth,
            minWidth: 160,
            padding: '8px 10px',
            background: 'var(--card2, var(--card))',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: 'normal',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            whiteSpace: 'normal',
            textAlign: 'left',
            pointerEvents: 'auto',
          }}
        >
          {content}
        </div>
      )}
    </span>
  );
}

/**
 * TooltipInfo — versão pré-empacotada com ícone Info Lucide.
 * Use quando o trigger é apenas o ícone padrão "ⓘ".
 */
export function TooltipInfo({
  content,
  side,
  maxWidth,
  size = 13,
  'data-testid': dataTestId,
  ariaLabel,
}: Omit<TooltipProps, 'children'> & { size?: number }) {
  return (
    <Tooltip
      content={content}
      side={side}
      maxWidth={maxWidth}
      data-testid={dataTestId}
      ariaLabel={ariaLabel}
    >
      <Info size={size} aria-hidden="true" />
    </Tooltip>
  );
}
