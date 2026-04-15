import os
import re

chart_files = [
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
        print(f"Skipping {file_path} - not found")
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Skip if already fixed
    if 'opts={{ responsive:' in content:
        print(f"Skipping {file_path} - already fixed")
        continue
    
    # Pattern 1: style={{ height: 400 }} with />
    content = re.sub(
        r'<ReactECharts ref={chartRef} option={option} style={{ height: (\d+) }} />',
        r'<ReactECharts\n        ref={chartRef}\n        option={option}\n        style={{ height: \1, width: "100%" }}\n        opts={{ responsive: true, maintainAspectRatio: false }}\n      />',
        content
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Fixed {file_path}")

print("Done!")
