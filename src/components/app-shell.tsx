

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
import { Home, Users, Landmark, CircleUser, UserCog, LogOut, ShieldCheck, FileKey, KeyRound, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from './ui/skeleton';
import Footer from './footer';
import { OriangoLogo } from './oriango-logo';
import { useAuth } from '@/hooks/use-auth';
import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementBanner from './announcement-banner';
import { ThemeSwitch } from './theme-switch';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const publicPages = ['/login', '/signup', '/admin/login', '/admin/signup', '/forgot-password'];
  const landingPage = pathname === '/';

  const isPublicPage = publicPages.includes(pathname);
  const isAuthPage = isPublicPage && !landingPage; // Login, signup, etc.

  if (isAuthPage) {
    return <>{children}</>;
  }

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
    if (pathname.startsWith('/about')) return 'About Us';
    return 'Oriango';
  }

  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <OriangoLogo className="h-20 w-20 text-primary" />
          </motion.div>
        </div>
     )
  }

  if (!user && !landingPage) {
    return (
        <div className="flex flex-col min-h-dvh bg-background">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <Link href="/" className="flex items-center justify-center gap-2">
                    <OriangoLogo className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Oriango</span>
                </Link>
                <nav className="ml-auto flex gap-2">
                    <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
                    <Button asChild><Link href="/signup">Sign Up</Link></Button>
                </nav>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
        </div>
    );
  }

  if (landingPage) {
     return (
      <div className="flex flex-col min-h-dvh bg-background">
        <AnnouncementBanner />
        <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <Link href="/" className="flex items-center justify-center gap-2">
            <OriangoLogo className="h-6 w-6 text-primary" />
            <span className="font-semibold">Oriango</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <ThemeSwitch />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="grid gap-6 text-lg font-medium mt-6">
                  <Link href="/login" className="hover:text-primary transition-colors">User Login</Link>
                  <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
                  <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                  <Link href="/#how-it-works" className="hover:text-primary transition-colors">How to Apply</Link>
                  <Link href="/#calculator" className="hover:text-primary transition-colors">Eligibility Calculator</Link>
                  <Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </header>
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
      </div>
    );
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['user'] },
    { href: '/profile', label: 'My Profile', icon: CircleUser, roles: ['user'] },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['user'] },
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck, roles: ['admin'] },
    { href: '/super-admin/dashboard', label: 'SA Dashboard', icon: ShieldCheck, roles: ['super-admin'] },
    { href: '/borrowers', label: 'Users', icon: Users, roles: ['admin', 'super-admin'] },
    { href: '/super-admin/users', label: 'Manage Roles', icon: UserCog, roles: ['super-admin'] },
    { href: '/loans', label: 'All Loans', icon: Landmark, roles: ['admin', 'super-admin'] },
    { href: '/admin/form-series', label: 'Form Series', icon: FileKey, roles: ['admin', 'super-admin'] },
    { href: '/super-admin/api-keys', label: 'API Keys', icon: KeyRound, roles: ['super-admin'] },
  ];

  const userNavItems = navItems.filter(item => user && item.roles.includes(user.role));

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
           <div className="flex items-center gap-2">
            <ThemeSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <CircleUser className="h-6 w-6" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
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
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;



