import React, { ReactNode } from 'react';
import { tokens } from '../tokens';

interface DashboardShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, sidebar, header }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: tokens.colors.background }}>
      {sidebar && (
        <aside style={{
          width: '250px',
          borderRight: `1px solid ${tokens.colors.border}`,
          padding: tokens.spacing.md
        }}>
          {sidebar}
        </aside>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {header && (
          <header style={{
            height: '60px',
            borderBottom: `1px solid ${tokens.colors.border}`,
            padding: tokens.spacing.md,
            display: 'flex',
            alignItems: 'center'
          }}>
            {header}
          </header>
        )}
        <main style={{ flex: 1, padding: tokens.spacing.lg }}>
          {children}
        </main>
      </div>
    </div>
  );
};
