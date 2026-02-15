'use client';

import React, { useState, useEffect } from 'react';

export interface Command {
  id: string;
  name: string;
  action: () => void;
}

export const CommandPalette: React.FC<{ commands: Command[] }> = ({ commands }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', paddingTop: '100px'
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px' }}>
        <input
          type="text"
          placeholder="Type a command..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          autoFocus
        />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredCommands.map(cmd => (
            <li
              key={cmd.id}
              onClick={() => { cmd.action(); setIsOpen(false); }}
              style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              {cmd.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
