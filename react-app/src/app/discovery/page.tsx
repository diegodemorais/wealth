'use client';

export default function DiscoveryPage() {
  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Componentes anteriores integrados às abas permanentes:
          IR Shield → Portfolio · Bond Strategy → Withdraw · Próximo Aporte → Now · Carry Differential → Now
        </p>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', padding: '20px 0', textAlign: 'center' }}>
        Nenhum componente em avaliação no momento.
      </div>
    </div>
  );
}
