# HD-gaps-aposenteaos40-spec: Implementação das 3 Features FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-gaps-aposenteaos40-spec |
| **Dono** | Dev |
| **Status** | Concluído |
| **Prioridade** | Alta |
| **Participantes** | Arquiteto, Dev, QA, Quant |
| **Criado em** | 2026-04-30 |
| **Origem** | Benchmark vs lab.aposenteaos40.org — gaps aprovados pelo Head + especialistas FIRE/Macro |
| **Concluido em** | 2026-04-30 |

---

## Implementation Order

**Feature 1 → Feature 2 → Feature 3** (Features 1+2 paralelas, Feature 3 independente)

- Features 1 e 2 compartilham o mesmo ponto de escrita em `generate_data.py → fire_section` e a mesma aba `/fire`. Implementar em sequência dentro do mesmo commit de pipeline evita conflitos.
- Feature 3 é script standalone + JSON próprio + UI em `/backtest`. Sem dependência das outras.

---

## Feature 1 — Coast FIRE Calculator

**Conceito:** `CoastNumber = FIRE_Number / (1 + r_real)^n` — ponto em que Diego pode parar de aportar e ainda atingir o FIRE Number com crescimento composto.

### Pipeline (`scripts/generate_data.py`)

Nova função antes da montagem de `fire_section` (~linha 4960):

```python
def compute_coast_fire(premissas: dict) -> dict:
    fire_number = 10_000_000.0  # R$10M — adicionar FIRE_NUMBER_TARGET em config.py
    patrimonio_atual = premissas.get("patrimonio_atual", 3_472_335.0)
    r_base = premissas.get("retorno_equity_base", 0.0485)
    r_fav  = r_base + premissas.get("adj_favoravel", 0.010)
    r_str  = r_base + premissas.get("adj_stress", -0.010)
    n      = premissas.get("n_anos_fire", 14)          # 2026 → 2040

    def coast(r): return fire_number / (1 + r) ** n

    cn_base = coast(r_base)
    cn_fav  = coast(r_fav)
    cn_str  = coast(r_str)

    from datetime import date
    ano_atual = date.today().year

    def ano_projetado(cn):
        # Approximation: how many years at r_base until patrimonio_atual reaches cn
        if patrimonio_atual >= cn:
            return ano_atual
        # Assuming aporte ~R$25k/mês = R$300k/yr drives growth
        # Simple binary search up to 20 years
        for yr in range(0, 21):
            proj = patrimonio_atual * (1 + r_base) ** yr + 300_000 * ((1 + r_base) ** yr - 1) / r_base
            if proj >= cn:
                return ano_atual + yr
        return ano_atual + 20

    return {
        "coast_number_base":   round(cn_base, 0),
        "coast_number_fav":    round(cn_fav, 0),
        "coast_number_stress": round(cn_str, 0),
        "gap_base":            round(cn_base - patrimonio_atual, 0),
        "passou_base":         patrimonio_atual >= cn_base,
        "ano_projetado_base":  ano_projetado(cn_base),
        "r_real_base":         r_base,
        "r_real_fav":          r_fav,
        "r_real_stress":       r_str,
        "n_anos":              n,
        "fire_number":         fire_number,
        "_metodo":             "coast_fire_formula",
    }
```

Wire: `fire_section["coast_fire"] = compute_coast_fire(premissas_raw)`

Schema assertion:
```python
assert data["fire"].get("coast_fire") is not None, "coast_fire missing"
assert isinstance(data["fire"]["coast_fire"]["coast_number_base"], float), "coast_number_base type"
```

### TypeScript (`react-app/src/types/dashboard.ts`)

Adicionar interface e campo em `FireModuleData`:

```typescript
export interface CoastFireData {
  coast_number_base: number;
  coast_number_fav: number;
  coast_number_stress: number;
  gap_base: number;
  passou_base: boolean;
  ano_projetado_base: number;
  r_real_base: number;
  r_real_fav: number;
  r_real_stress: number;
  n_anos: number;
  fire_number: number;
  _metodo: string;
}
// Em FireModuleData:
coast_fire?: CoastFireData;
```

### React Component

- **Criar:** `react-app/src/app/fire/CoastFireCard.tsx`
- **Props:** `{ coast: CoastFireData; patrimonioAtual: number; privacyMode: boolean }`
- **Conteúdo:**
  1. Status badge: "ON TRACK — Coast in [2033]" ou "COAST ACHIEVED" em verde
  2. Progress bar: `patrimonioAtual / coast_number_base * 100`
  3. Mini-tabela 3 cenários: Scenario | r_real | Coast Number | Gap | Year
  4. Footnote: "Coast FIRE uses portfolio real return (4.85% base), not fixed SWR."
- **data-testid:** `coast-fire-card`, `coast-fire-status`, `coast-fire-gap-base`
- **Wire em `fire/page.tsx`:** CollapsibleSection `id="section-coast-fire"` na seção Readiness

### Changelog entry
```typescript
{ datetime: '2026-04-30T...', type: 'dado', component: 'CoastFireCard', tab: 'fire', anchor: 'section-coast-fire', de: 'ausente', para: 'Coast FIRE Calculator — 3 cenários, progress bar, ano projetado' }
```

---

## Feature 2 — FIRE Spectrum Widget

**Conceito:** 4 bandas do espectro FIRE com terminologia acadêmica em inglês. Custo de vida = R$250k/ano = **R$20.833/mês** (não confundir com aporte/renda de R$25k/mês).

| Band | Multiple | Implicit SWR | Threshold (Diego) |
|------|----------|-------------|-------------------|
| Fat FIRE | 400x | 3.0% | R$8.33M |
| FIRE | 300x | 4.0% | R$6.25M |
| Lean FIRE | 200x | 6.0% | R$4.17M |
| Barista FIRE | 150x | 8.0% | R$3.13M |

Diego hoje: R$3.47M = 167x → entre Barista e Lean FIRE.
Modelo de Diego (R$10M) = 480x = SWR 2.5% = acima do Fat FIRE padrão (mostrar como nota).

### Pipeline (`scripts/generate_data.py`)

```python
def compute_fire_spectrum(premissas: dict) -> dict:
    custo_anual   = premissas.get("custo_vida_base", 250_000.0)
    custo_mensal  = custo_anual / 12
    patrimonio    = premissas.get("patrimonio_atual", 3_472_335.0)

    BANDAS = [
        ("Fat FIRE",    400, 3.0),
        ("FIRE",        300, 4.0),
        ("Lean FIRE",   200, 6.0),
        ("Barista FIRE",150, 8.0),
    ]

    bandas_out = []
    banda_atual = "below_barista"
    for nome, mult, swr in BANDAS:
        alvo = custo_mensal * mult
        atingido = patrimonio >= alvo
        pct = min(100.0, round(patrimonio / alvo * 100, 1))
        bandas_out.append({
            "nome": nome, "multiplo": mult, "swr_pct": swr,
            "alvo_brl": round(alvo, 0), "atingido": atingido, "pct_atual": pct,
        })
        if atingido:
            banda_atual = nome.lower().replace(" ", "_")

    return {
        "custo_mensal":    round(custo_mensal, 0),
        "patrimonio_atual": patrimonio,
        "bandas":          bandas_out,
        "banda_atual":     banda_atual,
        "_metodo":         "multiplo_gastos_mensais",
    }
```

Wire: `fire_section["fire_spectrum"] = compute_fire_spectrum(premissas_raw)`

Schema assertion:
```python
assert data["fire"].get("fire_spectrum") is not None, "fire_spectrum missing"
assert len(data["fire"]["fire_spectrum"]["bandas"]) == 4, "fire_spectrum bandas"
```

### TypeScript (`react-app/src/types/dashboard.ts`)

```typescript
export interface FireSpectrumBand {
  nome: string;
  multiplo: number;
  swr_pct: number;
  alvo_brl: number;
  atingido: boolean;
  pct_atual: number;
}
export interface FireSpectrumData {
  custo_mensal: number;
  patrimonio_atual: number;
  bandas: FireSpectrumBand[];
  banda_atual: string;
  _metodo: string;
}
// Em FireModuleData:
fire_spectrum?: FireSpectrumData;
```

### React Component

- **Criar:** `react-app/src/app/fire/FireSpectrumWidget.tsx`
- **Props:** `{ spectrum: FireSpectrumData; diegoTarget?: number; privacyMode: boolean }`
- **Visual:** 4 bandas coloridas (horizontal stacked). Cada banda mostra nome, múltiplo, SWR%, alvo (fmtPrivacy). Indicador da posição atual de Diego. Nota: "Diego's model target (R$10M) = 480x = SWR 2.5% — above Fat FIRE."
- **data-testid:** `fire-spectrum-widget`, `fire-spectrum-band-fat`, `fire-spectrum-band-fire`, `fire-spectrum-band-lean`, `fire-spectrum-band-barista`
- **Wire em `fire/page.tsx`:** CollapsibleSection `id="section-fire-spectrum"` após `section-coast-fire`

### Changelog entry
```typescript
{ datetime: '2026-04-30T...', type: 'dado', component: 'FireSpectrumWidget', tab: 'fire', anchor: 'section-fire-spectrum', de: 'ausente', para: 'FIRE Spectrum — Fat FIRE / FIRE / Lean FIRE / Barista FIRE com múltiplos e SWR implícito' }
```

---

## Feature 3 — Historical Cycle Simulation

**Conceito:** Metodologia Bengen/cFIREsim adaptada ao Brasil — simula cada janela histórica desde 2003 como cenário de aposentadoria. Validação independente do Monte Carlo distribucional.

**Limitação crítica:** ~23 anos de dados BR → janelas sobrepostas → **sanity check**, não estimativa probabilística rival ao MC.

### Script Python

**Criar:** `scripts/brfiresim.py` (script standalone, NÃO wired em `generate_data.py`)
**Output:** `react-app/public/brfiresim_results.json`

Fontes de dados e fallbacks:
- **IPCA mensal:** BCB REST API `api.bcb.gov.br/dados/serie/bcdata.sgs.433` (sem dependência de lib)
- **Equity BRL:** yfinance `^BVSP` ou `BOVA11.SA` (já disponível no stack)
- **NTN-B:** pyield ANBIMA (instalar se ausente) → fallback BCB SGS 12466 → fallback 6% real fixo

⚠️ `pyield` e `python-bcb` podem não estar instalados — implementar try/except com fallback gracioso.

Schema do output `brfiresim_results.json`:
```json
{
  "_generated": "ISO",
  "data_range": {"inicio": "2003-01", "fim": "2026-04"},
  "cycles": [
    {
      "ano_inicio": 2003, "duracao_anos": 20,
      "resultados_swr": {
        "3pct": {"sucesso": true, "saldo_final": 12000000, "min_saldo": 8000000},
        "4pct": {"sucesso": true, "saldo_final": 9000000, "min_saldo": 5000000},
        "6pct": {"sucesso": false, "saldo_final": 0, "min_saldo": 0},
        "8pct": {"sucesso": false, "saldo_final": 0, "min_saldo": 0}
      }
    }
  ],
  "resumo": {
    "taxa_sucesso_3pct": 0.846, "taxa_sucesso_4pct": 0.769,
    "taxa_sucesso_6pct": 0.615, "taxa_sucesso_8pct": 0.385,
    "n_ciclos": 13
  },
  "series": {
    "datas": ["2003-01", "..."],
    "retornos_equity_brl_pct": [1.2, "..."],
    "ipca_mensal_pct": [0.42, "..."]
  },
  "_fontes": {"ipca": "BCB SGS 433", "equity_brl": "yfinance BOVA11.SA"},
  "_caveat": "23 years of Brazilian data = overlapping windows. Interpret as sanity check."
}
```

### TypeScript + UI

**Tipos inline em `BRFireSimSection.tsx`** (single consumer):
```typescript
interface BRFireSimCycle {
  ano_inicio: number; duracao_anos: number;
  resultados_swr: Record<string, { sucesso: boolean; saldo_final: number; min_saldo: number }>;
}
interface BRFireSimResult {
  _generated: string; data_range: { inicio: string; fim: string };
  cycles: BRFireSimCycle[];
  resumo: Record<string, number>;
  series: { datas: string[]; retornos_equity_brl_pct: number[]; ipca_mensal_pct: number[] };
  _fontes: Record<string, string>;
  _caveat: string;
}
```

**Criar:** `react-app/src/components/charts/BRFireSimChart.tsx`
- ECharts bar chart: x=ano_inicio, y=success/failure por SWR
- Usa `useEChartsPrivacy()`, padrão de `DrawdownExtendedChart.tsx`

**Criar:** `react-app/src/app/backtest/BRFireSimSection.tsx`
- Hook `useBRFireSim()` — fetch lazy de `/brfiresim_results.json`
- Renderiza: caveat badge + KPI cards (taxa_sucesso por SWR) + tabela de ciclos + BRFireSimChart
- Se JSON ausente: exibe "Run `python scripts/brfiresim.py` to generate data"

**Wire em `backtest/page.tsx`:**
- Import + CollapsibleSection `id="section-brfiresim"` com SectionDivider "Historical Cycle Simulation"
- data-testid: `brfiresim-section`, `brfiresim-summary`, `brfiresim-chart`

---

## Technical Risks

| Risco | Feature | Mitigação |
|-------|---------|-----------|
| `pyield` não instalado | 3 | Fallback BCB REST → fixo 6% real |
| `python-bcb` não instalado | 3 | Usar BCB REST API direta sem lib |
| R$10M vs R$8.33M como FIRE_NUMBER | 1 | Usar R$10M hardcoded; adicionar `FIRE_NUMBER_TARGET = 10_000_000` em `config.py` |
| `adj_stress` sign convention | 1 | Confirmar em `config.py`: `ADJ_STRESS = -0.010` (negativo) |
| brfiresim_results.json ausente no build | 3 | Fetch lazy no cliente com null guard — build não falha |
| Janelas sobrepostas (23 anos dados BR) | 3 | Caveat badge proeminente; comunicar como sanity check |

---

## Próximos Passos

- [x] **Arquiteto**: spec estruturada (este arquivo)
- [x] **Dev**: implementar Features 1+2 (pipeline + React) → build → commit `e5ddc75d`
- [x] **Dev**: implementar Feature 3 (brfiresim.py + UI) → build → commit `dfaa8c4e`
- [x] **QA**: testes criados — coast-fire.test.ts (26), fire-spectrum.test.ts (40), schema-validation + E2E → commit `6f78291d`
- [x] **Quant**: validado. Achados críticos aplicados: adj_stress=-0.005 (config.py já correto), proxy SWRD.L (não BVSP), janela 20y→4 ciclos, taxa_sucesso como fração

### Quant findings incorporados
- `adj_stress = -0.005` em config.py (não -0.010 do spec) ✓
- Proxy equity: SWRD.L+PTAX (não BVSP) — correlação BVSP/MSCI World ~0.60 < threshold 0.85
- n_ciclos=4 para janela de 20 anos com dados 2003-2025 (Opção A do Quant)
- `taxa_sucesso` exibida como "X de N ciclos históricos" — nunca como probabilidade %
- Disclaimer: bandas Lean (6%) e Barista (8%) não são SWRs sustentáveis para 37 anos (na UI: caveat badge)
