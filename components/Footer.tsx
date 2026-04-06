'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Heart } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gold/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-deep-red fill-deep-red" />
              <span className="text-xl font-heading text-deep-red font-bold">BangaliBandhan</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-gray-800 border-b border-gold/10 pb-2">{t('quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  {t('quickLinks')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  Search
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-gray-800 border-b border-gold/10 pb-2">{t('support')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-gray-800 border-b border-gold/10 pb-2">{t('legal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-deep-red transition-colors text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gold/40 rounded-full mr-2"></span>
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
