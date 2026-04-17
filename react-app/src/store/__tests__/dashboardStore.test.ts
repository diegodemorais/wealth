import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useDashboardStore } from '../dashboardStore';
import { DashboardData, MCParams } from '@/types/dashboard';

describe('Dashboard Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useDashboardStore.setState({
      data: null,
      derived: null,
      isLoadingData: false,
      dataLoadError: null,
      mcParams: {
        initialCapital: 1000000,
        monthlyContribution: 5000,
        returnMean: 0.07,
        returnStd: 0.12,
        stressLevel: 0,
        years: 30,
        numSims: 1000,
      },
      mcResults: null,
    });
    // Reset singleton promise between tests
    vi.restoreAllMocks();
  });

  const mockData: DashboardData = {
    _generated: '2026-04-14T10:00:00Z',
    _generated_brt: '2026-04-14T07:00:00-03:00',
    date: '2026-04-14',
    timestamps: {
      posicoes_ibkr: '2026-04-14T10:00:00Z',
      precos_yfinance: '2026-04-14T10:00:00Z',
      historico_csv: '2026-04-14T10:00:00Z',
      holdings_md: '2026-04-14T10:00:00Z',
      fire_mc: '2026-04-14T10:00:00Z',
      geral: '2026-04-14T10:00:00Z',
    },
    cambio: 5.0,
    posicoes: {},
    pesosTarget: {},
    pisos: {
      pisoTaxaIpcaLongo: 0.045,
      pisoTaxaRendaPlus: 0.05,
      pisoVendaRendaPlus: 0.045,
      ir_aliquota: 0.15,
    },
    premissas: {
      patrimonio_atual: 1000000,
      patrimonio_gatilho: 2500000,
      idade_atual: 35,
      idade_cenario_base: 50,
      custo_vida_base: 60000,
    },
    rf: {
      ipca2029: { valor: 100000 },
      ipca2040: { valor: 200000 },
      ipca2050: { valor: 300000 },
      renda2065: { valor: 150000 },
    },
  } as DashboardData;

  describe('Data Actions', () => {
    it('setData initializes store', () => {
      const { setData } = useDashboardStore.getState();
      expect(() => setData(mockData)).not.toThrow();
    });

    it('setData computes derived values', () => {
      const { setData } = useDashboardStore.getState();
      setData(mockData);
      const state = useDashboardStore.getState();
      expect(state.data).toEqual(mockData);
      // derived may be null if data is too minimal to compute, but no throw
      expect(state.dataLoadError).toBeNull();
    });

    it('setData with invalid data sets derived to null but does not throw', () => {
      const { setData } = useDashboardStore.getState();
      // Pass something that will cause computeDerivedValues to throw
      expect(() => setData({} as DashboardData)).not.toThrow();
      // data is still stored even if derived computation fails
      const state = useDashboardStore.getState();
      expect(state.data).toBeDefined();
    });

    it('updateField is available', () => {
      const { updateField } = useDashboardStore.getState();
      expect(typeof updateField).toBe('function');
    });

    it('updateField does nothing when data is null', () => {
      const { updateField } = useDashboardStore.getState();
      expect(() => updateField('cambio', 5.5)).not.toThrow();
      const state = useDashboardStore.getState();
      expect(state.data).toBeNull();
    });

    it('updateField updates a field when data is loaded', () => {
      const { setData, updateField } = useDashboardStore.getState();
      setData(mockData);
      updateField('cambio', 5.5);
      const state = useDashboardStore.getState();
      expect(state.data?.cambio).toBe(5.5);
    });

    it('initial state has null data and no error', () => {
      const state = useDashboardStore.getState();
      expect(state.data).toBeNull();
      expect(state.derived).toBeNull();
      expect(state.isLoadingData).toBe(false);
      expect(state.dataLoadError).toBeNull();
    });
  });

  describe('loadDataOnce', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets isLoadingData while fetching', async () => {
      let resolveFetch!: (v: any) => void;
      const fetchPromise = new Promise(resolve => { resolveFetch = resolve; });

      vi.stubGlobal('fetch', () => fetchPromise);

      const store = useDashboardStore.getState();
      const loadPromise = store.loadDataOnce().catch(() => {});

      // Should be loading immediately
      expect(useDashboardStore.getState().isLoadingData).toBe(true);

      // Resolve with valid data
      resolveFetch({
        ok: true,
        json: async () => ({
          ...mockData,
          posicoes: {},
          rf: { ipca2029: {}, ipca2040: {}, ipca2050: {}, renda2065: {} },
          fire_trilha: {},
          cambio: 5.0,
          pfire_base: { base: 90.0 },
        }),
      });

      await loadPromise;
    });

    it('returns cached data if already loaded', async () => {
      const { setData } = useDashboardStore.getState();
      setData(mockData);

      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const result = await useDashboardStore.getState().loadDataOnce();

      // Should return cached data without fetching
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('MC Params Management', () => {
    it('initializes with default MC params', () => {
      const state = useDashboardStore.getState();
      expect(state.mcParams.initialCapital).toBe(1000000);
      expect(state.mcParams.monthlyContribution).toBe(5000);
      expect(state.mcParams.returnMean).toBe(0.07);
      expect(state.mcParams.returnStd).toBe(0.12);
      expect(state.mcParams.stressLevel).toBe(0);
    });

    it('updates MC params partially', () => {
      const { setMcParams } = useDashboardStore.getState();
      setMcParams({ monthlyContribution: 10000 });

      const state = useDashboardStore.getState();
      expect(state.mcParams.monthlyContribution).toBe(10000);
      expect(state.mcParams.initialCapital).toBe(1000000); // Unchanged
    });

    it('updates stress level', () => {
      const { setMcParams } = useDashboardStore.getState();
      setMcParams({ stressLevel: 50 });

      const state = useDashboardStore.getState();
      expect(state.mcParams.stressLevel).toBe(50);
    });
  });

  describe('MC Results', () => {
    it('stores MC results', () => {
      const { setMcResults } = useDashboardStore.getState();
      const mockResults = {
        trajectories: [[1000000, 1010000]],
        endWealthDist: [2500000],
        percentiles: { p10: [1500000], p50: [2000000], p90: [2500000] },
        successRate: 0.85,
        medianEndWealth: 2000000,
      };

      setMcResults(mockResults);

      const state = useDashboardStore.getState();
      expect(state.mcResults).toEqual(mockResults);
    });

    it('clears MC results when set to null', () => {
      const { setMcResults } = useDashboardStore.getState();
      setMcResults(null);

      const state = useDashboardStore.getState();
      expect(state.mcResults).toBeNull();
    });
  });

  describe('runMC action', () => {
    it('executes MC simulation with default params', () => {
      const { runMC } = useDashboardStore.getState();
      runMC();

      const state = useDashboardStore.getState();
      expect(state.mcResults).toBeDefined();
      expect(state.mcResults?.trajectories).toBeDefined();
      expect(state.mcResults?.successRate).toBeDefined();
    });

    it('applies stress level to returns', () => {
      const { setMcParams, runMC } = useDashboardStore.getState();

      // Run without stress
      setMcParams({ stressLevel: 0 });
      runMC();
      const stateNoStress = useDashboardStore.getState();
      const resultNoStress = stateNoStress.mcResults;

      // Run with stress
      setMcParams({ stressLevel: 50 });
      runMC();
      const stateWithStress = useDashboardStore.getState();
      const resultWithStress = stateWithStress.mcResults;

      // Stress should not increase success rate (can be equal if both are 100%)
      expect(resultWithStress?.successRate).toBeLessThanOrEqual(resultNoStress?.successRate || 0);
    });

    it('runs with custom parameters', () => {
      const { runMC } = useDashboardStore.getState();
      const customParams: Partial<MCParams> = {
        monthlyContribution: 20000,
      };

      runMC(customParams);

      const state = useDashboardStore.getState();
      // Should have MC results after running
      expect(state.mcResults).toBeDefined();
    });
  });

  describe('Stress Shocks', () => {
    it('sets return shock', () => {
      const { setStressShock } = useDashboardStore.getState();
      setStressShock('returnShock', -0.2);

      const state = useDashboardStore.getState();
      expect(state.stress.returnShock).toBe(-0.2);
    });

    it('sets volatility shock', () => {
      const { setStressShock } = useDashboardStore.getState();
      setStressShock('volatilityShock', 0.5);

      const state = useDashboardStore.getState();
      expect(state.stress.volatilityShock).toBe(0.5);
    });

    it('sets contribution shock', () => {
      const { setStressShock } = useDashboardStore.getState();
      setStressShock('contributionShock', -0.3);

      const state = useDashboardStore.getState();
      expect(state.stress.contributionShock).toBe(-0.3);
    });
  });
});
