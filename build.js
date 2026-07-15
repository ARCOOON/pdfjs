import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

async function buildModules() {
  const distPath = './node_modules/pdfjs-dist/legacy/build';
  const outBuildDir = './dist/build';

  // Ensure output directory exists inside dist/build
  if (!fs.existsSync(outBuildDir)) {
    fs.mkdirSync(outBuildDir, { recursive: true });
  }

  const commonConfig = {
    bundle: true,
    format: 'iife',
    sourcemap: true,
    define: { 'import.meta.url': '""' },
    target: ['es2020']
  };

  const targets = [
    { in: 'pdf.mjs', out: 'pdf.js', globalName: 'pdfjsLib' },
    { in: 'pdf.worker.mjs', out: 'pdf.worker.js' },
    { in: 'pdf.sandbox.mjs', out: 'pdf.sandbox.js' }
  ];

  console.log('Starting transpilation of PDF.js modules...');

  for (const t of targets) {
    // 1. Build standard unminified version
    await esbuild.build({
      ...commonConfig,
      entryPoints: [path.join(distPath, t.in)],
      outfile: path.join(outBuildDir, t.out),
      globalName: t.globalName,
      minify: false
    });
    console.log(`✓ ${t.out} bundled.`);

    // 2. Build minified version
    const minOut = t.out.replace('.js', '.min.js');
    await esbuild.build({
      ...commonConfig,
      entryPoints: [path.join(distPath, t.in)],
      outfile: path.join(outBuildDir, minOut),
      globalName: t.globalName,
      minify: true
    });
    console.log(`✓ ${minOut} bundled (minified).`);
  }

  console.log('Transpilation completed successfully.');
}

buildModules().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
