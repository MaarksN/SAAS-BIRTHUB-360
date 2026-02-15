// Placeholder for UI components referenced in page
// In a real repo, these would be in components/ui

import React from 'react';

export function Card({ children, className }: any) {
  return <div className={`bg-white shadow rounded-lg border ${className}`}>{children}</div>;
}

export function CardHeader({ children }: any) {
  return <div className="px-6 py-4 border-b">{children}</div>;
}

export function CardTitle({ children }: any) {
  return <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>;
}

export function CardContent({ children }: any) {
  return <div className="p-6">{children}</div>;
}

export function Badge({ children, variant, className }: any) {
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>{children}</span>;
}

export function Table({ children }: any) {
    return <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-300">{children}</table></div>;
}

export function TableHeader({ children }: any) {
    return <thead className="bg-gray-50">{children}</thead>;
}

export function TableBody({ children }: any) {
    return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>;
}

export function TableRow({ children }: any) {
    return <tr>{children}</tr>;
}

export function TableHead({ children }: any) {
    return <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{children}</th>;
}

export function TableCell({ children, className }: any) {
    return <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${className}`}>{children}</td>;
}
