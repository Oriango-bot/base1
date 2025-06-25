'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { HandCoins, Loader2 } from 'lucide-react';
import { recordRepayment } from '@/app/actions';

const repaymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Repayment amount must be positive.' }),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;

export default function RecordRepaymentDialog({ loanId }: { loanId: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentSchema),
  });

  const onSubmit = async (data: RepaymentFormValues) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('loanId', loanId);
    formData.append('amount', data.amount.toString());

    const result = await recordRepayment(formData);
    
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Repayment Recorded',
        description: `Your repayment has been successfully recorded.`,
      });
      reset();
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Recording Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset();
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <HandCoins className="mr-2 h-4 w-4" />
          Record Repayment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Record Repayment</DialogTitle>
            <DialogDescription>
              Enter the amount for the new repayment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (KES)</Label>
              <div className="col-span-3">
                <Input id="amount" type="number" step="0.01" {...register('amount')} disabled={isLoading} />
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Repayment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
