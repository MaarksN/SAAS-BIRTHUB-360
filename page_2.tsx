'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@salesos/ui';

export default function BDRDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Outbound Hunter (BDR)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Buying Committee Map</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Visualize account hierarchy.</p>
          </CardContent>
        </Card>
        {/* Placeholder for other 19 tools */}
        <Card>
          <CardHeader>
            <CardTitle>Email Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Real-time verification.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
