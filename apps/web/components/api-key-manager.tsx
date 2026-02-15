'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Eye, EyeOff,Key } from 'lucide-react';
import React from 'react';

import { useLocalStorage } from '../hooks/use-local-storage';
import { Input } from './Input';

export function ApiKeyManager() {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini_api_key', '');
  const [showKey, setShowKey] = React.useState(false);

  return (
    <Card className="w-full border-slate-200 bg-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Key className="size-4 text-slate-500" />
          Configuração da IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500">Chave da API Gemini (Google)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Cole sua API Key aqui..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            A chave é salva apenas no seu navegador.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
