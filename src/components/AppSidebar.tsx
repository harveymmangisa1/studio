'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  FileText,
  Warehouse,
  BarChart3,
  Shield,
  ChevronRight,
  User,
  LogOut,
  Bell,
  HelpCircle,
  Search,
  Building,
  FileText as FileQuote,
  CreditCard,
  Receipt,
  Briefcase,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
import { cn } from '@/lib/utils';

interface SubMenuItem {
  href: string;
  label: string;
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  comingSoon?: boolean;
  badge?: string;
  description?: string;
  isNew?: boolean;
  isPro?: boolean;
  subItems?: SubMenuItem[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Core',
    items: [
      { 
        href: '/', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        roles: ['Admin', 'Manager', 'Accountant', 'Cashier', 'Store Clerk', 'Auditor'],
        description: 'Business overview and analytics',
      },
    ]
  },
  {
    title: 'Operations',
    items: [
      { 
        href: '/inventory', 
        label: 'Inventory', 
        icon: Package, 
        roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'],
        description: 'Manage products and stock levels',
        badge: '3',
        isNew: true
      },
      { 
        href: '/sales', 
        label: 'Sales', 
        icon: ShoppingCart, 
        roles: ['Admin', 'Manager', 'Cashier', 'Accountant', 'Auditor'],
        description: 'Sales orders and transactions',
        subItems: [
          { href: '/sales', label: 'Invoices' },
          { href: '/sales/quotes', label: 'Quotations' },
        ]
      },
      { 
        href: '/purchases', 
        label: 'Purchases', 
        icon: ShoppingBag, 
        roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'], 
        description: 'Purchase orders and suppliers'
      },
    ]
  },
  {
    title: 'Financial',
    items: [
      { 
        href: '/expenses', 
        label: 'Expenses', 
        icon: DollarSign, 
        roles: ['Admin', 'Manager', 'Accountant', 'Auditor'],
        description: 'Track and manage expenses'
      },
      { 
        href: '/accounts', 
        label: 'Accounting',
        icon: FileText,
        roles: ['Admin', 'Accountant', 'Auditor'], 
        description: 'Financial statements and books'
      },
      { 
        href: '/reports', 
        label: 'Reports', 
        icon: BarChart3, 
        roles: ['Admin', 'Manager', 'Accountant', 'Auditor'], 
        description: 'Analytics and insights',
        isPro: true
      },
    ]
  },
  {
    title: 'Relationships',
    items: [
      { 
        href: '/customers', 
        label: 'Customers', 
        icon: Users, 
        roles: ['Admin', 'Manager', 'Cashier', 'Accountant', 'Auditor'], 
        description: 'Customer database and history'
      },
      { 
        href: '/suppliers', 
        label: 'Suppliers', 
        icon: Warehouse, 
        roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'], 
        description: 'Supplier management'
      },
    ]
  },
  {
    title: 'Human Resources',
    items: [
      {
        href: '/hr',
        label: 'HR Dashboard',
        icon: Briefcase,
        roles: ['Admin', 'HR Manager'],
        description: 'Human resources overview',
        subItems: [
          { href: '/hr/employees', label: 'Employees' },
          { href: '/hr/payroll', label: 'Payroll' },
          { href: '/hr/attendance', label: 'Attendance' },
          { href: '/hr/performance', label: 'Performance' },
          { href: '/hr/reports', label: 'Reports' },
        ]
      },
    ]
  },
  {
    title: 'Administration',
    items: [
      { 
        href: '/users', 
        label: 'Team Management', 
        icon: Shield, 
        roles: ['Admin'], 
        description: 'User and role management'
      },
      { 
        href: '/settings', 
        label: 'Settings', 
        icon: Settings, 
        roles: ['Admin', 'Manager'], 
        description: 'System configuration'
      },
    ]
  },
];

export function AppSidebar() {
  const { tenant } = useTenant();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mock user data - replace with real authentication
  const userRoles = ['Admin'];
  const userName = "Alex Morgan";
  const userRole = "Administrator";

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Filter menu items based on search and roles
  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items
      .filter(item => 
        item.roles.some(role => userRoles.includes(role)) &&
        (item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
  })).filter(group => group.items.length > 0);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg bg-corporate-blue/10 hover:bg-corporate-blue/20 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-corporate-blue to-corporate-blue/80 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-corporate-blue">{tenant?.name || 'BusinessSuite'}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-80"
      )}>
        <Sidebar className="bg-white border-r border-gray-200 shadow-sm">
          {/* Header */}
          <SidebarHeader>
            <div className="p-6 border-b border-gray-200">
              <div className={cn("flex items-center gap-3 mb-6 transition-all", isCollapsed ? "justify-center" : "")}>
                <div className="w-10 h-10 bg-gradient-to-br from-corporate-blue to-corporate-blue/80 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-corporate-blue truncate">{tenant?.name || 'BusinessSuite'}</h1>
                    <p className="text-xs text-gray-500">Enterprise Management</p>
                  </div>
                )}
                {!isCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg bg-corporate-blue/10 hover:bg-corporate-blue/20 transition-colors"
                  >
                    <ChevronRight className={cn("w-4 h-4 transition-transform", isCollapsed ? "rotate-180" : "")} />
                  </button>
                )}
              </div>

              {/* Search Bar */}
              {!isCollapsed && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-transparent transition-colors"
                  />
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  {/* Group Header */}
                  {!isCollapsed && group.items.length > 0 && (
                    <div className="px-2">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {group.title}
                      </h3>
                    </div>
                  )}

                  {/* Menu Items */}
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || 
                        (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)));
                      
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={isCollapsed ? item.label : undefined}
                            className="group relative"
                          >
                            <Link 
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg transition-all duration-200",
                                isActive 
                                  ? "bg-corporate-blue/10 text-corporate-blue border border-corporate-blue/30" 
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                              )}
                            >
                              {/* Icon */}
                              <div className="relative flex-shrink-0">
                                <div className={cn(
                                  "p-2 rounded-md transition-colors",
                                  isActive 
                                    ? "bg-corporate-blue/20 text-corporate-blue" 
                                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700"
                                )}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                
                                {/* Badges */}
                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="absolute -top-1 -right-1 bg-corporate-blue text-white text-[10px] px-1 rounded border-2 border-white">
                                    NEW
                                  </span>
                                )}
                              </div>

                              {/* Content */}
                              {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                      {item.label}
                                    </span>
                                    {item.isPro && (
                                      <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-1.5 py-0.5 rounded">
                                        PRO
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {item.description}
                                  </p>
                                </div>
                              )}

                              {/* Chevron */}
                              {!isCollapsed && item.subItems && (
                                <ChevronRight className={cn(
                                  "w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0",
                                  isActive && item.subItems ? "rotate-90" : ""
                                )} />
                              )}
                            </Link>
                          </SidebarMenuButton>

                          {/* Sub Items */}
                          {isActive && item.subItems && !isCollapsed && (
                            <SidebarMenuSub>
                              {item.subItems.map(subItem => (
                                <SidebarMenuSubItem key={subItem.href}>
                                  <SidebarMenuSubButton 
                                    asChild 
                                    isActive={pathname === subItem.href}
                                  >
                                    <Link 
                                      href={subItem.href}
                                      className={cn(
                                        "text-sm transition-colors",
                                        pathname === subItem.href 
                                          ? "text-corporate-blue font-medium" 
                                          : "text-gray-600 hover:text-gray-900"
                                      )}
                                    >
                                      {subItem.label}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              ))}
            </div>
          </SidebarContent>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-gray-900 transition-colors text-sm">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-gray-900 transition-colors text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>Support</span>
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userRole}</p>
                </div>
                <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Collapsed Footer */}
          {isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </Sidebar>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed top-16 left-0 bottom-0 z-30 w-80 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar className="h-full bg-white">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <SidebarContent className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="px-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>

                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="group relative"
                          >
                            <Link 
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                isActive 
                                  ? "bg-corporate-blue/10 text-corporate-blue border border-corporate-blue/30" 
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                              )}
                            >
                              <div className="relative flex-shrink-0">
                                <div className={cn(
                                  "p-2 rounded-md transition-colors",
                                  isActive 
                                    ? "bg-corporate-blue/20 text-corporate-blue" 
                                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700"
                                )}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1 rounded border-2 border-white">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">
                                    {item.label}
                                  </span>
                                  {item.isPro && (
                                    <span className="text-xs bg-gradient-to-r from-corporate-blue to-corporate-blue/80 text-white px-1.5 py-0.5 rounded">
                                      PRO
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.description}
                                </p>
                              </div>

                              {item.subItems && (
                                <ChevronRight className={cn(
                                  "w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0",
                                  isActive ? "rotate-90" : ""
                                )} />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              ))}
            </div>
          </SidebarContent>
        </Sidebar>
      </div>

      {/* Mobile spacing */}
      <div className="lg:hidden h-16" />
    </>
  );
}

// Add missing Menu and X icons
const Menu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);