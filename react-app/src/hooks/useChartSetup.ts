'use client';

import { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// @ts-ignore - Sankey chart types not fully typed
import { SankeyController } from 'chartjs-chart-sankey';

export function useChartSetup() {
  useEffect(() => {
    // Register Chart.js components globally, once per mount
    try {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        LogarithmicScale,
        RadialLinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend,
        Filler,
        SankeyController
      );
      console.log('✅ Chart.js registered successfully');
    } catch (e) {
      console.error('❌ Failed to register Chart.js:', e);
    }
  }, []);
}
