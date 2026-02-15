import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { SYSTEM_ADMIN_HEADER } from '../../lib/admin-auth';
import { Users, Flag, FileText, LogOut, ShieldAlert } from 'lucide-react';

export default async function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const isSuperAdmin = headersList.get(SYSTEM_ADMIN_HEADER) === 'true';

  if (!isSuperAdmin) {
    redirect('/system-admin/login');
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            System Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/system-admin/users" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors">
            <Users size={20} />
            Users
          </Link>
          <Link href="/system-admin/feature-flags" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors">
            <Flag size={20} />
            Feature Flags
          </Link>
          <Link href="/system-admin/audit-logs" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors">
            <FileText size={20} />
            Audit Logs
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
           {/* Logout handled client-side but link to api route works if we POST */}
           <form action="/api/system-admin/logout" method="POST">
             <button type="submit" className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-slate-800 rounded text-red-400">
               <LogOut size={20} />
               Logout
             </button>
           </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
