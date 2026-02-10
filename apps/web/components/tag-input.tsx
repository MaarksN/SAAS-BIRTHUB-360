'use client';

import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = "Add tag..." }: TagInputProps) {
  const [tagInput, setTagInput] = useState('');

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault(); // Evita submit do form se estiver dentro de um

      // Evita duplicatas
      if (!tags.includes(tagInput.trim())) {
        onChange([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleTagKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}
