#!/usr/bin/env node
// Imprime timestamp ISO BRT canônico para entrada do changelog.
// Uso:
//   node react-app/scripts/changelog-now.mjs
// Output:
//   2026-05-02T22:35:00-03:00
//
// REGRA (react-app/CLAUDE.md): jamais escrever timestamp manual no changelog.
// Devs (humanos ou agentes) DEVEM rodar este script para obter `datetime`.
// Releitura no release_gate valida janela [hora atual − 24h, hora atual + 5min].

const now = new Date();
const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
});
const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}-03:00`;
process.stdout.write(iso + '\n');
