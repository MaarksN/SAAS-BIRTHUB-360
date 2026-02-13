'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DialerModal({ lead, onClose }: { lead: any, onClose: () => void }) {
  const [status, setStatus] = useState<'IDLE' | 'DIALING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [duration, setDuration] = useState(0);

  const handleCall = () => {
    setStatus('DIALING');
    // Simulate connection
    setTimeout(() => {
        setStatus('CONNECTED');
    }, 1500);
  };

  const handleHangup = () => {
    setStatus('ENDED');
    // Save call log
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-96 bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-slate-100">Calling {lead.name}...</CardTitle>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 animate-pulse">
                <span className="text-3xl">👤</span>
            </div>

            <div className="text-center">
                <div className="text-xl font-bold text-white">{lead.phone}</div>
                <div className="text-sm text-slate-400 uppercase tracking-widest mt-2">{status}</div>
                {status === 'CONNECTED' && <div className="text-emerald-400 font-mono mt-1">00:12</div>}
            </div>

            <div className="flex gap-4 w-full">
                {status === 'IDLE' ? (
                    <Button onClick={handleCall} className="w-full bg-emerald-600 hover:bg-emerald-500">Call</Button>
                ) : (
                    <Button onClick={handleHangup} className="w-full bg-red-600 hover:bg-red-500">Hang Up</Button>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
