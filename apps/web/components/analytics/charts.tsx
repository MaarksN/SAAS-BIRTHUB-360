'use client';

// Simple CSS Bar Chart to avoid heavy deps
export function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1); // Avoid div by zero

  return (
    <div className="flex items-end gap-4 h-64 border-b border-slate-700 pb-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full flex justify-end flex-col items-center h-full">
                <div
                    className={`w-full rounded-t-md transition-all duration-500 ${d.color} opacity-80 group-hover:opacity-100`}
                    style={{ height: `${(d.value / max) * 100}%` }}
                >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.value}
                    </span>
                </div>
            </div>
            <span className="text-xs text-slate-400 mt-2 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function StatCard({ title, value, subtext }: { title: string, value: string | number, subtext?: string }) {
    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{value}</span>
                {subtext && <span className="text-xs text-emerald-400">{subtext}</span>}
            </div>
        </div>
    );
}
