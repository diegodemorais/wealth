import os
import re

chart_files = [
    "src/components/charts/TimelineChart.tsx",
    "src/components/charts/AttributionChart.tsx",
    "src/components/charts/BacktestChart.tsx",
    "src/components/charts/BacktestR7Chart.tsx",
    "src/components/charts/BondPoolRunwayChart.tsx",
    "src/components/charts/DeltaBarChart.tsx",
    "src/components/charts/DonutCharts.tsx",
    "src/components/charts/DrawdownHistChart.tsx",
    "src/components/charts/FanChart.tsx",
    "src/components/charts/GlidePathChart.tsx",
    "src/components/charts/GuardrailsChart.tsx",
    "src/components/charts/IncomeChart.tsx",
    "src/components/charts/IncomeProjectionChart.tsx",
    "src/components/charts/InformationRatioChart.tsx",
    "src/components/charts/NetWorthProjectionChart.tsx",
    "src/components/charts/RollingSharpChart.tsx",
    "src/components/charts/SankeyChart.tsx",
    "src/components/charts/ShadowChart.tsx",
    "src/components/charts/StackedAllocChart.tsx",
    "src/components/charts/TornadoChart.tsx",
    "src/components/charts/TrackingFireChart.tsx",
]

for file_path in chart_files:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove the opts prop and adjust style
    content = re.sub(
        r'<ReactECharts\s+ref={chartRef}\s+option={option}\s+style={{ height: (\d+), width: ["\']100%["\'] }}\s+opts={{ responsive: true, maintainAspectRatio: false }}\s+/>',
        r'<ReactECharts ref={chartRef} option={option} style={{ height: \1, width: "100%" }} />',
        content
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Reverted {file_path}")

print("Done!")
