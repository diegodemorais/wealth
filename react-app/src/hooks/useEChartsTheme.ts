/**
 * ECharts Theme Configuration
 * Professional dark mode with FIRE theme colors
 */

export function useEChartsTheme() {
  return {
    color: [
      '#f59e0b', // amber - primary
      '#3b82f6', // blue
      '#10b981', // green
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#14b8a6', // teal
      '#f97316', // orange
      '#6366f1', // indigo
      '#84cc16', // lime
    ],
    backgroundColor: '#111827',
    textStyle: {
      color: '#e5e7eb',
      fontFamily: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
    },
    title: {
      textStyle: {
        color: '#f3f4f6',
        fontSize: 16,
        fontWeight: 600,
      },
      subtextStyle: {
        color: '#9ca3af',
      },
    },
    line: {
      itemStyle: {
        borderWidth: 1.5,
      },
      lineStyle: {
        width: 2,
      },
      smooth: true,
    },
    radar: {
      itemStyle: {
        borderWidth: 1,
      },
      lineStyle: {
        width: 1.5,
      },
      symbolSize: 4,
    },
    bar: {
      itemStyle: {
        barBorderRadius: [4, 4, 0, 0],
      },
    },
    pie: {
      itemStyle: {
        borderRadius: 8,
        borderColor: '#1f2937',
        borderWidth: 1.5,
      },
      label: {
        color: '#d1d5db',
      },
      labelLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
    },
    scatter: {
      itemStyle: {
        opacity: 0.8,
      },
    },
    boxplot: {
      itemStyle: {
        borderWidth: 1.5,
      },
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
      },
    },
    sankey: {
      itemStyle: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#374151',
      },
      label: {
        color: '#d1d5db',
      },
      lineStyle: {
        color: '#4b5563',
        opacity: 0.5,
      },
    },
    funnel: {
      itemStyle: {
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#374151',
      },
    },
    gauge: {
      itemStyle: {
        borderRadius: 4,
        borderWidth: 1,
      },
      progress: {
        itemStyle: {
          borderRadius: 4,
        },
      },
      anchor: {
        itemStyle: {
          color: '#f59e0b',
        },
      },
      detail: {
        valueAnimation: true,
        color: '#f3f4f6',
      },
    },
    candlestick: {
      itemStyle: {
        color: '#10b981',
        color0: '#ef4444',
        borderColor: '#10b981',
        borderColor0: '#ef4444',
        borderWidth: 1,
      },
    },
    graph: {
      itemStyle: {
        borderWidth: 1,
        borderColor: '#374151',
      },
      lineStyle: {
        width: 1.5,
        color: '#4b5563',
      },
      symbolSize: 4,
      smooth: false,
      color: [
        '#f59e0b',
        '#3b82f6',
        '#10b981',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4',
      ],
      label: {
        color: '#e5e7eb',
      },
    },
    map: {
      itemStyle: {
        areaColor: '#2d3748',
        borderColor: '#1f2937',
        borderWidth: 0.5,
      },
      label: {
        color: '#e5e7eb',
      },
      emphasis: {
        itemStyle: {
          areaColor: '#f59e0b',
          borderColor: '#fbbf24',
          borderWidth: 1,
        },
        label: {
          color: '#fff',
        },
      },
    },
    geo: {
      itemStyle: {
        areaColor: '#2d3748',
        borderColor: '#1f2937',
        borderWidth: 0.5,
      },
      label: {
        color: '#e5e7eb',
      },
      emphasis: {
        itemStyle: {
          areaColor: '#f59e0b',
          borderColor: '#fbbf24',
          borderWidth: 1,
        },
        label: {
          color: '#fff',
        },
      },
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: '#374151',
          width: 0.5,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
      },
      splitLine: {
        show: false,
      },
      splitArea: {
        show: false,
      },
    },
    valueAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: '#374151',
          width: 0.5,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#2d3748',
          width: 0.5,
        },
      },
      splitArea: {
        show: false,
      },
    },
    logAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: '#374151',
          width: 0.5,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#2d3748',
          width: 0.5,
        },
      },
      splitArea: {
        show: false,
      },
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: '#374151',
          width: 0.5,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: '#2d3748',
          width: 0.5,
        },
      },
      splitArea: {
        show: false,
      },
    },
    toolbox: {
      iconStyle: {
        borderColor: '#9ca3af',
      },
      emphasis: {
        iconStyle: {
          borderColor: '#f59e0b',
        },
      },
    },
    legend: {
      textStyle: {
        color: '#d1d5db',
      },
      pageButtonItemStyle: {
        color: '#9ca3af',
        borderColor: '#374151',
      },
      pageButtonEmphasisItemStyle: {
        color: '#f59e0b',
        borderColor: '#f59e0b',
      },
    },
    tooltip: {
      borderColor: '#374151',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      textStyle: {
        color: '#e5e7eb',
      },
      axisPointer: {
        lineStyle: {
          color: '#4b5563',
          width: 1,
        },
        crossStyle: {
          color: '#f59e0b',
          width: 1,
        },
      },
    },
    timeline: {
      lineStyle: {
        color: '#374151',
        width: 1,
      },
      itemStyle: {
        color: '#2d3748',
        borderColor: '#4b5563',
      },
      controlStyle: {
        color: '#9ca3af',
        borderColor: '#374151',
      },
      checkpointStyle: {
        color: '#f59e0b',
        borderColor: '#fbbf24',
      },
      label: {
        color: '#9ca3af',
      },
      emphasis: {
        itemStyle: {
          color: '#4b5563',
        },
        controlStyle: {
          color: '#f3f4f6',
          borderColor: '#9ca3af',
        },
        label: {
          color: '#e5e7eb',
        },
      },
    },
    visualMap: {
      textStyle: {
        color: '#9ca3af',
      },
      itemWidth: 10,
      itemHeight: 120,
      inRange: {
        color: ['#2d3748', '#374151', '#4b5563', '#f59e0b'],
      },
      outOfRange: {
        color: ['#10b981', '#ef4444'],
      },
    },
    markPoint: {
      label: {
        color: '#e5e7eb',
      },
      emphasis: {
        label: {
          color: '#fff',
        },
      },
    },
  };
}
