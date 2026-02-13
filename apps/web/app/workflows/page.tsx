import { RuleBuilder } from '@/components/workflows/rule-builder';

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-100">Workflows</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RuleBuilder />
        <div className="text-slate-400 text-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Active Rules</h3>
            <p>No active rules found.</p>
        </div>
      </div>
    </div>
  );
}
