
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateLoanStatus } from '@/app/actions';
import type { Loan, User, LoanStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function UpdateLoanStatus({ loan }: { loan: Loan }) {
  const [newStatus, setNewStatus] = useState<LoanStatus>(loan.status);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleStatusUpdate = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    if (newStatus === loan.status) {
      toast({ variant: 'destructive', title: 'No Change', description: 'Please select a different status.' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('loanId', loan.id);
    formData.append('newStatus', newStatus);
    formData.append('adminId', currentUser.id);

    const result = await updateLoanStatus(formData);
    setIsLoading(false);

    if (result.success) {
      toast({ title: 'Status Updated', description: `Loan status changed to ${newStatus}.` });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
    }
  };
  
  const availableStatuses: LoanStatus[] = ['pending', 'approved', 'rejected', 'active', 'paid'];
  
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'super-admin') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Loan Status</CardTitle>
        <CardDescription>Only admins can perform this action.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={newStatus} onValueChange={(value) => setNewStatus(value as LoanStatus)}>
          <SelectTrigger disabled={isLoading}>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
                <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleStatusUpdate} disabled={isLoading || newStatus === loan.status} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
        </Button>
      </CardContent>
    </Card>
  );
}
