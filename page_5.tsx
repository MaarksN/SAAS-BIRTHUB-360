'use client';

import React from 'react';
import { Card } from '@salesos/ui';
import {
  Shield, Key, Globe, Users, FileText, Lock,
  Activity, Eye, Download, Palette
} from 'lucide-react';

const SETTINGS = [
    { id: 81, name: 'SSO / SAML', icon: Key, color: 'blue', desc: 'Manage Identity Providers' },
    { id: 82, name: 'Audit Logs', icon: FileText, color: 'slate', desc: 'Track all activity' },
    { id: 83, name: 'Role Manager', icon: Users, color: 'purple', desc: 'RBAC Configuration' },
    { id: 84, name: 'Data Residency', icon: Globe, color: 'green', desc: 'US / EU / BR Regions' },
    { id: 85, name: 'API Keys', icon: Lock, color: 'amber', desc: 'Developer Access' },
    { id: 86, name: 'IP Whitelist', icon: Shield, color: 'red', desc: 'Network Security' },
    { id: 87, name: 'Active Sessions', icon: Activity, color: 'cyan', desc: 'Kill Suspicious Logins' },
    { id: 88, name: 'Compliance Export', icon: Download, color: 'indigo', desc: 'GDPR / LGPD Data' },
    { id: 89, name: '2FA Enforcement', icon: Eye, color: 'orange', desc: 'Require MFA for all' },
    { id: 90, name: 'White Label', icon: Palette, color: 'pink', desc: 'Custom Branding' },
];

export default function EnterpriseSettingsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-500">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-white">
                ENTERPRISE <span className="text-slate-500">ADMIN</span>
            </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {SETTINGS.map((tool) => (
            <Card key={tool.id} className="bg-slate-800/50 border-slate-700 p-6 flex flex-col gap-4 hover:border-slate-500 transition-colors cursor-pointer group">
                <div className={`w-12 h-12 rounded-2xl bg-${tool.color}-500/20 flex items-center justify-center group-hover:bg-${tool.color}-500/30 transition-colors`}>
                    <tool.icon className={`w-6 h-6 text-${tool.color}-400`} />
                </div>
                <div>
                    <h3 className="font-bold text-white">{tool.name}</h3>
                    <p className="text-xs text-slate-400">{tool.desc}</p>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
