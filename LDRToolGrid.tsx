'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@salesos/ui';

interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'beta' | 'planned';
}

const tools: Tool[] = [
  { id: '1', name: 'Enrichment CNPJ', description: 'Dados atualizados da Receita', status: 'active' },
  { id: '2', name: 'Validação Cruzada', description: 'Checagem de múltiplas fontes', status: 'active' },
  { id: '3', name: 'Score Confiabilidade', description: '0-100 para dados', status: 'active' },
  { id: '4', name: 'Empresas Inativas', description: 'Detecção automática', status: 'active' },
  { id: '5', name: 'ICP Dinâmico', description: 'Perfil de Cliente Ideal', status: 'active' },
  { id: '6', name: 'Clusterização', description: 'Agrupamento por IA', status: 'active' },
  { id: '7', name: 'Normalização CNAE', description: 'Padronização fiscal', status: 'active' },
  { id: '8', name: 'Cargos Genéricos', description: 'Identificação de decisores', status: 'active' },
  { id: '9', name: 'Auto Update', description: 'Atualização de contatos', status: 'active' },
  { id: '10', name: 'LGPD Guard', description: 'Compliance automático', status: 'active' },
  { id: '11', name: 'Dados Sensíveis', description: 'Proteção PII', status: 'active' },
  { id: '12', name: 'Feedback Loop', description: 'Integração com Vendas', status: 'active' },
  { id: '13', name: 'Análise Qualidade', description: 'KPIs de listas', status: 'active' },
  { id: '14', name: 'Ranking Listas', description: 'Conversão por origem', status: 'active' },
  { id: '15', name: 'Histórico', description: 'Timeline de inteligência', status: 'active' },
  { id: '16', name: 'Duplicidade', description: 'Deduplicação avançada', status: 'active' },
  { id: '17', name: 'Turnover Monitor', description: 'Saída de executivos', status: 'active' },
  { id: '18', name: 'Novos Nichos', description: 'Sugestão de mercado', status: 'active' },
  { id: '19', name: 'Alertas Degradação', description: 'Monitor de qualidade', status: 'active' },
  { id: '20', name: 'Impact Report', description: 'ROI de dados', status: 'active' },
];

export function LDRToolGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {tools.map((tool) => (
        <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              {tool.name}
              <span className={`text-xs px-2 py-1 rounded-full ${tool.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {tool.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{tool.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
