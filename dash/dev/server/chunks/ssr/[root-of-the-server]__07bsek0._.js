module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useUiStore",
    ()=>useUiStore
]);
/**
 * UI Store — Interface State Management
 * Privacy mode, collapse state, tab selection
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
;
;
const useUiStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        // Privacy mode
        privacyMode: false,
        togglePrivacy: ()=>{
            set((state)=>({
                    privacyMode: !state.privacyMode
                }));
        },
        setPrivacy: (enabled)=>{
            set({
                privacyMode: enabled
            });
        },
        // Collapse state
        collapseState: {},
        toggleCollapse: (id)=>{
            set((state)=>({
                    collapseState: {
                        ...state.collapseState,
                        [id]: !state.collapseState[id]
                    }
                }));
        },
        setCollapse: (id, collapsed)=>{
            set((state)=>({
                    collapseState: {
                        ...state.collapseState,
                        [id]: collapsed
                    }
                }));
        },
        // Simulator tab
        activeSimulator: 'mc',
        setActiveSimulator: (simulator)=>{
            set({
                activeSimulator: simulator
            });
        },
        // Period filter
        activePeriod: 'all',
        setActivePeriod: (period)=>{
            set({
                activePeriod: period
            });
        }
    }), {
    name: 'dashboard-ui-store',
    partialize: (state)=>({
            privacyMode: state.privacyMode,
            collapseState: state.collapseState,
            activeSimulator: state.activeSimulator,
            activePeriod: state.activePeriod
        })
}));
}),
"[project]/react-app/src/config/version.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Auto-generated on build
__turbopack_context__.s([
    "BUILD_DATE",
    ()=>BUILD_DATE,
    "DASHBOARD_VERSION",
    ()=>DASHBOARD_VERSION
]);
const DASHBOARD_VERSION = '0.1.166';
const BUILD_DATE = '2026-04-15T19:19:20.886Z';
}),
"[project]/react-app/src/components/layout/Header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$config$2f$version$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/config/version.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function Header() {
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const togglePrivacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.togglePrivacy);
    const handleReload = ()=>{
        window.location.reload();
    };
    const handleEruda = ()=>{
        // Eruda is loaded via CDN (can be added to layout if needed)
        console.log('Eruda console toggle');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "header",
        style: styles.header,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.logoSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: styles.logo,
                            children: "💰 Wealth"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Header.tsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: styles.version,
                            title: `Build: ${__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$config$2f$version$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DASHBOARD_VERSION"]}`,
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$config$2f$version$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DASHBOARD_VERSION"]
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Header.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/layout/Header.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.controls,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleReload,
                            title: "Reload data",
                            style: styles.button,
                            "aria-label": "Reload",
                            children: "🔄 Reload"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Header.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleEruda,
                            title: "Open console",
                            style: styles.button,
                            "aria-label": "Console",
                            children: "🛠️"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Header.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: togglePrivacy,
                            title: privacyMode ? 'Show values' : 'Hide values',
                            style: {
                                ...styles.button,
                                backgroundColor: privacyMode ? 'var(--red)' : 'var(--green)'
                            },
                            "data-test": "privacy-toggle",
                            "aria-label": "Privacy mode",
                            children: privacyMode ? '🔒' : '👁️'
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Header.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/layout/Header.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/react-app/src/components/layout/Header.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/react-app/src/components/layout/Header.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
const styles = {
    header: {
        backgroundColor: 'var(--card)',
        color: '#fff',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px'
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    logo: {
        margin: 0,
        fontSize: '24px',
        fontWeight: '600'
    },
    version: {
        fontSize: '11px',
        color: 'var(--muted)',
        fontFamily: 'monospace',
        paddingLeft: '8px',
        borderLeft: '1px solid var(--border)',
        lineHeight: '1'
    },
    controls: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    button: {
        padding: '8px 12px',
        backgroundColor: 'var(--border)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.2s'
    }
};
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/react-app/src/components/layout/TabNav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TabNav",
    ()=>TabNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const TABS = [
    {
        href: '/',
        label: '🕐 Now',
        id: 'tab-now'
    },
    {
        href: '/portfolio',
        label: '🎯 Portfolio',
        id: 'tab-portfolio'
    },
    {
        href: '/performance',
        label: '📈 Performance',
        id: 'tab-performance'
    },
    {
        href: '/fire',
        label: '🔥 FIRE',
        id: 'tab-fire'
    },
    {
        href: '/withdraw',
        label: '💸 Withdraw',
        id: 'tab-withdraw'
    },
    {
        href: '/simulators',
        label: '🧪 Simulators',
        id: 'tab-simulators'
    },
    {
        href: '/backtest',
        label: '📊 Backtest',
        id: 'tab-backtest'
    },
    {
        href: '/avaliar',
        label: '🔍 AVALIAR',
        id: 'tab-avaliar'
    }
];
function TabNav() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "tab-nav",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "tab-nav-container",
            children: TABS.map((tab)=>{
                const isActive = pathname === tab.href;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: tab.href,
                    className: `tab-btn ${isActive ? 'active' : ''}`,
                    "data-test": tab.id,
                    children: tab.label
                }, tab.href, false, {
                    fileName: "[project]/react-app/src/components/layout/TabNav.tsx",
                    lineNumber: 26,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/react-app/src/components/layout/TabNav.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/react-app/src/components/layout/TabNav.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/react-app/src/utils/dataWiring.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Data Wiring — Computed Derived Values
 * Port from dashboard/js/02-data-wiring.mjs
 * Pure function: no side effects, no DOM access
 */ __turbopack_context__.s([
    "computeDerivedValues",
    ()=>computeDerivedValues,
    "validateDataSchema",
    ()=>validateDataSchema
]);
function validateDataSchema(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Data must be a non-null object');
    }
    const requiredFields = [
        'posicoes',
        'rf',
        'cambio',
        'premissas',
        'pfire_base'
    ];
    const missingFields = requiredFields.filter((field)=>!(field in data));
    if (missingFields.length > 0) {
        throw new Error(`Invalid data.json schema: missing required fields [${missingFields.join(', ')}]`);
    }
    // Validate critical nested structures
    if (!data.posicoes || typeof data.posicoes !== 'object') {
        throw new Error('data.posicoes must be an object');
    }
    if (!data.rf || typeof data.rf !== 'object') {
        throw new Error('data.rf must be an object');
    }
    if (typeof data.cambio !== 'number') {
        throw new Error('data.cambio must be a number');
    }
    if (!data.premissas || typeof data.premissas !== 'object') {
        throw new Error('data.premissas must be an object');
    }
    console.log('✓ Data schema validation passed');
}
function _ymToDecimal(ym) {
    const [y, m] = ym.split('-').map(Number);
    return y + (m - 1) / 12;
}
function _fmtYearMonth(ym) {
    const [y, m] = ym.split('-');
    const months = [
        'jan',
        'fev',
        'mar',
        'abr',
        'mai',
        'jun',
        'jul',
        'ago',
        'set',
        'out',
        'nov',
        'dez'
    ];
    return months[parseInt(m, 10) - 1] + '/' + y;
}
function computeDerivedValues(data) {
    // Normalize camelCase aliases
    const normalized = {
        ...data,
        dcaStatus: data.dca_status,
        etfComposition: data.etf_composition,
        fireTrilha: data.fire_trilha,
        fireSWRPercentis: data.fire_swr_percentis,
        fireMatrix: data.fire_matrix,
        lumpyEvents: data.lumpy_events,
        earliestFire: data.earliest_fire,
        rollingMetrics: data.rolling_sharpe,
        driftStatus: data.drift,
        gastoPiso: data.gasto_piso,
        bondPoolRunway: data.bond_pool_runway,
        spendingBreakdown: data.spending_breakdown,
        spendingGuardrails: data.spending_guardrails,
        rendaFixa: data.rf,
        cryptoStatus: {
            valor: data.hodl11?.valor,
            status: 'ativo'
        },
        cryptoPnl: data.hodl11,
        operacoes: data.minilog,
        montecarlo: data.fire_matrix,
        fireMetrics: {
            base: data.pfire_base,
            aspirational: data.pfire_aspiracional
        },
        backtestMetrics: data.backtest?.metrics || {},
        backtestData: data.backtest,
        patrimonioProjecao: data.timeline,
        stressTest: data.scenario_comparison || {},
        performanceAnalysis: {
            rolling: data.factor_rolling,
            loadings: data.factor_loadings,
            attribution: data.attribution
        },
        exposicaoCambial: {
            cambio: data.cambio,
            posicoes: data.posicoes
        }
    };
    const CAMBIO = data.cambio;
    const PAT_GATILHO = data.premissas.patrimonio_gatilho;
    // Total equity USD
    let totalEquityUsd = 0;
    Object.values(data.posicoes || {}).forEach((p)=>{
        if (p && typeof p.qty === 'number' && typeof p.price === 'number') {
            totalEquityUsd += p.qty * p.price;
        }
    });
    // Total BRL = equity + RF + crypto
    const rfBrl = (data.rf.ipca2029?.valor ?? 0) + (data.rf.ipca2040?.valor ?? 0) + (data.rf.ipca2050?.valor ?? 0) + (data.rf.renda2065?.valor ?? 0);
    const cryptoLegado = data.cryptoLegado ?? 3000;
    const cryptoBrl = (data.hodl11?.valor ?? 0) + cryptoLegado;
    const totalBrl = totalEquityUsd * CAMBIO + rfBrl + cryptoBrl;
    // IPCA total
    const ipcaTotalBrl = (data.rf.ipca2029?.valor ?? 0) + (data.rf.ipca2040?.valor ?? 0) + (data.rf.ipca2050?.valor ?? 0);
    // Bucket values USD
    const bucketUsd = {
        SWRD: 0,
        AVGS: 0,
        AVEM: 0,
        JPGL: 0
    };
    Object.entries(data.posicoes || {}).forEach(([k, p])=>{
        if (p && p.bucket && typeof p.qty === 'number' && typeof p.price === 'number') {
            bucketUsd[p.bucket] = (bucketUsd[p.bucket] || 0) + p.qty * p.price;
        }
    });
    // Geo breakdown
    const swrdUsd = data.posicoes.SWRD?.qty * data.posicoes.SWRD?.price || 0;
    const avuvUsd = data.posicoes.AVUV?.qty * data.posicoes.AVUV?.price || 0;
    const avdvUsd = data.posicoes.AVDV?.qty * data.posicoes.AVDV?.price || 0;
    const usscUsd = data.posicoes.USSC?.qty * data.posicoes.USSC?.price || 0;
    const avgsUsd = data.posicoes.AVGS?.qty * data.posicoes.AVGS?.price || 0;
    const avemUsd = (data.posicoes.EIMI?.qty * data.posicoes.EIMI?.price || 0) + (data.posicoes.AVES?.qty * data.posicoes.AVES?.price || 0) + (data.posicoes.DGS?.qty * data.posicoes.DGS?.price || 0);
    const iwvlUsd = data.posicoes.IWVL?.qty * data.posicoes.IWVL?.price || 0;
    const geoUS = swrdUsd * 0.67 + avuvUsd + usscUsd + avgsUsd * 0.58;
    const geoDM = swrdUsd * 0.33 + avdvUsd + avgsUsd * 0.42 + iwvlUsd;
    const geoEM = avemUsd;
    // CAGR historical series
    const timeline = data.timeline || {
        values: [
            totalBrl
        ],
        labels: []
    };
    const patInicio = timeline.values?.[0] ?? totalBrl;
    const patFim = timeline.values?.[timeline.values.length - 1] ?? totalBrl;
    const _tStart = timeline.labels?.length ? _ymToDecimal(timeline.labels[0]) : 2021.25;
    const _tEnd = timeline.labels?.length ? _ymToDecimal(timeline.labels[timeline.labels.length - 1]) : 2026.25;
    const anos = _tEnd - _tStart;
    const cagr = anos > 0 && patInicio > 0 ? (Math.pow(patFim / patInicio, 1 / anos) - 1) * 100 : 0;
    // Backtest metrics
    const TWR_USD = data.backtest?.metrics?.target?.cagr ?? 12.88;
    const _btDates = data.backtest?.dates || [];
    const _btFirstDate = _btDates[0];
    const _btLastDate = _btDates[_btDates.length - 1];
    const _btPeriodStr = _btFirstDate && _btLastDate ? _fmtYearMonth(_btFirstDate) + '–' + _fmtYearMonth(_btLastDate) : 'N/A';
    const cambioInicio = data.backtest?.cambioInicio ?? 3.79;
    const cambioFim = data.cambio;
    const anosCambio = _btDates && _btDates.length > 1 ? _ymToDecimal(_btDates[_btDates.length - 1]) - _ymToDecimal(_btDates[0]) : 6.75;
    const fx_contrib_anual = anosCambio > 0 ? (Math.pow(cambioFim / cambioInicio, 1 / anosCambio) - 1) * 100 : 0;
    const TWR_BRL = ((1 + TWR_USD / 100) * (1 + fx_contrib_anual / 100) - 1) * 100;
    // Progress FIRE
    const progPct = data.premissas.patrimonio_atual / PAT_GATILHO * 100;
    const swrFireDay = data.premissas.custo_vida_base / PAT_GATILHO;
    // Years to FIRE
    const today = new Date(data.date);
    const _anoFireAlvoGlobal = today.getFullYear() + (data.premissas.idade_cenario_base - data.premissas.idade_atual);
    const _anoFireAspir = today.getFullYear() + ((data.premissas.idade_cenario_aspiracional ?? 50) - data.premissas.idade_atual);
    const _anoFire = today.getFullYear() + (data.premissas.idade_cenario_base - data.premissas.idade_atual);
    const fireDate = new Date(`${_anoFire}-01-01`);
    const msLeft = fireDate.getTime() - today.getTime();
    const yearsLeft = msLeft / (1000 * 60 * 60 * 24 * 365.25);
    const yrInt = Math.floor(yearsLeft);
    const moInt = Math.round((yearsLeft - yrInt) * 12);
    // P(FIRE) — probability of success from pfire_base (base scenario)
    const pfire = (data.pfire_base?.base ?? 90.4) / 100;
    // Build gatilhos array
    const gatilhos = [];
    const dcaIpca = data.dca_status?.ipca_longo;
    if (dcaIpca) {
        const taxa = dcaIpca.taxa_atual;
        const piso = dcaIpca.piso;
        const status = taxa != null && piso != null && taxa >= piso ? 'verde' : 'amarelo';
        const valorIpca2040 = data.rf?.ipca2040?.valor ?? 0;
        const valorIpca2029 = data.rf?.ipca2029?.valor ?? 0;
        const posicaoBrl = valorIpca2040 + valorIpca2029;
        const pctAtual = dcaIpca.pct_carteira_atual;
        const pctAlvo = dcaIpca.alvo_pct;
        const gapAlvo = dcaIpca.gap_alvo_pp;
        const ctx = taxa != null ? `taxa: ${taxa.toFixed(2)}% · piso ${piso.toFixed(1)}% · posição: R$${(posicaoBrl / 1000).toFixed(0)}k` + (pctAtual != null ? ` (${pctAtual.toFixed(1)}% vs alvo ${pctAlvo.toFixed(1)}%, gap ${gapAlvo.toFixed(1)}pp)` : '') : undefined;
        gatilhos.push({
            nome: 'IPCA+ 2040 — DCA',
            tipo: 'taxa',
            status,
            valorPrimario: taxa != null ? `${taxa.toFixed(2)}% vs piso ${piso.toFixed(1)}%` : '--',
            contexto: ctx,
            acao: dcaIpca.ativo ? 'DCA ativo' : 'DCA pausado'
        });
    }
    const dg = data.rf?.renda2065?.distancia_gatilho;
    if (dg) {
        const valorRenda = data.rf?.renda2065?.valor ?? 0;
        const ctx = dg.taxa_atual != null ? `taxa: ${dg.taxa_atual.toFixed(2)}% · piso venda ${dg.piso_venda.toFixed(1)}% · gap ${dg.gap_pp.toFixed(2)}pp` + (valorRenda > 0 ? ` · posição R$${(valorRenda / 1000).toFixed(0)}k` : '') : undefined;
        gatilhos.push({
            nome: 'Renda+ 2065 — Taxa',
            tipo: 'taxa',
            status: dg.status || 'verde',
            valorPrimario: dg.taxa_atual != null ? `${dg.taxa_atual.toFixed(2)}% (gatilho ≤${dg.piso_venda.toFixed(1)}%)` : '--',
            contexto: ctx,
            acao: dg.status === 'verde' ? 'Monitorar' : dg.status === 'amarelo' ? 'Atenção — próximo do piso' : 'Avaliar venda'
        });
    }
    const driftSwrd = data.drift?.SWRD;
    if (driftSwrd) {
        const gap = driftSwrd.alvo - driftSwrd.atual;
        const absGap = Math.abs(gap);
        const status = absGap <= 3 ? 'verde' : absGap <= 5 ? 'amarelo' : 'vermelho';
        const impactoR = totalBrl > 0 ? Math.abs(absGap / 100 * totalBrl) : null;
        const ctx = `atual: ${driftSwrd.atual.toFixed(1)}% · alvo ${driftSwrd.alvo.toFixed(1)}% · gap ${gap >= 0 ? '-' : '+'}${absGap.toFixed(1)}pp` + (impactoR != null ? ` · ~R$${(impactoR / 1000).toFixed(0)}k para rebalancear` : '');
        gatilhos.push({
            nome: 'Equity SWRD — Drift',
            tipo: 'posicao',
            status,
            valorPrimario: `${driftSwrd.atual.toFixed(1)}% (alvo ${driftSwrd.alvo.toFixed(1)}%)`,
            contexto: ctx,
            acao: status === 'verde' ? 'OK' : 'Priorizar aporte SWRD'
        });
    }
    const banda = data.hodl11?.banda;
    if (banda) {
        const ctx = banda.atual_pct != null ? `atual: ${banda.atual_pct.toFixed(1)}% · alvo ${banda.alvo_pct.toFixed(0)}% · banda ${banda.min_pct.toFixed(1)}–${banda.max_pct.toFixed(1)}%` : undefined;
        gatilhos.push({
            nome: 'Crypto HODL11 — Banda',
            tipo: 'crypto',
            status: banda.status || 'verde',
            valorPrimario: banda.atual_pct != null ? `${banda.atual_pct.toFixed(1)}% (banda ${banda.min_pct.toFixed(1)}–${banda.max_pct.toFixed(1)}%)` : '--',
            contexto: ctx,
            acao: banda.status === 'verde' ? 'Dentro da banda' : banda.status === 'amarelo' ? 'Perto do limite' : 'Fora da banda'
        });
    }
    const driftEntries = Object.entries(data.drift || {});
    const maxDriftEntry = driftEntries.filter(([k])=>k !== 'Custo').sort((a, b)=>Math.abs(b[1]?.atual - b[1]?.alvo) - Math.abs(a[1]?.atual - a[1]?.alvo))[0];
    if (maxDriftEntry) {
        const [bucket, bDrift] = maxDriftEntry;
        const bGap = bDrift.alvo - bDrift.atual;
        const bAbsGap = Math.abs(bGap);
        const status = bAbsGap <= 3 ? 'verde' : bAbsGap <= 5 ? 'amarelo' : 'vermelho';
        const impactoR = totalBrl > 0 ? Math.abs(bAbsGap / 100 * totalBrl) : null;
        const ctx = `atual: ${bDrift.atual.toFixed(1)}% · alvo ${bDrift.alvo.toFixed(1)}% · gap ${bGap >= 0 ? '-' : '+'}${bAbsGap.toFixed(1)}pp` + (impactoR != null ? ` · ~R$${(impactoR / 1000).toFixed(0)}k` : '');
        gatilhos.push({
            nome: `Drift máximo (${bucket})`,
            tipo: 'posicao',
            status,
            valorPrimario: `${bAbsGap.toFixed(1)}pp`,
            contexto: ctx,
            acao: status === 'verde' ? 'OK' : 'Rebalancear via aporte'
        });
    }
    const statusIpca = gatilhos.length > 0 ? gatilhos[0].status : 'verde';
    const resumoGatilhos = `IPCA+ 2040: ${dcaIpca?.ativo ? 'DCA ativo' : 'DCA pausado'} · ${gatilhos.length} gatilhos monitorados`;
    // Compute wellness label from score
    const wellnessScoreRaw = Math.min(1, progPct / 100 * 1.2);
    const wellnessLabel = wellnessScoreRaw >= 0.80 ? 'Excelente' : wellnessScoreRaw >= 0.60 ? 'Progredindo' : wellnessScoreRaw >= 0.40 ? 'Atenção' : 'Crítico';
    // Compute wellness metrics breakdown
    const firePercentageMetric = Math.min(1, progPct / 100);
    const equityAllocationMetric = totalEquityUsd * CAMBIO / totalBrl; // Already computed above
    const diversificationMetric = Object.keys(bucketUsd).filter((k)=>bucketUsd[k] > 0).length >= 3 ? 0.9 : Object.keys(bucketUsd).filter((k)=>bucketUsd[k] > 0).length === 2 ? 0.6 : 0.3;
    const costEfficiencyMetric = 1 - Math.min(1, (data.drift?.['Custo']?.atual ?? 0) / 100);
    const liquidityScore = (rfBrl + (data.hodl11?.valor ?? 0)) / totalBrl; // RF + crypto as liquid
    const wellnessMetrics = [
        {
            label: 'Progresso FIRE',
            value: Math.round(firePercentageMetric * 100),
            max: 100,
            color: firePercentageMetric >= 0.8 ? '#22c55e' : firePercentageMetric >= 0.6 ? '#eab308' : '#ef4444',
            detail: `${Math.round(firePercentageMetric * 100)}%`
        },
        {
            label: 'Alocação Equity',
            value: Math.round(equityAllocationMetric * 100),
            max: 100,
            color: equityAllocationMetric >= 0.6 ? '#22c55e' : equityAllocationMetric >= 0.5 ? '#eab308' : '#ef4444',
            detail: `${Math.round(equityAllocationMetric * 100)}%`
        },
        {
            label: 'Diversificação',
            value: Math.round(diversificationMetric * 100),
            max: 100,
            color: diversificationMetric >= 0.8 ? '#22c55e' : diversificationMetric >= 0.5 ? '#eab308' : '#ef4444',
            detail: `${Object.keys(bucketUsd).filter((k)=>bucketUsd[k] > 0).length} buckets`
        },
        {
            label: 'Eficiência Custos',
            value: Math.round(costEfficiencyMetric * 100),
            max: 100,
            color: costEfficiencyMetric >= 0.95 ? '#22c55e' : costEfficiencyMetric >= 0.90 ? '#eab308' : '#ef4444',
            detail: `${(data.drift?.['Custo']?.atual ?? 0).toFixed(2)}% TER`
        },
        {
            label: 'Liquidez',
            value: Math.round(liquidityScore * 100),
            max: 100,
            color: liquidityScore >= 0.3 ? '#22c55e' : liquidityScore >= 0.15 ? '#eab308' : '#ef4444',
            detail: `${Math.round(liquidityScore * 100)}%`
        }
    ];
    // Compute aporte accumulated values
    const aporteMensal = data.premissas?.aporte_mensal ?? 0;
    const ultimoAporte = data.premissas?.ultimo_aporte_brl ?? 0;
    const ultimoAporteData = data.premissas?.ultimo_aporte_data ?? '';
    // Estimate accumulated values (simplified — actual implementation would parse minilog)
    const acumuladoMes = ultimoAporte * (ultimoAporteData.includes(today.toISOString().substring(0, 7)) ? 1 : 0) || aporteMensal;
    const acumuladoAno = data.aporte_mensal?.total_aporte_brl ?? aporteMensal * 12; // Approximate
    // Compute top wellness actions from wellness_config
    const topAcoes = (()=>{
        if (!data.wellness_config || !Array.isArray(data.wellness_config.acoes)) {
            return [];
        }
        return data.wellness_config.acoes.sort((a, b)=>(a.rank || 999) - (b.rank || 999)).slice(0, 5);
    })();
    // Compute cash flow distribution (aporte → destinations)
    const aporteMensalVal = data.premissas?.aporte_mensal ?? 0;
    const equityRatio = totalEquityUsd * CAMBIO / totalBrl; // Current equity allocation %
    const rfRatio = rfBrl / totalBrl; // Current RF allocation %
    const cryptoRatio = cryptoBrl / totalBrl; // Current crypto allocation %
    const ipcaFlowMonthly = aporteMensalVal * (ipcaTotalBrl / (rfBrl || 1)); // Pro-rata IPCA allocation
    const equityFlowMonthly = aporteMensalVal * equityRatio;
    const rendaPlusFlowMonthly = aporteMensalVal * ((data.rf?.renda2065?.valor ?? 0) / (rfBrl || 1) * rfRatio);
    const cryptoFlowMonthly = aporteMensalVal * cryptoRatio;
    return {
        // Core values
        networth: totalBrl,
        networthUsd: totalEquityUsd,
        monthlyIncome: data.premissas?.renda_mensal_liquida ?? 0,
        yearlyExpense: data.premissas?.custo_vida_base ?? 0,
        // FIRE tracking
        fireDate,
        fireMonthsAway: moInt + yrInt * 12,
        firePercentage: progPct / 100,
        pfire,
        // Wellness score (simple heuristic)
        wellnessScore: Math.min(1, progPct / 100 * 1.2),
        wellnessLabel,
        wellnessMetrics,
        topAcoes,
        wellnessStatus: progPct >= 80 ? 'excellent' : progPct >= 60 ? 'ok' : progPct >= 40 ? 'warning' : 'critical',
        // FIRE patrimonio
        firePatrimonioAtual: data.premissas.patrimonio_atual,
        firePatrimonioGatilho: PAT_GATILHO,
        // Aporte tracking
        aporteMensal,
        ultimoAporte,
        ultimoAporteData,
        acumuladoMes,
        acumuladoAno,
        // Cash flow distribution (annual flows by destination)
        ipcaFlowMonthly,
        equityFlowMonthly,
        rendaPlusFlowMonthly,
        cryptoFlowMonthly,
        // P(FIRE) scenarios and tornado
        pfireBase: data.pfire_base?.base ?? 90.4,
        pfireFav: data.pfire_base?.fav ?? 94.1,
        pfireStress: data.pfire_base?.stress ?? 86.8,
        tornadoData: data.tornado ?? [],
        // Allocation
        equityPercentage: totalEquityUsd * CAMBIO / totalBrl,
        rfPercentage: rfBrl / totalBrl,
        // Geographic diversification
        internationalPercentage: (geoUS + geoDM + geoEM) / totalEquityUsd,
        concentrationBrazil: ipcaTotalBrl / totalBrl,
        // Cost metrics
        costIndexBps: data.drift?.['Custo']?.atual ?? 0,
        trackingDifference: 0,
        // Gatilhos
        gatilhos,
        statusIpca,
        resumoGatilhos,
        // Enriched data for charts
        CAMBIO,
        PAT_GATILHO,
        totalEquityUsd,
        rfBrl,
        cryptoLegado,
        cryptoBrl,
        totalBrl,
        ipcaTotalBrl,
        bucketUsd,
        swrdUsd,
        avuvUsd,
        avdvUsd,
        usscUsd,
        avgsUsd,
        avemUsd,
        iwvlUsd,
        geoUS,
        geoDM,
        geoEM,
        patInicio,
        patFim,
        anos,
        cagr,
        TWR_USD,
        TWR_BRL,
        progPct,
        swrFireDay,
        today,
        _anoFireAlvoGlobal,
        _anoFireAspir,
        _anoFire,
        _btPeriodStr,
        cambioInicio,
        cambioFim,
        anosCambio,
        fx_contrib_anual,
        yearsLeft,
        yrInt,
        moInt
    };
}
}),
"[project]/react-app/src/utils/montecarlo.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Monte Carlo Simulation
 * Port from dashboard/js/05-fire-projections.mjs
 * Pure function: stateless, deterministic with seed
 */ __turbopack_context__.s([
    "computePercentiles",
    ()=>computePercentiles,
    "runMC",
    ()=>runMC,
    "runMCTrajectories",
    ()=>runMCTrajectories
]);
function runMC(params) {
    const trajectories = runMCTrajectories(params);
    const endWealthDist = trajectories.map((t)=>t[t.length - 1]);
    const sorted = endWealthDist.slice().sort((a, b)=>a - b);
    const p10 = sorted[Math.floor(sorted.length * 0.1)];
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const successRate = endWealthDist.filter((w)=>w > params.initialCapital).length / endWealthDist.length;
    return {
        trajectories,
        endWealthDist,
        percentiles: {
            p10: trajectories.map((_, i)=>getPercentileAtMonth(trajectories, 0.1, i)),
            p50: trajectories.map((_, i)=>getPercentileAtMonth(trajectories, 0.5, i)),
            p90: trajectories.map((_, i)=>getPercentileAtMonth(trajectories, 0.9, i))
        },
        successRate,
        medianEndWealth: p50
    };
}
function runMCTrajectories(params) {
    const months = params.years * 12;
    const monthlyReturn = params.returnMean / 12;
    const monthlyStd = params.returnStd / Math.sqrt(12);
    const trajectories = [];
    for(let sim = 0; sim < params.numSims; sim++){
        const traj = [
            params.initialCapital
        ];
        for(let month = 1; month < months; month++){
            const prevValue = traj[month - 1];
            const randomReturn = boxMullerRandom() * monthlyStd + monthlyReturn;
            const newValue = prevValue * (1 + randomReturn) + params.monthlyContribution;
            traj.push(Math.max(0, newValue));
        }
        trajectories.push(traj);
    }
    return trajectories;
}
/**
 * Box-Muller transform for normal distribution
 */ let z0 = null;
let z1 = null;
function boxMullerRandom() {
    if (z1 !== null) {
        const result = z1;
        z1 = null;
        return result;
    }
    let u1 = 0;
    let u2 = 0;
    // Ensure u1 is not 0
    while(u1 === 0)u1 = Math.random();
    while(u2 === 0)u2 = Math.random();
    const mag = Math.sqrt(-2.0 * Math.log(u1));
    z0 = mag * Math.cos(2.0 * Math.PI * u2);
    z1 = mag * Math.sin(2.0 * Math.PI * u2);
    return z0;
}
/**
 * Compute percentile at specific month across trajectories
 */ function getPercentileAtMonth(trajectories, percentile, month) {
    const values = trajectories.map((t)=>t[month] || t[t.length - 1]).sort((a, b)=>a - b);
    const idx = Math.floor(values.length * percentile);
    return values[idx];
}
function computePercentiles(trajectories, percentiles = [
    0.1,
    0.5,
    0.9
]) {
    if (!trajectories || trajectories.length === 0) {
        return {};
    }
    const maxMonths = Math.max(...trajectories.map((t)=>t.length));
    const result = {};
    for (const p of percentiles){
        const values = [];
        for(let month = 0; month < maxMonths; month++){
            values.push(getPercentileAtMonth(trajectories, p, month));
        }
        result[Math.round(p * 100)] = values;
    }
    return result;
}
}),
"[project]/react-app/src/utils/basePath.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBasePath",
    ()=>getBasePath,
    "withBasePath",
    ()=>withBasePath
]);
/**
 * Utility to get the basePath from environment or construct absolute URLs
 * basePath is configured in next.config.ts and injected via NEXT_PUBLIC_BASE_PATH
 */ const BASE_PATH = ("TURBOPACK compile-time value", "/wealth") || '';
function getBasePath() {
    return BASE_PATH;
}
function withBasePath(path) {
    // If path already starts with basePath, return as-is
    if (BASE_PATH && path.startsWith(BASE_PATH)) {
        return path;
    }
    // Prepend basePath to relative paths
    return `${BASE_PATH}${path}`;
}
}),
"[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDashboardStore",
    ()=>useDashboardStore
]);
/**
 * Dashboard Store — Global State Management
 * Using Zustand for reactive state without Redux boilerplate
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$dataWiring$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/utils/dataWiring.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$montecarlo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/utils/montecarlo.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/utils/basePath.ts [app-ssr] (ecmascript)");
;
;
;
;
// Singleton promise tracking — prevents duplicate in-flight requests
let loadDataPromise = null;
let abortController = null;
const defaultMcParams = {
    initialCapital: 1000000,
    monthlyContribution: 5000,
    returnMean: 0.07,
    returnStd: 0.12,
    stressLevel: 0,
    years: 30,
    numSims: 1000
};
const useDashboardStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        // Initial state
        data: null,
        derived: null,
        isLoadingData: false,
        dataLoadError: null,
        stress: {
            returnShock: 0,
            volatilityShock: 0,
            contributionShock: 0
        },
        mcParams: defaultMcParams,
        mcResults: null,
        // Data actions
        setData: (data)=>{
            try {
                const derived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$dataWiring$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeDerivedValues"])(data);
                set({
                    data,
                    derived,
                    dataLoadError: null
                });
            } catch (e) {
                console.error('Error computing derived values:', e);
                set({
                    data,
                    derived: null
                });
            }
        },
        // Singleton data loading
        loadDataOnce: async ()=>{
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
            set({
                isLoadingData: true,
                dataLoadError: null
            });
            // Create new AbortController for this request
            abortController = new AbortController();
            // Fetch data once
            loadDataPromise = (async ()=>{
                try {
                    const dataUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["withBasePath"])('/data.json');
                    console.log('Dashboard: fetching data from', dataUrl);
                    const response = await fetch(dataUrl, {
                        signal: abortController.signal
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status} from ${dataUrl}`);
                    }
                    const data = await response.json();
                    // Validate schema before storing
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$dataWiring$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateDataSchema"])(data);
                    // Store data in Zustand
                    set({
                        data,
                        isLoadingData: false,
                        dataLoadError: null
                    });
                    const derived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$dataWiring$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeDerivedValues"])(data);
                    set({
                        derived
                    });
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
                    set({
                        isLoadingData: false,
                        dataLoadError: errorMsg
                    });
                    loadDataPromise = null;
                    throw error;
                }
            })();
            return loadDataPromise;
        },
        updateField: (key, value)=>{
            set((state)=>{
                if (!state.data) return state;
                const updated = {
                    ...state.data,
                    [key]: value
                };
                const derived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$dataWiring$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeDerivedValues"])(updated);
                return {
                    data: updated,
                    derived
                };
            });
        },
        // Simulator actions
        setStressShock: (key, value)=>{
            set((state)=>({
                    stress: {
                        ...state.stress,
                        [key]: value
                    }
                }));
        },
        setMcParams: (params)=>{
            set((state)=>({
                    mcParams: {
                        ...state.mcParams,
                        ...params
                    }
                }));
        },
        setMcResults: (results)=>{
            set({
                mcResults: results
            });
        },
        runMC: (params)=>{
            const state = get();
            const finalParams = params ? {
                ...state.mcParams,
                ...params
            } : state.mcParams;
            try {
                // Apply stress level to returns
                const stressedParams = {
                    ...finalParams,
                    returnMean: finalParams.returnMean * (1 - finalParams.stressLevel / 100),
                    returnStd: finalParams.returnStd * (1 + finalParams.stressLevel / 200)
                };
                const results = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$utils$2f$montecarlo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["runMC"])(stressedParams);
                const drawdownDistribution = {};
                // Generate drawdown buckets from trajectories
                if (results.trajectories && results.trajectories.length > 0) {
                    results.trajectories.forEach((trajectory)=>{
                        let maxDD = 0;
                        let peak = trajectory[0];
                        for(let i = 1; i < trajectory.length; i++){
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
                const mcResult = {
                    trajectories: results.trajectories || [],
                    endWealthDist: results.endWealthDist || [],
                    percentiles: results.percentiles || {
                        p10: [],
                        p50: [],
                        p90: []
                    },
                    successRate: (results.successRate || 0) * 100,
                    medianEndWealth: results.medianEndWealth || 0,
                    drawdownDistribution
                };
                set({
                    mcResults: mcResult
                });
            } catch (error) {
                console.error('Error running MC simulation:', error);
                set({
                    mcResults: null
                });
            }
        }
    }));
}),
"[project]/react-app/src/components/layout/Footer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Footer",
    ()=>Footer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/dashboardStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function Footer() {
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$dashboardStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardStore"])((s)=>s.data);
    const { generatedDate, daysOld, isStale } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data?.date) {
            return {
                generatedDate: '—',
                daysOld: 0,
                isStale: false
            };
        }
        const generated = new Date(data.date);
        const now = new Date();
        const diffMs = now.getTime() - generated.getTime();
        const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const isStale = daysOld > 7;
        const formatted = generated.toLocaleDateString('pt-BR');
        return {
            generatedDate: formatted,
            daysOld,
            isStale
        };
    }, [
        data?.date
    ]);
    const nextCheckDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data?.date) return '—';
        const generated = new Date(data.date);
        generated.setDate(generated.getDate() + 30);
        return generated.toLocaleDateString('pt-BR');
    }, [
        data?.date
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        style: styles.footer,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.section,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.label,
                            children: "Generated"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.value,
                            children: generatedDate
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        daysOld > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.subtext,
                            children: [
                                "(",
                                daysOld,
                                "d ago)"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.section,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.label,
                            children: "Next Check"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.value,
                            children: nextCheckDate
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this),
                isStale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...styles.section,
                        ...styles.staleness
                    },
                    "data-test": "staleness-banner",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                        style: {
                            color: 'var(--text)',
                            fontWeight: '600'
                        },
                        children: [
                            "⚠️ Data is ",
                            daysOld,
                            " days old — consider updating"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                        lineNumber: 55,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                    lineNumber: 48,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.section,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.label,
                            children: "Version"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            style: styles.value,
                            children: "v1.0.0-F2"
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/layout/Footer.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/react-app/src/components/layout/Footer.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/react-app/src/components/layout/Footer.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
const styles = {
    footer: {
        backgroundColor: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        padding: '12px 0',
        marginTop: '40px'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px',
        gap: '20px',
        flexWrap: 'wrap'
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    label: {
        color: 'var(--muted)',
        fontSize: '11px',
        textTransform: 'uppercase',
        fontWeight: '600'
    },
    value: {
        color: 'var(--text)',
        fontSize: '13px',
        fontWeight: '500'
    },
    subtext: {
        color: 'var(--muted)',
        fontSize: '11px'
    },
    staleness: {
        padding: '8px 12px',
        backgroundColor: 'var(--orange)',
        borderRadius: '4px',
        flex: 1
    }
};
}),
"[project]/react-app/src/components/primitives/VersionFooter.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VersionFooter",
    ()=>VersionFooter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$config$2f$version$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/config/version.ts [app-ssr] (ecmascript)");
'use client';
;
;
function VersionFooter() {
    const buildDateObj = new Date(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$config$2f$version$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BUILD_DATE"]);
    const formattedDate = buildDateObj.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        style: styles.footer,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.text,
                    children: [
                        "Dashboard: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: [
                                "v",
                                __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$config$2f$version$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DASHBOARD_VERSION"]
                            ]
                        }, void 0, true, {
                            fileName: "[project]/react-app/src/components/primitives/VersionFooter.tsx",
                            lineNumber: 19,
                            columnNumber: 22
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/primitives/VersionFooter.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: styles.text,
                    children: [
                        "Built: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                            children: formattedDate
                        }, void 0, false, {
                            fileName: "[project]/react-app/src/components/primitives/VersionFooter.tsx",
                            lineNumber: 22,
                            columnNumber: 18
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/react-app/src/components/primitives/VersionFooter.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/react-app/src/components/primitives/VersionFooter.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/react-app/src/components/primitives/VersionFooter.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
const styles = {
    footer: {
        marginTop: '60px',
        padding: '24px 16px',
        borderTop: '1px solid rgba(107, 114, 128, 0.2)',
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        fontSize: '0.75rem',
        color: '#9ca3af'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '24px',
        justifyContent: 'center'
    },
    text: {
        margin: 0
    }
};
}),
"[project]/react-app/src/hooks/usePrivacyMode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePrivacyMode",
    ()=>usePrivacyMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/store/uiStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
function usePrivacyMode() {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const privacyMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.privacyMode);
    const togglePrivacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.togglePrivacy);
    const setPrivacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((s)=>s.setPrivacy);
    // Apply privacy mode to body element
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, [
        privacyMode
    ]);
    // Return before mount to prevent hydration mismatch
    if (!mounted) {
        return {
            privacyMode: false,
            togglePrivacy,
            setPrivacy
        };
    }
    return {
        privacyMode,
        togglePrivacy,
        setPrivacy
    };
}
}),
"[project]/react-app/src/app/layout-client.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LayoutClient",
    ()=>LayoutClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$layout$2f$Header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/layout/Header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$layout$2f$TabNav$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/layout/TabNav.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$layout$2f$Footer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/layout/Footer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$VersionFooter$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/components/primitives/VersionFooter.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$usePrivacyMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/react-app/src/hooks/usePrivacyMode.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function LayoutClient({ children }) {
    // Chart.js removed - using ECharts instead
    // TODO: Remove useChartSetup hook and react-chartjs-2 dependencies
    // Initialize privacy mode hook (handles localStorage + DOM class)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$hooks$2f$usePrivacyMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrivacyMode"])();
    // Note: PTAX live updates removed - cambio is loaded from data.json
    // API calls to BCB from browser cause CORS/406 errors and break rendering
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$layout$2f$Header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Header"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/layout-client.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$layout$2f$TabNav$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabNav"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/layout-client.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: {
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '20px',
                    minHeight: 'calc(100vh - 200px)'
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/react-app/src/app/layout-client.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$layout$2f$Footer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Footer"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/layout-client.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$react$2d$app$2f$src$2f$components$2f$primitives$2f$VersionFooter$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VersionFooter"], {}, void 0, false, {
                fileName: "[project]/react-app/src/app/layout-client.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07bsek0._.js.map