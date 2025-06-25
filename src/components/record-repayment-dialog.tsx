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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { HandCoins } from 'lucide-react';

const repaymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Repayment amount must be positive.' }),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;

export default function RecordRepaymentDialog({ loanId }: { loanId: string }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentSchema),
  });

  const onSubmit = (data: RepaymentFormValues) => {
    console.log('New Repayment:', { ...data, loanId });
    toast({
      title: 'Repayment Recorded',
      description: `A repayment of ${data.amount} has been recorded.`,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Label htmlFor="amount" className="text-right">Amount ($)</Label>
              <div className="col-span-3">
                <Input id="amount" type="number" step="0.01" {...register('amount')} />
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Repayment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
