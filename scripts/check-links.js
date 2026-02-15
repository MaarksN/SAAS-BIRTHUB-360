const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

async function checkLinks() {
  console.log('Checking for broken links in Markdown files...');

  const files = globSync('**/*.md', { ignore: ['node_modules/**', 'dist/**', 'coverage/**'] });
  let errors = 0;
  let checked = 0;
  let externalLinks = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /\[.*?\]\((.*?)\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const url = match[1];

      // Internal links
      if (url.startsWith('.') || (url.startsWith('/') && !url.startsWith('//'))) {
        checked++;
        let targetPath;
        if (url.startsWith('/')) {
            targetPath = path.join(process.cwd(), url);
        } else {
            targetPath = path.resolve(path.dirname(file), url);
        }
        const cleanPath = targetPath.split('#')[0].split('?')[0];

        if (!fs.existsSync(cleanPath)) {
             console.error(`❌ Broken internal link in ${file}: ${url}`);
             errors++;
        }
      }
      // External links (http/https)
      else if (url.startsWith('http')) {
        externalLinks.push({ file, url });
      }
    }
  }

  console.log(`Checked ${checked} internal links.`);
  console.log(`Checking ${externalLinks.length} external links...`);

  // Batch verify external links to avoid rate limits or huge delays
  const BATCH_SIZE = 10;
  for (let i = 0; i < externalLinks.length; i += BATCH_SIZE) {
    const batch = externalLinks.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async ({ file, url }) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok && res.status !== 405 && res.status !== 403) {
                // 405 Method Not Allowed happens often for HEAD, 403 forbidden happens for some protected sites
                // We double check with GET if HEAD fails
                 const resGet = await fetch(url, { method: 'GET', signal: controller.signal });
                 if (!resGet.ok) {
                    console.warn(`⚠️ Potentially broken external link in ${file}: ${url} (Status: ${res.status})`);
                    // We treat external link failures as warnings, not errors to avoid blocking CI on flaky networks
                 }
            }
            checked++;
        } catch (err) {
            console.warn(`⚠️ Error checking external link in ${file}: ${url} (${err.message})`);
        }
    }));
  }

  console.log(`Checked total ${checked} links.`);

  if (errors > 0) {
    console.error(`Found ${errors} broken internal links.`);
    process.exit(1);
  } else {
    console.log('✅ No broken internal links found.');
  }
}

checkLinks();
