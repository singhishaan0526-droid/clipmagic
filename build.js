const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'frontend/dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 1. Browser bundle (IIFE with globalName: ClipMagicCore)
esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'frontend/src/index.ts')],
    outfile: path.join(distDir, 'clip-magic.bundle.js'),
    bundle: true,
    format: 'iife',
    globalName: 'ClipMagicCore',
    sourcemap: true,
    target: 'es2022'
});

// 2. ESM Module bundle for ES module imports
esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'frontend/src/index.ts')],
    outfile: path.join(distDir, 'index.esm.js'),
    bundle: true,
    format: 'esm',
    sourcemap: true,
    target: 'es2022'
});

console.log('✓ Clip Magic TypeScript bundles built successfully in frontend/dist/');
