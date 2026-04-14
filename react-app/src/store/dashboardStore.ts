/**
 * Dashboard Store — Global State Management
 * Using Zustand for reactive state without Redux boilerplate
 */

import { create } from 'zustand';
import { DashboardData, DerivedValues, MCParams, MCResult } from '@/types/dashboard';
import { computeDerivedValues } from '@/utils/dataWiring';

export interface DashboardState {
  // Data
  data: DashboardData | null;
  derived: DerivedValues | null;

  // Actions
  setData: (data: DashboardData) => void;
  updateField: (key: keyof DashboardData, value: any) => void;

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
}

const defaultMcParams: MCParams = {
  initialCapital: 1000000,
  monthlyContribution: 5000,
  returnMean: 0.07,
  returnStd: 0.12,
  years: 30,
  numSims: 1000,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  data: null,
  derived: null,

  stress: {
    returnShock: 0,
    volatilityShock: 0,
    contributionShock: 0,
  },
  mcParams: defaultMcParams,
  mcResults: null,

  // Data actions
  setData: (data: DashboardData) => {
    const derived = computeDerivedValues(data);
    set({ data, derived });
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
}));
