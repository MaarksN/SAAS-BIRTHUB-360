import {
  AlertCircle,
  Bomb,
  Book,
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  CloudUpload,
  Copy,
  DollarSign,
  FileCheck,
  Flame,
  Gavel,
  Headphones,
  HelpCircle,
  Layers,
  LifeBuoy,
  Lightbulb,
  Lock,
  MailOpen,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Mic,
  MousePointer,
  Music,
  Palette,
  PhoneIncoming,
  PlusCircle,
  Radar,
  Radio,
  Repeat,
  ScanFace,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Skull,
  Smile,
  Snowflake,
  StarHalf,
  Stethoscope,
  Swords,
  Trash2,
  TriangleAlert,
  Users,
  Video,
  Voicemail,
  X,
} from 'lucide-react';

export interface ToolField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[]; // For select
  defaultValue?: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: any; // Lucide icon component
  color: string;
  emoji: string;
  desc: string;
  fields: ToolField[];
  prompt: (data: any) => string;
  systemPrompt?: string;
  isImage?: boolean;
  useSearch?: boolean;
}

const COMMON_FIELDS: ToolField[] = [
  {
    id: 'tone',
    label: 'Tom de Voz',
    type: 'select',
    options: [
      'Profissional',
      'Casual',
      'Persuasivo',
      'Urgente',
      'Empático',
      'Autoritário',
      'Humorístico',
    ],
    defaultValue: 'Profissional',
  },
  {
    id: 'language',
    label: 'Idioma de Saída',
    type: 'select',
    options: [
      'Português (Brasil)',
      'Inglês (US)',
      'Espanhol',
      'Francês',
      'Alemão',
    ],
    defaultValue: 'Português (Brasil)',
  },
  {
    id: 'context',
    label: 'Contexto Adicional (Opcional)',
    type: 'textarea',
    placeholder:
      'Ex: Minha empresa vende software de RH para grandes empresas...',
  },
];

export const SDR_TOOLS: Tool[] = [
  {
    id: 'cadence',
    name: 'Cadência Total',
    icon: Layers,
    color: 'indigo',
    emoji: '📅',
    desc: 'Kit de prospecção completo',
    fields: [
      {
        id: 'f_product',
        label: 'O que você vende?',
        type: 'text',
        placeholder: 'Ex: Software de RH SaaS',
      },
      {
        id: 'f_persona',
        label: 'Quem é a Persona?',
        type: 'text',
        placeholder: 'Ex: Diretor de RH',
      },
      {
        id: 'f_pain',
        label: 'Dor Principal',
        type: 'text',
        placeholder: 'Ex: Demora na contratação',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Atue como um SDR Elite. Crie uma cadência de prospecção outbound de 3 passos (Email, LinkedIn, Roteiro de Call) para vender ${d.f_product} para ${d.f_persona} focando na dor: ${d.f_pain}. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'coldcall',
    name: 'Cold Call Sim',
    icon: PhoneIncoming,
    color: 'rose',
    emoji: '📞',
    desc: 'Simulador de objeções',
    fields: [
      {
        id: 'f_pitch',
        label: 'Seu Pitch Inicial',
        type: 'textarea',
        placeholder: 'Cole aqui seu pitch de abertura...',
      },
      {
        id: 'f_obj',
        label: 'Objeção (Opcional)',
        type: 'text',
        placeholder: 'Ex: Já tenho fornecedor',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Aja como um prospect ocupado e cético recebendo uma cold call. Reaja ao meu pitch: "${d.f_pitch}". ${d.f_obj ? `Use especificamente a objeção: ${d.f_obj}` : ''} \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'jobspy',
    name: 'Espião de Vagas',
    icon: Briefcase,
    color: 'gray',
    emoji: '🕵️',
    desc: 'Dores via Job Description',
    fields: [
      {
        id: 'f_job',
        label: 'Descrição da Vaga',
        type: 'textarea',
        placeholder: 'Cole a descrição da vaga aqui...',
      },
      {
        id: 'f_role',
        label: 'Cargo do Gestor',
        type: 'text',
        placeholder: 'Ex: CTO',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Analise esta vaga: "${d.f_job}". Identifique a Tech Stack e 3 dores ocultas que o gestor (${d.f_role}) está tentando resolver contratando. Escreva um cold email para o gestor citando essas dores. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'newsjack',
    name: 'News Jacking',
    icon: Radio,
    color: 'orange',
    emoji: '📰',
    desc: 'Abordagem via notícias',
    useSearch: true,
    fields: [
      {
        id: 'f_topic',
        label: 'Empresa ou Setor',
        type: 'text',
        placeholder: 'Ex: Setor Bancário Brasil',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Pesquise notícias urgentes e recentes sobre: ${d.f_topic}. Selecione a mais relevante e escreva um cold email curto conectando essa notícia à necessidade de uma solução de eficiência. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'emailroast',
    name: 'Email Roast',
    icon: Flame,
    color: 'orange',
    emoji: '🔥',
    desc: 'Crítica ácida do email',
    fields: [
      {
        id: 'f_email',
        label: 'Seu E-mail',
        type: 'textarea',
        placeholder: 'Cole o rascunho aqui...',
      },
      {
        id: 'f_target',
        label: 'Público Alvo',
        type: 'text',
        placeholder: 'Ex: CFOs',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Atue como um comprador ${d.f_target} impaciente. Analise este email: "${d.f_email}". Dê nota 0-10. Critique duramente jargões e tamanho. Reescreva a versão "High Conversion". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'disc',
    name: 'DISC Decoder',
    icon: Brain,
    color: 'fuchsia',
    emoji: '🧠',
    desc: 'Perfil do Lead',
    fields: [
      {
        id: 'f_text',
        label: 'Texto do Lead',
        type: 'textarea',
        placeholder: 'Cole algo que o lead escreveu...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Analise o perfil DISC deste texto: "${d.f_text}". Identifique se é D, I, S ou C. Dê 3 dicas de como vender para esse perfil. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'painmag',
    name: 'Pain Magnifier',
    icon: Maximize2,
    color: 'red',
    emoji: '🔍',
    desc: 'Aumente a dor',
    fields: [
      {
        id: 'f_pain',
        label: 'Problema Superficial',
        type: 'text',
        placeholder: 'Ex: Processo manual no Excel',
      },
      {
        id: 'f_role',
        label: 'Cargo do Lead',
        type: 'text',
        placeholder: 'Ex: Gerente Financeiro',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `O ${d.f_role} disse: "${d.f_pain}". Expanda isso usando "Pain Magnification". Liste: 1. Custo Financeiro. 2. Risco Estratégico. 3. Impacto Pessoal. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'linkedincomment',
    name: 'Comentário LinkedIn',
    icon: MessageSquare,
    color: 'blue',
    emoji: '💬',
    desc: 'Engajamento estratégico',
    fields: [
      {
        id: 'f_post',
        label: 'Post do Lead',
        type: 'textarea',
        placeholder: 'Cole o post aqui...',
      },
      {
        id: 'f_goal',
        label: 'Seu Objetivo',
        type: 'text',
        placeholder: 'Ex: Mostrar autoridade',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Gere 3 comentários inteligentes para este post: "${d.f_post}". Objetivo: ${d.f_goal}. Evite clichês. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'simplifier',
    name: 'Simplificador Tech',
    icon: Lightbulb,
    color: 'yellow',
    emoji: '💡',
    desc: 'Analogias poderosas',
    fields: [
      {
        id: 'f_concept',
        label: 'Conceito Técnico',
        type: 'text',
        placeholder: 'Ex: API RESTful',
      },
      {
        id: 'f_audience',
        label: 'Público Leigo',
        type: 'text',
        placeholder: 'Ex: CEO de Varejo',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Explique "${d.f_concept}" para um ${d.f_audience}. Use 3 analogias do mundo real para tornar o benefício óbvio. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'referral',
    name: 'Referral Engine',
    icon: Users,
    color: 'indigo',
    emoji: '🤝',
    desc: 'Pedir indicações',
    fields: [
      {
        id: 'f_success',
        label: 'Sucesso Recente',
        type: 'text',
        placeholder: 'Ex: Economizamos 20% no budget',
      },
      {
        id: 'f_target',
        label: 'Quem você quer?',
        type: 'text',
        placeholder: 'Ex: O Diretor de Marketing',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Acabei de entregar este sucesso: "${d.f_success}". Escreva um email curto pedindo uma introdução para ${d.f_target} na mesma empresa, sem parecer desesperado. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'podcast',
    name: 'Podcast Miner',
    icon: Headphones,
    color: 'rose',
    emoji: '🎧',
    desc: 'Ganchos de Áudio',
    fields: [
      {
        id: 'f_trans',
        label: 'Transcrição',
        type: 'textarea',
        placeholder: 'Cole trecho da transcrição...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Extraia 3 ganchos de venda desta transcrição: "${d.f_trans}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'planner',
    name: 'SDR Daily Planner',
    icon: Calendar,
    color: 'teal',
    emoji: '🗓️',
    desc: 'Planejador Diário',
    fields: [
      {
        id: 'f_tasks',
        label: 'Lista de Tarefas',
        type: 'textarea',
        placeholder: 'O que precisa fazer hoje?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Organize estas tarefas em uma agenda de alta performance (Time Blocking): "${d.f_tasks}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'videoscript',
    name: 'Roteiro de Vídeo',
    icon: Video,
    color: 'pink',
    emoji: '🎥',
    desc: 'Scripts para Loom',
    fields: [
      {
        id: 'f_prospect',
        label: 'Cliente/Empresa',
        type: 'text',
        placeholder: 'Ex: Nubank',
      },
      {
        id: 'f_value',
        label: 'Proposta de Valor',
        type: 'text',
        placeholder: 'Ex: Reduzir churn',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Crie um roteiro de 45s para vídeo Loom focado em ${d.f_prospect}. Oferta: ${d.f_value}. Estrutura: Gancho Visual -> Problema -> Solução. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'pricedojo',
    name: 'Dojo de Negociação',
    icon: DollarSign,
    color: 'green',
    emoji: '🥋',
    desc: 'Simulador de Preço',
    fields: [
      {
        id: 'f_offer',
        label: 'Sua Proposta',
        type: 'text',
        placeholder: 'Ex: R$ 50k anuais',
      },
      {
        id: 'f_scenario',
        label: 'Cenário',
        type: 'text',
        placeholder: 'Ex: Cliente diz que não tem budget',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Eu sou o vendedor. Minha oferta é ${d.f_offer}. Cenário: ${d.f_scenario}. Atue como um comprador durão de Procurement. Responda pressionando por desconto agressivo. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'crmcleaner',
    name: 'Limpador de CRM',
    icon: FileCheck,
    color: 'slate',
    emoji: '🧹',
    desc: 'Notas -> CRM',
    fields: [
      {
        id: 'f_notes',
        label: 'Notas Brutas',
        type: 'textarea',
        placeholder: 'Cole suas anotações...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Formate estas anotações para CRM (Resumo, Dores, BANT, Próximos Passos): "${d.f_notes}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'reviewminer',
    name: 'Review Miner',
    icon: StarHalf,
    color: 'orange',
    emoji: '⭐',
    desc: 'Explorar reviews ruins',
    fields: [
      {
        id: 'f_review',
        label: 'Review do Concorrente',
        type: 'textarea',
        placeholder: 'Cole a reclamação...',
      },
      {
        id: 'f_competitor',
        label: 'Concorrente',
        type: 'text',
        placeholder: 'Ex: Salesforce',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Analise esta review negativa do ${d.f_competitor}: "${d.f_review}". Crie 3 Hooks de Cold Email explorando essa fraqueza sem citar o concorrente. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'storyteller',
    name: 'Story Architect',
    icon: BookOpen,
    color: 'pink',
    emoji: '📖',
    desc: 'Storytelling',
    fields: [
      {
        id: 'f_data',
        label: 'Dado/Fato',
        type: 'text',
        placeholder: 'Ex: Aumentamos vendas em 30%',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Transforme "${d.f_data}" em uma micro-história de vendas usando a Jornada do Herói simplificada. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'meddic',
    name: 'MEDDIC Checker',
    icon: ClipboardCheck,
    color: 'blue',
    emoji: '🏢',
    desc: 'Validação Enterprise',
    fields: [
      {
        id: 'f_notes',
        label: 'Notas da Oportunidade',
        type: 'textarea',
        placeholder: 'Resumo das conversas...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Analise estas notas: "${d.f_notes}". Avalie segundo o framework MEDDIC. Liste o que temos e os GAPS fatais. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'voicemail',
    name: 'Voicemail Drop',
    icon: Voicemail,
    color: 'fuchsia',
    emoji: '📼',
    desc: 'Scripts de caixa postal',
    fields: [
      {
        id: 'f_name',
        label: 'Nome do Lead',
        type: 'text',
        placeholder: 'Ex: João',
      },
      {
        id: 'f_reason',
        label: 'Motivo',
        type: 'text',
        placeholder: 'Ex: Ideia nova',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Crie 3 scripts de Voicemail de 20s para ${d.f_name}. Motivo: ${d.f_reason}. 1. Curiosidade. 2. Referência Social. 3. Valor Direto. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'ctabuilder',
    name: 'CTA Builder',
    icon: MousePointer,
    color: 'lime',
    emoji: '🎯',
    desc: 'CTAs sem atrito',
    fields: [
      {
        id: 'f_context',
        label: 'Contexto do Email',
        type: 'text',
        placeholder: 'Ex: Oferecendo demo',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Para este contexto: "${d.f_context}", gere 5 CTAs de "Baixa Fricção" (Interest-Based). Foco em "Faz sentido?", "É prioridade?". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'lingo',
    name: 'Industry Lingo',
    icon: Book,
    color: 'cyan',
    emoji: '🏭',
    desc: 'Glossário Insider',
    fields: [
      {
        id: 'f_industry',
        label: 'Setor/Indústria',
        type: 'text',
        placeholder: 'Ex: Logística Farmacêutica',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Gere um glossário insider para ${d.f_industry}. 5 termos técnicos, 3 tendências atuais e 1 "unpopular opinion". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'meetingautopsy',
    name: 'Autópsia de Call',
    icon: Skull,
    color: 'slate',
    emoji: '💀',
    desc: 'Por que perdeu?',
    fields: [
      {
        id: 'f_summary',
        label: 'Resumo da Call',
        type: 'textarea',
        placeholder: 'O que aconteceu...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Atue como VP de Vendas. Analise: "${d.f_summary}". Identifique onde perdi a confiança. Liste 3 erros e a correção. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'competitorfud',
    name: 'Competitor FUD',
    icon: Bomb,
    color: 'red',
    emoji: '💣',
    desc: 'Dúvida no Concorrente',
    fields: [
      {
        id: 'f_comp',
        label: 'Concorrente',
        type: 'text',
        placeholder: 'Ex: SAP',
      },
      {
        id: 'f_weakness',
        label: 'Fraqueza',
        type: 'text',
        placeholder: 'Ex: Implementação lenta',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Lead considerando ${d.f_comp}. Fraqueza: ${d.f_weakness}. Gere 3 perguntas "Inception" para plantar dúvida sem falar mal. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'rapportremix',
    name: 'Rapport Metaphor',
    icon: Music,
    color: 'violet',
    emoji: '🎸',
    desc: 'Metáforas de Hobby',
    fields: [
      {
        id: 'f_hobby',
        label: 'Hobby do Lead',
        type: 'text',
        placeholder: 'Ex: Ciclismo',
      },
      {
        id: 'f_solution',
        label: 'Sua Solução',
        type: 'text',
        placeholder: 'Ex: Cibersegurança',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Lead ama ${d.f_hobby}. Vendo ${d.f_solution}. Crie uma metáfora de negócios conectando o hobby à solução. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'challenger',
    name: 'Challenger Insight',
    icon: TriangleAlert,
    color: 'orange',
    emoji: '⛰️',
    desc: 'Desafie o status quo',
    fields: [
      {
        id: 'f_statusquo',
        label: 'Crença Atual',
        type: 'text',
        placeholder: 'Ex: Planilhas funcionam bem',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Atue como vendedor Challenger. O cliente crê que "${d.f_statusquo}" é seguro. Crie um Insight Comercial que mostre o custo oculto/risco disso. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'roicalc',
    name: 'Calculadora ROI',
    icon: Calculator,
    color: 'emerald',
    emoji: '💰',
    desc: 'Custo da Inação',
    fields: [
      {
        id: 'f_problem',
        label: 'Cenário do Problema',
        type: 'text',
        placeholder: 'Ex: 10 pessoas gastam 1h/dia nisso',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Cenário: "${d.f_problem}". Estime o custo anual (Custo da Inação) com base em salários Brasil. Crie um parágrafo matemático para um CFO. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'chameleon',
    name: 'Camaleão de Texto',
    icon: Palette,
    color: 'fuchsia',
    emoji: '🦎',
    desc: 'Imite o estilo',
    fields: [
      {
        id: 'f_sample',
        label: 'Texto do Lead',
        type: 'textarea',
        placeholder: 'Cole um email dele...',
      },
      {
        id: 'f_msg',
        label: 'Sua Mensagem',
        type: 'text',
        placeholder: 'Ex: Quero marcar uma demo',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Analise o estilo deste texto: "${d.f_sample}". Reescreva minha mensagem "${d.f_msg}" imitando exatamente esse estilo. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'preflight',
    name: 'Briefing Pré-Call',
    icon: ClipboardList,
    color: 'purple',
    emoji: '📝',
    desc: 'Prep em 3 min',
    fields: [
      {
        id: 'f_company',
        label: 'Empresa Alvo',
        type: 'text',
        placeholder: 'Nome da Empresa',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Pesquise sobre ${d.f_company}. Crie um briefing: 1. Resumo. 2. Perguntas SPIN. 3. Fato recente. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
    useSearch: true,
  },
  {
    id: 'social',
    name: 'Social Authority',
    icon: Share2,
    color: 'blue',
    emoji: '📱',
    desc: 'Posts virais',
    fields: [
      {
        id: 'f_topic',
        label: 'Tópico',
        type: 'text',
        placeholder: 'Assunto do Post',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Crie um post LinkedIn sobre ${d.f_topic} usando framework Hook-Story-Value. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'closer',
    name: 'Fechamento Shark',
    icon: Gavel,
    color: 'red',
    emoji: '🦈',
    desc: 'Fechar negócio',
    fields: [
      {
        id: 'f_sit',
        label: 'Situação',
        type: 'text',
        placeholder: 'Por que travou?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Negociação travada: ${d.f_sit}. Crie email de fechamento usando gatilhos de urgência. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'whatsapp',
    name: 'Zap Audio Script',
    icon: Mic,
    color: 'green',
    emoji: '🟢',
    desc: 'Roteiro WhatsApp',
    fields: [
      {
        id: 'f_lead',
        label: 'Lead/Contexto',
        type: 'text',
        placeholder: 'Para quem é?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Roteiro de áudio WhatsApp 45s para ${d.f_lead}. Tom casual e urgente. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'objection',
    name: 'Mata-Objeção',
    icon: ShieldAlert,
    color: 'red',
    emoji: '🛡️',
    desc: 'Contorno de Objeção',
    fields: [
      {
        id: 'f_obj',
        label: 'Objeção',
        type: 'text',
        placeholder: 'O que ele disse?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Contorne a objeção: "${d.f_obj}". Seja breve e empático. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'subject',
    name: 'Assuntos Virais',
    icon: MailOpen,
    color: 'yellow',
    emoji: '📧',
    desc: 'Subject Lines',
    fields: [
      {
        id: 'f_topic',
        label: 'Tema do Email',
        type: 'text',
        placeholder: 'Sobre o que é?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `10 Assuntos de email viral para: ${d.f_topic}. Curto, sem clickbait óbvio. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'signals',
    name: 'Detector de Sinais',
    icon: Radar,
    color: 'fuchsia',
    emoji: '📡',
    desc: 'Subtexto do Lead',
    fields: [
      {
        id: 'f_resp',
        label: 'Resposta do Lead',
        type: 'text',
        placeholder: 'O que ele respondeu?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Analise: "${d.f_resp}". O que ele realmente quis dizer? Qual a temperatura? \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'remix',
    name: 'Remix Conteúdo',
    icon: Repeat,
    color: 'lime',
    emoji: '🔄',
    desc: 'Textão -> Pitch',
    fields: [
      {
        id: 'f_content',
        label: 'Conteúdo Original',
        type: 'textarea',
        placeholder: 'Cole o texto longo...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Transforme este conteúdo em um Hook curto: "${d.f_content}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'meme',
    name: 'Meme Tático',
    icon: Smile,
    color: 'pink',
    emoji: '🎭',
    desc: 'Imagem Quebra-Gelo',
    fields: [
      {
        id: 'f_sit',
        label: 'Situação',
        type: 'text',
        placeholder: 'Ex: Cliente sumiu',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) => `Crie imagem cartoon/meme Pixar 3D sobre: ${d.f_sit}.`,
    isImage: true,
  },
  {
    id: 'icebreaker',
    name: 'Icebreaker Pro',
    icon: Snowflake,
    color: 'cyan',
    emoji: '❄️',
    desc: 'Conexão LinkedIn',
    fields: [
      {
        id: 'f_bio',
        label: 'Bio do Lead',
        type: 'textarea',
        placeholder: 'Cole a bio dele...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `3 mensagens de conexão LinkedIn baseadas em: "${d.f_bio}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'followup',
    name: 'Resgate Lead',
    icon: LifeBuoy,
    color: 'orange',
    emoji: '🛟',
    desc: 'Ghosting',
    fields: [
      {
        id: 'f_hist',
        label: 'Histórico',
        type: 'text',
        placeholder: 'O que aconteceu antes?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Email de break-up para lead que sumiu: ${d.f_hist}. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'qualify',
    name: 'Validador BANT',
    icon: CheckCircle,
    color: 'emerald',
    emoji: '✅',
    desc: 'Qualificação',
    fields: [
      {
        id: 'f_notes',
        label: 'Notas',
        type: 'textarea',
        placeholder: 'Resumo da conversa...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Classifique no BANT estas notas: "${d.f_notes}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'gatekeeper',
    name: 'Gatekeeper Key',
    icon: Lock,
    color: 'slate',
    emoji: '🗝️',
    desc: 'Passar Recepção',
    fields: [
      {
        id: 'f_role',
        label: 'Quem atendeu?',
        type: 'text',
        placeholder: 'Secretária, Estagiário...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Script para passar por ${d.f_role} e chegar no diretor. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'persona',
    name: 'Avatar ICP',
    icon: ScanFace,
    color: 'violet',
    emoji: '👤',
    desc: 'Visualizar Cliente',
    fields: [
      {
        id: 'f_desc',
        label: 'Descrição',
        type: 'text',
        placeholder: 'Cargo e Indústria',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) => `Retrato fotorealista estúdio de: ${d.f_desc}.`,
    isImage: true,
  },
  {
    id: 'search',
    name: 'Market Intel',
    icon: Search,
    color: 'blue',
    emoji: '🔎',
    desc: 'Dados Reais',
    fields: [
      {
        id: 'f_query',
        label: 'O que buscar?',
        type: 'text',
        placeholder: 'Empresa ou Mercado',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Pesquise dados estratégicos sobre: ${d.f_query}. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
    useSearch: true,
  },
  {
    id: 'custom',
    name: 'Ferramenta Livre',
    icon: PlusCircle,
    color: 'pink',
    emoji: '✨',
    desc: 'Sua IA Personalizada',
    fields: [
      {
        id: 'f_req',
        label: 'O que você quer?',
        type: 'textarea',
        placeholder: 'Descreva sua necessidade...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `${d.f_req} \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'pitchdoctor',
    name: 'Pitch Doctor',
    icon: Stethoscope,
    color: 'teal',
    emoji: '🩺',
    desc: 'Curar Pitch',
    fields: [
      {
        id: 'f_pitch',
        label: 'Seu Pitch',
        type: 'textarea',
        placeholder: 'Cole seu pitch atual...',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Critique e melhore este pitch: "${d.f_pitch}". \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'spin',
    name: 'SPIN Generator',
    icon: HelpCircle,
    color: 'violet',
    emoji: '🌀',
    desc: 'Perguntas SPIN',
    fields: [
      {
        id: 'f_prod',
        label: 'Produto',
        type: 'text',
        placeholder: 'O que você vende?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Perguntas SPIN para vender ${d.f_prod}. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
  {
    id: 'battlecard',
    name: 'Battlecard',
    icon: Swords,
    color: 'amber',
    emoji: '⚔️',
    desc: 'Matar Concorrente',
    fields: [
      {
        id: 'f_comp',
        label: 'Concorrente',
        type: 'text',
        placeholder: 'Quem é o rival?',
      },
      ...COMMON_FIELDS,
    ],
    prompt: (d) =>
      `Battlecard contra ${d.f_comp}. Pontos fracos e armadilhas. \n\nContexto: ${d.context || 'Nenhum'}. \nTom: ${d.tone}. \nIdioma: ${d.language}.`,
  },
];
