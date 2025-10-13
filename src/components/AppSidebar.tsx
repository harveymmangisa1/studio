'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  FileText,
  Warehouse,
  CreditCard,
  BarChart3,
  Shield,
  Lightbulb,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

// TODO: Integrate with a real useAuth hook once implemented
// import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  comingSoon?: boolean;
}

const menuItems: MenuItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Accountant', 'Cashier', 'Store Clerk', 'Auditor'] },
  { href: '/inventory', label: 'Inventory', icon: Package, roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'] },
  { href: '/sales', label: 'Sales', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Cashier', 'Accountant', 'Auditor'] },
  { href: '/purchases', label: 'Purchases', icon: ShoppingBag, roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'], comingSoon: true },
  { href: '/expenses', label: 'Expenses', icon: DollarSign, roles: ['Admin', 'Manager', 'Accountant', 'Auditor'] },
  { href: '/accounting', label: 'Accounting', icon: FileText, roles: ['Admin', 'Accountant', 'Auditor'], comingSoon: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Manager', 'Accountant', 'Auditor'], comingSoon: true },
  { href: '/customers', label: 'Customers', icon: Users, roles: ['Admin', 'Manager', 'Cashier', 'Accountant', 'Auditor'], comingSoon: true },
  { href: '/suppliers', label: 'Suppliers', icon: Warehouse, roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'], comingSoon: true },
  { href: '/ai-suggestions', label: 'AI Suggestions', icon: Lightbulb, roles: ['Admin', 'Manager'] },
  { href: '/users', label: 'Users', icon: Shield, roles: ['Admin'], comingSoon: true },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Manager'], comingSoon: true },
];


export function AppSidebar() {
  const pathname = usePathname();
  // TODO: Replace with real authentication
  // const { roles } = useAuth();
  const userRoles = ['Admin']; // Mock role for now

  // const hasAccess = (itemRoles: string[]) => {
  //   return userRoles.some(role => itemRoles.includes(role));
  // };

  // const filteredMenuItems = menuItems.filter(item => hasAccess(item.roles));
  const filteredMenuItems = menuItems; // Show all items for now

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
            <Package className="w-6 h-6" />
            StockPilot
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Business Management</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                disabled={item.comingSoon}
              >
                <Link href={item.comingSoon ? '#' : item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                  {item.comingSoon && <span className="text-xs text-muted-foreground ml-auto">(Soon)</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
