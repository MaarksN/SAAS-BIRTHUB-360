const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

async function checkLinks() {
  console.log('Checking for broken internal links in Markdown files...');

  // Find all MD files
  const files = globSync('**/*.md', { ignore: ['node_modules/**', 'dist/**', 'coverage/**'] });
  let errors = 0;
  let checked = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    // Match [text](url)
    const regex = /\[.*?\]\((.*?)\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const url = match[1];

      // Check only local links
      if (url.startsWith('.') || (url.startsWith('/') && !url.startsWith('//'))) {
        checked++;
        let targetPath;

        if (url.startsWith('/')) {
            // Absolute path from root (heuristic)
            targetPath = path.join(process.cwd(), url);
        } else {
            // Relative path
            targetPath = path.resolve(path.dirname(file), url);
        }

        // Remove anchor
        const cleanPath = targetPath.split('#')[0];
        // Remove query
        const finalPath = cleanPath.split('?')[0];

        if (!fs.existsSync(finalPath)) {
            // Try adding extensions? usually MD links point to files.
            // But if it points to a directory, it might mean README.md?
            if (!fs.existsSync(finalPath)) {
                 console.error(`❌ Broken link in ${file}: ${url}`);
                 errors++;
            }
        }
      }
    }
  }

  console.log(`Checked ${checked} links in ${files.length} files.`);

  if (errors > 0) {
    console.error(`Found ${errors} broken links.`);
    process.exit(1);
  } else {
    console.log('✅ No broken internal links found.');
  }
}

checkLinks();
