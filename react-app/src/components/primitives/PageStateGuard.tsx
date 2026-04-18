'use client';

/**
 * PageStateGuard — renders loading / error / warning states consistently.
 *
 * Usage:
 *   const guard = usePageStateGuard({ isLoading, dataError, data });
 *   if (guard) return guard;
 *   // proceed with confident data
 *
 * Or as a component wrapper (renders children only when data is ready):
 *   <PageStateGuard isLoading={isLoading} dataError={dataError} data={data}>
 *     {children}
 *   </PageStateGuard>
 */

import React from 'react';

export interface PageStateGuardProps {
  isLoading: boolean;
  dataError: string | null | undefined;
  data: unknown;
  loadingText?: string;
  errorPrefix?: string;
  warningText?: string;
  children?: React.ReactNode;
}

/**
 * Returns a JSX element if in a loading/error/warning state, or null if data is ready.
 * Designed for early-return patterns:
 *
 *   const guard = pageStateElement({ isLoading, dataError, data });
 *   if (guard) return guard;
 */
export function pageStateElement({
  isLoading,
  dataError,
  data,
  loadingText = 'Carregando dados...',
  errorPrefix = 'Erro ao carregar dados:',
  warningText = 'Dados carregados mas não disponíveis',
}: Omit<PageStateGuardProps, 'children'>): React.JSX.Element | null {
  if (isLoading) {
    return <div className="loading-state">⏳ {loadingText}</div>;
  }
  if (dataError) {
    return (
      <div className="error-state">
        <strong>{errorPrefix}</strong> {dataError}
      </div>
    );
  }
  if (!data) {
    return <div className="warning-state">⚠️ {warningText}</div>;
  }
  return null;
}

/**
 * Component version — renders children only when data is ready.
 */
export function PageStateGuard({
  isLoading,
  dataError,
  data,
  loadingText,
  errorPrefix,
  warningText,
  children,
}: PageStateGuardProps) {
  const guard = pageStateElement({ isLoading, dataError, data, loadingText, errorPrefix, warningText });
  if (guard) return guard;
  return <>{children}</>;
}
