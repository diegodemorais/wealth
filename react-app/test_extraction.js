const fs = require('fs');
const cssContent = fs.readFileSync('src/styles/dashboard.css', 'utf-8');

const startIdx = cssContent.indexOf('@media (max-width: 768px)');
const endIdx = cssContent.indexOf('}', startIdx) + 1;
const tabletSection = cssContent.substring(startIdx, endIdx);

console.log("Extracted section:");
console.log(tabletSection);
console.log("\n---\n");
console.log("Contains 'repeat(2, 1fr)'?", tabletSection.includes('repeat(2, 1fr)'));
