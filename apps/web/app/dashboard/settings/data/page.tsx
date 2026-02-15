'use client';

import { Card, CardContent,CardHeader, CardTitle } from '@salesos/ui';
import { Button } from '@salesos/ui';
import { Download, FileText,Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DataSettingsPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportType, setExportType] = useState<'leads' | 'deals'>('leads');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const handleExport = () => {
    const url = `/api/data/export?type=${exportType}&format=${exportFormat}`;
    window.open(url, '_blank');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('type', 'leads'); // Only leads supported for now

    try {
      const res = await fetch('/api/data/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${data.imported} records with ${data.errors} errors.`);
        setImportFile(null);
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (err) {
      toast.error('Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Export your data or migrate from other platforms.
        </p>
      </div>

      <div className="flex space-x-4 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 pb-2 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Export Data
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 pb-2 text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Import Data
        </button>
      </div>

      {activeTab === 'export' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="size-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Data Type</label>
                <select
                  className="w-full rounded-md border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as 'leads' | 'deals')}
                >
                  <option value="leads">Leads</option>
                  <option value="deals">Deals</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Format</label>
                <select
                  className="w-full rounded-md border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                >
                  <option value="csv">CSV (Excel)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleExport} className="w-full md:w-auto">
                <Download className="mr-2 size-4" />
                Download Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              Import Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">Supported Format (CSV):</p>
              <p>email, name, phone, company, status, score</p>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              <div className="relative cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-2">
                  <FileText className="size-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {importFile ? importFile.name : 'Click to upload CSV or JSON'}
                  </span>
                </div>
              </div>

              <Button type="submit" disabled={!importFile || importLoading} className="w-full md:w-auto">
                {importLoading ? 'Importing...' : 'Start Import'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
