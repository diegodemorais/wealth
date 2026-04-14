/**
 * Chart.js Setup & Global Registration
 * Must be imported before any chart components render
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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

// Register Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
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

export default ChartJS;
