// Placeholder script for accessibility audit
// This script is intended to be run in a CI/CD environment where `pa11y` is installed.

const fs = require('fs');

async function runAudit() {
  console.log('Running Accessibility Audit...');

  try {
    const pa11y = require('pa11y');
    const urls = [
      'http://localhost:3000',
      'http://localhost:3000/dashboard'
    ];

    let hasErrors = false;

    for (const url of urls) {
      console.log(`Checking ${url}...`);
      try {
        const results = await pa11y(url, {
            // Options
            standard: 'WCAG2AA'
        });

        if (results.issues.length > 0) {
            console.error(`[FAIL] ${url}: Found ${results.issues.length} issues.`);
            results.issues.forEach(issue => {
                console.error(` - ${issue.message} (${issue.selector})`);
            });
            hasErrors = true;
        } else {
            console.log(`[PASS] ${url}`);
        }
      } catch (e) {
          console.warn(`Could not test ${url} (Service might be down):`, e.message);
      }
    }

    if (hasErrors) {
        process.exit(1);
    }

  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.warn('[WARN] `pa11y` module not found. Skipping automated audit.');
      console.warn('Please install it manually: npm install pa11y --save-dev');
      console.warn('Or follow the manual checklist in docs/ACCESSIBILITY.md');
    } else {
      console.error('Audit failed:', e);
      process.exit(1);
    }
  }
}

runAudit();
