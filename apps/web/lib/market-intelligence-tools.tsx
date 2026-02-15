import {
  Activity,
  Anchor,
  BarChart2,
  Calculator,
  Clock,
  Cpu,
  Database,
  DollarSign,
  FileCheck,
  Filter,
  Globe,
  Handshake,
  Layers,
  LayoutDashboard,
  ListPlus,
  LucideIcon,
  Map,
  MapPin,
  MessageSquare,
  Radar,
  RefreshCw,
  Rocket,
  Scan,
  ShieldCheck,
  Sparkles,
  Tags,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

export interface MarketTool {
  id: string;
  name: string;
  function: string;
  pain: string;
  description: string;
  icon: LucideIcon;
  status: 'ready' | 'beta' | 'planned';
}

export const marketIntelligenceTools: MarketTool[] = [
  {
    id: '1',
    name: 'ICP Data Unifier',
    function: 'Definir ICP',
    pain: 'Dados fragmentados',
    description:
      'Centraliza dados de múltiplas fontes para criar uma visão única do Perfil de Cliente Ideal.',
    icon: Database,
    status: 'ready',
  },
  {
    id: '2',
    name: 'Stakeholder Aligner',
    function: 'Definir ICP',
    pain: 'Conflito de visão',
    description:
      'Ferramenta de votação e consenso para alinhar expectativas entre Marketing e Vendas.',
    icon: Users,
    status: 'beta',
  },
  {
    id: '3',
    name: 'Market Oracle',
    function: 'Mapear TAM SAM SOM',
    pain: 'Falta de fontes confiáveis',
    description:
      'Agregador de dados de mercado em tempo real para estimativas precisas de tamanho de mercado.',
    icon: Globe,
    status: 'ready',
  },
  {
    id: '4',
    name: 'Actionable Metrics',
    function: 'Mapear TAM SAM SOM',
    pain: 'Dificuldade tradução números',
    description:
      'Converte dados brutos de mercado em planos de ação táticos para o time comercial.',
    icon: BarChart2,
    status: 'ready',
  },
  {
    id: '5',
    name: 'Competitor X-Ray',
    function: 'Analisar concorrência',
    pain: 'Informações incompletas',
    description:
      'Scanner profundo de presença digital e estratégias de concorrentes.',
    icon: Scan,
    status: 'ready',
  },
  {
    id: '6',
    name: 'Real-Time Tracker',
    function: 'Analisar concorrência',
    pain: 'Mudanças rápidas',
    description:
      'Alertas instantâneos sobre mudanças de preço, produto ou posicionamento da concorrência.',
    icon: Activity,
    status: 'beta',
  },
  {
    id: '7',
    name: 'Internal Event Radar',
    function: 'Identificar gatilhos',
    pain: 'Baixa visibilidade',
    description:
      'Monitora sinais de contratação, funding e expansão para identificar o momento certo.',
    icon: Radar,
    status: 'ready',
  },
  {
    id: '8',
    name: 'Timing Perfector',
    function: 'Identificar gatilhos',
    pain: 'Timing incorreto',
    description:
      'Algoritmo preditivo que sugere o melhor dia e hora para abordagem baseado em histórico.',
    icon: Clock,
    status: 'ready',
  },
  {
    id: '9',
    name: 'Objective Prioritizer',
    function: 'Criar segmentações Tier',
    pain: 'Resistência à priorização',
    description:
      'Matriz de pontuação objetiva para classificar contas em Tiers sem viés humano.',
    icon: Target,
    status: 'ready',
  },
  {
    id: '10',
    name: 'Data Classifier',
    function: 'Criar segmentações Tier',
    pain: 'Dados insuficientes',
    description:
      'Enriquecimento automático focado apenas em dados críticos para segmentação.',
    icon: Tags,
    status: 'ready',
  },
  {
    id: '11',
    name: 'Precision Enricher',
    function: 'Enriquecer bases',
    pain: 'Dados imprecisos',
    description:
      'Validação cruzada de e-mails e telefones em múltiplas bases de dados.',
    icon: Sparkles,
    status: 'ready',
  },
  {
    id: '12',
    name: 'Cost Optimizer',
    function: 'Enriquecer bases',
    pain: 'Alto custo',
    description:
      'Gerenciamento inteligente de créditos de enriquecimento para maximizar ROI.',
    icon: DollarSign,
    status: 'planned',
  },
  {
    id: '13',
    name: 'Tech Stack Revealer',
    function: 'Analisar stack',
    pain: 'Info técnica difícil',
    description:
      'Identifica tecnologias usadas no site e nas vagas de emprego dos prospects.',
    icon: Layers,
    status: 'ready',
  },
  {
    id: '14',
    name: 'Maturity Interpreter',
    function: 'Analisar stack',
    pain: 'Interpretação incorreta',
    description:
      'Traduz o stack tecnológico em um score de maturidade digital e propensão de compra.',
    icon: Cpu,
    status: 'beta',
  },
  {
    id: '15',
    name: 'Strategic Value Calc',
    function: 'Priorizar contas',
    pain: 'Pressão por volume',
    description:
      'Calculadora que demonstra o valor potencial de contas estratégicas vs. volume.',
    icon: Calculator,
    status: 'ready',
  },
  {
    id: '16',
    name: 'Sales Alignment Portal',
    function: 'Priorizar contas',
    pain: 'Falta de alinhamento',
    description:
      'Interface compartilhada onde Marketing e Vendas validam juntos as contas alvo.',
    icon: Handshake,
    status: 'ready',
  },
  {
    id: '17',
    name: 'Territory Conflict Solver',
    function: 'Apoiar territórios',
    pain: 'Conflitos internos',
    description:
      'Sistema de regras claras e logs de auditoria para distribuição de leads.',
    icon: Map,
    status: 'ready',
  },
  {
    id: '18',
    name: 'Dynamic Planner',
    function: 'Apoiar territórios',
    pain: 'Mudanças frequentes',
    description:
      'Simulador de cenários para rebalanceamento ágil de territórios.',
    icon: MapPin,
    status: 'planned',
  },
  {
    id: '19',
    name: 'Smart List Builder',
    function: 'Gerar listas',
    pain: 'Falta de critérios',
    description:
      'Construtor visual de queries com templates de melhores práticas de segmentação.',
    icon: ListPlus,
    status: 'ready',
  },
  {
    id: '20',
    name: 'Auto-Refresh Engine',
    function: 'Gerar listas',
    pain: 'Atualização constante',
    description:
      'Mantém listas vivas, adicionando e removendo leads conforme mudam de perfil.',
    icon: RefreshCw,
    status: 'beta',
  },
  {
    id: '21',
    name: 'Signal-to-Noise Filter',
    function: 'Monitorar tendências',
    pain: 'Excesso de informação',
    description:
      'IA que filtra notícias irrelevantes e destaca apenas o que impacta seu mercado.',
    icon: Filter,
    status: 'ready',
  },
  {
    id: '22',
    name: 'Impact Predictor',
    function: 'Monitorar tendências',
    pain: 'Dificuldade prever impacto',
    description:
      'Analisa tendências históricas para projetar cenários futuros.',
    icon: TrendingUp,
    status: 'planned',
  },
  {
    id: '23',
    name: 'CRM Standardizer',
    function: 'Alimentar CRM',
    pain: 'Falta de padronização',
    description:
      'Validação de entrada de dados que impede a criação de registros incompletos.',
    icon: ShieldCheck,
    status: 'ready',
  },
  {
    id: '24',
    name: 'Adoption Gamifier',
    function: 'Alimentar CRM',
    pain: 'Baixa adesão',
    description:
      'Sistema de pontuação e recompensas para engajar o time no uso do CRM.',
    icon: Trophy,
    status: 'beta',
  },
  {
    id: '25',
    name: 'Resonance Analyzer',
    function: 'Apoiar outbound',
    pain: 'Desalinhamento mensagem',
    description:
      'Testes A/B automáticos de copy e abordagem para identificar o que converte.',
    icon: MessageSquare,
    status: 'ready',
  },
  {
    id: '26',
    name: 'Outbound ROI Booster',
    function: 'Apoiar outbound',
    pain: 'Retorno abaixo do esperado',
    description:
      'Diagnóstico de funil que identifica gargalos na conversão outbound.',
    icon: Rocket,
    status: 'ready',
  },
  {
    id: '27',
    name: 'Instant Insight Reporter',
    function: 'Criar relatórios',
    pain: 'Demanda urgente',
    description:
      'Dashboards pré-configurados que respondem às perguntas mais comuns da diretoria.',
    icon: Zap,
    status: 'ready',
  },
  {
    id: '28',
    name: 'Stakeholder Dashboard',
    function: 'Criar relatórios',
    pain: 'Interpretação errada',
    description:
      'Visualizações simplificadas focadas em métricas de negócio, não métricas de vaidade.',
    icon: LayoutDashboard,
    status: 'ready',
  },
  {
    id: '29',
    name: 'Data Confidence Auditor',
    function: 'Sustentar decisões',
    pain: 'Questionamento constante',
    description:
      'Score de confiabilidade visível em cada análise para dar segurança aos decisores.',
    icon: FileCheck,
    status: 'beta',
  },
  {
    id: '30',
    name: 'Priority Pivot Manager',
    function: 'Sustentar decisões',
    pain: 'Mudança de prioridades',
    description:
      'Histórico de decisões e roadmaps para gerenciar mudanças de direção com dados.',
    icon: Anchor,
    status: 'planned',
  },
];
