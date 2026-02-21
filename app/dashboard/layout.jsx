'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ListTodo, Star, Menu, GitCompare } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
    { name: 'Lists', href: '/dashboard/lists', icon: ListTodo },
    { name: 'Compare', href: '/dashboard/compare', icon: GitCompare },
    { name: 'Saved', href: '/dashboard/saved', icon: Star },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border overflow-hidden flex flex-col`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground">VC Intelligence</h1>
          <p className="text-sm text-muted-foreground">Discover & Enrich</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
