export type StatusKey =
  | 'ativo'
  | 'pausado'
  | 'sempre'
  | 'on_track'
  | 'ahead'
  | 'behind'
  | 'future'
  | 'expansivo'
  | 'mantém'
  | 'defesa'
  | 'verde'
  | 'amarelo'
  | 'vermelho'
  | string;

export interface StatusStyle {
  color: string;
  bg: string;
  border: string;
  label?: string;
}

export function getStatusStyle(status: string): StatusStyle {
  const s = status.toLowerCase();
  if (s === 'ativo' || s === 'sempre' || s === 'on_track' || s === 'ahead' || s === 'verde')
    return { color: 'var(--green)', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)' };
  if (s === 'pausado' || s === 'amarelo' || s === 'monitorar')
    return { color: 'var(--yellow)', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' };
  if (s === 'behind' || s === 'vermelho' || s === 'defesa')
    return { color: 'var(--red)', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' };
  if (s === 'expansivo')
    return { color: 'var(--accent)', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' };
  if (s === 'mantém')
    return { color: 'var(--muted)', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)' };
  if (s === 'future')
    return { color: 'var(--muted)', bg: 'transparent', border: 'transparent' };
  return { color: 'var(--muted)', bg: 'var(--bg)', border: 'var(--border)' };
}
