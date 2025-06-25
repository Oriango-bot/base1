'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAiSummary } from '@/app/actions';
import type { Loan } from '@/lib/types';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AiSummaryDialog({ loan }: { loan: Loan }) {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    const result = await getAiSummary(loan);
    setIsLoading(false);
    
    if (result.summary) {
      setSummary(result.summary);
      setIsDialogOpen(true);
    } else if (result.error) {
      setError(result.error);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleGenerateSummary} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        AI Summary
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {error ? 'Error' : 'AI Loan Summary'}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {error ? error : summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
