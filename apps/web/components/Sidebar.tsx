import * as React from "react";

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">SalesOS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
          <span className="font-medium">Dashboard</span>
        </a>
        <a href="/leads" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">👥</span>
          <span className="font-medium">Leads</span>
        </a>
        <a href="/campaigns" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">🚀</span>
          <span className="font-medium">Campaigns</span>
        </a>
        <a href="/inbox" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">📬</span>
          <span className="font-medium">Inbox</span>
        </a>
        <a href="/analytics" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">📈</span>
          <span className="font-medium">Analytics</span>
        </a>
        <a href="/workflows" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">⚡</span>
          <span className="font-medium">Workflows</span>
        </a>

        <div className="pt-6 mt-6 border-t border-slate-800">
            <span className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</span>
            <a href="/admin/integrations" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all mt-2 group">
              <span className="text-lg group-hover:scale-110 transition-transform">🔌</span>
              <span className="font-medium">Integrations</span>
            </a>
            <a href="/admin/audit" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group">
              <span className="text-lg group-hover:scale-110 transition-transform">🛡️</span>
              <span className="font-medium">Audit Logs</span>
            </a>
            <a href="/api/user/export" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all group text-slate-400 hover:text-indigo-300">
              <span className="text-lg group-hover:scale-110 transition-transform">📥</span>
              <span className="font-medium">Export Data</span>
            </a>
        </div>
      </nav>

      {/* User Profile Snippet */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
            <div className="text-sm">
                <div className="text-white font-medium">Jules (CTO)</div>
                <div className="text-xs text-slate-500">Pro Plan</div>
            </div>
        </div>
      </div>
    </aside>
  );
};
