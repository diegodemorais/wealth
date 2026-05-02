/**
 * fire-simulator-aspiracional.test.ts
 *
 * Testa a lógica do botão Aspiracional no FireSimuladorSection.
 * Foco: estado FireMkt, preservação do perfil familiar, detecção isAspirPreset.
 *
 * Não monta o componente React (evita complexidade de store/router mocks).
 * Testa as funções puras e invariantes que governam o comportamento.
 */

import { describe, it, expect } from 'vitest';

// ── Tipos que espelham page.tsx ────────────────────────────────────────────────

type FireCond = 'solteiro' | 'casamento' | 'filho';
type FireMkt = 'stress' | 'base' | 'fav' | 'aspiracional' | 'cambio_dinamico';

// ── Lógica de estado extraída das funções do componente ───────────────────────

interface SimState {
  fireCond: FireCond;
  fireMkt: FireMkt;
  aporte: number;
  retorno: number;
  custo: number;
  custom: boolean;
}

const PREMISSAS = {
  aporte_mensal:             25_000,
  aporte_mensal_aspiracional: 35_000,
  custo_vida_base:           250_000,
  retorno_equity_base:       0.0485,
};

const FM_RETORNOS = { stress: 0.0435, base: 0.0485, fav: 0.0585 };
const FM_PERFIS   = { atual: { gasto_anual: 250_000 }, casado: { gasto_anual: 270_000 }, filho: { gasto_anual: 300_000 } };

function fracToPct(v: number) { return +(v * 100).toFixed(2); }

const MKT_RETORNOS: Record<Exclude<FireMkt, 'aspiracional'>, number> = {
  stress:          fracToPct(FM_RETORNOS.stress),
  base:            fracToPct(FM_RETORNOS.base),
  fav:             fracToPct(FM_RETORNOS.fav),
  cambio_dinamico: fracToPct(FM_RETORNOS.base),
};
const favRetorno = fracToPct(FM_RETORNOS.fav);

const COND_CUSTO: Record<FireCond, number> = {
  solteiro:  FM_PERFIS.atual.gasto_anual,
  casamento: FM_PERFIS.casado.gasto_anual,
  filho:     FM_PERFIS.filho.gasto_anual,
};

// Replica setFire50Preset (nova versão)
function applyAspiracional(state: SimState): SimState {
  return {
    ...state,
    fireMkt: 'aspiracional',
    aporte:  PREMISSAS.aporte_mensal_aspiracional,
    retorno: favRetorno,
    custom:  false,
    // fireCond NÃO alterado
  };
}

// Replica setCondPreset (nova versão)
function applyCondPreset(state: SimState, cond: FireCond): SimState {
  const next: SimState = {
    ...state,
    fireCond: cond,
    custo:    COND_CUSTO[cond],
    aporte:   PREMISSAS.aporte_mensal,
    custom:   false,
  };
  // Sai do modo aspiracional ao trocar perfil
  if (state.fireMkt === 'aspiracional') {
    next.fireMkt = 'base';
    next.retorno = MKT_RETORNOS.base;
  }
  return next;
}

// Replica setMktPreset (nova versão — exclui 'aspiracional')
function applyMktPreset(state: SimState, mkt: Exclude<FireMkt, 'aspiracional'>): SimState {
  return {
    ...state,
    fireMkt: mkt,
    retorno: MKT_RETORNOS[mkt],
    aporte:  PREMISSAS.aporte_mensal,
    custom:  false,
  };
}

// Replica isAspirPreset (nova versão)
function isAspirPreset(state: SimState): boolean {
  return !state.custom && state.fireMkt === 'aspiracional';
}

const DEFAULT_STATE: SimState = {
  fireCond: 'solteiro',
  fireMkt:  'base',
  aporte:   PREMISSAS.aporte_mensal,
  retorno:  fracToPct(PREMISSAS.retorno_equity_base),
  custo:    PREMISSAS.custo_vida_base,
  custom:   false,
};

// ── Testes ────────────────────────────────────────────────────────────────────

describe('Aspiracional preset — FireSimuladorSection', () => {
  it('não altera fireCond quando aspiracional é ativado (bug anterior: forçava solteiro)', () => {
    const initial: SimState = { ...DEFAULT_STATE, fireCond: 'casamento' };
    const after = applyAspiracional(initial);
    expect(after.fireCond).toBe('casamento'); // perfil preservado
  });

  it('define fireMkt como aspiracional (tipo dedicado)', () => {
    const after = applyAspiracional(DEFAULT_STATE);
    expect(after.fireMkt).toBe('aspiracional');
  });

  it('usa aporte aspiracional (não o aporte base)', () => {
    const after = applyAspiracional(DEFAULT_STATE);
    expect(after.aporte).toBe(PREMISSAS.aporte_mensal_aspiracional);
    expect(after.aporte).toBeGreaterThan(PREMISSAS.aporte_mensal);
  });

  it('retorno corresponde ao cenário favorável', () => {
    const after = applyAspiracional(DEFAULT_STATE);
    expect(after.retorno).toBeCloseTo(5.85, 1);
  });

  it('custom=false após ativar aspiracional (usa dados pré-computados)', () => {
    const initial: SimState = { ...DEFAULT_STATE, custom: true };
    const after = applyAspiracional(initial);
    expect(after.custom).toBe(false);
  });

  it('isAspirPreset = true quando fireMkt=aspiracional e custom=false', () => {
    const after = applyAspiracional(DEFAULT_STATE);
    expect(isAspirPreset(after)).toBe(true);
  });

  it('isAspirPreset = false quando custom=true (slider movido)', () => {
    const after: SimState = { ...applyAspiracional(DEFAULT_STATE), custom: true };
    expect(isAspirPreset(after)).toBe(false);
  });
});

describe('isAspirPreset — detecção robusta', () => {
  it('true apenas quando fireMkt=aspiracional', () => {
    const state: SimState = { ...DEFAULT_STATE, fireMkt: 'aspiracional' };
    expect(isAspirPreset(state)).toBe(true);
  });

  it('false quando fireMkt=fav (cenário favorável, não aspiracional)', () => {
    // Bug anterior: isAspirPreset = solteiro && fav — confundia os dois
    const state: SimState = { ...DEFAULT_STATE, fireMkt: 'fav', fireCond: 'solteiro' };
    expect(isAspirPreset(state)).toBe(false);
  });

  it('false quando fireMkt=base', () => {
    expect(isAspirPreset(DEFAULT_STATE)).toBe(false);
  });

  it('false quando fireMkt=stress', () => {
    const state: SimState = { ...DEFAULT_STATE, fireMkt: 'stress' };
    expect(isAspirPreset(state)).toBe(false);
  });
});

describe('Troca de perfil sai do modo aspiracional', () => {
  it('casamento → sai de aspiracional para base', () => {
    const inAspir = applyAspiracional(DEFAULT_STATE);
    const after = applyCondPreset(inAspir, 'casamento');
    expect(after.fireMkt).toBe('base');
    expect(isAspirPreset(after)).toBe(false);
  });

  it('filho → sai de aspiracional para base', () => {
    const inAspir = applyAspiracional(DEFAULT_STATE);
    const after = applyCondPreset(inAspir, 'filho');
    expect(after.fireMkt).toBe('base');
  });

  it('troca de perfil fora do aspiracional não altera fireMkt', () => {
    const state: SimState = { ...DEFAULT_STATE, fireMkt: 'fav', fireCond: 'solteiro' };
    const after = applyCondPreset(state, 'casamento');
    expect(after.fireMkt).toBe('fav'); // mkt preservado
  });

  it('troca de perfil atualiza custo corretamente', () => {
    const after = applyCondPreset(DEFAULT_STATE, 'casamento');
    expect(after.custo).toBe(270_000);
    const afterFilho = applyCondPreset(DEFAULT_STATE, 'filho');
    expect(afterFilho.custo).toBe(300_000);
  });

  it('troca de perfil reseta aporte para o normal', () => {
    const inAspir = applyAspiracional(DEFAULT_STATE);
    expect(inAspir.aporte).toBe(35_000);
    const after = applyCondPreset(inAspir, 'casamento');
    expect(after.aporte).toBe(PREMISSAS.aporte_mensal); // resetado para 25k
  });
});

describe('setMktPreset exclui aspiracional — tipo Exclude<FireMkt, aspiracional>', () => {
  it('stress: atualiza fireMkt e retorno, reseta aporte', () => {
    const inAspir = applyAspiracional(DEFAULT_STATE);
    const after = applyMktPreset(inAspir, 'stress');
    expect(after.fireMkt).toBe('stress');
    expect(after.retorno).toBeCloseTo(4.35, 1);
    expect(after.aporte).toBe(PREMISSAS.aporte_mensal);
  });

  it('base: retorna ao baseline', () => {
    const inAspir = applyAspiracional(DEFAULT_STATE);
    const after = applyMktPreset(inAspir, 'base');
    expect(after.fireMkt).toBe('base');
    expect(after.retorno).toBeCloseTo(4.85, 1);
    expect(isAspirPreset(after)).toBe(false);
  });

  it('fav: usa retorno favorável mas NÃO é aspiracional', () => {
    const after = applyMktPreset(DEFAULT_STATE, 'fav');
    expect(after.fireMkt).toBe('fav');
    expect(isAspirPreset(after)).toBe(false); // fav ≠ aspiracional
  });
});

// ── Regression: sliders ficam mortos após Aspiracional (bug 2026-05-01) ──────
//
// Bug: isPresetMode = !custom || retornoMatchesPreset.
// Quando Aspiracional usa retorno=favRetorno (5.85) e o usuário arrasta o slider
// de aporte, custom=true e retornoMatchesPreset também = true (retorno não mudou),
// então isPresetMode permanece true → FIRE year usa pré-computado, ignorando slider.
//
// Fix: isPresetMode = !custom (qualquer interação sai do preset).
//
// Replica a função pura corrigida.

function isPresetMode(state: SimState): boolean {
  return !state.custom;
}

describe('Regression — sliders após Aspiracional (2026-05-01)', () => {
  it('arrastar aporte slider sai do preset mode (custom=true) mesmo se retorno=favRetorno', () => {
    const aspir = applyAspiracional(DEFAULT_STATE);
    expect(isPresetMode(aspir)).toBe(true); // antes do drag

    // Simula drag do aporte (só mexe em aporte e custom)
    const afterDrag: SimState = { ...aspir, aporte: 50_000, custom: true };
    expect(isPresetMode(afterDrag)).toBe(false); // sai de preset → recalcula com slider
  });

  it('arrastar custo slider sai do preset mode após Aspiracional', () => {
    const aspir = applyAspiracional(DEFAULT_STATE);
    const afterDrag: SimState = { ...aspir, custo: 350_000, custom: true };
    expect(isPresetMode(afterDrag)).toBe(false);
  });

  it('arrastar retorno slider sai do preset mode (já funcionava antes do fix)', () => {
    const aspir = applyAspiracional(DEFAULT_STATE);
    const afterDrag: SimState = { ...aspir, retorno: 7.0, custom: true };
    expect(isPresetMode(afterDrag)).toBe(false);
  });

  it('clique em Stress/Base/Fav após Aspiracional volta ao preset mode', () => {
    let s = applyAspiracional(DEFAULT_STATE);
    s = { ...s, custom: true }; // user dragged
    expect(isPresetMode(s)).toBe(false);
    // Click base preset
    s = applyMktPreset(s, 'base');
    expect(isPresetMode(s)).toBe(true);
  });

  it('regressão: o heurístico antigo `retornoMatchesPreset` está fora — não permite preset com slider movido', () => {
    // Esta regra documenta a decisão de design: não tem "soft preset mode".
    // Se custom=true, sempre interativo. Sem exceções.
    const aspir = applyAspiracional(DEFAULT_STATE);
    const afterDrag: SimState = { ...aspir, aporte: 99_000, custom: true };
    // retorno ainda = favRetorno, mas estamos em interativo
    expect(afterDrag.retorno).toBeCloseTo(5.85, 1);
    expect(isPresetMode(afterDrag)).toBe(false);
  });
});

describe('Fluxo completo: perfil → aspiracional → perfil', () => {
  it('casado → aspir (preserva casado) → filho (sai de aspir, custo=filho)', () => {
    let s = applyCondPreset(DEFAULT_STATE, 'casamento');
    expect(s.fireCond).toBe('casamento');
    expect(s.custo).toBe(270_000);

    s = applyAspiracional(s);
    expect(s.fireCond).toBe('casamento'); // preservado
    expect(s.fireMkt).toBe('aspiracional');
    expect(isAspirPreset(s)).toBe(true);

    s = applyCondPreset(s, 'filho');
    expect(s.fireCond).toBe('filho');
    expect(s.fireMkt).toBe('base'); // saiu de aspiracional
    expect(s.custo).toBe(300_000);
    expect(isAspirPreset(s)).toBe(false);
  });
});
