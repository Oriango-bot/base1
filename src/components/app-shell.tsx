
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Users, Landmark, CircleUser, UserCog, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      const publicPages = ['/', '/login', '/signup'];
      if (!publicPages.includes(pathname)) {
        router.push('/login');
      }
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    router.push('/login');
  };

  const publicPages = ['/', '/login', '/signup'];
  if (publicPages.includes(pathname) && !user) {
    return <>{children}</>;
  }
  
  if (loading || !user) {
     return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
     )
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['user'] },
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck, roles: ['admin'] },
    { href: '/super-admin/dashboard', label: 'SA Dashboard', icon: ShieldCheck, roles: ['super-admin'] },
    // Corrected link to point to `/borrowers` as per directory structure
    { href: '/borrowers', label: 'Users', icon: Users, roles: ['admin', 'super-admin'] },
    { href: '/super-admin/users', label: 'Manage Roles', icon: UserCog, roles: ['super-admin'] },
    { href: '/loans', label: 'All Loans', icon: Landmark, roles: ['admin', 'super-admin'] },
  ];

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'User Dashboard';
    if (pathname === '/admin/dashboard') return 'Admin Dashboard';
    if (pathname === '/super-admin/dashboard') return 'Super Admin Dashboard';
    if (pathname.startsWith('/borrowers/')) return 'User Details';
    if (pathname.startsWith('/borrowers')) return 'All Users';
    if (pathname.startsWith('/loans/')) return 'Loan Details';
    if (pathname.startsWith('/loans')) return 'All Loans';
    if (pathname.startsWith('/super-admin/users')) return 'Manage User Roles';
    return 'Oriango';
  }
  
  const isActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5 text-primary">
            <Landmark className="h-7 w-7" />
            <span className="text-xl font-semibold tracking-tighter">Oriango</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {userNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton isActive={isActive(item.href)} asChild>
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <CircleUser className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;
