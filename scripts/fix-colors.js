/**
 * Script pour remplacer tous les backgrounds fixes par des variables CSS
 * Usage: node scripts/fix-colors.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('**/*.{tsx,ts}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/**']
});

const replacements = [
  {
    pattern: /background:\s*['"]rgba\(255,255,255,0\.05\)['"]/g,
    replacement: "background: 'var(--form-bg)'"
  },
  {
    pattern: /background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.05\)['"]/g,
    replacement: "background: 'var(--form-bg)'"
  }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Updated ${file}`);
  }
});

console.log('Done!');

