
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteApiKey } from '@/app/actions';
import type { ApiKey } from '@/lib/types';

interface DeleteApiKeyDialogProps {
  apiKey: ApiKey;
  onKeyDeleted: () => void;
}

export default function DeleteApiKeyDialog({ apiKey, onKeyDeleted }: DeleteApiKeyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteApiKey(apiKey.id);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'API Key Deleted',
        description: `The key for ${apiKey.partnerName} has been permanently removed.`,
      });
      onKeyDeleted();
    } else {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the API key for{' '}
            <span className="font-semibold">{apiKey.partnerName}</span> and revoke all access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, delete key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
