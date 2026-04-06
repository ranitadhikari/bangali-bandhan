'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Heart, LogOut, Menu, User, Search, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'bn', label: 'বাংলা' },
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gold/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-deep-red fill-deep-red" />
          <span className="text-2xl font-heading text-deep-red font-bold">BangaliBandhan</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-deep-red transition-colors font-medium">{t('home')}</Link>
          <Link href="/profiles" className="text-gray-700 hover:text-deep-red transition-colors font-medium">Browse Profiles</Link>
          <Link href="/about" className="text-gray-700 hover:text-deep-red transition-colors font-medium">{t('about')}</Link>
          <Link href="/pricing" className="text-gray-700 hover:text-deep-red transition-colors font-medium">{t('pricing')}</Link>
          <Link href="/contact" className="text-gray-700 hover:text-deep-red transition-colors font-medium">{t('contact')}</Link>
          <Link href="/faq" className="text-gray-700 hover:text-deep-red transition-colors font-medium">{t('faq')}</Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-deep-red transition-colors flex items-center gap-1 font-medium">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="hidden lg:flex items-center px-4 py-1.5 bg-cream rounded-full border border-gold/20">
              <span className="text-sm font-medium text-deep-red">
                {tCommon('nomoshkar')}, {(user.name || user.fullName || '').split(' ')[0] || user.email.split('@')[0]}
              </span>
            </div>
          )}

          <Link href="/profiles">
            <Button variant="ghost" size="icon" className="text-deep-red hover:bg-deep-red/10 rounded-full">
              <Search className="w-5 h-5" />
            </Button>
          </Link>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-deep-red hover:bg-deep-red/10 rounded-full flex items-center gap-2 px-3">
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gold/20">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`cursor-pointer ${locale === lang.code ? "bg-deep-red text-white" : "hover:bg-deep-red/10"}`}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <Button
              variant="outline"
              onClick={logout}
              className="hidden md:flex items-center gap-2 border-deep-red text-deep-red hover:bg-deep-red hover:text-white rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" /> {t('logout')}
            </Button>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="text-deep-red hover:bg-deep-red/10 rounded-full">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-deep-red hover:bg-deep-red/90 text-white rounded-full px-6">
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-deep-red hover:bg-deep-red/10 rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gold/10 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          {user && (
            <div className="px-4 py-2 bg-cream rounded-lg border border-gold/20 mb-2">
              <span className="text-sm font-medium text-deep-red">{tCommon('nomoshkar')}, {user.name || user.fullName}</span>
            </div>
          )}
          <Link href="/" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>{t('home')}</Link>
          <Link href="/profiles" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>Browse Profiles</Link>
          <Link href="/about" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>{t('about')}</Link>
          <Link href="/pricing" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>{t('pricing')}</Link>
          <Link href="/contact" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>{t('contact')}</Link>
          <Link href="/faq" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>{t('faq')}</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Button
                variant="outline"
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full justify-start border-deep-red text-deep-red mt-2 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full border-deep-red text-deep-red rounded-lg">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register" className="block" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-deep-red hover:bg-deep-red/90 text-white rounded-lg">
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
