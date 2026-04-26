/**
 * Dashboard Store — Global State Management
 * Using Zustand for reactive state without Redux boilerplate
 */

import { create } from 'zustand';
import { DashboardData, DerivedValues, MCParams, MCResult } from '@/types/dashboard';
import { computeDerivedValues, validateDataSchema } from '@/utils/dataWiring';
import { runMC } from '@/utils/montecarlo';
import { withBasePath } from '@/utils/basePath';

// Singleton promise tracking — prevents duplicate in-flight requests
let loadDataPromise: Promise<DashboardData> | null = null;
let abortController: AbortController | null = null;

export interface DashboardState {
  // Data
  data: DashboardData | null;
  derived: DerivedValues | null;
  isLoadingData: boolean;
  dataLoadError: string | null;

  // Actions
  setData: (data: DashboardData) => void;
  updateField: (key: keyof DashboardData, value: any) => void;
  loadDataOnce: () => Promise<DashboardData>;

  // Simulator state (Phase 4)
  stress: {
    returnShock: number; // -20% to +20%
    volatilityShock: number; // -50% to +50%
    contributionShock: number; // -50% to +100%
  };
  mcParams: MCParams;
  mcResults: MCResult | null;

  // Simulator actions
  setStressShock: (key: keyof DashboardState['stress'], value: number) => void;
  setMcParams: (params: Partial<MCParams>) => void;
  setMcResults: (results: MCResult | null) => void;
  runMC: (params?: Partial<MCParams>) => void;
}

const defaultMcParams: MCParams = {
  initialCapital: 1000000,
  monthlyContribution: 5000,
  returnMean: 0.07,
  returnStd: 0.12,
  stressLevel: 0,
  years: 30,
  numSims: 1000,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  data: null,
  derived: null,
  isLoadingData: false,
  dataLoadError: null,

  stress: {
    returnShock: 0,
    volatilityShock: 0,
    contributionShock: 0,
  },
  mcParams: defaultMcParams,
  mcResults: null,

  // Data actions
  setData: (data: DashboardData) => {
    try {
      const derived = computeDerivedValues(data);
      set({ data, derived, dataLoadError: null });
    } catch (e) {
      console.error('Error computing derived values:', e);
      set({ data, derived: null });
    }
  },

  // Singleton data loading
  loadDataOnce: async () => {
    const state = get();

    // If data already loaded, return it
    if (state.data) {
      console.log('Dashboard: data already cached, returning from store');
      return state.data;
    }

    // If request already in-flight, wait for it
    if (loadDataPromise) {
      console.log('Dashboard: request in-flight, waiting for existing promise');
      return loadDataPromise;
    }

    // New request — set loading state
    set({ isLoadingData: true, dataLoadError: null });

    // Create new AbortController for this request
    abortController = new AbortController();

    // Fetch data once
    loadDataPromise = (async () => {
      try {
        const dataUrl = withBasePath('/data.json');
        console.log('Dashboard: fetching data from', dataUrl);

        const response = await fetch(dataUrl, {
          signal: abortController!.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from ${dataUrl}`);
        }

        let data = await response.json();

        // Load realized_pnl.json for DARF obligations
        try {
          const realizedPnlUrl = withBasePath('/data/realized_pnl.json');
          const rpResponse = await fetch(realizedPnlUrl, {
            signal: abortController!.signal,
          });
          if (rpResponse.ok) {
            const realizedPnl = await rpResponse.json();
            data.realized_pnl = realizedPnl;
            console.log('Dashboard: realized_pnl loaded successfully');
          }
        } catch (e) {
          console.warn('Dashboard: could not load realized_pnl.json, continuing without DARF data:', e);
        }

        // Validate schema before storing
        validateDataSchema(data);

        // Store data in Zustand
        set({ data, isLoadingData: false, dataLoadError: null });
        const derived = computeDerivedValues(data);
        set({ derived });

        console.log('Dashboard: data loaded successfully, cached in store');
        return data;
      } catch (error) {
        // If aborted, don't set error state
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Dashboard: data load aborted');
          loadDataPromise = null;
          throw error;
        }

        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Dashboard: failed to load data:', errorMsg);
        set({ isLoadingData: false, dataLoadError: errorMsg });
        loadDataPromise = null;
        throw error;
      }
    })();

    return loadDataPromise;
  },

  updateField: (key: keyof DashboardData, value: any) => {
    set(state => {
      if (!state.data) return state;
      const updated = { ...state.data, [key]: value };
      const derived = computeDerivedValues(updated);
      return { data: updated, derived };
    });
  },

  // Simulator actions
  setStressShock: (key: keyof DashboardState['stress'], value: number) => {
    set(state => ({
      stress: { ...state.stress, [key]: value },
    }));
  },

  setMcParams: (params: Partial<MCParams>) => {
    set(state => ({
      mcParams: { ...state.mcParams, ...params },
    }));
  },

  setMcResults: (results: MCResult | null) => {
    set({ mcResults: results });
  },

  runMC: (params?: Partial<MCParams>) => {
    const state = get();
    const finalParams = params ? { ...state.mcParams, ...params } : state.mcParams;

    try {
      // Apply stress level to returns
      const stressedParams = {
        ...finalParams,
        returnMean: finalParams.returnMean * (1 - finalParams.stressLevel / 100),
        returnStd: finalParams.returnStd * (1 + finalParams.stressLevel / 200),
      };

      const results = runMC(stressedParams);
      const drawdownDistribution: { [key: string]: number } = {};

      // Generate drawdown buckets from trajectories
      if (results.trajectories && results.trajectories.length > 0) {
        results.trajectories.forEach(trajectory => {
          let maxDD = 0;
          let peak = trajectory[0];

          for (let i = 1; i < trajectory.length; i++) {
            if (trajectory[i] > peak) {
              peak = trajectory[i];
            }
            const dd = (peak - trajectory[i]) / peak;
            if (dd > maxDD) {
              maxDD = dd;
            }
          }

          const bucket = `${Math.floor(maxDD * 100)}-${Math.floor(maxDD * 100) + 5}%`;
          drawdownDistribution[bucket] = (drawdownDistribution[bucket] || 0) + 1;
        });
      }

      const mcResult: MCResult = {
        trajectories: results.trajectories || [],
        endWealthDist: results.endWealthDist || [],
        percentiles: results.percentiles || { p10: [], p50: [], p90: [] },
        successRate: results.successRate || 0,
        medianEndWealth: results.medianEndWealth || 0,
        drawdownDistribution,
      };

      set({ mcResults: mcResult });
    } catch (error) {
      console.error('Error running MC simulation:', error);
      set({ mcResults: null });
    }
  },
}));
