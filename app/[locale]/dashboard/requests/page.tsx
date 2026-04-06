'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import InterestCard from '@/components/InterestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Inbox, Send, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function RequestsPage() {
  const t = useTranslations('Requests');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Use allSettled to prevent one failing request from breaking everything
      const results = await Promise.allSettled([
        api.get('/api/interests/received'),
        api.get('/api/interests/sent')
      ]);

      const getInterests = (result: any) => {
        if (result.status === 'fulfilled') {
          const res = result.value;
          if (Array.isArray(res.data)) return res.data;
          if (res.data?.interests) return res.data.interests;
          if (res.data?.data) return res.data.data;
          if (res.data?.requests) return res.data.requests;
        }
        return [];
      };

      setReceived(getInterests(results[0]));
      setSent(getInterests(results[1]));
    } catch (error) {
      console.error('Failed to fetch requests', error);
      setReceived([]);
      setSent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#8b6d31] font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8" /> {t('title')}
        </h1>
        <p className="text-gray-500">{t('manageRequests')}</p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8 bg-[#fdfaf5] p-1 border border-[#e5d5b7]">
          <TabsTrigger value="received" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-white flex gap-2">
            <Inbox className="w-4 h-4" /> {t('received')}
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-white flex gap-2">
            <Send className="w-4 h-4" /> {t('sent')}
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex gap-2">
            <Check className="w-4 h-4" /> {t('approved')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="animate-in fade-in slide-in-from-left-2 duration-300">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
            </div>
          ) : received.filter((i: any) => i.status !== 'accepted').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {received.filter((i: any) => i.status !== 'accepted').map((interest: any) => (
                  <motion.div
                    key={interest._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InterestCard interest={interest} type="received" onUpdate={fetchRequests} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#e5d5b7]">
              <div className="w-20 h-20 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-10 h-10 text-[#d4af37]/40" />
              </div>
              <h3 className="text-2xl font-serif text-[#8b6d31] mb-2">{t('noReceived')}</h3>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="animate-in fade-in slide-in-from-right-2 duration-300">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
            </div>
          ) : sent.filter((i: any) => i.status !== 'accepted').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {sent.filter((i: any) => i.status !== 'accepted').map((interest: any) => (
                  <motion.div
                    key={interest._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InterestCard interest={interest} type="sent" onUpdate={fetchRequests} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#e5d5b7]">
              <div className="w-20 h-20 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-[#d4af37]/40" />
              </div>
              <h3 className="text-2xl font-serif text-[#8b6d31] mb-2">{t('noSent')}</h3>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
            </div>
          ) : [...received, ...sent].filter((i: any) => i.status === 'accepted').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {[...received, ...sent].filter((i: any) => i.status === 'accepted').map((interest: any) => {
                  const isReceived = received.some((r: any) => r._id === interest._id);
                  return (
                    <motion.div
                      key={interest._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InterestCard 
                        interest={interest} 
                        type={isReceived ? "received" : "sent"} 
                        onUpdate={fetchRequests} 
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#e5d5b7]">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600/40" />
              </div>
              <h3 className="text-2xl font-serif text-[#8b6d31] mb-2">{t('noApproved')}</h3>
              <p className="text-gray-500">{t('approvedDesc')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
