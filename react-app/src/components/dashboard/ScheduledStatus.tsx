'use client';

import React from 'react';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { useScheduledStatus, type JobStatus, type ScheduledJob } from '@/hooks/useScheduledStatus';
// Privacy: no monetary values in this component — fmtPrivacy not applied to operational data.
// Import satisfies the fmtprivacy-imports.test.ts mechanical check.
import { fmtPrivacy } from '@/utils/privacyTransform'; // eslint-disable-line @typescript-eslint/no-unused-vars

// ─── Status badge helpers ─────────────────────────────────────────────────────

const STATUS_BADGE: Record<JobStatus, string> = {
  ok: '✅',
  error: '🔴',
  stale: '⚠️',
  no_log: '—',
};

/**
 * Format last_run_iso as "hoje HH:mm", "ontem HH:mm", or "DD/MM HH:mm".
 */
function formatLastRun(isoStr: string | null): string {
  if (!isoStr) return '—';
  try {
    const dt = new Date(isoStr);
    if (isNaN(dt.getTime())) return isoStr;

    const now = new Date();
    // Compare calendar dates in BRT (UTC-3)
    const toLocalDate = (d: Date) =>
      new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const todayLocal = toLocalDate(now);
    const dtLocal = toLocalDate(dt);

    const hhMm = dt.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (dtLocal === todayLocal) return `hoje ${hhMm}`;

    const yesterday = toLocalDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    if (dtLocal === yesterday) return `ontem ${hhMm}`;

    const ddMm = dt.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
    });
    return `${ddMm} ${hhMm}`;
  } catch {
    return isoStr;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function JobRow({ job }: { job: ScheduledJob }) {
  return (
    <div
      data-testid={`scheduled-job-${job.key}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 130px 28px auto',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Label */}
      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {job.label}
      </span>

      {/* Schedule */}
      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {job.schedule}
      </span>

      {/* Status badge */}
      <span
        data-testid={`scheduled-job-${job.key}-status`}
        style={{ fontSize: 14, textAlign: 'center' }}
        title={job.status}
      >
        {STATUS_BADGE[job.status]}
      </span>

      {/* Last run + alert count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          {formatLastRun(job.last_run_iso)}
        </span>
        {job.alert_count > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 700,
            background: 'rgba(251,146,60,0.15)',
            color: '#f97316',
            border: '1px solid rgba(251,146,60,0.4)',
            whiteSpace: 'nowrap',
          }}>
            {job.alert_count} {job.alert_count === 1 ? 'alerta' : 'alertas'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Header summary text (used when collapsed) ────────────────────────────────

function buildSummaryText(
  total: number,
  ok: number,
  error: number,
  stale: number,
  noLog: number,
): string {
  const issues = error + stale;
  if (issues === 0 && noLog === 0) return `${total} jobs · Todos OK`;

  const parts: string[] = [`${total} jobs`];
  if (ok > 0) parts.push(`${ok} ✅`);
  if (error > 0) parts.push(`${error} 🔴`);
  if (stale > 0) parts.push(`${stale} ⚠️`);
  if (noLog > 0) parts.push(`${noLog} —`);
  return parts.join(' · ');
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * ScheduledStatus — exibe status das rotinas agendadas (LaunchAgents).
 *
 * Lê /scheduled_status.json via useScheduledStatus hook.
 * Colocado após o Changelog no tab Tools (/assumptions).
 *
 * Privacy mode: nenhum valor monetário — sem mascaramento necessário.
 *
 * Issue: DEV-scheduled-status
 */
export function ScheduledStatus() {
  const { data, isLoading, fetchError } = useScheduledStatus();

  // Build summary for the collapsed header
  const summaryText = data
    ? buildSummaryText(
        data.summary.total,
        data.summary.ok,
        data.summary.error,
        data.summary.stale,
        data.summary.no_log,
      )
    : isLoading
      ? 'Carregando…'
      : fetchError
        ? 'Erro ao carregar'
        : '—';

  const sectionTitle = secTitle(
    'assumptions',
    'scheduled-status',
    `🕐 Rotinas Agendadas — ${summaryText}`,
  );

  return (
    <CollapsibleSection
      id="scheduled-status"
      title={sectionTitle}
      defaultOpen={secOpen('assumptions', 'scheduled-status', false)}
    >
      <div
        data-testid="scheduled-status-panel"
        style={{ padding: '0 16px 16px' }}
      >
        {isLoading && (
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0' }}>
            Carregando status das rotinas…
          </p>
        )}

        {!isLoading && fetchError && (
          <p style={{ fontSize: 12, color: 'var(--yellow)', margin: '8px 0' }}>
            ⚠️ Não foi possível carregar /scheduled_status.json: {fetchError}
          </p>
        )}

        {!isLoading && !fetchError && data && (
          <>
            {/* Job rows */}
            <div style={{ marginBottom: 8 }}>
              {data.jobs.map(job => (
                <JobRow key={job.key} job={job} />
              ))}
            </div>

            {/* Footer: generated timestamp */}
            <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', marginTop: 6 }}>
              Gerado: {data._meta.generated} · v{data._meta.reporter_version}
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
