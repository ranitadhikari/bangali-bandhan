'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <div className="min-h-screen bg-cream pb-20">
      <section className="bg-white py-20 border-b border-gold/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8"
          >
            <ScrollText className="w-10 h-10 text-blue-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-heading text-deep-red mb-6"
          >
            {t('title')}
          </motion.h1>
          <p className="text-gray-500 font-medium italic">{t('lastUpdated')}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gold/10 space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('content')} By accessing or using BangaliBandhan, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">2. Eligibility</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                You must be at least 18 years old to use this service. By creating an account, you represent and warrant that you have the legal capacity to enter into this agreement.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">3. User Conduct</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                You are responsible for all content you post on BangaliBandhan. You agree not to use the service for any unlawful or prohibited purpose, including harassment or fraud.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">4. Termination</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that violates these Terms or is harmful to other users.
              </p>
            </div>

            <div className="p-8 bg-cream rounded-2xl border border-gold/10 italic text-gray-700">
              "We strive to provide a respectful and safe environment for all our members."
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
