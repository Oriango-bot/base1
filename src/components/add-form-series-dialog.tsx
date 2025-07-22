
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { createFormSeries, getNextPartnerId } from '@/app/actions';
import type { User } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const seriesSchema = z.object({
  prefix: z.string().min(1, 'Prefix is required'),
  start_number: z.coerce.number().int().min(0, 'Start number must be non-negative'),
  end_number: z.coerce.number().int().positive('End number must be positive'),
  partner_id: z.coerce.number().int().positive('Partner ID must be a positive number'),
}).refine(data => data.end_number > data.start_number, {
    message: "End number must be greater than start number",
    path: ["end_number"],
});

type SeriesFormValues = z.infer<typeof seriesSchema>;

interface AddFormSeriesDialogProps {
  onSeriesAdded: () => void;
}

export default function AddFormSeriesDialog({ onSeriesAdded }: AddFormSeriesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingId, setIsFetchingId] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (open) {
      setIsFetchingId(true);
      getNextPartnerId()
        .then(id => {
          setValue('partner_id', id);
        })
        .catch(() => {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch the next partner ID.' });
        })
        .finally(() => setIsFetchingId(false));
    }
  }, [open, setValue]);

  const onSubmit = async (data: SeriesFormValues) => {
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('prefix', data.prefix);
    formData.append('start_number', String(data.start_number));
    formData.append('end_number', String(data.end_number));
    formData.append('partner_id', String(data.partner_id));
    formData.append('created_by', currentUser.id);

    const result = await createFormSeries(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Form Series Created',
        description: `The new series with prefix "${data.prefix}" has been added.`,
      });
      reset();
      setOpen(false);
      onSeriesAdded();
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to Create Series',
        description: result.error,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Series
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Form Series</DialogTitle>
            <DialogDescription>
              Define a new validation rule for form numbers. The partner ID is auto-generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prefix" className="text-right">Prefix</Label>
              <div className="col-span-3">
                <Input id="prefix" {...register('prefix')} disabled={isLoading} />
                {errors.prefix && <p className="text-destructive text-xs mt-1">{errors.prefix.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partner_id" className="text-right">Partner ID</Label>
              <div className="col-span-3">
                {isFetchingId ? <Skeleton className="h-10 w-full" /> : 
                    <Input id="partner_id" type="number" {...register('partner_id')} disabled={true} />
                }
                {errors.partner_id && <p className="text-destructive text-xs mt-1">{errors.partner_id.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_number" className="text-right">Start #</Label>
              <div className="col-span-3">
                <Input id="start_number" type="number" {...register('start_number')} disabled={isLoading} />
                {errors.start_number && <p className="text-destructive text-xs mt-1">{errors.start_number.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_number" className="text-right">End #</Label>
              <div className="col-span-3">
                <Input id="end_number" type="number" {...register('end_number')} disabled={isLoading} />
                {errors.end_number && <p className="text-destructive text-xs mt-1">{errors.end_number.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Series
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
