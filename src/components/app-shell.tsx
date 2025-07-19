
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  SidebarFooter as SidebarFooterComponent,
} from '@/components/ui/sidebar';
import { Home, Users, Landmark, CircleUser, UserCog, LogOut, ShieldCheck, FileKey, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import Footer from './footer';
import { OriangoLogo } from './oriango-logo';
import { useAuth } from '@/hooks/use-auth';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const publicPages = ['/', '/login', '/signup', '/terms-of-service', '/privacy-policy', '/admin/login', '/admin/signup', '/about', '/forgot-password'];

  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }
  
  if (loading) {
     return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
     )
  }

  if (!user) {
    return <>{children}</>;
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['user'] },
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck, roles: ['admin'] },
    { href: '/super-admin/dashboard', label: 'SA Dashboard', icon: ShieldCheck, roles: ['super-admin'] },
    { href: '/borrowers', label: 'Users', icon: Users, roles: ['admin', 'super-admin'] },
    { href: '/super-admin/users', label: 'Manage Roles', icon: UserCog, roles: ['super-admin'] },
    { href: '/loans', label: 'All Loans', icon: Landmark, roles: ['admin', 'super-admin'] },
    { href: '/admin/form-series', label: 'Form Series', icon: FileKey, roles: ['admin', 'super-admin'] },
    { href: '/super-admin/api-keys', label: 'API Keys', icon: KeyRound, roles: ['super-admin'] },
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
    if (pathname.startsWith('/super-admin/api-keys')) return 'API Key Management';
    if (pathname.startsWith('/admin/form-series')) return 'Form Series Registry';
    if (pathname.startsWith('/terms-of-service')) return 'Terms of Service';
    if (pathname.startsWith('/privacy-policy')) return 'Privacy Policy';
    if (pathname.startsWith('/profile')) return 'My Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Oriango';
  }
  
  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin/dashboard' || href === '/super-admin/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5">
            <OriangoLogo className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold tracking-tighter text-foreground">Oriango</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {userNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton isActive={isActive(item.href)} asChild>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooterComponent>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooterComponent>
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
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;
