const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../public/service-worker.js');
const version = Date.now();

let content = fs.readFileSync(swPath, 'utf8');
content = content.replace(
  /const CACHE_NAME = 'house-meal-planner-[^']+'/,
  `const CACHE_NAME = 'house-meal-planner-${version}'`
);
fs.writeFileSync(swPath, content);
console.log(`Cache version updated: house-meal-planner-${version}`);
