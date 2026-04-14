/**
 * UI Store — Interface State Management
 * Privacy mode, collapse state, tab selection
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UIState {
  // Privacy mode
  privacyMode: boolean;
  togglePrivacy: () => void;
  setPrivacy: (enabled: boolean) => void;

  // Collapse state
  collapseState: Record<string, boolean>;
  toggleCollapse: (id: string) => void;
  setCollapse: (id: string, collapsed: boolean) => void;

  // Simulator tab
  activeSimulator: 'mc' | 'stress' | 'whatif';
  setActiveSimulator: (simulator: 'mc' | 'stress' | 'whatif') => void;

  // Period filter
  activePeriod: 'all' | '1y' | '3m' | '1m';
  setActivePeriod: (period: 'all' | '1y' | '3m' | '1m') => void;
}

export const useUiStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Privacy mode
      privacyMode: false,
      togglePrivacy: () => {
        set(state => ({ privacyMode: !state.privacyMode }));
      },
      setPrivacy: (enabled: boolean) => {
        set({ privacyMode: enabled });
      },

      // Collapse state
      collapseState: {},
      toggleCollapse: (id: string) => {
        set(state => ({
          collapseState: {
            ...state.collapseState,
            [id]: !state.collapseState[id],
          },
        }));
      },
      setCollapse: (id: string, collapsed: boolean) => {
        set(state => ({
          collapseState: {
            ...state.collapseState,
            [id]: collapsed,
          },
        }));
      },

      // Simulator tab
      activeSimulator: 'mc',
      setActiveSimulator: (simulator: 'mc' | 'stress' | 'whatif') => {
        set({ activeSimulator: simulator });
      },

      // Period filter
      activePeriod: 'all',
      setActivePeriod: (period: 'all' | '1y' | '3m' | '1m') => {
        set({ activePeriod: period });
      },
    }),
    {
      name: 'dashboard-ui-store',
      partialize: state => ({
        privacyMode: state.privacyMode,
        collapseState: state.collapseState,
        activeSimulator: state.activeSimulator,
        activePeriod: state.activePeriod,
      }),
    }
  )
);
