import { useEffect, useRef } from 'react';

/**
 * Hook para notificar ECharts quando o container é redimensionado
 * Especialmente útil quando seções colapsáveis expandem/contraem
 */
export function useChartResize() {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current?.getEchartsInstance?.()) {
        chartRef.current.getEchartsInstance().resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return chartRef;
}
