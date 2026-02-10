'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@salesos/ui';
import {
  Briefcase, ArrowLeft, Zap, Crown, TrendingUp, AlertTriangle,
  Percent, CheckSquare, Activity, Calendar, HeartPulse, FileText
} from 'lucide-react';

const TOOLS = [
    { id: 'automove', name: 'Auto-Move Stage', icon: TrendingUp, color: 'green', emoji: '🚀', desc: 'Sugestão de avanço de funil', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome do Deal' }, { id: 'f_act', label: 'Atividades', type: 'text', placeholder: 'Nº de interações' }] },
    { id: 'stale', name: 'Stale Deal Alert', icon: AlertTriangle, color: 'orange', emoji: '⚠️', desc: 'Alertas de estagnação', fields: [{ id: 'f_user', label: 'Owner', type: 'text', placeholder: 'Seu nome' }] },
    { id: 'winprob', name: 'Win Probability', icon: Percent, color: 'blue', emoji: '🎲', desc: 'Probabilidade de fechamento', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome' }] },
    { id: 'nba', name: 'Next Best Action', icon: Zap, color: 'purple', emoji: '🧠', desc: 'Próximo passo ideal', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome' }] },
    { id: 'health', name: 'Deal Health', icon: HeartPulse, color: 'red', emoji: '❤️', desc: 'Saúde da oportunidade', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome' }] },
    { id: 'logger', name: 'Activity Logger', icon: FileText, color: 'slate', emoji: '📝', desc: 'Registrar atividade rápida', fields: [{ id: 'f_deal', label: 'Deal', type: 'text', placeholder: 'Nome' }, { id: 'f_note', label: 'Nota', type: 'textarea', placeholder: 'Resumo' }] },
    { id: 'sentiment', name: 'Sentiment Analysis', icon: Activity, color: 'pink', emoji: '😊', desc: 'Análise de sentimento', fields: [{ id: 'f_text', label: 'Texto', type: 'textarea', placeholder: 'Email/Nota do cliente' }] },
    { id: 'prioritizer', name: 'Task Prioritizer', icon: CheckSquare, color: 'indigo', emoji: '✅', desc: 'Priorizar tarefas do dia', fields: [{ id: 'f_tasks', label: 'Tarefas', type: 'textarea', placeholder: 'Lista de tarefas' }] },
    { id: 'scheduler', name: 'Meeting Helper', icon: Calendar, color: 'cyan', emoji: '📅', desc: 'Sugestão de agenda', fields: [{ id: 'f_people', label: 'Participantes', type: 'text', placeholder: 'Emails' }] },
    { id: 'churn', name: 'Churn Detector', icon: AlertTriangle, color: 'red', emoji: '📉', desc: 'Risco de cancelamento', fields: [{ id: 'f_acc', label: 'Conta', type: 'text', placeholder: 'Nome do Cliente' }] },
];

export default function AEDashboard() {
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
    setTimeout(() => {
        let mockRes = `[AE Assistant Report: ${activeTool?.name}]\n\n`;
        if (activeToolId === 'winprob') mockRes += "Win Probability: 78%\nKey Factors: Budget Approved, Champion Engaged.";
        else if (activeToolId === 'nba') mockRes += "Action: Schedule call with CFO.\nReason: Economic buyer not yet contacted.";
        else mockRes += `Analysis for: ${JSON.stringify(formValues)}`;

        setOutput(mockRes);
        setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-white">
                CLOSER <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">ELITE</span>
            </h1>
        </div>
      </header>

      {view === 'dashboard' && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div onClick={() => setView('grid')} className="w-full max-w-xl p-10 rounded-[3rem] bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-2 text-center group">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                    <Briefcase className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h2 className="text-5xl font-black mb-4 tracking-tighter text-white">DEAL <span className="text-amber-400">ROOM</span></h2>
                <p className="text-lg text-slate-400 mb-8">Gestão de Pipeline e Fechamento.</p>
                <button className="py-4 px-10 bg-amber-600 rounded-full text-xs font-black text-white uppercase tracking-widest hover:bg-amber-500 transition-colors">
                    GERENCIAR DEALS
                </button>
            </div>
        </div>
      )}

      {view === 'grid' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-black text-white">Ferramentas de Fechamento</h2>
                <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id)}
                        className="bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-1 rounded-2xl p-5 group"
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

      {view === 'tool' && activeTool && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="lg:col-span-5 flex flex-col gap-6">
                <Card className="bg-slate-800/50 border-slate-700 p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setView('grid')} className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600">
                            <activeTool.icon className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold uppercase text-amber-300">{activeTool.name}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {activeTool.fields.map(field => (
                            <div key={field.id}>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-sm text-white focus:border-amber-500 outline-none transition-colors min-h-[120px]"
                                        placeholder={field.placeholder}
                                        onChange={(e) => setFormValues(prev => ({...prev, [field.id]: e.target.value}))}
                                    />
                                ) : (
                                    <input
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-sm text-white focus:border-amber-500 outline-none transition-colors"
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
                        className="w-full mt-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-white font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : <><Zap className="w-4 h-4" /> Executar Ação</>}
                    </button>
                </Card>
            </div>
            <div className="lg:col-span-7">
                <Card className="bg-slate-800/50 border-slate-700 p-8 rounded-[2rem] h-full min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${output ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 'bg-slate-600'}`}></div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Resultado</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-900/30 rounded-xl p-6 border border-slate-700/50 overflow-y-auto">
                        {output ? (
                            <pre className="whitespace-pre-wrap font-sans text-slate-200 text-sm leading-relaxed">{output}</pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                                <Briefcase className="w-16 h-16 opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest">Aguardando Input...</span>
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
