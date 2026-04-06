'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const t = useTranslations('Pricing');

  const plans = [
    {
      name: t('free'),
      price: '₹0',
      period: t('monthly'),
      icon: <Check className="w-6 h-6 text-gray-400" />,
      features: [t('feature1'), t('feature2')],
      recommended: false,
    },
    {
      name: t('premium'),
      price: '₹499',
      period: t('monthly'),
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      features: [t('feature1'), t('feature2'), t('feature3'), t('feature4')],
      recommended: true,
    },
    {
      name: t('pro'),
      price: '₹999',
      period: t('monthly'),
      icon: <Zap className="w-6 h-6 text-deep-red" />,
      features: [t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5')],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      <section className="bg-white py-20 border-b border-gold/10 text-center">
        <div className="container mx-auto px-4">
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
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-3xl p-8 border-2 transition-all hover:shadow-2xl ${
                  plan.recommended ? 'border-deep-red shadow-xl scale-105 z-10' : 'border-gold/10'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-deep-red text-white px-4 py-1 rounded-full text-sm font-bold">
                    Recommended
                  </div>
                )}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-4xl font-bold text-deep-red">{plan.price}</span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl ${plan.recommended ? 'bg-deep-red/10' : 'bg-gray-100'}`}>
                    {plan.icon}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-6 rounded-xl text-lg transition-all ${
                    plan.recommended
                      ? 'bg-deep-red hover:bg-deep-red/90 text-white'
                      : 'bg-white border-2 border-deep-red text-deep-red hover:bg-deep-red/5'
                  }`}
                >
                  {t('selectPlan')}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
