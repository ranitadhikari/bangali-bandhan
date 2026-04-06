'use client';

import React from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  LayoutDashboard,
  User,
  Search,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Globe,
  ShieldCheck,
  Home,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const t = useTranslations('Dashboard');
  const tNav = useTranslations('Navbar');

  const languages = [
    { code: 'bn', label: 'বাংলা' },
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const sidebarItems = [
    { name: t('home'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('myProfile'), href: '/dashboard/profile', icon: User },
    { name: t('search'), href: '/dashboard/search', icon: Search },
    { name: t('requests'), href: '/dashboard/requests', icon: MessageSquare },
    { name: t('browseSite'), href: '/profiles', icon: Globe },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fdfaf5] flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 w-72 bg-white border-r border-[#e5d5b7] z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-10 h-10 bg-[#8b0000] rounded-xl flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-serif text-[#8b6d31] font-bold block">{t('adminPortal')}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">BangaliBandhan</span>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-[#d4af37] text-white shadow-md shadow-[#d4af37]/20' 
                        : 'text-gray-600 hover:bg-[#fdfaf5] hover:text-[#8b6d31]'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#fdfaf5]">
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('logout')}</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-[#e5d5b7] flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-[#8b6d31]"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h2 className="text-lg font-serif text-[#8b6d31] font-bold hidden md:block">{t('dashboardOverview')}</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#8b6d31] hover:bg-[#fdfaf5] flex gap-2 items-center">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">{tNav('language')}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-[#e5d5b7] bg-white">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`cursor-pointer ${locale === lang.code ? "bg-[#d4af37] text-white" : "hover:bg-[#fdfaf5] text-gray-700"}`}
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-[1px] bg-gray-200" />

              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#d4af37] flex gap-2 items-center">
                  <Home className="w-4 h-4" /> 
                  <span className="hidden sm:inline">{t('backToHome')}</span>
                </Button>
              </Link>
              <div className="h-8 w-[1px] bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-none mb-1">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('activeMember')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#fdfaf5] border border-[#e5d5b7] flex items-center justify-center text-[#8b6d31] font-bold overflow-hidden">
                  {(user as any)?.profile?.photos?.[0] ? (
                    <Image src={(user as any).profile.photos[0]} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    user?.name?.[0] || 'U'
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
