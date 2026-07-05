import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

async function buildModules() {
  const distPath = './node_modules/pdfjs-dist/legacy/build';
  const outDir = './dist';

  // Ensure output directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Shared configuration for esbuild
  const commonConfig = {
    bundle: true,
    format: 'iife',
    sourcemap: true,
    define: { 'import.meta.url': '""' },
    target: ['es2020']
  };

  console.log('Starting transpilation of PDF.js modules...');

  // 1. Bundle the main library
  await esbuild.build({
    ...commonConfig,
    entryPoints: [path.join(distPath, 'pdf.mjs')],
    globalName: 'pdfjsLib',
    outfile: path.join(outDir, 'pdf.js'),
  });
  console.log('✓ pdf.js bundled.');

  // 2. Bundle the Web Worker
  await esbuild.build({
    ...commonConfig,
    entryPoints: [path.join(distPath, 'pdf.worker.mjs')],
    outfile: path.join(outDir, 'pdf.worker.js'),
  });
  console.log('✓ pdf.worker.js bundled.');

  // 3. Bundle the Sandbox
  await esbuild.build({
    ...commonConfig,
    entryPoints: [path.join(distPath, 'pdf.sandbox.mjs')],
    outfile: path.join(outDir, 'pdf.sandbox.js'),
  });
  console.log('✓ pdf.sandbox.js bundled.');

  console.log('Transpilation completed successfully.');
}

buildModules().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
