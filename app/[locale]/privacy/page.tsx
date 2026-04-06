'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  return (
    <div className="min-h-screen bg-cream pb-20">
      <section className="bg-white py-20 border-b border-gold/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-8"
          >
            <ShieldCheck className="w-10 h-10 text-green-600" />
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
              <h2 className="text-2xl font-bold text-gray-800">1. Information Collection</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('content')} We collect information you provide directly, such as your name, email, photos, and personal details for profile creation.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">2. Data Usage</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Your data is used to match you with other users based on your preferences and to improve our services. We never sell your personal information to third parties.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">3. Security</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                We implement a variety of security measures to maintain the safety of your personal information. All sensitive information is encrypted using industry-standard protocols.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">4. Your Choices</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                You can review and update your profile information at any time. You also have the right to delete your account and all associated data from our platform.
              </p>
            </div>

            <div className="p-8 bg-cream rounded-2xl border border-gold/10 italic text-gray-700">
              "We are committed to protecting your privacy and ensuring a safe experience for all our users."
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
