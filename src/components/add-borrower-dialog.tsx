
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
import { PlusCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { addUserByAdmin } from '@/app/actions';

const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  address: z.string().min(5, { message: 'Please enter a valid address.' }),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function AddBorrowerDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    // @ts-ignore
    Object.keys(data).forEach(key => formData.append(key, data[key]));

    const result = await addUserByAdmin(formData);
    setIsLoading(false);

    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Failed to Add User',
            description: result.error,
        });
    } else {
        toast({
          title: "User Added",
          description: `${data.name} has been successfully added.`,
        });
        reset();
        setOpen(false);
        router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Enter the details for the new user. An initial password is required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} disabled={isLoading} />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input id="email" {...register('email')} disabled={isLoading}/>
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3">
                <Input id="password" type="password" {...register('password')} disabled={isLoading} />
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <div className="col-span-3">
                <Input id="phone" {...register('phone')} disabled={isLoading}/>
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <div className="col-span-3">
                <Input id="address" {...register('address')} disabled={isLoading}/>
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
