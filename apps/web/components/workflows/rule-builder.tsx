'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent } from '@/components/ui/card';

export function RuleBuilder() {
  const [trigger, setTrigger] = useState('lead.updated');
  const [field, setField] = useState('status');
  const [operator, setOperator] = useState('==');
  const [value, setValue] = useState('QUALIFIED');
  const [action, setAction] = useState('send_email');

  const handleSave = () => {
    // Construct JSON Logic
    const condition = { [operator]: [{ "var": field }, value] };
    console.log('Rule:', { trigger, condition, action });
    // Call Server Action to save
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Create Automation Rule</h3>

            <div className="flex gap-2 items-center">
                <span className="text-slate-400 font-mono">WHEN</span>
                <select className="bg-slate-800 text-white rounded p-2 border border-slate-700" value={trigger} onChange={e => setTrigger(e.target.value)}>
                    <option value="lead.created">Lead Created</option>
                    <option value="lead.updated">Lead Updated</option>
                </select>
            </div>

            <div className="flex gap-2 items-center p-4 bg-slate-800/50 rounded border border-slate-700 border-dashed">
                <span className="text-slate-400 font-mono">IF</span>
                <select className="bg-slate-800 text-white rounded p-2 border border-slate-700" value={field} onChange={e => setField(e.target.value)}>
                    <option value="status">Status</option>
                    <option value="score">Score</option>
                </select>
                <select className="bg-slate-800 text-white rounded p-2 border border-slate-700" value={operator} onChange={e => setOperator(e.target.value)}>
                    <option value="==">Equals</option>
                    <option value=">">Greater Than</option>
                </select>
                <Input className="w-40" value={value} onChange={e => setValue(e.target.value)} />
            </div>

            <div className="flex gap-2 items-center">
                <span className="text-slate-400 font-mono">THEN</span>
                <select className="bg-slate-800 text-white rounded p-2 border border-slate-700" value={action} onChange={e => setAction(e.target.value)}>
                    <option value="send_email">Send Email</option>
                    <option value="add_tag">Add Tag</option>
                    <option value="notify_slack">Notify Slack</option>
                </select>
            </div>

            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 w-full">Save Workflow</Button>
        </CardContent>
    </Card>
  );
}
