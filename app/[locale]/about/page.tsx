'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Shield, Users } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('About');

  const reasons = [
    { icon: <CheckCircle className="w-8 h-8 text-deep-red" />, title: t('reason1'), desc: t('reason1Text') },
    { icon: <Shield className="w-8 h-8 text-deep-red" />, title: t('reason2'), desc: t('reason2Text') },
    { icon: <Users className="w-8 h-8 text-deep-red" />, title: t('reason3'), desc: t('reason3Text') },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Hero Header */}
      <section className="bg-white py-20 border-b border-gold/10">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-heading text-deep-red mb-6"
          >
            {t('title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {t('missionText')}
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-heading text-deep-red">{t('mission')}</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {t('missionText')}
              </p>
              <div className="p-6 bg-white rounded-2xl border border-gold/20 shadow-sm">
                <Heart className="w-10 h-10 text-deep-red mb-4" />
                <p className="italic text-gray-600">
                  "Finding a life partner is a journey of hearts, and we are here to make that journey beautiful and secure."
                </p>
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200"
                alt="Bengali Tradition"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading text-center text-deep-red mb-16">{t('whyChooseUs')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-cream border border-gold/10 hover:shadow-lg transition-all"
              >
                <div className="mb-6">{reason.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed">{reason.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
