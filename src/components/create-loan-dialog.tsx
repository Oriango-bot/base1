
'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { createLoan } from '@/app/actions';
import type { User } from '@/lib/types';

const loanSchema = z.object({
  formNumber: z.string().min(1, { message: 'Form number is required.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  interestRate: z.coerce.number().min(0).max(100, { message: 'Interest rate must be between 0 and 100.' }),
  repaymentSchedule: z.enum(['weekly', 'monthly']),
});

type LoanFormValues = z.infer<typeof loanSchema>;

export default function CreateLoanDialog({ borrowerId }: { borrowerId: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [open]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      repaymentSchedule: 'monthly',
      formNumber: '',
    },
  });

  const onSubmit = async (data: LoanFormValues) => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a loan.' });
      return;
    }
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('formNumber', data.formNumber);
    formData.append('amount', data.amount.toString());
    formData.append('interestRate', data.interestRate.toString());
    formData.append('repaymentSchedule', data.repaymentSchedule);
    formData.append('borrowerId', borrowerId);
    formData.append('createdBy', currentUser.id);

    const result = await createLoan(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Loan Application Submitted',
        description: `The application for ${data.formNumber} is now pending review.`,
      });
      reset();
      setOpen(false);
      router.refresh(); // Refresh the page to show the new loan
    } else {
       toast({
        variant: 'destructive',
        title: 'Application Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Apply for Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>New Loan Application</DialogTitle>
            <DialogDescription>
              Enter the details for the new loan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formNumber" className="text-right">Form No.</Label>
              <div className="col-span-3">
                <Input id="formNumber" {...register('formNumber')} />
                {errors.formNumber && <p className="text-destructive text-xs mt-1">{errors.formNumber.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount ($)</Label>
              <div className="col-span-3">
                <Input id="amount" type="number" step="0.01" {...register('amount')} />
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">Interest (%)</Label>
              <div className="col-span-3">
                <Input id="interestRate" type="number" {...register('interestRate')} />
                {errors.interestRate && <p className="text-destructive text-xs mt-1">{errors.interestRate.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repaymentSchedule" className="text-right">Schedule</Label>
              <Controller
                name="repaymentSchedule"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
