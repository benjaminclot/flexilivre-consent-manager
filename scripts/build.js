import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const CONFIGS_DIR = path.join(ROOT_DIR, 'src/configs');
const INPUT_PATH = path.join(ROOT_DIR, 'src/consent.js');
const OUTPUT_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'consent.min.js');

// Load and merge all configs with vendor data
function loadConfigs() {
  const vendorsPath = path.join(CONFIGS_DIR, 'vendors.json');
  const allVendors = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'));

  const configs = {};

  // Read all domain config files (exclude vendors.json)
  const configFiles = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json') && f !== 'vendors.json');

  for (const file of configFiles) {
    const configPath = path.join(CONFIGS_DIR, file);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const key = file.replace('.json', ''); // Use filename as key (e.g., "flexilivre.es")
    const enabledVendors = config.enabledVendors || [];
    const lang = config.language;

    // Merge vendor data into translations
    config.translations.vendors = enabledVendors.map(vendorId => {
      const vendorData = allVendors[vendorId];
      if (!vendorData) return null;

      // Get translation or fallback to first available
      const vendorTrans = vendorData.translations[lang] ||
        vendorData.translations[Object.keys(vendorData.translations)[0]];

      return {
        id: vendorId,
        favicon: vendorData.favicon,
        legitimate: vendorData.legitimate || false,
        ...vendorTrans
      };
    }).filter(v => v !== null);

    configs[key] = config;
  }

  return configs;
}

async function buildClient() {
  try {
    console.log('Building consent.min.js...');

    if (!fs.existsSync(INPUT_PATH)) {
      console.error('Source file not found:', INPUT_PATH);
      process.exit(1);
    }

    // Load all configs
    const configs = loadConfigs();
    console.log(`Loaded ${Object.keys(configs).length} domain configs:`, Object.keys(configs).join(', '));

    // Read source and inject configs at the top (inside the IIFE)
    let code = fs.readFileSync(INPUT_PATH, 'utf8');

    // Inject CONFIGS constant after the opening IIFE
    const configsCode = `const CONFIGS = ${JSON.stringify(configs)};`;
    code = code.replace('(function () {', `(function () {\n  ${configsCode}`);

    const result = await minify(code, {
      compress: true,
      mangle: true
    });

    if (result.error) {
      throw result.error;
    }

    let finalCode = result.code;

    // Post-process to remove HTML formatting
    // 1. Remove literal newlines and following whitespace (template literals)
    finalCode = finalCode.replace(/[\r\n]+\s*/g, '');
    // 2. Remove escaped newlines and following whitespace (strings)
    finalCode = finalCode.replace(/\\n\s*/g, '');
    // 3. Remove spaces between HTML tags
    finalCode = finalCode.replace(/>\s+</g, '><');

    // Ensure dist directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, finalCode);
    console.log('Successfully built dist/consent.min.js');
    return true;
  } catch (err) {
    console.error('Error building client:', err);
    return false;
  }
}

// Watch mode
async function watch() {
  const chokidar = await import('chokidar');

  console.log('Starting watch mode...');
  await buildClient();

  const watcher = chokidar.default.watch([
    path.join(CONFIGS_DIR, '*.json'),
    INPUT_PATH
  ], {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });

  watcher.on('change', async (filePath) => {
    console.log(`\nFile changed: ${path.basename(filePath)}`);
    await buildClient();
  });

  watcher.on('add', async (filePath) => {
    console.log(`\nFile added: ${path.basename(filePath)}`);
    await buildClient();
  });

  watcher.on('unlink', async (filePath) => {
    console.log(`\nFile removed: ${path.basename(filePath)}`);
    await buildClient();
  });

  console.log('Watching for changes... (Ctrl+C to stop)');
}

// CLI
const args = process.argv.slice(2);
if (args.includes('--watch') || args.includes('-w')) {
  watch();
} else {
  buildClient();
}
