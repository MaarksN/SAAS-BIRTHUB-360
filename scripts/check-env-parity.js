const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(rootDir, '.env.example');
const envLocalPath = path.join(rootDir, '.env.local');
const envPath = path.join(rootDir, '.env');

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.warn('⚠️  .env.example not found. Skipping parity check.');
  process.exit(0);
}

// Read .env.example
const parseEnv = (content) => {
  return content
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(key => key.length > 0);
};

const exampleKeys = parseEnv(fs.readFileSync(envExamplePath, 'utf8'));

// Determine which local env file to check
let localEnvPath = null;
if (fs.existsSync(envLocalPath)) {
  localEnvPath = envLocalPath;
} else if (fs.existsSync(envPath)) {
  localEnvPath = envPath;
}

if (!localEnvPath) {
  console.error('❌ No .env or .env.local found. Please copy .env.example to .env');
  process.exit(1);
}

const localKeys = parseEnv(fs.readFileSync(localEnvPath, 'utf8'));
const localKeysSet = new Set(localKeys);

const missingKeys = exampleKeys.filter(key => !localKeysSet.has(key));

if (missingKeys.length > 0) {
  console.error('❌ Missing environment variables in ' + path.basename(localEnvPath) + ':');
  missingKeys.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log('✅ Environment parity check passed.');
