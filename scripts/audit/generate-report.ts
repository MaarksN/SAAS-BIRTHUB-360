import { execSync } from 'child_process';
import { format } from 'date-fns';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import PDFDocument from 'pdfkit';
import ts from 'typescript';

// --- Configuration & Constants ---

const REPORT_DIR = 'docs/audits';
const ROOT_DIR = process.cwd();

// "Jules" Persona Constants
const PERSONA = {
  name: 'Jules',
  role: 'Global CTO & Chief Product Officer',
  company: 'Birthub 360',
  tone: 'Uncompromising Excellence',
};

const COLORS = {
  primary: '#0F172A', // Slate 900
  accent: '#3B82F6', // Blue 500
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  text: '#334155', // Slate 700
  lightText: '#64748B', // Slate 500
  bg: '#F8FAFC', // Slate 50
};

// --- Interfaces ---

interface AuditMetrics {
  totalFiles: number;
  rootFiles: number;
  magicNumbers: number;
  useClientAbuse: number;
  waterfalls: number;
  zodUsage: number;
  serverActions: number;
  highComplexityFiles: number;
}

interface InnovationMetrics {
  aiIntegration: boolean;
  voiceCapabilities: boolean;
  paymentInfrastructure: boolean;
  realTimeData: boolean; // e.g., WebSockets, Redis
  agents: boolean;
}

interface AuditResult {
  score: number;
  grade: string;
  metrics: AuditMetrics;
  innovation: InnovationMetrics;
  criticalIssues: string[];
  recommendations: string[];
  techDebt: {
    acceptable: string[];
    toxic: string[];
  };
  blueOcean: string[];
}

// --- Analysis Functions ---

function calculateCyclomaticComplexity(content: string): number {
  try {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      content,
      ts.ScriptTarget.Latest,
      true,
    );
    let complexity = 1;
    function visit(node: ts.Node) {
      if (
        ts.isIfStatement(node) ||
        ts.isForStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isCaseClause(node) ||
        ts.isConditionalExpression(node)
      ) {
        complexity++;
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return complexity;
  } catch (e) {
    return 1; // Fallback
  }
}

async function analyzeArchitecture(): Promise<{
  rootFiles: number;
  isMonorepoBroken: boolean;
}> {
  const rootFiles = fs.readdirSync(ROOT_DIR).filter((f) => {
    try {
      return fs.statSync(path.join(ROOT_DIR, f)).isFile();
    } catch {
      return false;
    }
  });
  const appsDir = fs.existsSync(path.join(ROOT_DIR, 'apps'));
  const libsDir = fs.existsSync(path.join(ROOT_DIR, 'libs'));

  // If package.json says workspaces but apps/libs are missing, it's broken.
  const packageJson =
    fs.readJsonSync(path.join(ROOT_DIR, 'package.json'), { throws: false }) ||
    {};
  const claimsWorkspaces = Boolean(packageJson.workspaces);

  return {
    rootFiles: rootFiles.length,
    isMonorepoBroken: claimsWorkspaces && (!appsDir || !libsDir),
  };
}

async function scanCodebase(): Promise<AuditResult> {
  // Ensure output directory exists
  fs.ensureDirSync(REPORT_DIR);

  const tsFiles = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '.next/**'],
    cwd: ROOT_DIR,
  });

  const metrics: AuditMetrics = {
    totalFiles: tsFiles.length,
    rootFiles: 0,
    magicNumbers: 0,
    useClientAbuse: 0,
    waterfalls: 0,
    zodUsage: 0,
    serverActions: 0,
    highComplexityFiles: 0,
  };

  const innovation: InnovationMetrics = {
    aiIntegration: false,
    voiceCapabilities: false,
    paymentInfrastructure: false,
    realTimeData: false,
    agents: false,
  };

  const toxicDebt: string[] = [];
  const acceptableDebt: string[] = [];
  const recommendations: string[] = [];
  const blueOcean: string[] = [];

  // Architecture Check
  const arch = await analyzeArchitecture();
  metrics.rootFiles = arch.rootFiles;

  if (arch.isMonorepoBroken) {
    toxicDebt.push(
      "CATASTROPHIC ARCHITECTURE: Monorepo structure defined in package.json but 'apps'/'libs' directories are missing. All code dumped in root.",
    );
    recommendations.push(
      "IMMEDIATE REFACTOR: Move root components to 'apps/web' and libraries to 'libs/'.",
    );
  } else if (metrics.rootFiles > 20) {
    toxicDebt.push(
      `Root Directory Pollution: ${metrics.rootFiles} files in root. Indicates lack of modularity.`,
    );
  }

  // File Analysis
  for (const file of tsFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');

    // 0. AST Complexity
    const complexity = calculateCyclomaticComplexity(content);
    if (complexity > 15) {
      metrics.highComplexityFiles++;
    }

    // 1. Magic Numbers (Tailwind arbitrary values)
    const magicNumberMatches = content.match(/-\[\d+px\]/g);
    if (magicNumberMatches) {
      metrics.magicNumbers += magicNumberMatches.length;
    }

    // 2. 'use client' abuse (Heuristic: checking layout/page/root files)
    if (content.includes('"use client"') || content.includes("'use client'")) {
      // Just track usage for now
    }

    // 3. Waterfalls (useEffect with fetch)
    if (
      content.match(/useEffect.*fetch/s) ||
      content.match(/useEffect.*axios/s)
    ) {
      metrics.waterfalls++;
    }

    // 4. Zod Usage
    if (content.includes('z.object') || content.includes('import { z }')) {
      metrics.zodUsage++;
    }

    // 5. Server Actions
    if (content.includes('"use server"') || content.includes("'use server'")) {
      metrics.serverActions++;
    }

    // --- Innovation Checks ---
    if (
      content.includes('openai') ||
      content.includes('langchain') ||
      content.includes('llm')
    )
      innovation.aiIntegration = true;
    if (
      content.includes('elevenlabs') ||
      content.includes('deepgram') ||
      content.includes('speech-to-text')
    )
      innovation.voiceCapabilities = true;
    if (content.includes('stripe')) innovation.paymentInfrastructure = true;
    if (
      content.includes('socket.io') ||
      content.includes('redis') ||
      content.includes('pusher')
    )
      innovation.realTimeData = true;
    if (content.includes('Agent') && content.includes('Tool'))
      innovation.agents = true;
  }

  // --- Scoring Logic ---
  let score = 50; // Base score
  if (arch.isMonorepoBroken) score -= 30;
  if (innovation.aiIntegration) score += 10;
  if (innovation.voiceCapabilities) score += 10;
  if (innovation.paymentInfrastructure) score += 5;
  if (innovation.agents) score += 15;

  if (metrics.magicNumbers > 10) score -= 5;
  if (metrics.magicNumbers > 100) score -= 10;
  if (metrics.highComplexityFiles > 5) score -= 5;

  if (metrics.waterfalls > 5) {
    toxicDebt.push(
      `Client-Side Waterfalls detected in ${metrics.waterfalls} components. Kill useEffect for data fetching.`,
    );
  }

  if (metrics.zodUsage < 5 && metrics.totalFiles > 20) {
    toxicDebt.push('Dangerous Input Validation: Zod usage is dangerously low.');
  }

  if (metrics.serverActions === 0 && metrics.totalFiles > 10) {
    recommendations.push(
      'Modernize Data Mutation: No Server Actions detected. Migrate API routes to Actions.',
    );
  }

  if (metrics.highComplexityFiles > 10) {
    toxicDebt.push(
      `Spaghetti Code Alert: ${metrics.highComplexityFiles} files exceed complexity threshold (15). Refactor immediately.`,
    );
  }

  // Blue Ocean Opportunities
  if (innovation.aiIntegration && !innovation.voiceCapabilities) {
    blueOcean.push(
      'Multimodal Convergence: Add Voice Agents to existing AI text stack for <1s response interactions.',
    );
  }
  if (!innovation.agents) {
    blueOcean.push(
      "Autonomous Agents: Move from 'Copilots' to 'Autopilots'. Let the AI do the work, not just assist.",
    );
  }
  if (innovation.paymentInfrastructure) {
    blueOcean.push(
      'Usage-Based Pricing: Implement dynamic pricing based on AI token usage.',
    );
  }

  // Grade
  let grade = 'C';
  if (score >= 90) grade = 'A+ (Unicorn)';
  else if (score >= 80) grade = 'A (Solid)';
  else if (score >= 70) grade = 'B (Good)';
  else if (score >= 50) grade = 'C (Average)';
  else grade = 'F (Legacy/Broken)';

  return {
    score,
    grade,
    metrics,
    innovation,
    criticalIssues: toxicDebt,
    recommendations,
    techDebt: {
      acceptable: acceptableDebt,
      toxic: toxicDebt,
    },
    blueOcean,
  };
}

// --- PDF Generation ---

function drawHeader(doc: PDFKit.PDFDocument, timestamp: string) {
  doc.rect(0, 0, 612, 120).fill(COLORS.primary);
  doc
    .fillColor('#FFFFFF')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('Birthub 360', 50, 40);
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Technical & Innovation Audit 2026', 50, 70);
  doc.fontSize(10).text(`Generated: ${timestamp}`, 50, 85);
  doc
    .fontSize(10)
    .text(`Auditor: ${PERSONA.name}`, 400, 40, { align: 'right' });
  doc.fontSize(10).text(PERSONA.role, 400, 55, { align: 'right' });

  let gitHash = 'UNKNOWN';
  try {
    gitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    // Git might not be initialized or available
  }
  doc.fontSize(8).text(`Hash: ${gitHash}`, 400, 70, { align: 'right' });
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number) {
  doc.rect(50, y, 512, 25).fill(COLORS.accent); // Background strip
  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(title.toUpperCase(), 60, y + 7);
  return y + 40;
}

function drawScore(doc: PDFKit.PDFDocument, result: AuditResult, y: number) {
  doc.fillColor(COLORS.text);
  doc.fontSize(10).text('INNOVATION INDEX', 50, y);

  // Draw Circle
  const circleX = 500;
  const circleY = y + 20;
  doc
    .circle(circleX, circleY, 30)
    .lineWidth(3)
    .stroke(result.score > 70 ? COLORS.success : COLORS.error);
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(result.score.toString(), circleX - 10, circleY - 8);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`Grade: ${result.grade}`, 50, y + 20);
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      'A score below 70 indicates vulnerability to disruption.',
      50,
      y + 40,
    );

  return y + 80;
}

function drawList(
  doc: PDFKit.PDFDocument,
  items: string[],
  y: number,
  color: string = COLORS.text,
) {
  doc.fontSize(10).font('Helvetica');
  items.forEach((item) => {
    doc.fillColor(color).text(`• ${item}`, 60, y, { width: 480 });
    y += doc.heightOfString(item, { width: 480 }) + 5;
  });
  return y + 10;
}

async function generateReport(result: AuditResult) {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  const filename = `RELATORIO_TECNICO_2026_v1_${timestamp}.pdf`;
  const filepath = path.join(REPORT_DIR, filename);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filepath);

  doc.pipe(stream);

  // Cover / Header
  drawHeader(doc, timestamp);
  let y = 140;

  // Executive Summary
  y = drawSectionTitle(doc, 'Executive Summary', y);
  y = drawScore(doc, result, y);

  const summary =
    result.criticalIssues.length > 0
      ? 'The platform is currently in a CRITICAL state. Structural integrity is compromised by significant technical debt. Immediate refactoring is required before scaling.'
      : 'The platform shows promise but requires modernization to reach 2026 standards.';

  doc.fillColor(COLORS.text).fontSize(10).text(summary, 50, y, { width: 500 });
  y += 40;

  // Tech Debt Radar
  y = drawSectionTitle(doc, 'Tech Debt Radar (Risk Matrix)', y);

  doc
    .fillColor(COLORS.error)
    .font('Helvetica-Bold')
    .text('TOXIC DEBT (Immediate Action Required):', 50, y);
  y += 20;
  if (result.techDebt.toxic.length === 0) {
    doc
      .fillColor(COLORS.success)
      .font('Helvetica')
      .text('None detected.', 60, y);
    y += 20;
  } else {
    y = drawList(doc, result.techDebt.toxic, y, COLORS.error);
  }

  y += 10;
  doc
    .fillColor(COLORS.warning)
    .font('Helvetica-Bold')
    .text('Blue Ocean Opportunities (Strategy):', 50, y);
  y += 20;
  y = drawList(doc, result.blueOcean, y, COLORS.primary);

  // Metrics Table
  y += 20;
  y = drawSectionTitle(doc, 'The Engine Room (Metrics)', y);

  const metricsData = [
    ['Metric', 'Value', 'Status'],
    ['Total Files', result.metrics.totalFiles.toString(), 'Info'],
    [
      'Magic Numbers',
      result.metrics.magicNumbers.toString(),
      result.metrics.magicNumbers > 10 ? 'Fail' : 'Pass',
    ],
    [
      'High Complexity Files',
      result.metrics.highComplexityFiles.toString(),
      result.metrics.highComplexityFiles > 5 ? 'Warning' : 'Good',
    ],
    [
      'Waterfalls',
      result.metrics.waterfalls.toString(),
      result.metrics.waterfalls > 0 ? 'Warning' : 'Pass',
    ],
    [
      'Server Actions',
      result.metrics.serverActions.toString(),
      result.metrics.serverActions > 0 ? 'Good' : 'Missing',
    ],
    [
      'Zod Validation',
      result.metrics.zodUsage.toString(),
      result.metrics.zodUsage > 0 ? 'Good' : 'Risk',
    ],
  ];

  let tableY = y;
  doc.font('Helvetica');
  metricsData.forEach((row, i) => {
    const isHeader = i === 0;
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
    doc.text(row[0], 60, tableY);
    doc.text(row[1], 250, tableY);
    doc.text(row[2], 400, tableY);
    tableY += 20;
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filepath));
    stream.on('error', reject);
  });
}

// --- Main Execution ---

async function main() {
  try {
    console.log('Starting Audit Protocol...');
    const result = await scanCodebase();
    console.log('Audit Complete. Generating Artifact...');
    const pdfPath = await generateReport(result);
    console.log(`Report Generated: ${pdfPath}`);

    // Commit logic
    try {
      console.log('Committing report...');
      execSync(`git add ${pdfPath}`);
      execSync(
        `git commit -m "chore(audit): relatório de conformidade e inovação 2026"`,
      );
      console.log('Report committed successfully.');
    } catch (e) {
      console.warn(
        'Git commit failed (likely mostly due to no changes or repo state), but report is saved.',
      );
    }
  } catch (error) {
    console.error('Audit Protocol Failed:', error);
    process.exit(1);
  }
}

main();
