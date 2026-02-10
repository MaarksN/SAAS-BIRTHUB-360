import * as React from "react";

interface SidebarItem {
  label: string;
  href: string;
  active?: boolean;
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50 min-h-screen p-4">
      <div className="mb-8 px-4 text-xl font-bold text-blue-600">SalesOS</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-md text-sm font-medium ${
              item.active
                ? "bg-blue-100 text-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
