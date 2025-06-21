'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';
import type { Prompt } from '@/lib/types';
import { Download, PlusIcon, Bot } from 'lucide-react';

const initialPrompts: Prompt[] = [
  {
    id: 1,
    prompt: 'Write a short, upbeat marketing slogan for a new brand of coffee called "Morning Star".',
    result: null,
  },
];

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const nextId = useRef(initialPrompts.length + 1);

  const addPrompt = useCallback(() => {
    setPrompts(prev => [
      ...prev,
      {
        id: nextId.current++,
        prompt: '',
        result: null,
      },
    ]);
  }, []);

  const updatePrompt = useCallback((id: number, data: Partial<Prompt>) => {
    setPrompts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const deletePrompt = useCallback((id: number) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleExport = useCallback(() => {
    const headers = [
      'id',
      'prompt',
      'result',
      'quality',
      'length',
      'latency_ms',
      'tokens',
    ];
    const rows = prompts.map(p =>
      [
        p.id,
        `"${p.prompt.replace(/"/g, '""')}"`,
        `"${p.result?.result.replace(/"/g, '""') ?? ''}"`,
        p.result?.quality ?? '',
        p.result?.length ?? '',
        p.result?.latency ?? '',
        p.result?.tokenUsage ?? '',
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'prompt_pilot_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [prompts]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-7 w-7 text-primary" />
            <h1 className="font-headline text-2xl font-bold">PromptPilot</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={addPrompt} variant="outline">
              <PlusIcon />
              Add Prompt
            </Button>
            <Button onClick={handleExport} disabled={prompts.length === 0}>
              <Download />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {prompts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {prompts.map((prompt, index) => (
              <PromptCard
                key={prompt.id}
                promptData={prompt}
                onUpdate={updatePrompt}
                onDelete={deletePrompt}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border-2 border-dashed">
            <h2 className="text-xl font-medium text-muted-foreground">No prompts yet.</h2>
            <p className="text-muted-foreground">Click "Add Prompt" to get started.</p>
            <Button onClick={addPrompt} className="mt-4">
               <PlusIcon />
              Add Your First Prompt
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
