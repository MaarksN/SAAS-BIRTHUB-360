'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SDR_TOOLS } from '../../../../config/sdr-tools';
import { useLocalStorage } from '../../../../hooks/use-local-storage';
import { Button, Card, CardContent } from '@salesos/ui';
import { Input } from '../../../../components/Input';
import { Loader2, ArrowLeft, Zap, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.toolId as string;
  const tool = SDR_TOOLS.find((t) => t.id === toolId);

  const [apiKey] = useLocalStorage<string>('gemini_api_key', '');
  const [recentTools, setRecentTools] = useLocalStorage<string[]>('sdr_recent_tools', []);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  // Initialize form with default values
  useEffect(() => {
    if (tool) {
      const defaults: Record<string, string> = {};
      tool.fields.forEach(f => {
        if (f.defaultValue) defaults[f.id] = f.defaultValue;
      });
      setFormValues(defaults);

      // Update recent tools
      setRecentTools(prev => {
        const filtered = prev.filter(id => id !== tool.id);
        return [tool.id, ...filtered].slice(0, 5);
      });
    }
  }, [tool?.id]);

  if (!tool) {
    return <div className="p-8 text-center">Ferramenta não encontrada.</div>;
  }

  const handleInputChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('Copiado para a área de transferência!');
    }
  };

  const runIA = async () => {
    if (!apiKey) {
      toast.error('Configure sua API Key nas configurações primeiro!');
      return;
    }

    // Validate required fields (simple check: non-empty)
    const emptyFields = tool.fields.filter(f => f.type !== 'select' && !f.placeholder?.includes('Opcional') && !formValues[f.id]);
    // Note: This validation is basic. Better to rely on schema, but for now this works.

    setLoading(true);
    setOutput(null);

    try {
      const promptText = tool.prompt(formValues);

      const payload = {
        contents: [{ parts: [{ text: `${promptText} \n\nIMPORTANT: Return ONLY the response content. Use rich Markdown formatting (bold, lists, headers).` }] }],
        generationConfig: { temperature: 0.7 }
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Erro na API');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setOutput(text);
        toast.success('Gerado com sucesso!');
      } else {
        throw new Error('Sem resposta da IA');
      }

    } catch (error: any) {
      console.error(error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Voltar para o Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* INPUT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <Card className={`border-t-4 border-t-${tool.color}-500 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-${tool.color}-100 flex items-center justify-center text-${tool.color}-600`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{tool.name}</h1>
                  <p className="text-xs text-slate-500">{tool.desc}</p>
                </div>
              </div>

              <div className="space-y-4">
                {tool.fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      {field.label}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                        placeholder={field.placeholder}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        className="bg-slate-50 border-slate-200 focus:ring-blue-500"
                        placeholder={field.placeholder}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={runIA}
                disabled={loading}
                className={`w-full mt-8 h-12 text-base font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all ${loading ? 'opacity-80' : 'hover:scale-[1.02]'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Gerar Conteúdo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[500px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${output ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`}></div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Resultado Gerado</span>
              </div>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                  title="Copiar"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                  <div className={`w-16 h-16 rounded-full border-4 border-slate-100 border-t-${tool.color}-500 animate-spin`}></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">A inteligência está trabalhando...</p>
                </div>
              ) : output ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Preencha o formulário para gerar o conteúdo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
