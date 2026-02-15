'use client';

import React from 'react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Input } from './Input';

export function ApiKeyManager() {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini_api_key', '');
  const [showKey, setShowKey] = React.useState(false);

  return (
    <Card className="w-full bg-slate-50 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-500" />
          Configuração da IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label className="text-xs text-slate-500 font-medium">Chave da API Gemini (Google)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Cole sua API Key aqui..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 bg-white"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
