import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Cores para o terminal
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const log = (msg, color = colors.cyan) => console.log(`${color}==> ${msg}${colors.reset}`);
const run = (cmd, fatal = true) => {
  log(`Executando: ${cmd}`, colors.yellow);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    if (fatal) {
      log(`Erro ao executar comando.`, colors.red);
      process.exit(1);
    } else {
      throw e;
    }
  }
};

const args = process.argv.slice(2);
const action = args[0];

// --- AÇÕES ---

const setup = () => {
  log("Iniciando Setup Universal...");

  // 1. Setup Backend/Frontend (Node)
  log("Instalando dependências Node.js...");
  run("npm install");

  // 2. Setup Env Vars
  const envFiles = [
    { example: 'apps/web/.env.example', target: 'apps/web/.env' },
    { example: 'apps/web/.env.example', target: 'apps/web/.env.local' }
  ];

  envFiles.forEach(({ example, target }) => {
    if (!fs.existsSync(target) && fs.existsSync(example)) {
      fs.copyFileSync(example, target);
      log(`Criado arquivo ${target}`, colors.green);
    }
  });

  // 3. Prisma Generate
  log("Gerando cliente Prisma...");
  run("npx turbo run db:generate"); // Assumindo que você tem esse script ou similar

  // 4. Setup Python (AI Agents)
  if (fs.existsSync('apps/ai-agents/requirements.txt')) {
    log("Configurando ambiente Python...");
    // Tenta usar python3 ou python
    try {
        run("pip install -r apps/ai-agents/requirements.txt", false);
    } catch {
        log("Aviso: Falha ao instalar deps Python. Verifique se o pip está no PATH.", colors.yellow);
    }
  }

  log("✅ Setup concluído com sucesso!", colors.green);
};

const build = () => {
  log("Iniciando Build de Produção...");
  run("npx turbo run build");
  log("✅ Build concluído!", colors.green);
};

const dockerDev = () => {
  log("Subindo ambiente Docker (Dev)...");
  run("docker-compose -f docker-compose.dev.yml up -d --build");
  log("✅ Ambiente rodando em background.", colors.green);
};

// --- ROTEADOR ---

switch (action) {
  case 'setup': setup(); break;
  case 'build': build(); break;
  case 'dev': dockerDev(); break;
  default:
    console.log(`
    ${colors.yellow}Uso: node scripts/manager.mjs [acao]${colors.reset}

    Ações disponíveis:
      setup   - Instala dependências, cria .env e gera Prisma client
      build   - Roda o build de produção via Turbo
      dev     - Sobe o Docker Compose de desenvolvimento
    `);
}
