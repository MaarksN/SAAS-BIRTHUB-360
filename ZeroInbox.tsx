'use client';
import React, { useState } from 'react';

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export const ZeroInbox: React.FC<{ initialTasks: Task[] }> = ({ initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks);

  const completeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  if (tasks.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>🎉 Zero Inbox! You're all caught up.</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3>Tasks ({tasks.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <span>{task.title}</span>
            <button onClick={() => completeTask(task.id)}>Done</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
