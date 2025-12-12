

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Users,
  Settings,
  FileText,
  Warehouse,
  BarChart3,
  Shield,
  LogOut,
  Building,
  Briefcase,
} from 'lucide-react';
import { useWalkthrough } from '@/hooks/use-walkthrough';
import { useAuth } from '@/components/AuthProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

const menuGroups = [
    {
      title: 'Core',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Accountant', 'Viewer'] },
      ]
    },
    {
      title: 'Operations',
      items: [
        { href: '/inventory', label: 'Inventory', icon: Package, roles: ['Admin', 'Manager', 'Store Clerk'] },
        { href: '/sales', label: 'Sales', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Cashier'] },
        { href: '/purchases', label: 'Purchases', icon: ShoppingBag, roles: ['Admin', 'Manager'] },
      ]
    },
    {
      title: 'Financial',
      items: [
        { href: '/expenses', label: 'Expenses', icon: DollarSign, roles: ['Admin', 'Manager', 'Accountant'] },
        { href: '/accounts', label: 'Accounting', icon: FileText, roles: ['Admin', 'Accountant'] },
        { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Manager', 'Accountant', 'Viewer'] },
      ]
    },
    {
      title: 'Relationships',
      items: [
        { href: '/customers', label: 'Customers', icon: Users, roles: ['Admin', 'Manager', 'Cashier'] },
        { href: '/suppliers', label: 'Suppliers', icon: Warehouse, roles: ['Admin', 'Manager'] },
      ]
    },
    {
      title: 'Human Resources',
      items: [
        { href: '/hr', label: 'HR Dashboard', icon: Briefcase, roles: ['Admin', 'Manager'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { href: '/users', label: 'Team', icon: Shield, roles: ['Admin'] },
        { href: '/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
      ]
    },
  ];

function HelpSection() {
  const { reset } = useWalkthrough();
  return (
    <SidebarMenuButton onClick={reset}>
      Show Walkthrough
    </SidebarMenuButton>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();

  if (!auth) {
    return null; // Or a loading skeleton
  }

  const { userProfile, supabase } = auth;
  const userName = userProfile?.name || userProfile?.email || 'Admin';
  const userRole = userProfile?.role || 'Admin';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.roles.includes(userRole)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-tour-id="sidebar-brand">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">paeasybooks</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{userName}</span>
                <span className="truncate text-xs">{userRole}</span>
              </div>
              <span onClick={handleLogout} className="cursor-pointer">
                <LogOut className="w-4 h-4 ml-auto" />
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <HelpSection />
      </SidebarFooter>
    </Sidebar>
  );
}
