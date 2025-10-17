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
  ChevronRight,
  Building,
  User,
  LogOut,
  Bell,
  HelpCircle,
  Search,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useState } from 'react';

// TODO: Integrate with a real useAuth hook once implemented
// import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  comingSoon?: boolean;
  badge?: string;
  description?: string;
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
        description: 'Business overview and analytics'
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
        badge: '3'
      },
      { 
        href: '/sales', 
        label: 'Sales', 
        icon: ShoppingCart, 
        roles: ['Admin', 'Manager', 'Cashier', 'Accountant', 'Auditor'],
        description: 'Sales orders and transactions'
      },
      { 
        href: '/purchases', 
        label: 'Purchases', 
        icon: ShoppingBag, 
        roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'], 
        comingSoon: false,
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
                description: 'Financial statements and books'      },
      { 
        href: '/reports', 
        label: 'Reports', 
        icon: BarChart3, 
        roles: ['Admin', 'Manager', 'Accountant', 'Auditor'], 
        comingSoon: false,
        description: 'Analytics and insights'
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
        comingSoon: false,
        description: 'Customer database and history'
      },
      { 
        href: '/suppliers', 
        label: 'Suppliers', 
        icon: Warehouse, 
        roles: ['Admin', 'Manager', 'Store Clerk', 'Accountant', 'Auditor'], 
        comingSoon: false,
        description: 'Supplier management'
      },
    ]
  },
  {
    title: 'Advanced',
    items: [
            { 
        href: '/users', 
        label: 'Team', 
        icon: Shield, 
        roles: ['Admin'], 
        comingSoon: false,
        description: 'User and role management'
      },
      { 
        href: '/settings', 
        label: 'Settings', 
        icon: Settings, 
        roles: ['Admin', 'Manager'], 
        comingSoon: true,
        description: 'System configuration'
      },
    ]
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  // TODO: Replace with real authentication
  const userRoles = ['Admin']; // Mock role for now
  const userName = "Alex Morgan";
  const userRole = "Admin";

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

  return (
    <Sidebar className="bg-white border-r border-slate-200 shadow-lg">
      {/* Header */}
      <SidebarHeader>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">StockPaEasy</h1>
              <p className="text-xs text-slate-600">Business Management</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-8">
          {filteredGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              {/* Group Header */}
              <div className="px-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              </div>

              {/* Menu Items */}
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
                        disabled={item.comingSoon}
                        className="group relative"
                      >
                        <Link 
                          href={item.comingSoon ? '#' : item.href}
                          className={`
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                            ${isActive 
                              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600 shadow-lg shadow-blue-500/10' 
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                            }
                            ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {/* Icon Container */}
                          <div className={`
                            p-2 rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800'
                            }
                          `}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className={`
                                  px-1.5 py-0.5 text-xs font-medium rounded-full
                                  ${item.badge === 'New' 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                  }
                                `}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {item.description}
                            </p>
                          </div>

                          {/* Status Indicators */}
                          <div className="flex items-center gap-1">
                            {item.comingSoon && (
                              <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-md">
                                Soon
                              </span>
                            )}
                            {!item.comingSoon && (
                              <ChevronRight className={`
                                w-4 h-4 transition-transform duration-200
                                ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}
                                ${isActive ? 'rotate-90' : ''}
                              `} />
                            )}
                          </div>
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

      {/* User Profile & Quick Actions */}
      <div className="p-4 border-t border-slate-200 space-y-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors text-sm">
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userRole}</p>
          </div>
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* System Status */}
        <div className="px-3 py-2 bg-slate-100/50 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">System</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
