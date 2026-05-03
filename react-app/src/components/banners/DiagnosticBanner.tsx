'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Lightbulb } from 'lucide-react';

export type DiagnosticBannerVariant = 'warning' | 'info' | 'success' | 'insight';

interface DiagnosticBannerProps {
  variant: DiagnosticBannerVariant;
  title: string;
  children: React.ReactNode;
  /** Opcional: id de teste e ancoragem */
  testId?: string;
  /** Compact: padding menor, ícone menor */
  compact?: boolean;
}

/**
 * DiagnosticBanner — banner reutilizável de diagnóstico/aviso/insight estratégico.
 * Usado para anti-ancoragem (Markowitz informativo), conservadorismo de design (P(FIRE)),
 * vantagens estratégicas (TD 2040 = FIRE Day), e disclaimers metodológicos.
 *
 * Variantes:
 * - warning: anti-ancoragem, alerta sobre interpretação errada (amarelo)
 * - info: contexto técnico, disclaimers (azul)
 * - success: vantagem estratégica reconhecida (verde)
 * - insight: insight novo / fato pouco visível (roxo)
 */
export function DiagnosticBanner({ variant, title, children, testId, compact = false }: DiagnosticBannerProps) {
  const cfg = VARIANT_CFG[variant];
  const Icon = cfg.icon;
  const pad = compact ? '10px 12px' : '12px 14px';
  const iconSize = compact ? 16 : 18;

  return (
    <div
      data-testid={testId}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.accent}`,
        borderRadius: 8,
        padding: pad,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <Icon size={iconSize} style={{ color: cfg.accent, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: cfg.accent, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const VARIANT_CFG: Record<DiagnosticBannerVariant, { bg: string; border: string; accent: string; icon: typeof AlertTriangle }> = {
  warning: {
    bg: 'rgba(234,179,8,.08)',
    border: 'rgba(234,179,8,.25)',
    accent: 'var(--yellow)',
    icon: AlertTriangle,
  },
  info: {
    bg: 'rgba(99,179,237,.08)',
    border: 'rgba(99,179,237,.25)',
    accent: 'var(--accent)',
    icon: Info,
  },
  success: {
    bg: 'rgba(34,197,94,.08)',
    border: 'rgba(34,197,94,.25)',
    accent: 'var(--green)',
    icon: CheckCircle2,
  },
  insight: {
    bg: 'rgba(168,85,247,.08)',
    border: 'rgba(168,85,247,.25)',
    accent: 'var(--purple)',
    icon: Lightbulb,
  },
};
