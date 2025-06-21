'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';
import type { Prompt } from '@/lib/types';
import { Download, PlusIcon, Bot, BarChart2, LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';


const initialPrompts: Prompt[] = [
  {
    id: 1,
    prompt: 'Write a short, upbeat marketing slogan for a new brand of coffee called "Morning Star".',
    result: null,
  },
];

const chartConfig = {
  latency: {
    label: 'Latency (ms)',
    color: 'hsl(var(--chart-1))',
  },
  length: {
    label: 'Length (chars)',
    color: 'hsl(var(--chart-2))',
  },
  tokenUsage: {
    label: 'Tokens',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;


export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const nextId = useRef(initialPrompts.length + 1);

  const chartData = useMemo(() => {
    return prompts
      .map((p, index) => ({
        // Map first to get the correct index for all prompts
        prompt: p,
        index: index,
      }))
      .filter(item => item.prompt.result) // Then filter
      .map(item => ({
        name: `Variation ${item.index + 1}`,
        latency: item.prompt.result!.latency,
        length: item.prompt.result!.length,
        tokenUsage: item.prompt.result!.tokenUsage,
      }));
  }, [prompts]);

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
        <Tabs defaultValue="cards" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="cards"><LayoutGrid className="mr-2 h-4 w-4" />Card View</TabsTrigger>
              <TabsTrigger value="analytics" disabled={chartData.length === 0}><BarChart2 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="cards">
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
          </TabsContent>
          <TabsContent value="analytics">
             {chartData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                  <CardDescription>
                    Comparison of performance metrics across all prompt variations with results.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                      <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Legend />
                      <Bar dataKey="latency" fill="var(--color-latency)" radius={4} yAxisId="left" />
                      <Bar dataKey="length" fill="var(--color-length)" radius={4} yAxisId="right" />
                      <Bar dataKey="tokenUsage" fill="var(--color-tokenUsage)" radius={4} yAxisId="left" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ) : (
                 <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border-2 border-dashed">
                    <BarChart2 className="h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-medium text-muted-foreground">No data to display.</h2>
                    <p className="text-muted-foreground">Run some prompts to see analytics here.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
