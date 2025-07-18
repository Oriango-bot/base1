
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Loader2, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { createApiKeyAction } from '@/app/actions';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';

const availableScopes = [
    { id: 'forms:read', label: 'Read Forms' },
    { id: 'forms:write', label: 'Create Forms' },
    { id: 'loans:read', label: 'Read Loans' },
    { id: 'loans:write', label: 'Create Loans' },
];

const apiKeySchema = z.object({
  partnerName: z.string().min(3, 'Partner name is required.'),
  partnerId: z.coerce.number().int().positive('Partner ID must be a positive integer.'),
  scopes: z.array(z.string()).refine(value => value.length > 0, {
    message: 'At least one scope must be selected.',
  }),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

interface CreateApiKeyDialogProps {
  onKeyCreated: () => void;
  nextPartnerId: number;
}

export default function CreateApiKeyDialog({ onKeyCreated, nextPartnerId }: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
        partnerName: '',
        partnerId: nextPartnerId,
        scopes: []
    }
  });
  
  // Update default partnerId when the dialog opens or nextPartnerId changes
  useState(() => {
    form.reset({
        partnerName: '',
        partnerId: nextPartnerId,
        scopes: []
    });
  });

  const onSubmit = async (data: ApiKeyFormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('partnerName', data.partnerName);
    formData.append('partnerId', String(data.partnerId));
    data.scopes.forEach(scope => formData.append('scopes', scope));

    const result = await createApiKeyAction(formData);
    setIsLoading(false);

    if (result.success && result.newKey) {
        setNewKey(result.newKey);
        setShowKeyDialog(true);
        form.reset();
        setOpen(false);
        onKeyCreated();
    } else {
        toast({
            variant: 'destructive',
            title: 'Failed to Create Key',
            description: result.error || 'An unknown error occurred.',
        });
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
        navigator.clipboard.writeText(newKey);
        toast({ title: 'Copied!', description: 'API Key copied to clipboard.' });
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a key for a new partner to access the API. The next available Partner ID has been pre-filled.
                  </DialogDescription>
                </DialogHeader>

                <FormField
                  control={form.control}
                  name="partnerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., M-Kopa Solar" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner ID</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 26" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scopes"
                  render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Scopes</FormLabel>
                            <p className="text-sm text-muted-foreground">Assign permissions for this key.</p>
                        </div>
                        {availableScopes.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="scopes"
                            render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== item.id
                                            )
                                        )
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                            )}
                            />
                        ))}
                        <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Key
                    </Button>
                </DialogFooter>
              </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API Key Generated Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              This is the only time you will see this key. Please copy it and store it securely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative rounded-md bg-muted p-4 font-mono text-sm break-all">
            {newKey}
            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8" onClick={copyToClipboard}>
                <Copy className="h-4 w-4"/>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowKeyDialog(false)}>I have copied the key</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
