'use client';

import { useState } from 'react';
import { createCampaign } from '@/actions/campaigns';
import { EmailEditor } from './email-editor';
import { Button } from '@salesos/ui';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Placeholder imports or use real ones if available

// Simple Wizard State
type Step = 'DETAILS' | 'AUDIENCE' | 'CONTENT' | 'REVIEW';

export function CampaignWizard() {
  const [step, setStep] = useState<Step>('DETAILS');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    audienceId: ''
  });

  const handleNext = () => {
    if (step === 'DETAILS') setStep('AUDIENCE');
    else if (step === 'AUDIENCE') setStep('CONTENT');
    else if (step === 'CONTENT') setStep('REVIEW');
  };

  const handleBack = () => {
    if (step === 'REVIEW') setStep('CONTENT');
    else if (step === 'CONTENT') setStep('AUDIENCE');
    else if (step === 'AUDIENCE') setStep('DETAILS');
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Create New Campaign</h2>
        <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 'DETAILS' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Details</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 'AUDIENCE' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Audience</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 'CONTENT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Content</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 'REVIEW' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>4. Review</span>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6 space-y-6">
            {/* Step 1: Details */}
            {step === 'DETAILS' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Campaign Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Q4 Outreach - CFOs"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Subject Line</label>
                        <Input
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            placeholder="Quick question about {{companyName}}"
                        />
                        <p className="text-xs text-slate-500 mt-1">Tip: Use variables like {'{{firstName}}'} to personalize.</p>
                    </div>
                </div>
            )}

            {/* Step 2: Audience (Mock) */}
            {step === 'AUDIENCE' && (
                <div className="space-y-4">
                    <p className="text-slate-400">Select target audience from your lists.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-700 p-4 rounded hover:border-indigo-500 cursor-pointer bg-slate-800/50">
                            <h4 className="font-bold text-slate-200">All Leads</h4>
                            <p className="text-sm text-slate-500">1,240 contacts</p>
                        </div>
                        <div className="border border-slate-700 p-4 rounded hover:border-indigo-500 cursor-pointer bg-slate-800/50">
                            <h4 className="font-bold text-slate-200">SaaS CEOs</h4>
                            <p className="text-sm text-slate-500">320 contacts</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Content (Editor) */}
            {step === 'CONTENT' && (
                <div className="space-y-4">
                     <label className="block text-sm font-medium text-slate-300 mb-1">Email Body</label>
                     <EmailEditor
                        value={formData.content}
                        onChange={(value) => setFormData({...formData, content: value})}
                     />
                </div>
            )}

            {/* Step 4: Review */}
            {step === 'REVIEW' && (
                <div className="space-y-4 text-slate-300">
                    <h3 className="text-xl font-bold text-white">Summary</h3>
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Subject:</strong> {formData.subject}</p>
                    <p><strong>Audience:</strong> 320 contacts (Estimated)</p>
                    <div className="border-t border-slate-700 pt-4 mt-4">
                        <h4 className="font-bold text-white mb-2">Preview:</h4>
                        <div className="bg-white text-black p-4 rounded shadow-sm">
                            <p className="mb-2"><strong>Subject:</strong> {formData.subject.replace('{{companyName}}', 'Acme Corp')}</p>
                            <hr className="my-2"/>
                            <div className="whitespace-pre-wrap font-sans text-sm">
                                {formData.content.replace('{{firstName}}', 'John')}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button onClick={handleBack} disabled={step === 'DETAILS'} variant="outline">Back</Button>
        {step !== 'REVIEW' ? (
            <Button onClick={handleNext}>Next Step</Button>
        ) : (
            <form action={createCampaign}>
                <input type="hidden" name="name" value={formData.name} />
                <input type="hidden" name="subject" value={formData.subject} />
                <input type="hidden" name="content" value={formData.content} />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">Launch Campaign 🚀</Button>
            </form>
        )}
      </div>
    </div>
  );
}
