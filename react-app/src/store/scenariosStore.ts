/**
 * scenariosStore — F5 DEV-boldin-dashboard
 * Persistent named scenarios for the What-If simulator.
 * Key: "scenarios-store" (localStorage).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScenarioInputs {
  aporte_mensal: number;
  retorno_equity: number;
  custo_vida: number;
  taxa_ipca: number;
}

export interface ScenarioResult {
  p_fire: number | null;
  fire_year: number | null;
  pat_mediano: number | null;
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  inputs: ScenarioInputs;
  result?: ScenarioResult;
}

const MAX_SCENARIOS = 10;

function uuid(): string {
  // Use crypto.randomUUID if available (browser/Node 19+), else timestamp-based fallback
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const t = Date.now().toString(36);
  const c = typeof performance !== 'undefined' ? performance.now().toString(36).replace('.', '') : '0';
  return `${t}-${c}`;
}

interface ScenariosStore {
  scenarios: SavedScenario[];
  saveScenario: (name: string, inputs: ScenarioInputs, result?: ScenarioResult) => { ok: boolean; error?: string };
  deleteScenario: (id: string) => void;
  loadScenario: (id: string) => SavedScenario | undefined;
  clearAll: () => void;
}

export const useScenariosStore = create<ScenariosStore>()(
  persist(
    (set, get) => ({
      scenarios: [],

      saveScenario(name, inputs, result) {
        const { scenarios } = get();
        if (scenarios.length >= MAX_SCENARIOS) {
          return { ok: false, error: `Limite de ${MAX_SCENARIOS} cenários atingido. Exclua um para continuar.` };
        }
        const scenario: SavedScenario = {
          id: uuid(),
          name: name.trim() || `Cenário ${scenarios.length + 1}`,
          createdAt: new Date().toISOString(),
          inputs,
          result,
        };
        set(s => ({ scenarios: [...s.scenarios, scenario] }));
        return { ok: true };
      },

      deleteScenario(id) {
        set(s => ({ scenarios: s.scenarios.filter(sc => sc.id !== id) }));
      },

      loadScenario(id) {
        return get().scenarios.find(sc => sc.id === id);
      },

      clearAll() {
        set({ scenarios: [] });
      },
    }),
    {
      name: 'scenarios-store',
      version: 1,
    }
  )
);
