const fs = require('fs');
const path = require('path');

const checks = [
  {
    file: 'libs/core/src/types/ldr.ts',
    check: (content) =>
      content.includes('export interface ICNPJEnrichmentResult'),
    msg: 'libs/core/src/types/ldr.ts should exist and export ICNPJEnrichmentResult',
  },
  {
    file: 'libs/core/src/types/pipeline.ts',
    check: (content) => content.includes('export interface Deal'),
    msg: 'libs/core/src/types/pipeline.ts should exist and export Deal',
  },
  {
    file: 'libs/core/src/index.ts',
    check: (content) =>
      content.includes("export * from './types/ldr';") &&
      content.includes("export * from './types/pipeline';"),
    msg: 'libs/core/src/index.ts should export ldr and pipeline types',
  },
  {
    file: 'apps/web/services/ldr.service.ts',
    check: (content) =>
      content.includes("from '@salesos/core';") &&
      !content.includes("from '../types/ldr';"),
    msg: 'apps/web/services/ldr.service.ts should import from @salesos/core',
  },
  {
    file: 'apps/web/services/pipeline.service.ts',
    check: (content) =>
      content.includes('from "@salesos/core";') ||
      content.includes("from '@salesos/core';"),
    msg: 'apps/web/services/pipeline.service.ts should import from @salesos/core',
  },
  {
    file: 'apps/web/lib/prospector-actions.ts',
    check: (content) => content.includes("from '@salesos/core';"),
    msg: 'apps/web/lib/prospector-actions.ts should import from @salesos/core',
  },
  {
    file: 'apps/web/lib/pipeline.ts',
    check: (content) =>
      content.includes("from '@salesos/core';") &&
      !content.includes('export interface Deal {'),
    msg: 'apps/web/lib/pipeline.ts should import from @salesos/core and NOT export Deal interface locally',
  },
  {
    file: 'apps/web/lib/ldr.ts',
    check: (content) => content.includes("from '../services/ldr.service';"),
    msg: 'apps/web/lib/ldr.ts should import from ../services/ldr.service',
  },
];

let failed = false;

checks.forEach(({ file, check, msg }) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (!check(content)) {
      console.error(`FAIL: ${msg}`);
      failed = true;
    } else {
      console.log(`PASS: ${msg}`);
    }
  } catch (err) {
    console.error(`FAIL: Could not read ${file}`);
    failed = true;
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log('All checks passed.');
}
