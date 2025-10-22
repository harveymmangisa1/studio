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
  Zap,
  Cloud,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';

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
  isNew?: boolean;
  isPro?: boolean;
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
        isNew: false
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
        description: 'Financial statements and books'
      },
      { 
        href: '/reports', 
        label: 'Reports', 
        icon: BarChart3, 
        roles: ['Admin', 'Manager', 'Accountant', 'Auditor'], 
        comingSoon: false,
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
        comingSoon: false,
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
  const [darkMode, setDarkMode] = useState(false);

  // TODO: Replace with real authentication
  const userRoles = ['Admin']; // Mock role for now
  const userName = "Alex Morgan";
  const userRole = "Admin";

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

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you would persist this preference and apply it to the entire app
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{tenant?.name || 'StockPaEasy'}</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`
        hidden lg:flex transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-80'}
      `}>
        <Sidebar className={`
          bg-white border-r border-slate-200 shadow-lg transition-all duration-300
          ${darkMode ? 'dark:bg-slate-900 dark:border-slate-700' : ''}
        `}>
          {/* Header */}
          <SidebarHeader>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className={`flex items-center gap-3 mb-6 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{tenant?.name || 'StockPaEasy'}</h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Business Management</p>
                  </div>
                )}
                {!isCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Search Bar - Hidden when collapsed */}
              {!isCollapsed && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-8">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  {/* Group Header - Hidden when collapsed */}
                  {!isCollapsed && (
                    <div className="px-2">
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {group.title}
                      </h3>
                    </div>
                  )}

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
                            tooltip={isCollapsed ? item.label : undefined}
                            disabled={item.comingSoon}
                            className="group relative"
                          >
                            <Link 
                              href={item.comingSoon ? '#' : item.href}
                              className={`
                                flex items-center gap-3 rounded-xl transition-all duration-200
                                ${isCollapsed ? 'justify-center px-3 py-4' : 'px-3 py-3'}
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                                }
                                ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              {/* Icon Container */}
                              <div className="relative">
                                <div className={`
                                  p-2 rounded-lg transition-colors flex-shrink-0
                                  ${isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-slate-300'
                                  }
                                `}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                
                                {/* Badges */}
                                {!isCollapsed && item.badge && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isNew && !isCollapsed && (
                                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] px-1 rounded border-2 border-white dark:border-slate-900">
                                    NEW
                                  </span>
                                )}
                              </div>

                              {/* Content - Hidden when collapsed */}
                              {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                      {item.label}
                                    </span>
                                    {item.isPro && (
                                      <Zap className="w-3 h-3 text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {item.description}
                                  </p>
                                </div>
                              )}

                              {/* Status Indicators - Hidden when collapsed */}
                              {!isCollapsed && (
                                <div className="flex items-center gap-1">
                                  {item.comingSoon && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                                      Soon
                                    </span>
                                  )}
                                  {!item.comingSoon && (
                                    <ChevronRight className={`
                                      w-4 h-4 transition-transform duration-200 flex-shrink-0
                                      ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}
                                      ${isActive ? 'rotate-90' : ''}
                                    `} />
                                  )}
                                </div>
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

          {/* User Profile & Quick Actions */}
          {!isCollapsed && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userRole}</p>
                </div>
                <button className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* System Status & Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <Cloud className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-500 dark:text-slate-400">System</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleDarkMode}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Footer */}
          {isCollapsed && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
      <div className={`
        lg:hidden fixed top-16 left-0 bottom-0 z-30 w-80 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar className="h-full bg-white">
          {/* Mobile Search Bar */}
          <div className="p-4 border-b border-slate-200">
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

          {/* Mobile Navigation Content */}
          <SidebarContent className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-8">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <div className="px-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                            disabled={item.comingSoon}
                            className="group relative"
                          >
                            <Link 
                              href={item.comingSoon ? '#' : item.href}
                              className={`
                                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                                }
                                ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              <div className="relative">
                                <div className={`
                                  p-2 rounded-lg transition-colors
                                  ${isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800'
                                  }
                                `}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] px-1 rounded border-2 border-white">
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
                                    <Zap className="w-3 h-3 text-amber-500" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                  {item.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                {item.comingSoon && (
                                  <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-md">
                                    Soon
                                  </span>
                                )}
                                {!item.comingSoon && (
                                  <ChevronRight className={`
                                    w-4 h-4 transition-transform duration-200
                                    ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}
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
        </Sidebar>
      </div>

      {/* Mobile spacing */}
      <div className="lg:hidden h-16" />
    </>
  );
}
