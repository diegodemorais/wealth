import { useEffect, useRef } from 'react';

/**
 * Hook para notificar ECharts quando o container é redimensionado.
 *
 * Usa ResizeObserver (quando disponível) para reagir ao redimensionamento
 * do container diretamente — mais robusto que window resize event.
 * Fallback: window.addEventListener('resize') para ambientes sem ResizeObserver.
 *
 * Hidden-tab handling: em seções colapsáveis que usam display:none,
 * o ECharts não renderiza corretamente se offsetWidth === 0 no mount.
 * O ResizeObserver dispara quando o container torna-se visível,
 * garantindo que o chart faça resize correto.
 *
 * Issue: ARCH-handleChartResize-dead-code
 */
export function useChartResize() {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      // Check offsetWidth > 0 before calling resize to avoid resize on hidden containers
      if (chartRef.current?.getEchartsInstance?.() && chartRef.current?.offsetWidth > 0) {
        chartRef.current.getEchartsInstance().resize();
      }
    };

    // ResizeObserver: fires when container dimensions change (including hidden→visible transitions)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && chartRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // setTimeout retry ensures ECharts has rendered before we call resize
        setTimeout(() => {
          if (chartRef.current?.getEchartsInstance?.() && chartRef.current?.offsetWidth > 0) {
            chartRef.current.getEchartsInstance().resize();
          }
        }, 50);
      });

      const container = chartRef.current?.ele ?? chartRef.current;
      if (container instanceof Element) {
        resizeObserver.observe(container);
      }
    }

    // Fallback: window resize event
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, []);

  return chartRef;
}
