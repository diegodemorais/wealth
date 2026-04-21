module.exports = [
"[project]/react-app/src/components/primitives/CollapsibleSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CollapsibleSection",
    ()=>CollapsibleSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function CollapsibleSection({ id, title, children, defaultOpen = true, icon = '📋' }) {
    const collapseState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.collapseState);
    const setCollapse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.setCollapse);
    const isCollapsed = collapseState[id] ?? !defaultOpen;
    const contentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [height, setHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('auto');
    // Update height on mount and when collapsed state changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (contentRef.current) {
            if (isCollapsed) {
                setHeight(0);
            } else {
                setHeight(contentRef.current.scrollHeight);
                // Recalculate height if content changes
                const observer = new ResizeObserver(()=>{
                    if (contentRef.current) {
                        setHeight(contentRef.current.scrollHeight);
                    }
                });
                observer.observe(contentRef.current);
                // Dispatch resize event after animation completes (300ms) for ECharts to recalculate
                const resizeTimeout = setTimeout(()=>{
                    window.dispatchEvent(new Event('resize'));
                }, 300);
                return ()=>{
                    clearTimeout(resizeTimeout);
                    observer.disconnect();
                };
            }
        }
    }, [
        isCollapsed
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mb-5 rounded-lg overflow-hidden border border-slate-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "w-full px-4 py-4 bg-slate-800/50 border-b border-slate-700/50 cursor-pointer flex justify-between items-center text-white text-sm font-semibold transition-colors hover:bg-slate-700/50",
                onClick: ()=>setCollapse(id, !isCollapsed),
                "aria-expanded": !isCollapsed,
                "aria-controls": `content-${id}`,
                "data-test": `section-header-${id}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "flex items-center gap-3 flex-1 text-left",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-base min-w-6",
                            children: [
                                isCollapsed ? '▶️' : '▼',
                                " ",
                                icon
                            ]
                        }, void 0, true, {
                            fileName: "[project]/react-app/src/components/primitives/CollapsibleSection.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex-1",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/primitives/CollapsibleSection.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/primitives/CollapsibleSection.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/primitives/CollapsibleSection.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: `content-${id}`,
                ref: contentRef,
                className: "transition-all duration-300 ease-in-out",
                style: {
                    maxHeight: height,
                    overflow: isCollapsed ? 'hidden' : 'visible'
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/primitives/CollapsibleSection.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/primitives/CollapsibleSection.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
}),
"[project]/react-app/src/hooks/useEChartsTheme.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * ECharts Theme Configuration
 * Professional dark mode with FIRE theme colors
 */ __turbopack_context__.s([
    "useEChartsTheme",
    ()=>useEChartsTheme
]);
function useEChartsTheme() {
    return {
        color: [
            '#f59e0b',
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
            '#14b8a6',
            '#f97316',
            '#6366f1',
            '#84cc16'
        ],
        backgroundColor: '#111827',
        textStyle: {
            color: '#e5e7eb',
            fontFamily: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif"
        },
        title: {
            textStyle: {
                color: '#f3f4f6',
                fontSize: 16,
                fontWeight: 600
            },
            subtextStyle: {
                color: '#9ca3af'
            }
        },
        line: {
            itemStyle: {
                borderWidth: 1.5
            },
            lineStyle: {
                width: 2
            },
            smooth: true
        },
        radar: {
            itemStyle: {
                borderWidth: 1
            },
            lineStyle: {
                width: 1.5
            },
            symbolSize: 4
        },
        bar: {
            itemStyle: {
                barBorderRadius: [
                    4,
                    4,
                    0,
                    0
                ]
            }
        },
        pie: {
            itemStyle: {
                borderRadius: 8,
                borderColor: '#1f2937',
                borderWidth: 1.5
            },
            label: {
                color: '#d1d5db'
            },
            labelLine: {
                lineStyle: {
                    color: '#4b5563'
                }
            }
        },
        scatter: {
            itemStyle: {
                opacity: 0.8
            }
        },
        boxplot: {
            itemStyle: {
                borderWidth: 1.5
            }
        },
        parallel: {
            itemStyle: {
                borderWidth: 0
            }
        },
        sankey: {
            itemStyle: {
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#374151'
            },
            label: {
                color: '#d1d5db'
            },
            lineStyle: {
                color: '#4b5563',
                opacity: 0.5
            }
        },
        funnel: {
            itemStyle: {
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#374151'
            }
        },
        gauge: {
            itemStyle: {
                borderRadius: 4,
                borderWidth: 1
            },
            progress: {
                itemStyle: {
                    borderRadius: 4
                }
            },
            anchor: {
                itemStyle: {
                    color: '#f59e0b'
                }
            },
            detail: {
                valueAnimation: true,
                color: '#f3f4f6'
            }
        },
        candlestick: {
            itemStyle: {
                color: '#10b981',
                color0: '#ef4444',
                borderColor: '#10b981',
                borderColor0: '#ef4444',
                borderWidth: 1
            }
        },
        graph: {
            itemStyle: {
                borderWidth: 1,
                borderColor: '#374151'
            },
            lineStyle: {
                width: 1.5,
                color: '#4b5563'
            },
            symbolSize: 4,
            smooth: false,
            color: [
                '#f59e0b',
                '#3b82f6',
                '#10b981',
                '#8b5cf6',
                '#ec4899',
                '#06b6d4'
            ],
            label: {
                color: '#e5e7eb'
            }
        },
        map: {
            itemStyle: {
                areaColor: '#2d3748',
                borderColor: '#1f2937',
                borderWidth: 0.5
            },
            label: {
                color: '#e5e7eb'
            },
            emphasis: {
                itemStyle: {
                    areaColor: '#f59e0b',
                    borderColor: '#fbbf24',
                    borderWidth: 1
                },
                label: {
                    color: '#fff'
                }
            }
        },
        geo: {
            itemStyle: {
                areaColor: '#2d3748',
                borderColor: '#1f2937',
                borderWidth: 0.5
            },
            label: {
                color: '#e5e7eb'
            },
            emphasis: {
                itemStyle: {
                    areaColor: '#f59e0b',
                    borderColor: '#fbbf24',
                    borderWidth: 1
                },
                label: {
                    color: '#fff'
                }
            }
        },
        categoryAxis: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#374151',
                    width: 0.5
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#9ca3af',
                fontSize: 12
            },
            splitLine: {
                show: false
            },
            splitArea: {
                show: false
            }
        },
        valueAxis: {
            axisLine: {
                show: false,
                lineStyle: {
                    color: '#374151',
                    width: 0.5
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#9ca3af',
                fontSize: 12
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#2d3748',
                    width: 0.5
                }
            },
            splitArea: {
                show: false
            }
        },
        logAxis: {
            axisLine: {
                show: false,
                lineStyle: {
                    color: '#374151',
                    width: 0.5
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#9ca3af',
                fontSize: 12
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#2d3748',
                    width: 0.5
                }
            },
            splitArea: {
                show: false
            }
        },
        timeAxis: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#374151',
                    width: 0.5
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#9ca3af',
                fontSize: 12
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: '#2d3748',
                    width: 0.5
                }
            },
            splitArea: {
                show: false
            }
        },
        toolbox: {
            iconStyle: {
                borderColor: '#9ca3af'
            },
            emphasis: {
                iconStyle: {
                    borderColor: '#f59e0b'
                }
            }
        },
        legend: {
            textStyle: {
                color: '#d1d5db'
            },
            pageButtonItemStyle: {
                color: '#9ca3af',
                borderColor: '#374151'
            },
            pageButtonEmphasisItemStyle: {
                color: '#f59e0b',
                borderColor: '#f59e0b'
            }
        },
        tooltip: {
            borderColor: '#374151',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            textStyle: {
                color: '#e5e7eb'
            },
            axisPointer: {
                lineStyle: {
                    color: '#4b5563',
                    width: 1
                },
                crossStyle: {
                    color: '#f59e0b',
                    width: 1
                }
            }
        },
        timeline: {
            lineStyle: {
                color: '#374151',
                width: 1
            },
            itemStyle: {
                color: '#2d3748',
                borderColor: '#4b5563'
            },
            controlStyle: {
                color: '#9ca3af',
                borderColor: '#374151'
            },
            checkpointStyle: {
                color: '#f59e0b',
                borderColor: '#fbbf24'
            },
            label: {
                color: '#9ca3af'
            },
            emphasis: {
                itemStyle: {
                    color: '#4b5563'
                },
                controlStyle: {
                    color: '#f3f4f6',
                    borderColor: '#9ca3af'
                },
                label: {
                    color: '#e5e7eb'
                }
            }
        },
        visualMap: {
            textStyle: {
                color: '#9ca3af'
            },
            itemWidth: 10,
            itemHeight: 120,
            inRange: {
                color: [
                    '#2d3748',
                    '#374151',
                    '#4b5563',
                    '#f59e0b'
                ]
            },
            outOfRange: {
                color: [
                    '#10b981',
                    '#ef4444'
                ]
            }
        },
        markPoint: {
            label: {
                color: '#e5e7eb'
            },
            emphasis: {
                label: {
                    color: '#fff'
                }
            }
        }
    };
}
}),
"[project]/react-app/src/hooks/useEChartsPrivacy.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEChartsPrivacy",
    ()=>useEChartsPrivacy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useEChartsTheme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/hooks/useEChartsTheme.ts [app-ssr] (ecmascript)");
'use client';
;
;
function useEChartsPrivacy() {
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useEChartsTheme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEChartsTheme"])();
    /**
   * Wraps a chart option with privacy mode modifications
   * Masks tooltip and label values when privacy mode is enabled
   */ const withPrivacyMode = (option)=>{
        if (!privacyMode) {
            return option;
        }
        // Create a copy to avoid mutations
        const masked = JSON.parse(JSON.stringify(option));
        // Mask tooltip
        if (!masked.tooltip) {
            masked.tooltip = {};
        }
        const originalTooltipFormatter = masked.tooltip.formatter;
        masked.tooltip.formatter = (params)=>{
            if (typeof originalTooltipFormatter === 'function') {
                const original = originalTooltipFormatter(params);
                // Replace numeric values with •••• in tooltip
                if (typeof original === 'string') {
                    return original.replace(/R\$[\s\S]*?(?=<br|$)|[\d.,]+/g, '••••');
                }
                return '••••';
            }
            return '••••';
        };
        // Mask series labels
        if (masked.series && Array.isArray(masked.series)) {
            masked.series.forEach((serie)=>{
                if (serie.label) {
                    serie.label.color = 'transparent';
                }
                // Mask data labels
                if (serie.data && Array.isArray(serie.data)) {
                    serie.data.forEach((item)=>{
                        if (typeof item === 'object' && item !== null) {
                            item.value = undefined; // Hide numeric value
                        }
                    });
                }
            });
        }
        // Mask axis labels
        if (masked.xAxis) {
            if (Array.isArray(masked.xAxis)) {
                masked.xAxis.forEach((axis)=>{
                    if (axis.axisLabel) {
                        axis.axisLabel.color = 'transparent';
                    }
                });
            } else {
                if (masked.xAxis.axisLabel) {
                    masked.xAxis.axisLabel.color = 'transparent';
                }
            }
        }
        if (masked.yAxis) {
            if (Array.isArray(masked.yAxis)) {
                masked.yAxis.forEach((axis)=>{
                    if (axis.axisLabel) {
                        axis.axisLabel.color = 'transparent';
                    }
                });
            } else {
                if (masked.yAxis.axisLabel) {
                    masked.yAxis.axisLabel.color = 'transparent';
                }
            }
        }
        return masked;
    };
    return {
        privacyMode,
        withPrivacyMode,
        theme
    };
}
}),
"[project]/react-app/src/hooks/useChartResize.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useChartResize",
    ()=>useChartResize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useChartResize() {
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleResize = ()=>{
            if (chartRef.current?.getEchartsInstance?.()) {
                chartRef.current.getEchartsInstance().resize();
            }
        };
        window.addEventListener('resize', handleResize);
        return ()=>window.removeEventListener('resize', handleResize);
    }, []);
    return chartRef;
}
}),
"[project]/react-app/src/utils/chartSetup.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Chart Setup Factory — Centraliza builders ECharts
 * Reduz duplicação em componentes chart (goal: <50 linhas cada)
 */ __turbopack_context__.s([
    "createAttributionChartOption",
    ()=>createAttributionChartOption,
    "createBacktestChartOption",
    ()=>createBacktestChartOption,
    "createBaseOption",
    ()=>createBaseOption,
    "createBondPoolDeterministicOption",
    ()=>createBondPoolDeterministicOption,
    "createBondPoolProbabilisticOption",
    ()=>createBondPoolProbabilisticOption,
    "createBoundedLineChartOption",
    ()=>createBoundedLineChartOption,
    "createDeltaBarChartOption",
    ()=>createDeltaBarChartOption,
    "createDonutChartOption",
    ()=>createDonutChartOption,
    "createDrawdownHistChartOption",
    ()=>createDrawdownHistChartOption,
    "createDualLineChartOption",
    ()=>createDualLineChartOption,
    "createGlidePathChartOption",
    ()=>createGlidePathChartOption,
    "createIncomeChartOption",
    ()=>createIncomeChartOption,
    "createNetWorthProjectionChartOption",
    ()=>createNetWorthProjectionChartOption,
    "createSankeyChartOption",
    ()=>createSankeyChartOption,
    "createSimpleLineChartOption",
    ()=>createSimpleLineChartOption,
    "createStackedAreaChartOption",
    ()=>createStackedAreaChartOption,
    "createTimelineChartOption",
    ()=>createTimelineChartOption,
    "createTornadoChartOption",
    ()=>createTornadoChartOption
]);
function createBaseOption(theme, privacyMode) {
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        }
    };
}
function createAttributionChartOption(options) {
    const { privacyMode, theme } = options;
    const categories = [
        'Equity Selection',
        'Allocation',
        'Market Return',
        'Currency',
        'Costs'
    ];
    const attributionData = [
        2.5,
        1.2,
        4.8,
        -0.3,
        -0.6
    ];
    const colors = attributionData.map((v)=>v >= 0 ? '#10b981' : '#ef4444');
    return {
        ...createBaseOption(theme, privacyMode),
        xAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: '{value}%',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            },
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            }
        },
        series: [
            {
                name: 'Attribution (%)',
                type: 'bar',
                data: attributionData.map((value, idx)=>({
                        value,
                        itemStyle: {
                            color: colors[idx]
                        }
                    })),
                itemStyle: {
                    borderRadius: [
                        0,
                        4,
                        4,
                        0
                    ]
                }
            }
        ]
    };
}
function createDonutChartOption(options) {
    const { data, privacyMode, theme } = options;
    const posicoes = data.posicoes || {};
    const cambio = data.cambio || 1;
    let totalUsd = 0;
    const buckets = {
        SWRD: 0,
        AVGS: 0,
        AVEM: 0
    };
    Object.values(posicoes).forEach((p)=>{
        const val = (p.qty || 0) * (p.price || 0);
        totalUsd += val;
        if (p.bucket && buckets.hasOwnProperty(p.bucket)) {
            buckets[p.bucket] += val;
        }
    });
    const rfBrl = (data.rf?.ipca2029?.valor || 0) + (data.rf?.ipca2040?.valor || 0) + (data.rf?.ipca2050?.valor || 0) + (data.rf?.renda2065?.valor || 0);
    const hodlBrl = data.hodl11?.valor || 0;
    const equityBrl = totalUsd * cambio;
    const totalBrl = equityBrl + rfBrl + hodlBrl;
    const assetData = [
        {
            value: equityBrl,
            name: 'Equity',
            color: '#3b82f6'
        },
        {
            value: rfBrl,
            name: 'Renda Fixa',
            color: '#10b981'
        },
        {
            value: hodlBrl,
            name: 'Bitcoin',
            color: '#f59e0b'
        }
    ].filter((d)=>d.value > 0);
    return {
        tooltip: {
            trigger: 'item',
            formatter: (params)=>{
                if (privacyMode) return '••••';
                const pct = (params.value / totalBrl * 100).toFixed(1);
                return `${params.name}<br/>R$ ${(params.value / 1e6).toFixed(1)}M (${pct}%)`;
            }
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                color: '#d1d5db'
            }
        },
        series: [
            {
                name: 'Alocação por Classe',
                type: 'pie',
                radius: [
                    '30%',
                    '70%'
                ],
                center: [
                    '50%',
                    '50%'
                ],
                data: assetData,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#1f2937',
                    borderWidth: 1
                },
                label: {
                    formatter: privacyMode ? ()=>'' : '{b}\n{d}%',
                    color: privacyMode ? 'transparent' : '#d1d5db'
                }
            }
        ]
    };
}
function createTimelineChartOption(options) {
    const { data, privacyMode, theme } = options;
    const timeline = data.timeline || {
        values: [],
        labels: []
    };
    const values = timeline.values || [];
    const labels = timeline.labels || [];
    if (values.length === 0) {
        return {
            title: {
                text: 'No projection data available'
            }
        };
    }
    const dates = labels.map((ym)=>ym.replace('-', '/'));
    const baseValue = values[values.length - 1] || 0;
    const years = 10;
    const baselineProj = Array.from({
        length: years * 12
    }, (_, i)=>{
        const monthsOut = i + 1;
        return baseValue * Math.pow(1 + 0.03 / 12, monthsOut);
    });
    const optimisticProj = Array.from({
        length: years * 12
    }, (_, i)=>{
        const monthsOut = i + 1;
        return baseValue * Math.pow(1 + 0.05 / 12, monthsOut);
    });
    const pessimisticProj = Array.from({
        length: years * 12
    }, (_, i)=>{
        const monthsOut = i + 1;
        return baseValue * Math.pow(1 + 0.00 / 12, monthsOut);
    });
    const forecastDates = Array.from({
        length: years * 12
    }, (_, i)=>{
        const date = new Date();
        date.setMonth(date.getMonth() + i + 1);
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    return {
        tooltip: {
            trigger: 'axis',
            formatter: (params)=>{
                if (!Array.isArray(params)) return '';
                let html = `<div style="padding: 8px;">`;
                params.forEach((p)=>{
                    const value = privacyMode ? '••••' : `<strong>R$ ${(p.value / 1e6).toFixed(1)}M</strong>`;
                    html += `<div>${p.seriesName}: ${value}</div>`;
                });
                html += `</div>`;
                return html;
            }
        },
        legend: {
            data: [
                'Histórico',
                'Pessimista (0%)',
                'Base (3% a.a.)',
                'Otimista (5% a.a.)'
            ],
            textStyle: {
                color: '#d1d5db'
            }
        },
        grid: {
            left: 60,
            right: 40,
            top: 40,
            bottom: 40
        },
        xAxis: {
            type: 'category',
            data: [
                ...dates.slice(-24),
                ...forecastDates.slice(0, 48)
            ],
            axisLabel: {
                interval: 12,
                formatter: (v)=>v
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (v)=>`R$ ${(v / 1e6).toFixed(0)}M`
            }
        },
        series: [
            {
                name: 'Histórico',
                type: 'line',
                data: [
                    ...values.slice(-24),
                    ...baselineProj.slice(0, 48)
                ],
                itemStyle: {
                    color: '#f59e0b'
                },
                lineStyle: {
                    width: 2.5
                },
                smooth: true
            },
            {
                name: 'Pessimista (0%)',
                type: 'line',
                data: Array(dates.slice(-24).length).fill(null).concat(pessimisticProj.slice(0, 48)),
                itemStyle: {
                    color: '#ef4444'
                },
                lineStyle: {
                    width: 1.5,
                    type: 'dashed'
                },
                smooth: true
            },
            {
                name: 'Base (3% a.a.)',
                type: 'line',
                data: Array(dates.slice(-24).length).fill(null).concat(baselineProj.slice(0, 48)),
                itemStyle: {
                    color: '#10b981'
                },
                lineStyle: {
                    width: 1.5,
                    type: 'dashed'
                },
                smooth: true
            },
            {
                name: 'Otimista (5% a.a.)',
                type: 'line',
                data: Array(dates.slice(-24).length).fill(null).concat(optimisticProj.slice(0, 48)),
                itemStyle: {
                    color: '#3b82f6'
                },
                lineStyle: {
                    width: 1.5,
                    type: 'dashed'
                },
                smooth: true
            }
        ]
    };
}
function createStackedAreaChartOption(options) {
    const { privacyMode, theme } = options;
    const months = 24;
    const xAxisData = Array.from({
        length: months
    }, (_, i)=>`M${i + 1}`);
    const swrdData = Array.from({
        length: months
    }, (_, i)=>1200000 + i * 5000);
    const avgsData = Array.from({
        length: months
    }, (_, i)=>600000 + i * 2500);
    const ipcaData = Array.from({
        length: months
    }, (_, i)=>450000 + i * 3000);
    const cryptoData = Array.from({
        length: months
    }, (_, i)=>120000 + i * 500);
    return {
        color: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ec4899'
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params)) return '';
                if (privacyMode) return '••••';
                let result = params[0].axisValueLabel + '<br/>';
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: R$ ${p.value.toLocaleString('pt-BR', {
                        maximumFractionDigits: 0
                    })}<br/>`;
                });
                return result;
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: (value)=>`R$ ${(value / 1e6).toFixed(1)}M`,
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                name: 'SWRD',
                type: 'line',
                data: swrdData,
                smooth: true,
                fill: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: 'AVGS',
                type: 'line',
                data: avgsData,
                smooth: true,
                fill: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: 'IPCA+',
                type: 'line',
                data: ipcaData,
                smooth: true,
                fill: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: 'Crypto',
                type: 'line',
                data: cryptoData,
                smooth: true,
                fill: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            }
        ]
    };
}
function createBacktestChartOption(options) {
    const { privacyMode, theme } = options;
    const months = 84;
    const xAxisData = Array.from({
        length: months
    }, (_, i)=>`M${i + 1}`);
    const portfolioData = Array.from({
        length: months
    }, (_, i)=>100 * Math.pow(1.0088, i));
    const benchmarkData = Array.from({
        length: months
    }, (_, i)=>100 * Math.pow(1.0075, i));
    return {
        color: [
            '#10b981',
            '#9ca3af'
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params)) return '';
                let result = `${params[0].axisValueLabel}<br/>`;
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
                });
                return result;
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12,
                interval: 11
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                name: 'Portfolio',
                type: 'line',
                data: portfolioData,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: 'Benchmark',
                type: 'line',
                data: benchmarkData,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            }
        ]
    };
}
function createIncomeChartOption(options) {
    const { privacyMode, theme } = options;
    const categories = [
        'Salary',
        'Dividends',
        'Bond Coupons',
        'Rental',
        'Other'
    ];
    const amountsData = [
        120000,
        35000,
        18000,
        24000,
        3000
    ];
    const colors = [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
        '#ec4899'
    ];
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params) || params.length === 0) return '';
                const p = params[0];
                return `${p.name}<br/>${p.marker} R$ ${p.value.toLocaleString('pt-BR', {
                    maximumFractionDigits: 0
                })}`;
            },
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 120,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: (value)=>`R$ ${(value / 1e3).toFixed(0)}K`,
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            },
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            }
        },
        series: [
            {
                name: 'Annual Income',
                type: 'bar',
                data: amountsData.map((value, idx)=>({
                        value,
                        itemStyle: {
                            color: colors[idx]
                        }
                    })),
                itemStyle: {
                    borderRadius: [
                        0,
                        4,
                        4,
                        0
                    ]
                }
            }
        ]
    };
}
function createGlidePathChartOption(options) {
    const { privacyMode, theme } = options;
    const ages = Array.from({
        length: 46
    }, (_, i)=>35 + i);
    const retirementAge = 50;
    const equityAlloc = ages.map((age)=>{
        if (age >= retirementAge) return 30;
        const yearsToRetire = retirementAge - age;
        return Math.max(30, 100 - yearsToRetire * 1.5);
    });
    const fixedIncomeAlloc = equityAlloc.map((eq)=>100 - eq);
    return {
        color: [
            '#3b82f6',
            '#f59e0b'
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params)) return '';
                let result = `Age ${params[0].axisValueLabel}<br/>`;
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}%<br/>`;
                });
                return result;
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ages.map((a)=>a.toString()),
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12,
                interval: 4
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: '{value}%',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                name: 'Target Equity %',
                type: 'line',
                data: equityAlloc,
                smooth: true,
                fill: true,
                areaStyle: {
                    opacity: 0.3
                },
                lineStyle: {
                    width: 3
                },
                symbolSize: 0
            },
            {
                name: 'Fixed Income %',
                type: 'line',
                data: fixedIncomeAlloc,
                smooth: true,
                fill: true,
                areaStyle: {
                    opacity: 0.3
                },
                lineStyle: {
                    width: 3
                },
                symbolSize: 0
            }
        ]
    };
}
function createSankeyChartOption(options) {
    const { data } = options;
    const timeline_attr = data.timeline_attribution || {};
    const initialCapital = timeline_attr.patrimonio_inicial || 3000000;
    const contributions = timeline_attr.aportes || 0;
    const equityGains = timeline_attr.retorno_equity_usd || 0;
    const fxGains = timeline_attr.retorno_cambio || 0;
    const rfGains = timeline_attr.retorno_rf || 0;
    return {
        title: {
            text: 'Patrimônio: Origem dos Ganhos (60 meses)',
            left: 'center'
        },
        tooltip: {
            formatter: (params)=>{
                if (params.componentSubType === 'sankey') {
                    return `${params.source} → ${params.target}: <strong>R$ ${(params.value / 1e6).toFixed(1)}M</strong>`;
                }
                return '';
            }
        },
        series: [
            {
                type: 'sankey',
                data: [
                    {
                        name: 'Capital Inicial',
                        itemStyle: {
                            color: '#3b82f6'
                        }
                    },
                    {
                        name: 'Aportes',
                        itemStyle: {
                            color: '#06b6d4'
                        }
                    },
                    {
                        name: 'Ganho Equity USD',
                        itemStyle: {
                            color: '#10b981'
                        }
                    },
                    {
                        name: 'Ganho FX',
                        itemStyle: {
                            color: '#f59e0b'
                        }
                    },
                    {
                        name: 'Ganho RF',
                        itemStyle: {
                            color: '#8b5cf6'
                        }
                    },
                    {
                        name: 'Capital Final',
                        itemStyle: {
                            color: '#ec4899'
                        }
                    }
                ],
                links: [
                    {
                        source: 0,
                        target: 5,
                        value: initialCapital
                    },
                    {
                        source: 1,
                        target: 5,
                        value: contributions
                    },
                    {
                        source: 2,
                        target: 5,
                        value: equityGains
                    },
                    {
                        source: 3,
                        target: 5,
                        value: fxGains
                    },
                    {
                        source: 4,
                        target: 5,
                        value: rfGains
                    }
                ],
                emphasis: {
                    focus: 'adjacency'
                },
                levels: [
                    {
                        depth: 0,
                        itemStyle: {
                            color: '#3b82f6'
                        }
                    },
                    {
                        depth: 1,
                        itemStyle: {
                            color: '#ec4899'
                        }
                    }
                ],
                nodeWidth: 20,
                nodePadding: 120
            }
        ],
        grid: {
            left: 0,
            right: 0,
            top: 60,
            bottom: 0
        }
    };
}
function createNetWorthProjectionChartOption(options) {
    const { privacyMode, theme } = options;
    const years = 30;
    const xAxisData = Array.from({
        length: years
    }, (_, i)=>`Y${i + 1}`);
    const p10Data = Array.from({
        length: years
    }, (_, i)=>1250000 * Math.pow(1.05, i) + 60000 * i);
    const p50Data = Array.from({
        length: years
    }, (_, i)=>1250000 * Math.pow(1.07, i) + 60000 * i);
    const p90Data = Array.from({
        length: years
    }, (_, i)=>1250000 * Math.pow(1.09, i) + 60000 * i);
    return {
        color: [
            '#ef4444',
            '#10b981',
            '#3b82f6'
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params)) return '';
                let result = `${params[0].axisValueLabel}<br/>`;
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: R$ ${(p.value / 1e6).toFixed(1)}M<br/>`;
                });
                return result;
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: (value)=>`R$ ${(value / 1e6).toFixed(1)}M`,
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                name: 'P10 (Pessimistic)',
                type: 'line',
                data: p10Data,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: 'P50 (Median)',
                type: 'line',
                data: p50Data,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: 'P90 (Optimistic)',
                type: 'line',
                data: p90Data,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            }
        ]
    };
}
function createDeltaBarChartOption(options) {
    const { privacyMode, theme } = options;
    const xAxisData = Array.from({
        length: 12
    }, (_, i)=>`M${i + 1}`);
    const deltaData = [
        0.8,
        -0.2,
        1.2,
        0.5,
        -0.1,
        0.9,
        1.1,
        0.3,
        -0.4,
        0.6,
        0.8,
        0.7
    ];
    const colors = deltaData.map((v)=>v >= 0 ? '#10b981' : '#ef4444');
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params) || params.length === 0) return '';
                const p = params[0];
                return `${p.name}<br/>${p.marker} Delta: ${p.value.toFixed(2)}%`;
            },
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 50,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: '{value}%',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                type: 'bar',
                data: deltaData.map((value, idx)=>({
                        value,
                        itemStyle: {
                            color: colors[idx]
                        }
                    })),
                itemStyle: {
                    borderRadius: [
                        4,
                        4,
                        0,
                        0
                    ]
                }
            }
        ]
    };
}
function createDrawdownHistChartOption(options) {
    const { privacyMode, theme } = options;
    const buckets = [
        '0-5%',
        '5-10%',
        '10-15%',
        '15-20%',
        '20-25%',
        '25-30%'
    ];
    const frequencies = [
        145,
        89,
        34,
        18,
        7,
        2
    ];
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params) || params.length === 0) return '';
                const p = params[0];
                return `${p.name}<br/>${p.marker} ${p.value} months`;
            },
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 120,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: buckets,
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            },
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            }
        },
        series: [
            {
                type: 'bar',
                data: frequencies,
                itemStyle: {
                    color: '#3b82f6',
                    borderRadius: [
                        0,
                        4,
                        4,
                        0
                    ]
                }
            }
        ]
    };
}
function createSimpleLineChartOption(options) {
    const { privacyMode, theme, xAxisData, seriesData, yAxisFormatter, tooltipFormatter } = options;
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: tooltipFormatter || ((params)=>{
                if (!Array.isArray(params)) return '';
                let result = params[0].axisValueLabel + '<br/>';
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
                });
                return result;
            })
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: yAxisFormatter || ((v)=>v.toFixed(2)),
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: seriesData.map((s)=>({
                name: s.name,
                type: 'line',
                data: s.data,
                smooth: true,
                areaStyle: s.areaStyle ? {
                    opacity: 0.2
                } : undefined,
                lineStyle: {
                    width: 2,
                    type: s.dashed ? 'dashed' : 'solid',
                    color: s.color
                },
                symbolSize: 0
            }))
    };
}
function createBoundedLineChartOption(options) {
    const { privacyMode, theme, xAxisData, upperData, targetData, lowerData, upperLabel, targetLabel, lowerLabel, yAxisFormatter, tooltipFormatter } = options;
    return {
        color: [
            '#10b981',
            '#3b82f6',
            '#ef4444'
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: tooltipFormatter || ((params)=>{
                if (!Array.isArray(params)) return '';
                let result = params[0].axisValueLabel + '<br/>';
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(0)}<br/>`;
                });
                return result;
            })
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12,
                interval: 4
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: yAxisFormatter || ((v)=>`${v.toFixed(0)}`),
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                name: upperLabel,
                type: 'line',
                data: upperData,
                smooth: true,
                lineStyle: {
                    width: 2,
                    type: 'dashed'
                },
                symbolSize: 0
            },
            {
                name: targetLabel,
                type: 'line',
                data: targetData,
                smooth: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 3
                },
                symbolSize: 0
            },
            {
                name: lowerLabel,
                type: 'line',
                data: lowerData,
                smooth: true,
                lineStyle: {
                    width: 2,
                    type: 'dashed'
                },
                symbolSize: 0
            }
        ]
    };
}
function createTornadoChartOption(options) {
    const { privacyMode, theme, categories, downside, upside, downsideLabel = 'Pessimistic', upsideLabel = 'Optimistic' } = options;
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params)=>{
                if (!Array.isArray(params)) return '';
                let html = `<div style="padding: 8px;">`;
                params.forEach((p)=>{
                    const val = Math.abs(p.value);
                    html += `<div>${p.seriesName}: <strong>${val.toFixed(1)}%</strong></div>`;
                });
                html += `</div>`;
                return html;
            }
        },
        legend: {
            data: [
                downsideLabel,
                upsideLabel
            ],
            textStyle: {
                color: '#d1d5db'
            }
        },
        grid: {
            left: 120,
            right: 60,
            top: 40,
            bottom: 40
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: (v)=>`${v}%`
            }
        },
        yAxis: {
            type: 'category',
            data: categories
        },
        series: [
            {
                name: downsideLabel,
                type: 'bar',
                stack: 'total',
                data: downside,
                itemStyle: {
                    color: '#ef4444',
                    opacity: 0.8
                }
            },
            {
                name: upsideLabel,
                type: 'bar',
                stack: 'total',
                data: upside,
                itemStyle: {
                    color: '#10b981',
                    opacity: 0.8
                }
            }
        ]
    };
}
function createDualLineChartOption(options) {
    const { privacyMode, theme, xAxisData, series1Data, series1Name, series2Data, series2Name, series1Color = '#3b82f6', series2Color = '#f59e0b', yAxisFormatter, tooltipFormatter, dashed = false } = options;
    return {
        color: [
            series1Color,
            series2Color
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: tooltipFormatter || ((params)=>{
                if (!Array.isArray(params)) return '';
                let result = params[0].axisValueLabel + '<br/>';
                params.forEach((p)=>{
                    result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
                });
                return result;
            })
        },
        legend: {
            display: !privacyMode,
            textStyle: {
                color: theme.textStyle.color
            },
            top: 10
        },
        grid: {
            left: 60,
            right: 20,
            top: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: '#374151'
                }
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: yAxisFormatter || ((v)=>v.toFixed(2)),
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748'
                }
            }
        },
        series: [
            {
                name: series1Name,
                type: 'line',
                data: series1Data,
                smooth: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 0
            },
            {
                name: series2Name,
                type: 'line',
                data: series2Data,
                smooth: true,
                areaStyle: {
                    opacity: 0.2
                },
                lineStyle: {
                    width: 2,
                    type: dashed ? 'dashed' : 'solid'
                },
                symbolSize: 0
            }
        ]
    };
}
function createBondPoolProbabilisticOption(options) {
    const { theme, privacyMode, dates, p10, p50, p90 } = options;
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params) || params.length === 0) return '';
                let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
                params.forEach((p)=>{
                    if (p.value != null && !p.seriesName.startsWith('_')) {
                        html += `<div>${p.seriesName}: <strong>${p.value.toFixed(1)} anos</strong></div>`;
                    }
                });
                html += '</div>';
                return html;
            }
        },
        legend: {
            data: [
                'P90 (otimista)',
                'P50 (mediana)',
                'P10 (pessimista)'
            ],
            textStyle: {
                color: '#d1d5db'
            },
            bottom: 0
        },
        grid: {
            left: 50,
            right: 20,
            top: 40,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: '#9ca3af'
            }
        },
        yAxis: {
            type: 'value',
            name: 'Anos restantes',
            nameTextStyle: {
                color: '#9ca3af'
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: (v)=>`${v.toFixed(0)}`
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748',
                    width: 0.5
                }
            }
        },
        series: [
            {
                name: 'P90 (otimista)',
                type: 'line',
                data: p90,
                lineStyle: {
                    width: 1.5,
                    type: 'dashed',
                    color: '#10b981'
                },
                itemStyle: {
                    color: '#10b981'
                },
                areaStyle: {
                    color: 'rgba(16,185,129,0.08)'
                },
                symbol: 'none',
                smooth: true
            },
            {
                name: 'P50 (mediana)',
                type: 'line',
                data: p50,
                lineStyle: {
                    width: 2.5,
                    color: '#f59e0b'
                },
                itemStyle: {
                    color: '#f59e0b'
                },
                symbol: 'none',
                smooth: true
            },
            {
                name: 'P10 (pessimista)',
                type: 'line',
                data: p10,
                lineStyle: {
                    width: 1.5,
                    type: 'dashed',
                    color: '#ef4444'
                },
                itemStyle: {
                    color: '#ef4444'
                },
                symbol: 'none',
                smooth: true
            }
        ]
    };
}
function createBondPoolDeterministicOption(options) {
    const { theme, privacyMode, years, poolTotal, pool2040, pool2050, alvo } = options;
    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            textStyle: theme.tooltip.textStyle,
            formatter: (params)=>{
                if (!Array.isArray(params) || params.length === 0) return '';
                let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
                params.forEach((p)=>{
                    if (p.value != null && !p.seriesName.startsWith('_')) {
                        const val = p.value;
                        const formatted = privacyMode ? '••••' : `R$ ${(val / 1000).toFixed(0)}k`;
                        html += `<div style="display:flex;align-items:center;gap:4px;">`;
                        html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>`;
                        html += `${p.seriesName}: <strong>${formatted}</strong></div>`;
                    }
                });
                html += '</div>';
                return html;
            }
        },
        legend: {
            data: [
                'Pool Total',
                'IPCA+ 2040',
                'IPCA+ 2050',
                'Meta 2040'
            ],
            textStyle: {
                color: '#d1d5db'
            },
            bottom: 0
        },
        grid: {
            left: 70,
            right: 20,
            top: 40,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            data: years.map(String),
            axisLabel: {
                color: '#9ca3af'
            }
        },
        yAxis: {
            type: 'value',
            name: 'R$ (BRL)',
            nameTextStyle: {
                color: '#9ca3af'
            },
            axisLabel: {
                color: privacyMode ? 'transparent' : '#9ca3af',
                formatter: (v)=>`${(v / 1000).toFixed(0)}k`
            },
            splitLine: {
                lineStyle: {
                    color: '#2d3748',
                    width: 0.5
                }
            }
        },
        series: [
            {
                name: 'IPCA+ 2050',
                type: 'bar',
                stack: 'pool',
                data: pool2050,
                itemStyle: {
                    color: '#8b5cf6',
                    borderRadius: [
                        0,
                        0,
                        0,
                        0
                    ]
                },
                emphasis: {
                    focus: 'series'
                }
            },
            {
                name: 'IPCA+ 2040',
                type: 'bar',
                stack: 'pool',
                data: pool2040,
                itemStyle: {
                    color: '#3b82f6',
                    borderRadius: [
                        4,
                        4,
                        0,
                        0
                    ]
                },
                emphasis: {
                    focus: 'series'
                }
            },
            {
                name: 'Pool Total',
                type: 'line',
                data: poolTotal,
                lineStyle: {
                    width: 2.5,
                    color: '#f59e0b'
                },
                itemStyle: {
                    color: '#f59e0b'
                },
                symbol: 'circle',
                symbolSize: 6,
                smooth: true,
                z: 10
            },
            {
                name: 'Meta 2040',
                type: 'line',
                data: years.map(()=>alvo),
                lineStyle: {
                    width: 1.5,
                    type: 'dashed',
                    color: '#ef4444'
                },
                itemStyle: {
                    color: '#ef4444'
                },
                symbol: 'none'
            }
        ]
    };
}
}),
"[project]/react-app/src/components/charts/DonutCharts.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DonutCharts",
    ()=>DonutCharts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$echarts$2d$for$2d$react$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/echarts-for-react/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useEChartsPrivacy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/hooks/useEChartsPrivacy.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useChartResize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/hooks/useChartResize.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$chartSetup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/utils/chartSetup.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function DonutCharts({ data }) {
    const { privacyMode, theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useEChartsPrivacy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEChartsPrivacy"])();
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useChartResize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartResize"])();
    const option = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$chartSetup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDonutChartOption"])({
            data,
            privacyMode,
            theme
        }), [
        data,
        privacyMode,
        theme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: '400px',
            width: '100%'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$echarts$2d$for$2d$react$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            ref: chartRef,
            option: option,
            theme: theme
        }, void 0, false, {
            fileName: "[project]/react-app/src/components/charts/DonutCharts.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/react-app/src/components/charts/DonutCharts.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
}),
"[project]/react-app/src/components/charts/StackedAllocChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StackedAllocChart",
    ()=>StackedAllocChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$echarts$2d$for$2d$react$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/echarts-for-react/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useEChartsPrivacy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/hooks/useEChartsPrivacy.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useChartResize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/hooks/useChartResize.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$chartSetup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/utils/chartSetup.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function StackedAllocChart({ data }) {
    const { privacyMode, theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useEChartsPrivacy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEChartsPrivacy"])();
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$useChartResize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartResize"])();
    const option = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$chartSetup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createStackedAreaChartOption"])({
            data,
            privacyMode,
            theme
        }), [
        data,
        privacyMode,
        theme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '.65rem',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '.5px',
                            marginBottom: 4
                        },
                        children: "Por Classe de Ativo"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/charts/StackedAllocChart.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$echarts$2d$for$2d$react$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        ref: chartRef,
                        option: option,
                        style: {
                            height: 220,
                            width: "100%"
                        }
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/charts/StackedAllocChart.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/charts/StackedAllocChart.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: '.65rem',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        marginBottom: 4
                    },
                    children: "Intra-Equity — Pesos Atuais vs Alvo"
                }, void 0, false, {
                    fileName: "[project]/react-app/src/components/charts/StackedAllocChart.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/charts/StackedAllocChart.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/charts/StackedAllocChart.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
}),
"[project]/react-app/src/components/portfolio/HoldingsTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HoldingsTable",
    ()=>HoldingsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function HoldingsTable() {
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.data);
    const { positions, totals } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data?.posicoes) return {
            positions: [],
            totals: {
                usd: 0,
                brl: 0
            }
        };
        const cambio = data.cambio ?? 1;
        const bucketOrder = {
            SWRD: 0,
            AVGS: 1,
            AVEM: 2
        };
        const positions = Object.entries(data.posicoes).map(([ticker, p])=>{
            const pm = p.avg_cost ?? p.pm ?? 0;
            const preco = p.price ?? 0;
            const ganho_pct = pm > 0 ? (preco / pm - 1) * 100 : 0;
            const valor_usd = p.qty * preco;
            const valor_brl = valor_usd * cambio;
            return {
                ticker,
                bucket: p.bucket,
                status: p.status,
                pm,
                preco,
                ganho_pct,
                valor_usd,
                valor_brl
            };
        }).sort((a, b)=>{
            const aOrd = bucketOrder[a.bucket] ?? 99;
            const bOrd = bucketOrder[b.bucket] ?? 99;
            return aOrd !== bOrd ? aOrd - bOrd : a.ticker.localeCompare(b.ticker);
        });
        const totals = {
            usd: positions.reduce((s, p)=>s + p.valor_usd, 0),
            brl: positions.reduce((s, p)=>s + p.valor_brl, 0)
        };
        return {
            positions,
            totals
        };
    }, [
        data
    ]);
    const fmtUsd = (v)=>privacyMode ? '••••' : `$${(v / 1000).toFixed(1)}k`;
    const fmtBrl = (v)=>privacyMode ? '••••' : `R$${(v / 1000).toFixed(0)}k`;
    const fmtPct = (v)=>privacyMode ? '••' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    const fmtPm = (v)=>privacyMode ? '••' : `$${v.toFixed(2)}`;
    const bucketColors = {
        SWRD: 'var(--accent)',
        AVGS: '#8b5cf6',
        AVEM: '#06b6d4'
    };
    const ibkrDate = data?.timestamps?.posicoes_ibkr;
    const stalenessBadge = (()=>{
        if (!ibkrDate) return null;
        const diffDays = Math.round((Date.now() - new Date(ibkrDate + 'T00:00:00').getTime()) / 86400000);
        if (diffDays > 3) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    fontSize: '.6rem',
                    fontWeight: 700,
                    background: 'rgba(234,179,8,.2)',
                    color: 'var(--yellow)',
                    border: '1px solid rgba(234,179,8,.3)'
                },
                children: [
                    "⚠ dados de ",
                    diffDays,
                    " dias atrás"
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: '.6rem',
                fontWeight: 600,
                background: 'rgba(34,197,94,.12)',
                color: 'var(--green)'
            },
            children: ibkrDate
        }, void 0, false, {
            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this);
    })();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginBottom: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            marginBottom: 0
                        },
                        children: "Posições — ETFs Internacionais (IBKR)"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    stalenessBadge
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflowX: 'auto'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '.82rem'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    borderBottom: '2px solid var(--border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'left',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Ativo"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 83,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'left',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Bucket"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 84,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'left',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 85,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        className: "hide-mobile",
                                        children: "PM (USD)"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 86,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Preço"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 87,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Ganho %"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 88,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Valor USD"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 89,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        className: "pv",
                                        children: "Valor BRL"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                        lineNumber: 90,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: positions.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '1px solid var(--border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '7px 8px',
                                                fontWeight: 700
                                            },
                                            children: p.ticker
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 96,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '7px 8px',
                                                color: bucketColors[p.bucket] ?? 'var(--muted)',
                                                fontSize: '.7rem'
                                            },
                                            children: p.bucket
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 97,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '7px 8px'
                                            },
                                            children: p.status === 'alvo' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'inline-block',
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(34,197,94,.15)',
                                                    color: 'var(--green)',
                                                    fontSize: '.7rem',
                                                    fontWeight: 600
                                                },
                                                children: "alvo"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                                lineNumber: 100,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'inline-block',
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(234,179,8,.15)',
                                                    color: 'var(--yellow)',
                                                    fontSize: '.7rem',
                                                    fontWeight: 600
                                                },
                                                children: "transit."
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                                lineNumber: 101,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 98,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            className: "hide-mobile",
                                            children: fmtPm(p.pm)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            children: fmtPm(p.preco)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 105,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px',
                                                color: p.ganho_pct >= 0 ? 'var(--green)' : 'var(--red)',
                                                fontWeight: 600
                                            },
                                            children: fmtPct(p.ganho_pct)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 106,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            className: "pv",
                                            children: fmtUsd(p.valor_usd)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            className: "pv",
                                            children: fmtBrl(p.valor_brl)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                            lineNumber: 108,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, p.ticker, true, {
                                    fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 10,
                    fontSize: '.75rem',
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Total USD: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "pv",
                                children: fmtUsd(totals.usd)
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                lineNumber: 116,
                                columnNumber: 26
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Total BRL: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "pv",
                                children: fmtBrl(totals.brl)
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                                lineNumber: 117,
                                columnNumber: 26
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/portfolio/HoldingsTable.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[project]/react-app/src/components/portfolio/CustoBaseTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustoBaseTable",
    ()=>CustoBaseTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$CollapsibleSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/primitives/CollapsibleSection.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const EQUITY_BUCKETS = [
    'SWRD',
    'AVGS',
    'AVEM'
];
const BUCKET_COLORS = {
    SWRD: 'var(--accent)',
    AVGS: '#8b5cf6',
    AVEM: '#06b6d4'
};
function CustoBaseTable() {
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.data);
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data?.posicoes) return [];
        const posicoes = data.posicoes;
        const pesosTarget = data.pesosTarget ?? {};
        const totalEquityTarget = EQUITY_BUCKETS.reduce((s, k)=>s + (pesosTarget[k] ?? 0), 0);
        const acc = {};
        EQUITY_BUCKETS.forEach((b)=>{
            acc[b] = {
                valor: 0,
                custo: 0
            };
        });
        Object.values(posicoes).forEach((p)=>{
            const b = p.bucket;
            if (!acc[b]) return;
            acc[b].valor += p.qty * p.price;
            acc[b].custo += p.qty * (p.avg_cost ?? p.pm ?? p.price);
        });
        const totalValor = EQUITY_BUCKETS.reduce((s, b)=>s + acc[b].valor, 0);
        return EQUITY_BUCKETS.map((b)=>{
            const { valor, custo } = acc[b];
            const ganho_pct = custo > 0 ? (valor / custo - 1) * 100 : 0;
            const peso = totalValor > 0 ? valor / totalValor * 100 : 0;
            const meta = totalEquityTarget > 0 ? pesosTarget[b] / totalEquityTarget * 100 : 0;
            const delta = peso - meta;
            return {
                bucket: b,
                valor,
                custo,
                ganho_pct,
                peso,
                meta: Math.round(meta),
                delta
            };
        });
    }, [
        data
    ]);
    const fmtUsd = (v)=>privacyMode ? '••••' : `$${(v / 1000).toFixed(0)}k`;
    const fmtPct = (v, sign = false)=>privacyMode ? '••' : `${sign && v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    const deltaColor = (d)=>Math.abs(d) <= 2 ? 'var(--green)' : Math.abs(d) <= 5 ? 'var(--yellow)' : 'var(--red)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$CollapsibleSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CollapsibleSection"], {
        id: "section-custo-base",
        title: "Base de Custo e Alocação — Equity por Bucket",
        defaultOpen: false,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflowX: 'auto'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '.82rem'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    borderBottom: '1px solid var(--border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'left',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Bucket"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 69,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Valor USD"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 70,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Custo USD"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Ganho %"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 72,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Peso equity"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 73,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Meta equity"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '6px 8px',
                                            color: 'var(--muted)',
                                            fontWeight: 600
                                        },
                                        children: "Δ"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                lineNumber: 68,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: rows.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '1px solid var(--border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '7px 8px',
                                                fontWeight: 700,
                                                color: BUCKET_COLORS[r.bucket]
                                            },
                                            children: r.bucket
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 81,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            className: "pv",
                                            children: fmtUsd(r.valor)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 82,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            className: "pv",
                                            children: fmtUsd(r.custo)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px',
                                                color: r.ganho_pct >= 0 ? 'var(--green)' : 'var(--red)',
                                                fontWeight: 600
                                            },
                                            children: fmtPct(r.ganho_pct, true)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 84,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px'
                                            },
                                            children: fmtPct(r.peso)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 87,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px',
                                                color: 'var(--muted)'
                                            },
                                            children: [
                                                r.meta,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 88,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '7px 8px',
                                                color: deltaColor(r.delta),
                                                fontWeight: 600
                                            },
                                            children: fmtPct(r.delta, true)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                            lineNumber: 89,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, r.bucket, true, {
                                    fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                                    lineNumber: 80,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "src",
                children: "Fonte: IBKR · Custo médio ponderado (USD) · Pesos intra-equity vs alvo 50/30/20"
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/portfolio/CustoBaseTable.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
}),
"[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TaxAnalysisGrid",
    ()=>TaxAnalysisGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function TaxAnalysisGrid() {
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.data);
    const taxData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data?.tax?.ir_por_etf) return [];
        return Object.entries(data.tax.ir_por_etf).map(([ticker, etfData])=>({
                ticker,
                ganho_usd: etfData.ganho_usd || 0,
                ptax_medio: etfData.ptax_compra_medio || 0,
                ptax_atual: etfData.ptax_atual || 0,
                custo_brl: etfData.custo_total_brl || 0,
                valor_brl: etfData.valor_atual_brl || 0,
                ganho_brl: etfData.ganho_brl || 0,
                ir_estimado: etfData.ir_estimado || 0
            })).sort((a, b)=>b.ir_estimado - a.ir_estimado);
    }, [
        data?.tax?.ir_por_etf
    ]);
    const formatCurrency = (value)=>{
        if (privacyMode) return '••••';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(value);
    };
    const formatUSD = (value)=>{
        if (privacyMode) return '••••';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value);
    };
    const formatRate = (value)=>{
        if (privacyMode) return '••••';
        return value.toFixed(4);
    };
    const getGainColor = (value)=>{
        if (value > 0) return 'var(--green)';
        if (value < 0) return 'var(--red)';
        return 'var(--text)';
    };
    const totalCostBRL = taxData.reduce((sum, item)=>sum + item.custo_brl, 0);
    const totalValueBRL = taxData.reduce((sum, item)=>sum + item.valor_brl, 0);
    const totalGainBRL = taxData.reduce((sum, item)=>sum + item.ganho_brl, 0);
    const totalIREstimado = data?.tax?.ir_diferido_total_brl || 0;
    if (taxData.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.empty,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Sem dados de IR disponíveis"
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.tableWrapper,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '13px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    borderBottom: '1px solid var(--border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "Ticker"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 76,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "Ganho USD"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 77,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "PTAX Médio"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 78,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "Custo BRL"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 79,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "Valor Atual BRL"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 80,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "Ganho BRL"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: 'var(--muted)',
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        },
                                        children: "IR Estimado"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 82,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: taxData.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '1px solid var(--border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '8px',
                                                ...styles.ticker
                                            },
                                            children: item.ticker
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 88,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px',
                                                color: 'var(--text)'
                                            },
                                            children: formatUSD(item.ganho_usd)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 89,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px',
                                                fontSize: '12px',
                                                color: 'var(--text)'
                                            },
                                            children: formatRate(item.ptax_medio)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 92,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px',
                                                color: 'var(--text)'
                                            },
                                            children: formatCurrency(item.custo_brl)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px',
                                                fontWeight: '500',
                                                color: 'var(--text)'
                                            },
                                            children: formatCurrency(item.valor_brl)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 98,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px',
                                                color: getGainColor(item.ganho_brl),
                                                fontWeight: '500'
                                            },
                                            children: formatCurrency(item.ganho_brl)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 101,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px',
                                                color: 'var(--orange)',
                                                fontWeight: '600'
                                            },
                                            children: formatCurrency(item.ir_estimado)
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, item.ticker, true, {
                                    fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.summarySection,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        style: styles.summaryTitle,
                        children: "Tax Summary"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.summaryGrid,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.summaryItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryLabel,
                                        children: "Total Cost Basis"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 117,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryValue,
                                        children: formatCurrency(totalCostBRL)
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.summaryItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryLabel,
                                        children: "Current Value"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryValue,
                                        children: formatCurrency(totalValueBRL)
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.summaryItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryLabel,
                                        children: "Unrealized Gain"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 125,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            ...styles.summaryValue,
                                            color: getGainColor(totalGainBRL)
                                        },
                                        children: formatCurrency(totalGainBRL)
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.summaryItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryLabel,
                                        children: "Deferred Tax"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            ...styles.summaryValue,
                                            color: 'var(--orange)'
                                        },
                                        children: formatCurrency(totalIREstimado)
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.summaryItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryLabel,
                                        children: "Effective Tax Rate"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryValue,
                                        children: privacyMode ? '••••' : totalGainBRL > 0 ? `${(totalIREstimado / totalGainBRL * 100).toFixed(1)}%` : '—'
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 138,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 136,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.summaryItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryLabel,
                                        children: "After-Tax Value"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 143,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.summaryValue,
                                        children: formatCurrency(totalValueBRL - totalIREstimado)
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "src",
                children: "Regime: ACC UCITS — diferimento fiscal (Lei 14.754/2023). IR 15% flat. PTAX histórica por lote. Transitórios: diluir via aportes, não comprar mais. TLH: ⚠️ = perda ≥ 5%."
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
const styles = {
    container: {
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text)'
    },
    subtitle: {
        margin: '0 0 16px 0',
        fontSize: '13px',
        color: 'var(--muted)'
    },
    tableWrapper: {
        overflowX: 'auto',
        marginBottom: '20px'
    },
    ticker: {
        fontWeight: '600',
        color: 'var(--accent)'
    },
    summarySection: {
        borderTop: '1px solid var(--border)',
        paddingTop: '16px',
        marginTop: '16px',
        marginBottom: '16px'
    },
    summaryTitle: {
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--muted)'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        backgroundColor: 'var(--bg)',
        borderRadius: '4px',
        border: '1px solid var(--border)'
    },
    summaryLabel: {
        fontSize: '11px',
        color: 'var(--muted)',
        fontWeight: '500',
        marginBottom: '4px'
    },
    summaryValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--accent)'
    },
    empty: {
        minHeight: '100px',
        backgroundColor: 'var(--bg)',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--muted)'
    },
    noteSection: {
        borderTop: '1px solid var(--border)',
        paddingTop: '12px'
    },
    note: {
        margin: '0',
        fontSize: '12px',
        color: 'var(--muted)',
        lineHeight: '1.5'
    }
};
}),
"[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RFCryptoComposition",
    ()=>RFCryptoComposition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function RFCryptoComposition() {
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.data);
    const rfComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data?.rf) return [];
        return [
            {
                name: 'IPCA+ 2029',
                key: 'ipca2029',
                type: 'IPCA+'
            },
            {
                name: 'IPCA+ 2040',
                key: 'ipca2040',
                type: 'IPCA+'
            },
            {
                name: 'IPCA+ 2050',
                key: 'ipca2050',
                type: 'IPCA+'
            },
            {
                name: 'Renda+ 2065',
                key: 'renda2065',
                type: 'Renda+'
            }
        ].map((item)=>{
            const rfData = data.rf?.[item.key];
            return {
                ...item,
                valor: rfData?.valor || 0,
                taxa: rfData?.taxa || 0,
                cotas: rfData?.cotas || 0,
                tipo: rfData?.tipo || ''
            };
        });
    }, [
        data?.rf
    ]);
    const formatCurrency = (value)=>{
        if (privacyMode) return '••••';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(value);
    };
    const totalRFValue = rfComposition.reduce((sum, item)=>sum + item.valor, 0);
    const hodlValue = data?.hodl11?.valor || 0;
    const totalDerivatives = totalRFValue + hodlValue;
    if (!data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: styles.title,
                    children: "Renda Fixa + Cripto"
                }, void 0, false, {
                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.empty,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading composition data..."
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: styles.title,
                children: "Renda Fixa + Cripto"
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.section,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        style: styles.sectionTitle,
                        children: "Fixed Income (RF)"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.tableWrapper,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: '1px solid var(--border)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'left',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Instrument"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 82,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Type"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 83,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Value (BRL)"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 84,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Quotes"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 85,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Rate"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 86,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: rfComposition.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                borderBottom: '1px solid var(--border)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '8px',
                                                        ...styles.instrumentName
                                                    },
                                                    children: item.name
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        padding: '8px',
                                                        fontSize: '12px',
                                                        color: 'var(--muted)'
                                                    },
                                                    children: item.type
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                    lineNumber: 93,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        padding: '8px',
                                                        fontWeight: '500',
                                                        color: 'var(--text)'
                                                    },
                                                    children: formatCurrency(item.valor)
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        padding: '8px',
                                                        fontSize: '12px',
                                                        color: 'var(--text)'
                                                    },
                                                    children: privacyMode ? '••••' : item.cotas.toFixed(2)
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        padding: '8px',
                                                        fontWeight: '500',
                                                        color: 'var(--accent)'
                                                    },
                                                    children: privacyMode ? '••••' : `${item.taxa.toFixed(2)}%`
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                    lineNumber: 102,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, item.key, true, {
                                            fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                            lineNumber: 91,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.subtotalRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Total Fixed Income"
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.subtotalValue,
                                children: formatCurrency(totalRFValue)
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 112,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.section,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        style: styles.sectionTitle,
                        children: "Crypto (HODL)"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.tableWrapper,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: '1px solid var(--border)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'left',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Asset"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 123,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Qty"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 124,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Price"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 125,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "Value (BRL)"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 126,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--muted)',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                },
                                                children: "P&L"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 127,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 122,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: data.hodl11 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: '1px solid var(--border)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '8px',
                                                    ...styles.instrumentName
                                                },
                                                children: "HODL11 (BTC Wrapper)"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 133,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--text)'
                                                },
                                                children: privacyMode ? '••••' : data.hodl11.qty.toLocaleString('pt-BR', {
                                                    maximumFractionDigits: 0
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 134,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: 'var(--text)'
                                                },
                                                children: privacyMode ? '••••' : `R$ ${data.hodl11.preco.toFixed(2)}`
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 137,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    fontWeight: '500',
                                                    color: 'var(--text)'
                                                },
                                                children: formatCurrency(data.hodl11.valor)
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 140,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    padding: '8px',
                                                    color: data.hodl11.pnl_pct >= 0 ? 'var(--green)' : 'var(--red)',
                                                    fontWeight: '500'
                                                },
                                                children: privacyMode ? '••••' : `${data.hodl11.pnl_pct.toFixed(2)}%`
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                                lineNumber: 143,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 132,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                            lineNumber: 120,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.subtotalRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Total Crypto"
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.subtotalValue,
                                children: formatCurrency(hodlValue)
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.totalSection,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.totalRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.totalLabel,
                                children: "RF + Crypto Total"
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.totalValue,
                                children: formatCurrency(totalDerivatives)
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.percentages,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.percentItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Fixed Income"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.percentValue,
                                        children: privacyMode ? '••••' : `${(totalRFValue / totalDerivatives * 100).toFixed(1)}%`
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.percentItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Crypto"
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 171,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.percentValue,
                                        children: privacyMode ? '••••' : `${(hodlValue / totalDerivatives * 100).toFixed(1)}%`
                                    }, void 0, false, {
                                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
const styles = {
    container: {
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
    },
    title: {
        margin: '0 0 20px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text)'
    },
    section: {
        marginBottom: '24px'
    },
    sectionTitle: {
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--muted)'
    },
    tableWrapper: {
        overflowX: 'auto',
        marginBottom: '12px'
    },
    instrumentName: {
        fontWeight: '500',
        color: 'var(--accent)'
    },
    subtotalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--bg)',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text)'
    },
    subtotalValue: {
        color: 'var(--accent)'
    },
    empty: {
        minHeight: '100px',
        backgroundColor: 'var(--bg)',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--muted)'
    },
    totalSection: {
        borderTop: '2px solid var(--border)',
        paddingTop: '16px',
        marginTop: '16px'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '12px'
    },
    totalLabel: {
        fontSize: '15px'
    },
    totalValue: {
        color: 'var(--green)'
    },
    percentages: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
    },
    percentItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--bg)',
        borderRadius: '4px',
        fontSize: '12px'
    },
    percentValue: {
        fontWeight: '600',
        color: 'var(--accent)'
    }
};
}),
"[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const ETFRegionComposition = ({ swrd = {
    usa: 48,
    europe: 20,
    japan: 8,
    otherDm: 12,
    em: 12
}, avgs = {
    usa: 45,
    europe: 25,
    japan: 10,
    otherDm: 12,
    em: 8
}, avem = {
    usa: 30,
    europe: 15,
    japan: 8,
    otherDm: 12,
    em: 35
} })=>{
    const [selectedTab, setSelectedTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('swrd');
    const etfs = {
        swrd: {
            name: 'SWRD (Global Large Cap)',
            color: '#3b82f6',
            data: swrd
        },
        avgs: {
            name: 'AVGS (Global Quality)',
            color: '#06b6d4',
            data: avgs
        },
        avem: {
            name: 'AVEM (Global EM Value)',
            color: '#10b981',
            data: avem
        }
    };
    const currentEtf = etfs[selectedTab];
    const regions = [
        {
            label: 'USA',
            key: 'usa',
            color: '#3b82f6'
        },
        {
            label: 'Europe',
            key: 'europe',
            color: '#8b5cf6'
        },
        {
            label: 'Japan',
            key: 'japan',
            color: '#ec4899'
        },
        {
            label: 'Other DM',
            key: 'otherDm',
            color: '#f59e0b'
        },
        {
            label: 'EM',
            key: 'em',
            color: '#10b981'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '16px',
                    marginTop: 0
                },
                children: "ETF Região Composição"
            }, void 0, false, {
                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px',
                            borderBottom: '1px solid var(--border)',
                            paddingBottom: '8px'
                        },
                        children: Object.keys(etfs).map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedTab(key),
                                style: {
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: selectedTab === key ? etfs[key].color + '20' : 'transparent',
                                    border: selectedTab === key ? `1px solid ${etfs[key].color}` : '1px solid var(--border)',
                                    color: selectedTab === key ? etfs[key].color : 'var(--muted)',
                                    fontWeight: selectedTab === key ? 600 : 500
                                },
                                children: etfs[key].name.split(' ')[0]
                            }, key, false, {
                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text)',
                                    marginBottom: '12px'
                                },
                                children: currentEtf.name
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                },
                                children: regions.map((region)=>{
                                    const value = currentEtf.data[region.key];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flexShrink: 0,
                                                    width: '120px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '0.75rem',
                                                            color: 'var(--muted)',
                                                            marginBottom: '4px'
                                                        },
                                                        children: region.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            height: '20px',
                                                            background: 'var(--bg)',
                                                            borderRadius: '2px',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                height: '100%',
                                                                width: `${value}%`,
                                                                backgroundColor: region.color,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            },
                                                            children: value > 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 600,
                                                                    color: 'white'
                                                                },
                                                                children: [
                                                                    value,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                                lineNumber: 84,
                                                                columnNumber: 39
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                            lineNumber: 83,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                        lineNumber: 82,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                lineNumber: 80,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flexShrink: 0,
                                                    width: '40px',
                                                    textAlign: 'right',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    color: region.color
                                                },
                                                children: [
                                                    value,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                lineNumber: 88,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, region.label, true, {
                                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                        lineNumber: 79,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            paddingTop: '16px',
                            borderTop: '1px solid var(--border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text)',
                                    marginBottom: '12px'
                                },
                                children: "Comparação — 3 ETFs"
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    overflowX: 'auto'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: {
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.75rem'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            textAlign: 'left',
                                                            padding: '8px',
                                                            borderBottom: '1px solid var(--border)',
                                                            color: 'var(--muted)',
                                                            fontWeight: 600
                                                        },
                                                        children: "Região"
                                                    }, void 0, false, {
                                                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    Object.keys(etfs).map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                textAlign: 'right',
                                                                padding: '8px',
                                                                borderBottom: '1px solid var(--border)',
                                                                fontWeight: 700,
                                                                color: etfs[key].color
                                                            },
                                                            children: etfs[key].name.split(' ')[0]
                                                        }, key, false, {
                                                            fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                            lineNumber: 109,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                lineNumber: 106,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: regions.map((region)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '8px',
                                                                borderBottom: '1px solid var(--border)',
                                                                color: 'var(--text)'
                                                            },
                                                            children: region.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                            lineNumber: 118,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        Object.keys(etfs).map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                style: {
                                                                    textAlign: 'right',
                                                                    padding: '8px',
                                                                    borderBottom: '1px solid var(--border)',
                                                                    fontWeight: 600,
                                                                    color: region.color
                                                                },
                                                                children: [
                                                                    etfs[key].data[region.key],
                                                                    "%"
                                                                ]
                                                            }, `${key}-${region.label}`, true, {
                                                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                                lineNumber: 120,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)))
                                                    ]
                                                }, region.label, true, {
                                                    fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                                    lineNumber: 117,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                            lineNumber: 115,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = ETFRegionComposition;
}),
"[project]/react-app/src/app/portfolio/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PortfolioPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$CollapsibleSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/primitives/CollapsibleSection.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$charts$2f$DonutCharts$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/charts/DonutCharts.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$charts$2f$StackedAllocChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/charts/StackedAllocChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$HoldingsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/portfolio/HoldingsTable.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$CustoBaseTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/portfolio/CustoBaseTable.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$TaxAnalysisGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/portfolio/TaxAnalysisGrid.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$RFCryptoComposition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/portfolio/RFCryptoComposition.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$dashboard$2f$ETFRegionComposition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/dashboard/ETFRegionComposition.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
function PortfolioPage() {
    const loadDataOnce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.loadDataOnce);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.data);
    const isLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.isLoadingData);
    const dataError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.dataLoadError);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadDataOnce().catch((e)=>console.error('Failed to load data:', e));
    }, [
        loadDataOnce
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "loading-state",
            children: "Carregando dados da carteira..."
        }, void 0, false, {
            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
            lineNumber: 25,
            columnNumber: 12
        }, this);
    }
    if (dataError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "error-state",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                    children: "Erro ao carregar carteira:"
                }, void 0, false, {
                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this),
                " ",
                dataError
            ]
        }, void 0, true, {
            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this);
    }
    if (!data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "warning-state",
            children: "Dados carregados mas carteira não disponível"
        }, void 0, false, {
            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
            lineNumber: 37,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Exposição Geográfica — Equities"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$charts$2f$DonutCharts$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DonutCharts"], {
                        data: data
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "src",
                        children: "Premissa: SWRD ≈ 67% US. AVUV/USSC = 100% US. AVDV = 100% DM ex-US. AVGS ~58% US. (Exclui Fixed Income.)"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Alocação — Barras Empilhadas"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$charts$2f$StackedAllocChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StackedAllocChart"], {
                        data: data
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$CollapsibleSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CollapsibleSection"], {
                id: "section-etf-region",
                title: "Composição por Região — ETFs da Carteira",
                defaultOpen: false,
                icon: "🗺️",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '16px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$dashboard$2f$ETFRegionComposition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "src",
                            children: "Fonte: etf_composition.json · SWRD=MSCI World, AVGS=Global Small Cap Value, AVEM=Emerging Markets"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$CollapsibleSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CollapsibleSection"], {
                id: "section-etf-factor",
                title: "Exposição Fatorial — ETFs da Carteira",
                defaultOpen: false,
                icon: "📊",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '16px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                color: 'var(--muted)',
                                fontSize: '.82rem',
                                marginBottom: 8
                            },
                            children: "Fatores: Value, Size, Profitability, Investment"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        data?.etf_composition?.etfs && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '.8rem',
                                marginBottom: '8px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: '1px solid var(--card2)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'left',
                                                    padding: '6px 0',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)'
                                                },
                                                children: "ETF"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 84,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '6px 0',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)'
                                                },
                                                children: "Market"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 85,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '6px 0',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)'
                                                },
                                                children: "Value"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 86,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '6px 0',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)'
                                                },
                                                children: "Size"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 87,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '6px 0',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)'
                                                },
                                                children: "Quality"
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 88,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                        lineNumber: 83,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: [
                                        'SWRD',
                                        'AVGS',
                                        'AVEM'
                                    ].map((etf)=>{
                                        const comp = data.etf_composition.etfs[etf];
                                        if (!comp || !comp.fatores) return null;
                                        const f = comp.fatores;
                                        const getColor = (val)=>{
                                            if (val === null || val === 0) return 'var(--muted)';
                                            if (val > 0.5) return 'var(--green)';
                                            if (val > 0) return 'var(--yellow)';
                                            return 'var(--muted)';
                                        };
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                borderBottom: '1px solid var(--card2)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '6px 0',
                                                        fontWeight: 600
                                                    },
                                                    children: etf
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '6px 0',
                                                        color: 'var(--green)'
                                                    },
                                                    children: f.market != null ? `${(f.market * 100).toFixed(0)}%` : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '6px 0',
                                                        color: getColor(f.value)
                                                    },
                                                    children: f.value != null ? `${(f.value * 100).toFixed(0)}%` : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '6px 0',
                                                        color: getColor(f.size)
                                                    },
                                                    children: f.size != null ? `${(f.size * 100).toFixed(0)}%` : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '6px 0',
                                                        color: getColor(f.quality)
                                                    },
                                                    children: f.quality != null ? `${(f.quality * 100).toFixed(0)}%` : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, etf, true, {
                                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                            lineNumber: 103,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                    lineNumber: 91,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                            lineNumber: 81,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "src",
                            children: "Fonte: etf_composition.json · Fatores: Value, Size, Profitability, Investment"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$HoldingsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HoldingsTable"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$CustoBaseTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustoBaseTable"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$CollapsibleSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CollapsibleSection"], {
                id: "section-tax-ir",
                title: "IR Diferido — Alvo & Transitório",
                defaultOpen: false,
                icon: "🏛️",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '16px'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$TaxAnalysisGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TaxAnalysisGrid"], {}, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$portfolio$2f$RFCryptoComposition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RFCryptoComposition"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            data?.minilog && Array.isArray(data.minilog) && data.minilog.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Últimas Operações"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: {
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '.8rem',
                            marginBottom: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '2px solid var(--card2)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'left',
                                                padding: '8px 0',
                                                fontWeight: 600,
                                                color: 'var(--muted)'
                                            },
                                            children: "Data"
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'left',
                                                padding: '8px 0',
                                                fontWeight: 600,
                                                color: 'var(--muted)'
                                            },
                                            children: "Tipo"
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                            lineNumber: 156,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'left',
                                                padding: '8px 0',
                                                fontWeight: 600,
                                                color: 'var(--muted)'
                                            },
                                            children: "Ativo"
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                            lineNumber: 157,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'left',
                                                padding: '8px 0',
                                                fontWeight: 600,
                                                color: 'var(--muted)'
                                            },
                                            children: "Corretora"
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                            lineNumber: 158,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right',
                                                padding: '8px 0',
                                                fontWeight: 600,
                                                color: 'var(--muted)'
                                            },
                                            children: "Valor"
                                        }, void 0, false, {
                                            fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                            lineNumber: 159,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                    lineNumber: 154,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: data.minilog.slice(0, 10).map((op, i)=>{
                                    // Parse valor string if needed (e.g., "R$ 46,498" → 46498)
                                    const valorNum = typeof op.valor === 'string' ? parseFloat(op.valor.replace('R$ ', '').replace('.', '').replace(',', '.')) : op.valor || 0;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: '1px solid var(--card2)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '6px 0',
                                                    fontSize: '.75rem',
                                                    color: 'var(--muted)'
                                                },
                                                children: op.data
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 170,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '6px 0',
                                                    fontSize: '.75rem'
                                                },
                                                children: op.tipo
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 171,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '6px 0',
                                                    fontWeight: 600
                                                },
                                                children: op.ativo
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 172,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '6px 0',
                                                    fontSize: '.75rem',
                                                    color: 'var(--muted)'
                                                },
                                                children: op.corretora
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 173,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '6px 0',
                                                    textAlign: 'right',
                                                    color: valorNum > 0 ? 'var(--green)' : 'var(--red)',
                                                    fontWeight: 700
                                                },
                                                children: new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                    maximumFractionDigits: 0
                                                }).format(Math.abs(valorNum))
                                            }, void 0, false, {
                                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                                lineNumber: 174,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "src",
                        children: "Fonte: IBKR · Nubank · Binance"
                    }, void 0, false, {
                        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                        lineNumber: 187,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/react-app/src/app/portfolio/page.tsx",
                lineNumber: 150,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/react-app/src/app/portfolio/page.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=react-app_src_13_fjv9._.js.map