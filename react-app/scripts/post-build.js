#!/usr/bin/env node
/**
 * Post-build script for GitHub Pages deployment
 * Creates a simple redirect from root to /dashboard
 *
 * Problem: Copying dashboard.html to index.html creates route conflicts
 * because dashboard.html has React Server Component payloads for /dashboard route.
 *
 * Solution: Create a simple HTML redirect using meta refresh.
 */

const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, '..', '..', 'dashboard');
const indexFile = path.join(dashboardDir, 'index.html');

const redirectHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/wealth-dash/dashboard">
  <title>Redirecting to Wealth Dashboard...</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f1117;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .container {
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    p {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
      margin-top: 20px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💰 Wealth</h1>
    <p>Redirecting to dashboard...</p>
    <a href="/wealth-dash/dashboard">Click here if not redirected automatically</a>
  </div>
</body>
</html>`;

try {
  fs.writeFileSync(indexFile, redirectHTML);
  console.log('✅ Post-build: Created redirect index.html');
} catch (error) {
  console.error('❌ Post-build failed:', error.message);
  process.exit(1);
}
