import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, ShoppingBag, DollarSign,
  Users, Settings, FileText, Warehouse, BarChart3, Shield,
  ChevronRight, LogOut, Building, Briefcase, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalkthrough } from '@/hooks/use-walkthrough';

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
      { href: '/accounts', label: 'Accounting', icon: FileText, roles: ['Admin'] },
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

function HelpSection({ compact = false }: { compact?: boolean }) {
  const { reset } = useWalkthrough();
  return (
    <div className={cn("bg-gray-50 rounded-lg", compact ? "p-1" : "p-2")}> 
      <button
        onClick={reset}
        className={cn(
          "w-full text-left text-xs font-medium text-gray-700 hover:text-gray-900",
          compact ? "px-1 py-1" : "px-2 py-1.5"
        )}
      >
        Show Walkthrough
      </button>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { userProfile } = useAuth();
  const userName = userProfile?.name || userProfile?.email || 'Admin';
  const userRoles = ['Admin'];

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.some(role => userRoles.includes(role)))
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">paeasybooks</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-gray-200 transition-all",
          isCollapsed ? "h-16 justify-center px-4" : "h-16 justify-between px-6"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2" data-tour-id="sidebar-brand">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">paeasybooks</span>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredGroups.map((group, idx) => (
            <div key={idx} className={cn("mb-6", isCollapsed ? "px-2" : "px-3")}>
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg transition-all group relative",
                        isCollapsed ? "justify-center p-2" : "px-3 py-2",
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Icon Container */}
                      <div className="relative flex-shrink-0">
                        <Icon className={cn(
                          "transition-all",
                          isCollapsed ? "w-5 h-5" : "w-4 h-4"
                        )} />
                        
                        {/* Badge */}
                        {item.badge && (
                          <span className={cn(
                            "absolute bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center",
                            isCollapsed 
                              ? "-top-1 -right-1 w-4 h-4" 
                              : "-top-1.5 -right-1.5 w-4 h-4"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-gray-200 space-y-2",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <HelpSection />
            </>
          ) : (
            <>
              <button className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors group relative">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {userName}
                </div>
              </button>
              <HelpSection compact />
            </>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">paeasybooks</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {filteredGroups.map((group, idx) => (
              <div key={idx} className="mb-6">
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
                
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative",
                          isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <Icon className="w-4 h-4" />
                          {item.badge && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16" />
      
      {/* Spacer for desktop */}
      <div className={cn(
        "hidden lg:block transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )} />
    </>
  );
}