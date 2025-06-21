'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';
import type { Prompt } from '@/lib/types';
import { Download, PlusIcon, Bot, BarChart2, LayoutGrid, LineChart as LineChartIcon, Radar as RadarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis, Line, LineChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const initialPrompts: Prompt[] = [
  {
    id: 1,
    prompt: 'Write a short, upbeat marketing slogan for a new brand of coffee called "Morning Star".',
    evaluationCriteria: 'Is it catchy? Is it under 10 words?',
    result: null,
    model: 'gemini-1.5-flash',
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
  qualityScore: {
    label: 'Quality Score',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;


export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const nextId = useRef(initialPrompts.length + 1);
  const [activeChart, setActiveChart] = useState<'bar' | 'line' | 'radar'>('bar');
  const [selectedMetrics, setSelectedMetrics] = useState<(keyof typeof chartConfig)[]>(['latency', 'length', 'qualityScore']);

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
        qualityScore: item.prompt.result!.quality?.score ?? 0,
      }));
  }, [prompts]);

  const addPrompt = useCallback(() => {
    setPrompts(prev => [
      ...prev,
      {
        id: nextId.current++,
        prompt: '',
        evaluationCriteria: '',
        result: null,
        model: 'gemini-1.5-flash',
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
      'evaluation_criteria',
      'model',
      'result',
      'quality_score',
      'quality_explanation',
      'length',
      'latency_ms',
      'tokens',
    ];
    const rows = prompts.map(p =>
      [
        p.id,
        `"${p.prompt.replace(/"/g, '""')}"`,
        `"${p.evaluationCriteria.replace(/"/g, '""')}"`,
        p.model,
        `"${p.result?.result.replace(/"/g, '""') ?? ''}"`,
        p.result?.quality?.score ?? '',
        `"${p.result?.quality?.explanation.replace(/"/g, '""') ?? ''}"`,
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
            <Button onClick={addPrompt}>
              <PlusIcon />
              Add Prompt
            </Button>
            <Button onClick={handleExport} variant="outline" disabled={prompts.length === 0}>
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Analytics Overview</CardTitle>
                            <CardDescription>
                            Use the controls to toggle metrics and chart types.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 text-sm">
                                {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`metric-${key}`}
                                            checked={selectedMetrics.includes(key)}
                                            onCheckedChange={(checked) => {
                                                setSelectedMetrics(prev => 
                                                    checked ? [...prev, key] : prev.filter((m) => m !== key)
                                                )
                                            }}
                                        />
                                        <Label htmlFor={`metric-${key}`} className="capitalize flex items-center gap-1.5 cursor-pointer">
                                            <span style={{ backgroundColor: chartConfig[key].color }} className="w-2.5 h-2.5 rounded-full inline-block" />
                                            {chartConfig[key].label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <ToggleGroup type="single" value={activeChart} onValueChange={(value: 'bar' | 'line' | 'radar' | '') => { if (value) setActiveChart(value) }} aria-label="Chart type" variant="outline" size="sm">
                                <ToggleGroupItem value="bar" aria-label="Bar chart">
                                    <BarChart2 className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="line" aria-label="Line chart">
                                    <LineChartIcon className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="radar" aria-label="Radar chart">
                                    <RadarIcon className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[450px] w-full">
                    {activeChart === 'bar' && (
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Legend />
                            {selectedMetrics.map(metric => (
                                <Bar key={metric} dataKey={metric} fill={`var(--color-${metric})`} radius={4} />
                            ))}
                        </BarChart>
                    )}
                    {activeChart === 'line' && (
                        <LineChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Legend />
                             {selectedMetrics.map(metric => (
                                <Line key={metric} type="monotone" dataKey={metric} stroke={`var(--color-${metric})`} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            ))}
                        </LineChart>
                    )}
                    {activeChart === 'radar' && (
                        <RadarChart data={chartData}>
                            <CartesianGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Legend />
                            {selectedMetrics.map(metric => (
                                <RechartsRadar key={metric} name={chartConfig[metric].label} dataKey={metric} stroke={`var(--color-${metric})`} fill={`var(--color-${metric})`} fillOpacity={0.6} />
                            ))}
                        </RadarChart>
                    )}
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
