import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Zap, Moon, Sun, Rocket, ArrowLeft, ArrowRight,
  Layers, PhoneIncoming, Briefcase, Radio, Flame,
  Brain, Maximize2, MessageSquare, Lightbulb, Users,
  Headphones, Calendar, Video, DollarSign, FileCheck,
  StarHalf, BookOpen, ClipboardCheck, Voicemail,
  MousePointer, Book, Skull, Bomb, Music, TriangleAlert,
  Calculator, Palette, CloudUpload, Copy, CheckCircle,
  Send, Mic, MessageCircle, X, Search, Smile, Share2,
  Gavel, ShieldAlert, MailOpen, Radar, Repeat, Snowflake,
  LifeBuoy, Lock, ScanFace, PlusCircle, ClipboardList, Stethoscope, HelpCircle, Swords,
  Trash2, AlertCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE & API ---
const firebaseConfig = JSON.parse(__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sdr-command-center';
const apiKey = ""; // Chave injetada pelo ambiente

const endpoints = {
  text: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
  image: `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
  tts: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`
};

// --- DATA: FERRAMENTAS ---
const TOOLS = [
    {
        id: 'cadence', name: 'Cadência Total', icon: Layers, color: 'indigo', emoji: '📅', desc: 'Kit de prospecção completo',
        fields: [{ id: 'f_product', label: 'O que você vende?', type: 'text', placeholder: 'Ex: Software de RH SaaS' }, { id: 'f_persona', label: 'Quem é a Persona?', type: 'text', placeholder: 'Ex: Diretor de RH' }, { id: 'f_pain', label: 'Dor Principal', type: 'text', placeholder: 'Ex: Demora na contratação' }],
        prompt: (d) => `Atue como um SDR Elite. Crie uma cadência de prospecção outbound de 3 passos (Email, LinkedIn, Roteiro de Call) para vender ${d.f_product} para ${d.f_persona} focando na dor: ${d.f_pain}.`
    },
    {
        id: 'coldcall', name: 'Cold Call Sim', icon: PhoneIncoming, color: 'rose', emoji: '📞', desc: 'Simulador de objeções',
        fields: [{ id: 'f_pitch', label: 'Seu Pitch Inicial', type: 'textarea', placeholder: 'Cole aqui seu pitch de abertura...' }, { id: 'f_obj', label: 'Objeção (Opcional)', type: 'text', placeholder: 'Ex: Já tenho fornecedor' }],
        prompt: (d) => `Aja como um prospect ocupado e cético recebendo uma cold call. Reaja ao meu pitch: "${d.f_pitch}". ${d.f_obj ? `Use especificamente a objeção: ${d.f_obj}` : ''}`
    },
    {
        id: 'jobspy', name: 'Espião de Vagas', icon: Briefcase, color: 'gray', emoji: '🕵️', desc: 'Dores via Job Description',
        fields: [{ id: 'f_job', label: 'Descrição da Vaga', type: 'textarea', placeholder: 'Cole a descrição da vaga aqui...' }, { id: 'f_role', label: 'Cargo do Gestor', type: 'text', placeholder: 'Ex: CTO' }],
        prompt: (d) => `Analise esta vaga: "${d.f_job}". Identifique a Tech Stack e 3 dores ocultas que o gestor (${d.f_role}) está tentando resolver contratando. Escreva um cold email para o gestor citando essas dores.`
    },
    {
        id: 'newsjack', name: 'News Jacking', icon: Radio, color: 'orange', emoji: '📰', desc: 'Abordagem via notícias', useSearch: true,
        fields: [{ id: 'f_topic', label: 'Empresa ou Setor', type: 'text', placeholder: 'Ex: Setor Bancário Brasil' }],
        prompt: (d) => `Pesquise notícias urgentes e recentes sobre: ${d.f_topic}. Selecione a mais relevante e escreva um cold email curto conectando essa notícia à necessidade de uma solução de eficiência.`
    },
    {
        id: 'emailroast', name: 'Email Roast', icon: Flame, color: 'orange', emoji: '🔥', desc: 'Crítica ácida do email',
        fields: [{ id: 'f_email', label: 'Seu E-mail', type: 'textarea', placeholder: 'Cole o rascunho aqui...' }, { id: 'f_target', label: 'Público Alvo', type: 'text', placeholder: 'Ex: CFOs' }],
        prompt: (d) => `Atue como um comprador ${d.f_target} impaciente. Analise este email: "${d.f_email}". Dê nota 0-10. Critique duramente jargões e tamanho. Reescreva a versão "High Conversion".`
    },
    {
        id: 'disc', name: 'DISC Decoder', icon: Brain, color: 'fuchsia', emoji: '🧠', desc: 'Perfil do Lead',
        fields: [{ id: 'f_text', label: 'Texto do Lead', type: 'textarea', placeholder: 'Cole algo que o lead escreveu...' }],
        prompt: (d) => `Analise o perfil DISC deste texto: "${d.f_text}". Identifique se é D, I, S ou C. Dê 3 dicas de como vender para esse perfil.`
    },
    {
        id: 'painmag', name: 'Pain Magnifier', icon: Maximize2, color: 'red', emoji: '🔍', desc: 'Aumente a dor',
        fields: [{ id: 'f_pain', label: 'Problema Superficial', type: 'text', placeholder: 'Ex: Processo manual no Excel' }, { id: 'f_role', label: 'Cargo do Lead', type: 'text', placeholder: 'Ex: Gerente Financeiro' }],
        prompt: (d) => `O ${d.f_role} disse: "${d.f_pain}". Expanda isso usando "Pain Magnification". Liste: 1. Custo Financeiro. 2. Risco Estratégico. 3. Impacto Pessoal.`
    },
    {
        id: 'linkedincomment', name: 'Comentário LinkedIn', icon: MessageSquare, color: 'blue', emoji: '💬', desc: 'Engajamento estratégico',
        fields: [{ id: 'f_post', label: 'Post do Lead', type: 'textarea', placeholder: 'Cole o post aqui...' }, { id: 'f_goal', label: 'Seu Objetivo', type: 'text', placeholder: 'Ex: Mostrar autoridade' }],
        prompt: (d) => `Gere 3 comentários inteligentes para este post: "${d.f_post}". Objetivo: ${d.f_goal}. Evite clichês.`
    },
    {
        id: 'simplifier', name: 'Simplificador Tech', icon: Lightbulb, color: 'yellow', emoji: '💡', desc: 'Analogias poderosas',
        fields: [{ id: 'f_concept', label: 'Conceito Técnico', type: 'text', placeholder: 'Ex: API RESTful' }, { id: 'f_audience', label: 'Público Leigo', type: 'text', placeholder: 'Ex: CEO de Varejo' }],
        prompt: (d) => `Explique "${d.f_concept}" para um ${d.f_audience}. Use 3 analogias do mundo real para tornar o benefício óbvio.`
    },
    {
        id: 'referral', name: 'Referral Engine', icon: Users, color: 'indigo', emoji: '🤝', desc: 'Pedir indicações',
        fields: [{ id: 'f_success', label: 'Sucesso Recente', type: 'text', placeholder: 'Ex: Economizamos 20% no budget' }, { id: 'f_target', label: 'Quem você quer?', type: 'text', placeholder: 'Ex: O Diretor de Marketing' }],
        prompt: (d) => `Acabei de entregar este sucesso: "${d.f_success}". Escreva um email curto pedindo uma introdução para ${d.f_target} na mesma empresa, sem parecer desesperado.`
    },
    {
        id: 'podcast', name: 'Podcast Miner', icon: Headphones, color: 'rose', emoji: '🎧', desc: 'Ganchos de Áudio',
        fields: [{ id: 'f_trans', label: 'Transcrição', type: 'textarea', placeholder: 'Cole trecho da transcrição...' }],
        prompt: (d) => `Extraia 3 ganchos de venda desta transcrição: "${d.f_trans}".`
    },
    {
        id: 'planner', name: 'SDR Daily Planner', icon: Calendar, color: 'teal', emoji: '🗓️', desc: 'Planejador Diário',
        fields: [{ id: 'f_tasks', label: 'Lista de Tarefas', type: 'textarea', placeholder: 'O que precisa fazer hoje?' }],
        prompt: (d) => `Organize estas tarefas em uma agenda de alta performance (Time Blocking): "${d.f_tasks}".`
    },
    {
        id: 'videoscript', name: 'Roteiro de Vídeo', icon: Video, color: 'pink', emoji: '🎥', desc: 'Scripts para Loom',
        fields: [{ id: 'f_prospect', label: 'Cliente/Empresa', type: 'text', placeholder: 'Ex: Nubank' }, { id: 'f_value', label: 'Proposta de Valor', type: 'text', placeholder: 'Ex: Reduzir churn' }],
        prompt: (d) => `Crie um roteiro de 45s para vídeo Loom focado em ${d.f_prospect}. Oferta: ${d.f_value}. Estrutura: Gancho Visual -> Problema -> Solução.`
    },
    {
        id: 'pricedojo', name: 'Dojo de Negociação', icon: DollarSign, color: 'green', emoji: '🥋', desc: 'Simulador de Preço',
        fields: [{ id: 'f_offer', label: 'Sua Proposta', type: 'text', placeholder: 'Ex: R$ 50k anuais' }, { id: 'f_scenario', label: 'Cenário', type: 'text', placeholder: 'Ex: Cliente diz que não tem budget' }],
        prompt: (d) => `Eu sou o vendedor. Minha oferta é ${d.f_offer}. Cenário: ${d.f_scenario}. Atue como um comprador durão de Procurement. Responda pressionando por desconto agressivo.`
    },
    {
        id: 'crmcleaner', name: 'Limpador de CRM', icon: FileCheck, color: 'slate', emoji: '🧹', desc: 'Notas -> CRM',
        fields: [{ id: 'f_notes', label: 'Notas Brutas', type: 'textarea', placeholder: 'Cole suas anotações...' }],
        prompt: (d) => `Formate estas anotações para CRM (Resumo, Dores, BANT, Próximos Passos): "${d.f_notes}".`
    },
    {
        id: 'reviewminer', name: 'Review Miner', icon: StarHalf, color: 'orange', emoji: '⭐', desc: 'Explorar reviews ruins',
        fields: [{ id: 'f_review', label: 'Review do Concorrente', type: 'textarea', placeholder: 'Cole a reclamação...' }, { id: 'f_competitor', label: 'Concorrente', type: 'text', placeholder: 'Ex: Salesforce' }],
        prompt: (d) => `Analise esta review negativa do ${d.f_competitor}: "${d.f_review}". Crie 3 Hooks de Cold Email explorando essa fraqueza sem citar o concorrente.`
    },
    {
        id: 'storyteller', name: 'Story Architect', icon: BookOpen, color: 'pink', emoji: '📖', desc: 'Storytelling',
        fields: [{ id: 'f_data', label: 'Dado/Fato', type: 'text', placeholder: 'Ex: Aumentamos vendas em 30%' }],
        prompt: (d) => `Transforme "${d.f_data}" em uma micro-história de vendas usando a Jornada do Herói simplificada.`
    },
    {
        id: 'meddic', name: 'MEDDIC Checker', icon: ClipboardCheck, color: 'blue', emoji: '🏢', desc: 'Validação Enterprise',
        fields: [{ id: 'f_notes', label: 'Notas da Oportunidade', type: 'textarea', placeholder: 'Resumo das conversas...' }],
        prompt: (d) => `Analise estas notas: "${d.f_notes}". Avalie segundo o framework MEDDIC. Liste o que temos e os GAPS fatais.`
    },
    {
        id: 'voicemail', name: 'Voicemail Drop', icon: Voicemail, color: 'fuchsia', emoji: '📼', desc: 'Scripts de caixa postal',
        fields: [{ id: 'f_name', label: 'Nome do Lead', type: 'text', placeholder: 'Ex: João' }, { id: 'f_reason', label: 'Motivo', type: 'text', placeholder: 'Ex: Ideia nova' }],
        prompt: (d) => `Crie 3 scripts de Voicemail de 20s para ${d.f_name}. Motivo: ${d.f_reason}. 1. Curiosidade. 2. Referência Social. 3. Valor Direto.`
    },
    {
        id: 'ctabuilder', name: 'CTA Builder', icon: MousePointer, color: 'lime', emoji: '🎯', desc: 'CTAs sem atrito',
        fields: [{ id: 'f_context', label: 'Contexto do Email', type: 'text', placeholder: 'Ex: Oferecendo demo' }],
        prompt: (d) => `Para este contexto: "${d.f_context}", gere 5 CTAs de "Baixa Fricção" (Interest-Based). Foco em "Faz sentido?", "É prioridade?".`
    },
    {
        id: 'lingo', name: 'Industry Lingo', icon: Book, color: 'cyan', emoji: '🏭', desc: 'Glossário Insider',
        fields: [{ id: 'f_industry', label: 'Setor/Indústria', type: 'text', placeholder: 'Ex: Logística Farmacêutica' }],
        prompt: (d) => `Gere um glossário insider para ${d.f_industry}. 5 termos técnicos, 3 tendências atuais e 1 "unpopular opinion".`
    },
    {
        id: 'meetingautopsy', name: 'Autópsia de Call', icon: Skull, color: 'slate', emoji: '💀', desc: 'Por que perdeu?',
        fields: [{ id: 'f_summary', label: 'Resumo da Call', type: 'textarea', placeholder: 'O que aconteceu...' }],
        prompt: (d) => `Atue como VP de Vendas. Analise: "${d.f_summary}". Identifique onde perdi a confiança. Liste 3 erros e a correção.`
    },
    {
        id: 'competitorfud', name: 'Competitor FUD', icon: Bomb, color: 'red', emoji: '💣', desc: 'Dúvida no Concorrente',
        fields: [{ id: 'f_comp', label: 'Concorrente', type: 'text', placeholder: 'Ex: SAP' }, { id: 'f_weakness', label: 'Fraqueza', type: 'text', placeholder: 'Ex: Implementação lenta' }],
        prompt: (d) => `Lead considerando ${d.f_comp}. Fraqueza: ${d.f_weakness}. Gere 3 perguntas "Inception" para plantar dúvida sem falar mal.`
    },
    {
        id: 'rapportremix', name: 'Rapport Metaphor', icon: Music, color: 'violet', emoji: '🎸', desc: 'Metáforas de Hobby',
        fields: [{ id: 'f_hobby', label: 'Hobby do Lead', type: 'text', placeholder: 'Ex: Ciclismo' }, { id: 'f_solution', label: 'Sua Solução', type: 'text', placeholder: 'Ex: Cibersegurança' }],
        prompt: (d) => `Lead ama ${d.f_hobby}. Vendo ${d.f_solution}. Crie uma metáfora de negócios conectando o hobby à solução.`
    },
    {
        id: 'challenger', name: 'Challenger Insight', icon: TriangleAlert, color: 'orange', emoji: '⛰️', desc: 'Desafie o status quo',
        fields: [{ id: 'f_statusquo', label: 'Crença Atual', type: 'text', placeholder: 'Ex: Planilhas funcionam bem' }],
        prompt: (d) => `Atue como vendedor Challenger. O cliente crê que "${d.f_statusquo}" é seguro. Crie um Insight Comercial que mostre o custo oculto/risco disso.`
    },
    {
        id: 'roicalc', name: 'Calculadora ROI', icon: Calculator, color: 'emerald', emoji: '💰', desc: 'Custo da Inação',
        fields: [{ id: 'f_problem', label: 'Cenário do Problema', type: 'text', placeholder: 'Ex: 10 pessoas gastam 1h/dia nisso' }],
        prompt: (d) => `Cenário: "${d.f_problem}". Estime o custo anual (Custo da Inação) com base em salários Brasil. Crie um parágrafo matemático para um CFO.`
    },
    {
        id: 'chameleon', name: 'Camaleão de Texto', icon: Palette, color: 'fuchsia', emoji: '🦎', desc: 'Imite o estilo',
        fields: [{ id: 'f_sample', label: 'Texto do Lead', type: 'textarea', placeholder: 'Cole um email dele...' }, { id: 'f_msg', label: 'Sua Mensagem', type: 'text', placeholder: 'Ex: Quero marcar uma demo' }],
        prompt: (d) => `Analise o estilo deste texto: "${d.f_sample}". Reescreva minha mensagem "${d.f_msg}" imitando exatamente esse estilo.`
    },
    { id: 'preflight', name: 'Briefing Pré-Call', icon: ClipboardList, color: 'purple', emoji: '📝', desc: 'Prep em 3 min', fields: [{id: 'f_company', label: 'Empresa Alvo', type: 'text', placeholder: 'Nome da Empresa'}], prompt: (d) => `Pesquise sobre ${d.f_company}. Crie um briefing: 1. Resumo. 2. Perguntas SPIN. 3. Fato recente.`, useSearch: true },
    { id: 'social', name: 'Social Authority', icon: Share2, color: 'blue', emoji: '📱', desc: 'Posts virais', fields: [{id: 'f_topic', label: 'Tópico', type: 'text', placeholder: 'Assunto do Post'}], prompt: (d) => `Crie um post LinkedIn sobre ${d.f_topic} usando framework Hook-Story-Value.` },
    { id: 'closer', name: 'Fechamento Shark', icon: Gavel, color: 'red', emoji: '🦈', desc: 'Fechar negócio', fields: [{id: 'f_sit', label: 'Situação', type: 'text', placeholder: 'Por que travou?'}], prompt: (d) => `Negociação travada: ${d.f_sit}. Crie email de fechamento usando gatilhos de urgência.` },
    { id: 'whatsapp', name: 'Zap Audio Script', icon: Mic, color: 'green', emoji: '🟢', desc: 'Roteiro WhatsApp', fields: [{id: 'f_lead', label: 'Lead/Contexto', type: 'text', placeholder: 'Para quem é?'}], prompt: (d) => `Roteiro de áudio WhatsApp 45s para ${d.f_lead}. Tom casual e urgente.` },
    { id: 'objection', name: 'Mata-Objeção', icon: ShieldAlert, color: 'red', emoji: '🛡️', desc: 'Contorno de Objeção', fields: [{id: 'f_obj', label: 'Objeção', type: 'text', placeholder: 'O que ele disse?'}], prompt: (d) => `Contorne a objeção: "${d.f_obj}". Seja breve e empático.` },
    { id: 'subject', name: 'Assuntos Virais', icon: MailOpen, color: 'yellow', emoji: '📧', desc: 'Subject Lines', fields: [{id: 'f_topic', label: 'Tema do Email', type: 'text', placeholder: 'Sobre o que é?'}], prompt: (d) => `10 Assuntos de email viral para: ${d.f_topic}. Curto, sem clickbait óbvio.` },
    { id: 'signals', name: 'Detector de Sinais', icon: Radar, color: 'fuchsia', emoji: '📡', desc: 'Subtexto do Lead', fields: [{id: 'f_resp', label: 'Resposta do Lead', type: 'text', placeholder: 'O que ele respondeu?'}], prompt: (d) => `Analise: "${d.f_resp}". O que ele realmente quis dizer? Qual a temperatura?` },
    { id: 'remix', name: 'Remix Conteúdo', icon: Repeat, color: 'lime', emoji: '🔄', desc: 'Textão -> Pitch', fields: [{id: 'f_content', label: 'Conteúdo Original', type: 'textarea', placeholder: 'Cole o texto longo...'}], prompt: (d) => `Transforme este conteúdo em um Hook curto: "${d.f_content}".` },
    { id: 'meme', name: 'Meme Tático', icon: Smile, color: 'pink', emoji: '🎭', desc: 'Imagem Quebra-Gelo', fields: [{id: 'f_sit', label: 'Situação', type: 'text', placeholder: 'Ex: Cliente sumiu'}], prompt: (d) => `Crie imagem cartoon/meme Pixar 3D sobre: ${d.f_sit}.`, isImage: true },
    { id: 'icebreaker', name: 'Icebreaker Pro', icon: Snowflake, color: 'cyan', emoji: '❄️', desc: 'Conexão LinkedIn', fields: [{id: 'f_bio', label: 'Bio do Lead', type: 'textarea', placeholder: 'Cole a bio dele...'}], prompt: (d) => `3 mensagens de conexão LinkedIn baseadas em: "${d.f_bio}".` },
    { id: 'followup', name: 'Resgate Lead', icon: LifeBuoy, color: 'orange', emoji: '🛟', desc: 'Ghosting', fields: [{id: 'f_hist', label: 'Histórico', type: 'text', placeholder: 'O que aconteceu antes?'}], prompt: (d) => `Email de break-up para lead que sumiu: ${d.f_hist}.` },
    { id: 'qualify', name: 'Validador BANT', icon: CheckCircle, color: 'emerald', emoji: '✅', desc: 'Qualificação', fields: [{id: 'f_notes', label: 'Notas', type: 'textarea', placeholder: 'Resumo da conversa...'}], prompt: (d) => `Classifique no BANT estas notas: "${d.f_notes}".` },
    { id: 'gatekeeper', name: 'Gatekeeper Key', icon: Lock, color: 'slate', emoji: '🗝️', desc: 'Passar Recepção', fields: [{id: 'f_role', label: 'Quem atendeu?', type: 'text', placeholder: 'Secretária, Estagiário...'}], prompt: (d) => `Script para passar por ${d.f_role} e chegar no diretor.` },
    { id: 'persona', name: 'Avatar ICP', icon: ScanFace, color: 'violet', emoji: '👤', desc: 'Visualizar Cliente', fields: [{id: 'f_desc', label: 'Descrição', type: 'text', placeholder: 'Cargo e Indústria'}], prompt: (d) => `Retrato fotorealista estúdio de: ${d.f_desc}.`, isImage: true },
    { id: 'search', name: 'Market Intel', icon: Search, color: 'blue', emoji: '🔎', desc: 'Dados Reais', fields: [{id: 'f_query', label: 'O que buscar?', type: 'text', placeholder: 'Empresa ou Mercado'}], prompt: (d) => `Pesquise dados estratégicos sobre: ${d.f_query}.`, useSearch: true },
    { id: 'custom', name: 'Ferramenta Livre', icon: PlusCircle, color: 'pink', emoji: '✨', desc: 'Sua IA Personalizada', fields: [{id: 'f_req', label: 'O que você quer?', type: 'textarea', placeholder: 'Descreva sua necessidade...'}], prompt: (d) => `${d.f_req}` },
    { id: 'pitchdoctor', name: 'Pitch Doctor', icon: Stethoscope, color: 'teal', emoji: '🩺', desc: 'Curar Pitch', fields: [{id: 'f_pitch', label: 'Seu Pitch', type: 'textarea', placeholder: 'Cole seu pitch atual...'}], prompt: (d) => `Critique e melhore este pitch: "${d.f_pitch}".` },
    { id: 'spin', name: 'SPIN Generator', icon: HelpCircle, color: 'violet', emoji: '🌀', desc: 'Perguntas SPIN', fields: [{id: 'f_prod', label: 'Produto', type: 'text', placeholder: 'O que você vende?'}], prompt: (d) => `Perguntas SPIN para vender ${d.f_prod}.` },
    { id: 'battlecard', name: 'Battlecard', icon: Swords, color: 'amber', emoji: '⚔️', desc: 'Matar Concorrente', fields: [{id: 'f_comp', label: 'Concorrente', type: 'text', placeholder: 'Quem é o rival?'}], prompt: (d) => `Battlecard contra ${d.f_comp}. Pontos fracos e armadilhas.` }
];

export default function SDRCommandCenter() {
  const [view, setView] = useState('dashboard');
  const [activeToolId, setActiveToolId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [clock, setClock] = useState({ time: '00:00', date: '--/--' });
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: 'Olá! Qual o desafio de prospecção hoje? 🏹' }]);
  const chatEndRef = useRef(null);
  const [toast, setToast] = useState({ visible: false, msg: '' });

  // Init Auth
  useEffect(() => {
    const init = async () => { await signInAnonymously(auth); };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Clock
  useEffect(() => {
    const i = setInterval(() => {
      const now = new Date();
      setClock({
        time: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
      });
    }, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const showToast = (msg) => { setToast({ visible: true, msg }); setTimeout(() => setToast({ visible: false, msg: '' }), 2500); };

  const handleToolClick = (toolId) => {
    setActiveToolId(toolId);
    setFormValues({});
    setFormErrors({});
    setOutput(null);
    setView('tool');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (fieldId, value) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    if(formErrors[fieldId]) setFormErrors(prev => ({ ...prev, [fieldId]: false }));
  };

  const clearForm = () => { setFormValues({}); setFormErrors({}); setOutput(null); };

  const activeTool = TOOLS.find(t => t.id === activeToolId);

  const fetchWithRetry = async (url, options, retries = 4) => {
    let delay = 1000;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return await res.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };

  const runIA = async () => {
    if (!activeTool) return;

    // Validation
    const errors = {};
    let hasError = false;
    activeTool.fields.forEach(f => {
        if (!formValues[f.id] || formValues[f.id].trim() === '') {
            errors[f.id] = true;
            hasError = true;
        }
    });
    setFormErrors(errors);

    if (hasError) {
      showToast("PREENCHA OS CAMPOS! ⚠️");
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      const promptText = activeTool.prompt(formValues);

      if (activeTool.isImage) {
        const result = await fetchWithRetry(endpoints.image, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: { prompt: promptText + " Professional, realistic, high quality, 3d render style or photorealistic." },
            parameters: { sampleCount: 1 }
          })
        });
        const imgUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        setOutput({ type: 'image', content: imgUrl });
      } else {
        const payload = {
          contents: [{ parts: [{ text: `${promptText} Responda em Português do Brasil. Use formatação Markdown rica (negrito, listas). Seja direto, tático e profissional.` }] }],
          generationConfig: { temperature: 0.7 }
        };
        if (activeTool.useSearch) payload.tools = [{ "google_search": {} }];

        const result = await fetchWithRetry(endpoints.text, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Erro no processamento.";
        setOutput({ type: 'text', content: text });

        if (activeTool.id === 'coldcall' || activeTool.id === 'pricedojo') {
          speakResult(text);
        }
      }
    } catch (e) {
      console.error(e);
      setOutput({ type: 'text', content: "Erro de conexão com o cérebro da IA. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const speakResult = async (text) => {
    try {
      const response = await fetch(endpoints.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Aja com naturalidade: ${text}` }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } } },
          model: "gemini-2.5-flash-preview-tts"
        })
      });
      const result = await response.json();
      const pcmData = result.candidates[0].content.parts[0].inlineData.data;

      const pcmToWav = (base64) => {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for(let i=0; i<len; i++) bytes[i] = binary.charCodeAt(i);
        const buffer = new ArrayBuffer(44 + len);
        const view = new DataView(buffer);
        const writeString = (o, s) => { for(let i=0;i<s.length;i++) view.setUint8(o+i, s.charCodeAt(i)); };
        writeString(0, 'RIFF'); view.setUint32(4, 36+len, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, 24000, true); view.setUint32(28, 48000, true); view.setUint16(32, 2, true);
        view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, len, true);
        for(let i=0; i<len; i++) view.setUint8(44+i, bytes[i]);
        return buffer;
      };
      new Audio(URL.createObjectURL(new Blob([pcmToWav(pcmData)], { type: 'audio/wav' }))).play();
    } catch(e) { console.error("TTS Error", e); }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) { showToast("VOZ NÃO SUPORTADA"); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (chatOpen) setChatInput(text);
      else if (activeTool) handleInputChange(activeTool.fields[0].id, text);
    };
    recognition.start();
    showToast("OUVINDO... 🎤");
  };

  const handleSendChat = async () => {
    if(!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setChatInput('');
    try {
      const result = await fetchWithRetry(endpoints.text, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Aja como um mentor SDR Sênior. Seja curto: ${msg}` }] }] })
      });
      const ai = result.candidates?.[0]?.content?.parts?.[0]?.text || "Erro.";
      setChatMessages(prev => [...prev, { sender: 'ai', text: ai }]);
    } catch(e) { setChatMessages(prev => [...prev, { sender: 'ai', text: 'Erro de conexão.' }]); }
  };

  const saveResult = async () => {
    if (output && output.type === 'text' && output.content) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        tool: activeTool.name, content: output.content, timestamp: serverTimestamp(), userId: user?.uid
      });
      showToast("SALVO NA NUVEM! ☁️");
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); showToast("COPIADO!"); };

  return (
    <div className={`${theme} min-h-screen font-sans text-slate-100 transition-colors duration-500`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .glass { backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); }
        .dark .glass { background: rgba(15, 23, 42, 0.7); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4); }
        .light .glass { background: rgba(255, 255, 255, 0.85); border-color: rgba(0, 0, 0, 0.05); }
        .dark { background-color: #0F172A; background-image: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%); }
        .light { background-color: #F8FAFC; background-image: radial-gradient(at 0% 0%, hsla(210,100%,96%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(250,100%,98%,1) 0, transparent 50%); color: #1e293b; }
        .shadow-premium { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 20px; }
        .form-error { border-color: #ef4444 !important; animation: shake 0.3s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
      `}</style>

      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl glass rounded-full px-6 py-2.5 flex items-center justify-between shadow-premium transition-all duration-300">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-extrabold text-lg tracking-tight leading-none dark:text-white text-slate-900">
            SDR <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-400">COMMANDER</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <p className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">{clock.time}</p>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 text-indigo-400">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 pt-24 pb-12">

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 animate-in fade-in zoom-in duration-500">
            <div onClick={() => setView('grid')} className="relative w-full max-w-xl p-10 rounded-[3rem] text-center cursor-pointer group overflow-hidden glass border-2 border-transparent hover:border-indigo-500/40 transition-all hover:-translate-y-2 shadow-premium">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-brand-primary to-indigo-400 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Rocket className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h2 className="text-5xl font-black mb-4 tracking-tighter dark:text-white text-slate-900 drop-shadow-sm">
                  COCKPIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-400">SDR</span>
                </h2>
                <p className="text-lg text-slate-400 mb-10 font-medium max-w-sm leading-relaxed">
                  Sistema de Inteligência Tática para Vendas de Alta Performance.
                </p>
                <div className="inline-flex items-center gap-3 py-4 px-10 bg-gradient-to-r from-brand-primary to-indigo-600 rounded-full text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-brand-primary/40 group-hover:translate-y-[-2px] transition-transform">
                  <span>INICIAR OPERAÇÃO</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <p className="mt-8 text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-[0.3em] opacity-60">Powered by Gemini 2.5 Pro</p>
          </div>
        )}

        {/* GRID */}
        {view === 'grid' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 px-2">
              <div>
                <h2 className="text-3xl font-black tracking-tight dark:text-white text-slate-900">
                  Arsenal Tático <span className="inline-block animate-bounce">⚡</span>
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Selecione uma ferramenta</p>
              </div>
              <button onClick={() => setView('dashboard')} className="px-6 py-3 glass rounded-full text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all active:scale-95 shadow-lg">
                <ArrowLeft className="w-4 h-4" /> VOLTAR
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {TOOLS.map((tool, idx) => (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className="relative p-8 rounded-[2.5rem] glass cursor-pointer flex flex-col justify-between group overflow-hidden min-h-[220px] hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-indigo-500/40 shadow-lg hover:shadow-premium"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity transform group-hover:scale-150 duration-700">
                    <tool.icon className={`w-32 h-32 text-${tool.color}-500`} />
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <div className={`w-14 h-14 rounded-3xl bg-${tool.color}-500/10 flex items-center justify-center group-hover:bg-${tool.color}-500 group-hover:text-white transition-all duration-300 shadow-inner`}>
                      <tool.icon className={`w-7 h-7 text-${tool.color}-500 group-hover:text-white transition-colors`} />
                    </div>
                    <span className="text-2xl filter grayscale-0 hover:grayscale transition-all duration-300 transform group-hover:rotate-12">{tool.emoji}</span>
                  </div>
                  <div className="z-10 mt-6">
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2 leading-tight group-hover:translate-x-1 transition-transform">{tool.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-l-2 border-indigo-500/20 pl-3 line-clamp-2">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOL */}
        {view === 'tool' && activeTool && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in fade-in slide-in-from-bottom-10 duration-500">
            {/* Input */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass p-8 rounded-[3rem] shadow-premium">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setView('grid')} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-white hover:text-brand-primary transition-all dark:text-white text-slate-900 shadow-md">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    <button onClick={clearForm} className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors" title="Limpar">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className={`flex items-center gap-3 bg-${activeTool.color}-500/10 px-4 py-2 rounded-full border border-${activeTool.color}-500/20`}>
                        <activeTool.icon className={`w-4 h-4 text-${activeTool.color}-500`} />
                        <h3 className={`text-xs font-black uppercase text-${activeTool.color}-500 tracking-widest`}>{activeTool.name}</h3>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {activeTool.fields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">
                        {field.label} {formErrors[field.id] && <AlertCircle className="w-3 h-3 text-red-500 ml-2" />}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder}
                          className={`w-full bg-slate-50 dark:bg-black/20 border-2 rounded-[2rem] p-6 text-sm font-medium outline-none h-40 focus:border-brand-primary/50 focus:bg-white dark:focus:bg-black/40 transition-all dark:text-white text-slate-800 placeholder-slate-400 resize-none shadow-inner ${formErrors[field.id] ? 'form-error' : 'border-slate-100 dark:border-white/5'}`}
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className={`w-full bg-slate-50 dark:bg-black/20 border-2 rounded-[2rem] p-6 text-sm font-medium outline-none focus:border-brand-primary/50 focus:bg-white dark:focus:bg-black/40 transition-all dark:text-white text-slate-800 placeholder-slate-400 shadow-inner ${formErrors[field.id] ? 'form-error' : 'border-slate-100 dark:border-white/5'}`}
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}

                  <button
                    onClick={runIA}
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-brand-primary to-indigo-600 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-white shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="relative z-10">Gerar Estratégia</span>
                        <Zap className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              <div className="glass flex-1 p-8 md:p-10 rounded-[3rem] shadow-premium relative flex flex-col border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${output ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]' : 'bg-slate-600'}`}></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Resultado Tático</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveResult} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-green-500 hover:text-white transition-all text-slate-400" title="Salvar na Nuvem">
                      <CloudUpload className="w-4 h-4" />
                    </button>
                    <button onClick={() => output && output.type === 'text' && copyToClipboard(output.content)} className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-indigo-400 shadow-lg shadow-brand-primary/30 transition-all active:scale-90" title="Copiar">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 text-base leading-relaxed dark:text-slate-200 text-slate-700 custom-scrollbar overflow-y-auto whitespace-pre-wrap font-medium p-4 bg-slate-50/5 dark:bg-black/20 rounded-[2rem] border border-white/5">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary animate-spin"></div>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary">Processando...</span>
                    </div>
                  ) : output ? (
                    output.type === 'image' ? (
                      <img src={output.content} alt="Generated" className="w-full rounded-[1.5rem] shadow-2xl border-4 border-white/10" />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: output.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-400">$1</strong>') }}></div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <Brain className="w-10 h-10" />
                      </div>
                      <p className="uppercase tracking-[0.3em] font-black text-xs">Aguardando Input...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat */}
      {chatOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] glass rounded-[2.5rem] shadow-premium z-[200] flex flex-col overflow-hidden border-2 border-white/5 animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          <div className="p-6 bg-gradient-to-r from-brand-primary to-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl"><Brain className="w-5 h-5" /></div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">Mentor SDR</h3>
                <p className="text-[10px] opacity-80 font-medium">IA Estratégica</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${msg.sender === 'user' ? 'bg-slate-500' : 'bg-indigo-500'}`}>
                  {msg.sender === 'user' ? 'YOU' : 'IA'}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-xs leading-relaxed max-w-[85%] ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200 dark:border-white/5 flex gap-2">
            <input
              type="text"
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-5 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all dark:text-white text-slate-900 border border-transparent"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            />
            <button onClick={handleSendChat} className="w-10 h-10 bg-brand-primary rounded-full text-white shadow-lg hover:bg-indigo-500 active:scale-90 transition-all flex items-center justify-center">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[150]">
        <button onClick={startVoice} className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-110 hover:-translate-y-1 transition-all border-4 border-white/10 group">
          <Mic className="w-7 h-7 text-white group-hover:animate-pulse" />
        </button>
        <button onClick={() => setChatOpen(!chatOpen)} className="w-16 h-16 bg-gradient-to-tr from-brand-primary to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 hover:-translate-y-1 transition-all border-4 border-white/10 group">
          <MessageCircle className="w-7 h-7 text-white" />
          {!chatOpen && <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
        </button>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-[250] text-xs uppercase tracking-widest flex items-center gap-3 border border-white/10">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
