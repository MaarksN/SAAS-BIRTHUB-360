import React from 'react';

export function Card({ children, className }: any) {
  return <div className={`bg-white shadow rounded-lg border ${className || ''}`}>{children}</div>;
}

export function CardHeader({ children, className }: any) {
  return <div className={`px-6 py-4 border-b ${className || ''}`}>{children}</div>;
}

export function CardTitle({ children, className }: any) {
  return <h3 className={`text-lg font-medium leading-6 text-gray-900 ${className || ''}`}>{children}</h3>;
}

export function CardContent({ children, className }: any) {
  return <div className={`p-6 ${className || ''}`}>{children}</div>;
}
