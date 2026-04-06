'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ContactPage() {
  const t = useTranslations('Contact');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('success'));
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    { icon: <Mail className="w-6 h-6 text-deep-red" />, label: t('email'), value: 'support@bangalibandhan.com' },
    { icon: <Phone className="w-6 h-6 text-deep-red" />, label: 'Phone', value: '+91 98765 43210' },
    { icon: <MapPin className="w-6 h-6 text-deep-red" />, label: 'Office', value: 'Kolkata, West Bengal, India' },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
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
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gold/20"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input id="name" required className="rounded-xl border-gold/20 focus:ring-deep-red" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" required className="rounded-xl border-gold/20 focus:ring-deep-red" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('subject')}</Label>
                  <Input id="subject" required className="rounded-xl border-gold/20 focus:ring-deep-red" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('message')}</Label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-deep-red focus:border-transparent transition-all"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-deep-red hover:bg-deep-red/90 text-white rounded-xl py-6 text-lg transition-all hover:scale-[1.02]">
                  <Send className="w-5 h-5 mr-2" />
                  {t('send')}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gold/10 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{info.label}</p>
                      <p className="text-xl text-gray-800 font-medium">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Element */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800"
                  alt="Contact Us"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-red/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-lg font-heading italic">"Connecting hearts, one message at a time."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
