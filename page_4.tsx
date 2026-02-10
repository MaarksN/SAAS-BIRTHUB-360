'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@salesos/ui';
import {
  Layers, PhoneIncoming, Flame, Rocket, ArrowLeft, Zap, Brain,
  Snowflake, ShieldAlert, Clock, Repeat, XCircle, Lock,
  Lightbulb, Maximize2, Calculator, Swords, HelpCircle,
  ClipboardCheck, CheckCircle, Users, BookOpen, Mic, FileAudio
} from 'lucide-react';

const TOOLS = [
    { id: 'cadence', name: 'Cadência Total', icon: Layers, color: 'indigo', emoji: '📅', desc: 'Kit de prospecção completo', fields: [{ id: 'f_product', label: 'O que você vende?', type: 'text', placeholder: 'Ex: Software de RH SaaS' }, { id: 'f_persona', label: 'Quem é a Persona?', type: 'text', placeholder: 'Ex: Diretor de RH' }, { id: 'f_pain', label: 'Dor Principal', type: 'text', placeholder: 'Ex: Demora na contratação' }] },
    { id: 'coldcall', name: 'Cold Call Script', icon: PhoneIncoming, color: 'rose', emoji: '📞', desc: 'Roteiro de ligação', fields: [{ id: 'f_persona', label: 'Persona', type: 'text', placeholder: 'Ex: CEO' }, { id: 'f_value', label: 'Valor', type: 'text', placeholder: 'Ex: Economia' }] },
    { id: 'emailroast', name: 'Email Roast', icon: Flame, color: 'orange', emoji: '🔥', desc: 'Crítica ácida do email', fields: [{ id: 'f_email', label: 'Seu E-mail', type: 'textarea', placeholder: 'Cole o rascunho aqui...' }] },
    { id: 'icebreaker', name: 'LinkedIn Icebreaker', icon: Snowflake, color: 'cyan', emoji: '❄️', desc: 'Quebra-gelo perfil', fields: [{ id: 'f_bio', label: 'Bio do Lead', type: 'textarea', placeholder: 'Cole a bio...' }] },
    { id: 'kill_price', name: 'Objection: Preço', icon: ShieldAlert, color: 'green', emoji: '💸', desc: 'Matar objeção de preço', fields: [{ id: 'f_ctx', label: 'Contexto', type: 'text', placeholder: 'O que ele disse?' }] },
    { id: 'kill_comp', name: 'Objection: Concorrente', icon: Swords, color: 'red', emoji: '⚔️', desc: 'Matar concorrente', fields: [{ id: 'f_comp', label: 'Concorrente', type: 'text', placeholder: 'Nome do rival' }] },
    { id: 'kill_time', name: 'Objection: Tempo', icon: Clock, color: 'yellow', emoji: '⏳', desc: 'Matar "sem tempo"', fields: [{ id: 'f_ctx', label: 'Contexto', type: 'text', placeholder: 'O que ele disse?' }] },
    { id: 'followup', name: 'Follow-up Builder', icon: Repeat, color: 'blue', emoji: '🔄', desc: 'Email de seguimento', fields: [{ id: 'f_ctx', label: 'Contexto Anterior', type: 'text', placeholder: 'Sobre o que falaram?' }] },
    { id: 'breakup', name: 'Break-up Email', icon: XCircle, color: 'slate', emoji: '👋', desc: 'Email de despedida', fields: [{ id: 'f_name', label: 'Nome', type: 'text', placeholder: 'Nome do lead' }] },
    { id: 'gatekeeper', name: 'Gatekeeper Bypass', icon: Lock, color: 'purple', emoji: '🗝️', desc: 'Passar pela secretária', fields: [{ id: 'f_role', label: 'Quem atendeu?', type: 'text', placeholder: 'Ex: Recepcionista' }] },
    { id: 'valueprop', name: 'Value Canvas', icon: Lightbulb, color: 'amber', emoji: '💡', desc: 'Canvas de Valor', fields: [{ id: 'f_prod', label: 'Produto', type: 'text', placeholder: 'Seu produto' }, { id: 'f_pain', label: 'Dor', type: 'text', placeholder: 'Dor do cliente' }] },
    { id: 'painmag', name: 'Pain Magnifier', icon: Maximize2, color: 'red', emoji: '🔍', desc: 'Aumentar a dor', fields: [{ id: 'f_pain', label: 'Dor', type: 'text', placeholder: 'Problema atual' }] },
    { id: 'roi', name: 'ROI Calculator', icon: Calculator, color: 'emerald', emoji: '💰', desc: 'Calcular Retorno', fields: [{ id: 'f_cost', label: 'Custo', type: 'text', placeholder: '1000' }, { id: 'f_gain', label: 'Ganho', type: 'text', placeholder: '5000' }] },
    { id: 'battlecard', name: 'Battlecard', icon: Swords, color: 'orange', emoji: '🛡️', desc: 'Cartão de Batalha', fields: [{ id: 'f_comp', label: 'Concorrente', type: 'text', placeholder: 'Nome' }] },
    { id: 'spin', name: 'SPIN Questions', icon: HelpCircle, color: 'violet', emoji: '🌀', desc: 'Perguntas SPIN', fields: [{ id: 'f_prod', label: 'Produto', type: 'text', placeholder: 'O que vende?' }] },
    { id: 'meddic', name: 'MEDDIC Check', icon: ClipboardCheck, color: 'blue', emoji: '📋', desc: 'Checklist Enterprise', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome da conta' }] },
    { id: 'bant', name: 'BANT Qualifier', icon: CheckCircle, color: 'teal', emoji: '✅', desc: 'Qualificação BANT', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome da conta' }] },
    { id: 'referral', name: 'Referral Request', icon: Users, color: 'pink', emoji: '🤝', desc: 'Pedir indicação', fields: [{ id: 'f_ctx', label: 'Sucesso', type: 'text', placeholder: 'O que entregou?' }] },
    { id: 'story', name: 'Case Story', icon: BookOpen, color: 'indigo', emoji: '📖', desc: 'Contar Caso', fields: [{ id: 'f_client', label: 'Cliente', type: 'text', placeholder: 'Quem?' }, { id: 'f_res', label: 'Resultado', type: 'text', placeholder: 'O que?' }] },
    { id: 'whatsapp', name: 'Zap Audio', icon: Mic, color: 'green', emoji: '🟢', desc: 'Roteiro Áudio', fields: [{ id: 'f_name', label: 'Nome', type: 'text', placeholder: 'Lead' }] },
];

export default function SDRDashboard() {
  const [view, setView] = useState<'dashboard' | 'grid' | 'tool'>('dashboard');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeTool = TOOLS.find(t => t.id === activeToolId);

  const handleToolClick = (toolId: string) => {
    setActiveToolId(toolId);
    setFormValues({});
    setOutput(null);
    setView('tool');
  };

  const handleRun = async () => {
    setLoading(true);
    // Simulate AI Call based on tool ID
    // In real app, this calls SDRService methods mapped by ID
    setTimeout(() => {
        let mockRes = `[AI Output for ${activeTool?.name}]\n\n`;
        if (activeToolId === 'coldcall') mockRes += "Script: Olá, aqui é...";
        else if (activeToolId === 'roi') mockRes += "ROI Calculado: 400%";
        else mockRes += `Estratégia gerada para: ${JSON.stringify(formValues)}`;

        setOutput(mockRes);
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-white">
                SDR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">COMMANDER</span>
            </h1>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div onClick={() => setView('grid')} className="w-full max-w-xl p-10 rounded-[3rem] bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-2 text-center group">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                    <Rocket className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h2 className="text-5xl font-black mb-4 tracking-tighter text-white">COCKPIT <span className="text-indigo-400">SDR</span></h2>
                <p className="text-lg text-slate-400 mb-8">20 Ferramentas Táticas Prontas.</p>
                <button className="py-4 px-10 bg-indigo-600 rounded-full text-xs font-black text-white uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                    INICIAR OPERAÇÃO
                </button>
            </div>
        </div>
      )}

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-black text-white">Arsenal Tático (20)</h2>
                <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id)}
                        className="bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 rounded-2xl p-5 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-${tool.color}-500/20 flex items-center justify-center group-hover:bg-${tool.color}-500/30 transition-colors`}>
                                <tool.icon className={`w-5 h-5 text-${tool.color}-400`} />
                            </div>
                            <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{tool.emoji}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">{tool.name}</h3>
                        <p className="text-[10px] text-slate-400">{tool.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* TOOL VIEW */}
      {view === 'tool' && activeTool && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* INPUT COL */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <Card className="bg-slate-800/50 border-slate-700 p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setView('grid')} className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600">
                            <activeTool.icon className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold uppercase text-indigo-300">{activeTool.name}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activeTool.fields.map(field => (
                            <div key={field.id}>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-colors min-h-[120px]"
                                        placeholder={field.placeholder}
                                        onChange={(e) => setFormValues(prev => ({...prev, [field.id]: e.target.value}))}
                                    />
                                ) : (
                                    <input
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                                        placeholder={field.placeholder}
                                        type={field.type}
                                        onChange={(e) => setFormValues(prev => ({...prev, [field.id]: e.target.value}))}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : <><Zap className="w-4 h-4" /> Gerar Estratégia</>}
                    </button>
                </Card>
            </div>

            {/* OUTPUT COL */}
            <div className="lg:col-span-7">
                <Card className="bg-slate-800/50 border-slate-700 p-8 rounded-[2rem] h-full min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${output ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-slate-600'}`}></div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Resultado Tático</span>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900/30 rounded-xl p-6 border border-slate-700/50 overflow-y-auto">
                        {output ? (
                            <pre className="whitespace-pre-wrap font-sans text-slate-200 text-sm leading-relaxed">{output}</pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                                <Brain className="w-16 h-16 opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest">Aguardando Dados...</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
