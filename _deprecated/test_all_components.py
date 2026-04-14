#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

# Read spec.json to get all blocks
spec_path = Path('dashboard/spec.json')
spec = json.loads(spec_path.read_text())

blocks = spec.get('blocks', [])
print(f"\n📊 Encontrados {len(blocks)} componentes no schema\n")

# Map block type to detection method
def get_detector_js(block_id, block_type):
    """Generate JavaScript to detect if component is rendered"""
    return f"""
(() => {{
  const el = document.getElementById('{block_id}');
  if (!el) return {{ found: false, type: '{block_type}' }};
  
  const isCanvas = el.tagName === 'CANVAS';
  const canvas = isCanvas ? el : el.querySelector('canvas');
  const table = isCanvas ? null : el.querySelector('table');
  const svg = isCanvas ? null : el.querySelector('svg');
  const hasContent = el.textContent.trim().length > 20 || el.children.length > 0;
  const isVisible = window.getComputedStyle(el).display !== 'none' && 
                    window.getComputedStyle(el).visibility !== 'hidden';
  
  return {{
    found: true,
    type: '{block_type}',
    visible: isVisible,
    hasCanvas: !!canvas,
    hasTable: !!table,
    hasSvg: !!svg,
    hasContent: hasContent,
    innerHTML: el.innerHTML.substring(0, 100),
  }};
}})();
"""

# Create Node.js test script
test_script = Path('test_components.js')
test_script.write_text('''#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 9876;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(DASHBOARD_DIR, url);
  if (!filePath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('404');
      return;
    }
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  const results = {};
  const BLOCKS = %BLOCKS%;
  
  for (const block of BLOCKS) {
    const tab = block.tab;
    
    // Switch to tab
    await page.evaluate(t => window.switchTab?.(t), tab);
    await page.waitForTimeout(1500);
    
    // Test component
    const status = await page.evaluate(`(%DETECTOR%)`);
    results[block.id] = { tab, type: block.type, status };
  }
  
  await browser.close();
  server.close();
  
  // Output results as JSON
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
});
'''.replace('%BLOCKS%', json.dumps(blocks))
.replace('%DETECTOR%', 'TODO'))

print(f"✅ Preparação completa para {len(blocks)} componentes")
print(f"📋 Próximo passo: testar cada componente no browser")
