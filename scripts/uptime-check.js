const https = require('https');
const http = require('http');

const urls = [
  process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/health` : 'http://localhost:3000/api/health',
  'http://localhost:8000/health'
];

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(true);
      } else {
        reject(new Error(`Status Code: ${res.statusCode}`));
      }
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function main() {
  console.log('Checking uptime...');
  let hasError = false;
  for (const url of urls) {
    try {
      await checkUrl(url);
      console.log(`✅ ${url} is UP`);
    } catch (error) {
      console.error(`❌ ${url} is DOWN: ${error.message}`);
      hasError = true;
    }
  }
  if (hasError) process.exit(1);
}

main();
