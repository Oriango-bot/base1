
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
import { useToast } from '@/hooks/use-toast';
import { KeySquare, Loader2 } from 'lucide-react';
import { adminUpdatePassword } from '@/app/actions';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ResetPasswordDialogProps {
  targetUserId: string;
  targetUserName: string;
  adminId?: string;
  disabled?: boolean;
}

export default function ResetPasswordDialog({ targetUserId, targetUserName, adminId, disabled = false }: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!adminId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Admin user not found.' });
      return;
    }

    setIsLoading(true);
    const result = await adminUpdatePassword(adminId, targetUserId, data.newPassword);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Password Updated',
        description: `${targetUserName}'s password has been successfully reset.`,
      });
      reset();
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) reset();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" disabled={disabled} aria-label={`Reset password for ${targetUserName}`}>
          <KeySquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-semibold">{targetUserName}</span>. The user will not be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set New Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
