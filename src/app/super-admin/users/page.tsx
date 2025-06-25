
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { updateUserRole, getUsers } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setIsLoading(true);
    getUsers().then(fetchedUsers => {
      setUsers(fetchedUsers);
      setIsLoading(false);
    });
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (currentUser?.id === userId) {
        toast({
            variant: 'destructive',
            title: "Action Forbidden",
            description: "You cannot change your own role.",
        });
        return;
    }

    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate?.role === 'super-admin') {
         toast({
            variant: 'destructive',
            title: "Action Forbidden",
            description: "The super admin role cannot be changed.",
        });
        return;
    }

    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      setUsers(currentUsers =>
        currentUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast({
        title: 'Role Updated',
        description: `User's role has been changed to ${newRole}.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: "Update Failed",
        description: result.error || "Could not update user's role.",
      });
    }
  };

  if (currentUser?.role !== 'super-admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Access Denied. You must be a Super Admin to view this page.</p>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Roles</CardTitle>
        <CardDescription>Assign or change roles for users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead className="text-right">Change Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <>
                    <TableRow>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-28" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-28" /></TableCell>
                    </TableRow>
                </>
            ) : (
                users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                        <Badge variant={user.role === 'super-admin' ? 'default' : (user.role === 'admin' ? 'secondary' : 'outline')}>
                            {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Select
                            defaultValue={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                            disabled={user.id === currentUser?.id || user.role === 'super-admin'}
                        >
                            <SelectTrigger className="w-[120px] ml-auto">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                    </Select>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
