import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, ShoppingBag, DollarSign,
  Users, Settings, FileText, Warehouse, BarChart3, Shield,
  ChevronRight, LogOut, Building, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalkthrough } from '@/hooks/use-walkthrough';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const menuGroups = [
  {
    title: 'Core',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { href: '/inventory', label: 'Inventory', icon: Package, roles: ['Admin'], badge: '3' },
      { href: '/sales', label: 'Sales', icon: ShoppingCart, roles: ['Admin'] },
      { href: '/purchases', label: 'Purchases', icon: ShoppingBag, roles: ['Admin'] },
    ]
  },
  {
    title: 'Financial',
    items: [
      { href: '/expenses', label: 'Expenses', icon: DollarSign, roles: ['Admin'] },
      { href: '/accounting', label: 'Accounting', icon: FileText, roles: ['Admin'] },
      { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin'] },
    ]
  },
  {
    title: 'Relationships',
    items: [
      { href: '/customers', label: 'Customers', icon: Users, roles: ['Admin'] },
      { href: '/suppliers', label: 'Suppliers', icon: Warehouse, roles: ['Admin'] },
    ]
  },
  {
    title: 'Human Resources',
    items: [
      { href: '/hr', label: 'HR Dashboard', icon: Briefcase, roles: ['Admin'] },
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

import { useAuth } from '@/components/AuthProvider';

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
  const { userProfile } = useAuth() || {};
  const userName = userProfile?.name || userProfile?.email || 'Admin';
  const userRoles = ['Admin'];

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.some(role => userRoles.includes(role)))
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">paeasybooks</span>
                <span className="truncate text-xs">Stock Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {filteredGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
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
                          {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {userName.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{userName}</span>
                <span className="truncate text-xs">Administrator</span>
              </div>
              <LogOut className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <HelpSection />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}