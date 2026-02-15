'use client';

import { Button, Card, CardContent } from '@salesos/ui';
import { AlertCircle,ArrowLeft, CheckCircle, Copy, Loader2, Zap } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect,useState } from 'react';
import { toast } from 'sonner';

import { Input } from '../../../../components/Input';
import { SDR_TOOLS } from '../../../../config/sdr-tools';
import { useLocalStorage } from '../../../../hooks/use-local-storage';

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
    <div className="animate-in slide-in-from-bottom-4 mx-auto max-w-5xl pb-20 duration-500">
      <button
        onClick={() => router.push('/dashboard')}
        className="group mb-6 flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="mr-1 size-4 transition-transform group-hover:-translate-x-1" />
        Voltar para o Dashboard
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* INPUT COLUMN */}
        <div className="space-y-6 lg:col-span-5">
          <Card className={`border-t- border-t-4${tool.color}-500 shadow-lg`}>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className={`bg- size-12 rounded-xl${tool.color}-100 text- flex items-center justify-center${tool.color}-600`}>
                  <tool.icon className="size-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{tool.name}</h1>
                  <p className="text-xs text-slate-500">{tool.desc}</p>
                </div>
              </div>

              <div className="space-y-4">
                {tool.fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {field.label}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        className="min-h-[100px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={field.placeholder}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        className="border-slate-200 bg-slate-50 focus:ring-blue-500"
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
                className={`mt-8 h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 ${loading ? 'opacity-80' : 'hover:scale-[1.02]'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 size-5" />
                    Gerar Conteúdo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-7">
          <div className="relative flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${output ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resultado Gerado</span>
              </div>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-blue-600"
                  title="Copiar"
                >
                  <Copy className="size-4" />
                </button>
              )}
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto bg-slate-50/30 p-8">
              {loading ? (
                <div className="flex h-full animate-pulse flex-col items-center justify-center space-y-4 text-center">
                  <div className={`border-t- size-16 rounded-full border-4 border-slate-100${tool.color}-500 animate-spin`}></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">A inteligência está trabalhando...</p>
                </div>
              ) : output ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center opacity-40">
                  <div className="flex size-20 items-center justify-center rounded-full bg-slate-100">
                    <Zap className="size-8 text-slate-400" />
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
