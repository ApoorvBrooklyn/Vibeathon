'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Import, Bookmark } from 'lucide-react';
import type { SavedPrompt } from '@/lib/types';

interface SavedPromptsSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  prompts: SavedPrompt[];
  onLoad: (prompt: SavedPrompt) => void;
  onDelete: (id: number) => void;
}

export function SavedPromptsSidebar({ isOpen, onOpenChange, prompts, onLoad, onDelete }: SavedPromptsSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Prompt Library</SheetTitle>
          <SheetDescription>
            Manage and load your saved prompts.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {prompts.length > 0 ? (
            <ScrollArea className="h-full pr-4">
              <div className="flex flex-col gap-4 py-4">
                {prompts.map(prompt => (
                  <Card key={prompt.id}>
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">
                        {prompt.prompt || 'Untitled Prompt'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        <strong>Model:</strong> {prompt.model}
                      </p>
                       {prompt.evaluationCriteria && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          <strong>Criteria:</strong> {prompt.evaluationCriteria}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onDelete(prompt.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                      <Button size="sm" onClick={() => onLoad(prompt)}>
                        <Import className="h-4 w-4" />
                        Load
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
              <Bookmark className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Your library is empty</h3>
              <p className="text-sm text-muted-foreground">Save prompts from the main view to add them here.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
