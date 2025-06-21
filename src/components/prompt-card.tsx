'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  WandSparkles,
  Trash2,
  Timer,
  FileText,
  Cpu,
  Loader2,
  Copy,
} from 'lucide-react';
import type { Prompt } from '@/lib/types';
import type { PromptOptimizerOutput } from '@/ai/flows/prompt-optimizer';
import { runPromptAction, optimizePromptAction } from '@/app/actions';

interface PromptCardProps {
  promptData: Prompt;
  onUpdate: (id: number, data: Partial<Prompt>) => void;
  onDelete: (id: number) => void;
  index: number;
  model: string;
}

function Metric({
  icon,
  value,
  label,
  unit,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  unit?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {icon}
            <span className="font-mono">
              {value}
              {unit}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PromptCard({
  promptData,
  onUpdate,
  onDelete,
  index,
  model,
}: PromptCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<PromptOptimizerOutput | null>(null);
  const [isOptimizeOpen, setOptimizeOpen] = useState(false);
  const { toast } = useToast();

  const handleRun = async () => {
    if (!promptData.prompt) {
      toast({
        title: 'Empty Prompt',
        description: 'Please enter a prompt before running.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await runPromptAction(promptData.prompt, model);
      onUpdate(promptData.id, { result });
    } catch (error) {
      console.error('Error running prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a result from the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!promptData.prompt) {
      toast({
        title: 'Empty Prompt',
        description: 'Please enter a prompt to optimize.',
        variant: 'destructive',
      });
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await optimizePromptAction(promptData.prompt, model);
      setOptimization(result);
      setOptimizeOpen(true);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to optimize the prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (optimization) {
      onUpdate(promptData.id, { prompt: optimization.optimizedPrompt });
      setOptimizeOpen(false);
      toast({
        title: 'Prompt Updated',
        description: 'The optimized prompt has been applied.',
      });
    }
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: `${type} has been copied.`,
    });
  };

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-headline text-lg">
            Variation {index + 1}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(promptData.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Variation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`prompt-${promptData.id}`}>Prompt</Label>
            <Textarea
              id={`prompt-${promptData.id}`}
              placeholder="Enter your prompt here..."
              value={promptData.prompt}
              onChange={e => onUpdate(promptData.id, { prompt: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRun} disabled={isLoading || isOptimizing} className="w-full bg-primary/80 hover:bg-primary text-primary-foreground">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Play />
              )}
              Run
            </Button>
            <Button
              onClick={handleOptimize}
              disabled={isLoading || isOptimizing}
              variant="outline"
              className="w-full"
            >
              {isOptimizing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <WandSparkles />
              )}
              Optimize
            </Button>
          </div>
          <Separator />
          <div className="grid flex-1 gap-2">
            <Label>Result</Label>
            <div className="relative min-h-[100px] w-full rounded-md border bg-muted/50 p-3 text-sm">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              ) : promptData.result ? (
                <>
                  <p className="whitespace-pre-wrap">{promptData.result.result}</p>
                   <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 text-muted-foreground opacity-50 transition-opacity hover:opacity-100"
                      onClick={() => handleCopyToClipboard(promptData.result?.result || '', 'Result')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Click &quot;Run&quot; to see the result.
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex h-14 items-center justify-between gap-4 rounded-b-lg bg-muted/30 px-6 py-2">
          {promptData.result ? (
            <>
              <Metric
                icon={<FileText className="h-4 w-4 text-accent" />}
                value={promptData.result.length}
                label="Length (chars)"
              />
              <Metric
                icon={<Timer className="h-4 w-4 text-accent" />}
                value={promptData.result.latency}
                label="Latency"
                unit="ms"
              />
              <Metric
                icon={<Cpu className="h-4 w-4 text-accent" />}
                value={promptData.result.tokenUsage}
                label="Tokens Used"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xl">{promptData.result.quality}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quality Score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Metrics will appear here.
            </span>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isOptimizeOpen} onOpenChange={setOptimizeOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Prompt Optimizer</DialogTitle>
            <DialogDescription>
              The AI has suggested the following improvements. You can apply them or close this dialog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label>Explanation</Label>
              <p className="text-sm text-muted-foreground rounded-md border p-3 bg-muted/50">
                {optimization?.explanation}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Optimized Prompt</Label>
              <div className="relative rounded-md border p-3 bg-muted/50">
                 <p className="text-sm whitespace-pre-wrap font-code">{optimization?.optimizedPrompt}</p>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-muted-foreground opacity-50 transition-opacity hover:opacity-100"
                    onClick={() => handleCopyToClipboard(optimization?.optimizedPrompt || '', 'Optimized prompt')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleApplyOptimization}>
              Apply & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
