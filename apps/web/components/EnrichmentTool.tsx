'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@salesos/ui';
import React, { useState } from 'react';

import { enrichCNPJAction } from '../../app/actions/ldr';

export function EnrichmentTool() {
  const [cnpj, setCnpj] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleEnrich = async () => {
    setLoading(true);
    try {
      const data = await enrichCNPJAction(cnpj);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-8 w-full max-w-2xl">
      <CardHeader>
        <CardTitle>CNPJ Enrichment (AI-Powered)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter CNPJ (e.g., 00.000.000/0001-91)"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />
          <Button onClick={handleEnrich} disabled={loading}>
            {loading ? 'Enriching...' : 'Enrich'}
          </Button>
        </div>

        {result && (
          <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
            <p>
              <strong>Legal Name:</strong> {result.legalName}
            </p>
            <p>
              <strong>Status:</strong> {result.status}
            </p>
            <p>
              <strong>Founded:</strong> {result.foundedDate}
            </p>
            <p>
              <strong>CNAE:</strong> {result.cnae.description}
            </p>
            <p>
              <strong>Address:</strong> {result.address.street},{' '}
              {result.address.city}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
