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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { updateUserRole } from '@/app/actions';

async function getUsers(): Promise<User[]> {
    'use server';
    const { default: clientPromise } = await import('@/lib/mongodb');
    const client = await clientPromise;
    const db = client.db('oriango');
    const users = await db.collection('users').find({}).toArray();
    return users.map(user => ({
        ...user,
        id: user._id.toString(),
        // Make sure all required fields are present
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        joinDate: user.joinDate || '',
        role: user.role || 'user',
    })) as User[];
}


export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    getUsers().then(setUsers);
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
            {users.map((user) => (
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
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
