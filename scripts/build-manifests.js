
const fs = require('fs');
const path = require('path');
const pkgPath = path.join(__dirname, '..', 'package.json');
const outVSCode = path.join(__dirname, '..', 'manifest-vscode.json');
const outOpenVSX = path.join(__dirname, '..', 'manifest-openvsx.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// VS Code Marketplace manifest (as-is)
fs.writeFileSync(outVSCode, JSON.stringify(pkg, null, 2));

// Open VSX manifest (strip galleryBanner if needed, keep same fields)
const ovsx = JSON.parse(JSON.stringify(pkg));
// Example tweak: prefer neutral categories
if (!ovsx.categories || !Array.isArray(ovsx.categories)) ovsx.categories = ['Other'];
fs.writeFileSync(outOpenVSX, JSON.stringify(ovsx, null, 2));

console.log('Generated manifest-vscode.json and manifest-openvsx.json');
