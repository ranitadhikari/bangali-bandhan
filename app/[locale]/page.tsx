'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, UserPlus, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SuggestedMatches from '@/components/SuggestedMatches';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function HomePage() {
  const t = useTranslations('Index');
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  useEffect(() => {
    // Show register dialog for new users after 3 seconds
    const hasSeenPopup = localStorage.getItem('hasSeenRegisterPopup');
    if (!user && !hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsRegisterDialogOpen(true);
        localStorage.setItem('hasSeenRegisterPopup', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000", // Mandap/Stage
      title: t('hero.slide1.title'),
      desc: t('hero.slide1.desc')
    },
    {
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000", // Reception Stage
      title: t('hero.slide2.title'),
      desc: t('hero.slide2.desc')
    },
    {
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000", // Wedding Setup
      title: t('hero.slide3.title'),
      desc: t('hero.slide3.desc')
    },
    {
      image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=2000", // Grand Marriage Venue
      title: t('hero.slide4.title'),
      desc: t('hero.slide4.desc')
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-deep-red" />,
      title: t('howItWorks.step1.title'),
      desc: t('howItWorks.step1.desc')
    },
    {
      icon: <Search className="w-8 h-8 text-deep-red" />,
      title: t('howItWorks.step2.title'),
      desc: t('howItWorks.step2.desc')
    },
    {
      icon: <Heart className="w-8 h-8 text-deep-red" />,
      title: t('howItWorks.step3.title'),
      desc: t('howItWorks.step3.desc')
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-cream">
        <div className="absolute inset-0">
          <Image
            key={currentImageIndex}
            src={heroSlides[currentImageIndex].image}
            alt="Bengali Wedding"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-70 transition-opacity duration-300"
            priority
          />
          {/* Darker gradient for text readability without a box */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent z-10" />
        </div>

        <div className="container mx-auto px-4 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto md:mx-0 text-center md:text-left"
            >
              <h1 className="text-5xl md:text-7xl font-heading text-deep-red mb-6 leading-tight drop-shadow-sm">
                {heroSlides[currentImageIndex].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-800 mb-10 font-sans font-semibold max-w-xl">
                {heroSlides[currentImageIndex].desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register">
                  <Button size="lg" className="bg-deep-red hover:bg-deep-red/90 text-white px-8 py-7 text-lg rounded-full shadow-xl transition-all hover:scale-105 w-full sm:w-auto">
                    {t('heroCta')}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-deep-red text-deep-red px-8 py-7 text-lg rounded-full hover:bg-deep-red/10 w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading text-center text-deep-red mb-16">{t('howItWorks.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto shadow-inner border border-gold/20">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Visual Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
               <Image
                src="https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&q=80&w=1000"
                alt="Bengali Rituals"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-heading text-deep-red">Traditional Values, Modern Connection</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                BangaliBandhan is built on the foundation of trust and cultural authenticity. 
                Whether it's Shubho Drishti or Mala Badal, we celebrate every ritual that makes a Bengali Hindu wedding special.
              </p>
              <ul className="space-y-4">
                {['Culturally authentic profiles', 'Verified member base', 'Simple and easy to use'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-800">
                    <CheckCircle className="text-gold w-6 h-6" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Matches Section */}
      <SuggestedMatches />

      {/* Testimonials */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading text-center text-deep-red mb-16">{t('testimonials.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="bg-cream/30 border-gold/10">
               <CardContent className="pt-8">
                 <p className="text-lg italic text-gray-700 mb-6">"{t('successStories.story1')}"</p>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-deep-red/10 flex items-center justify-center font-bold text-deep-red">S&A</div>
                   <div>
                     <h4 className="font-semibold">Subhash & Anjali</h4>
                     <p className="text-sm text-gray-500">Married since 2025</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-cream/30 border-gold/10">
               <CardContent className="pt-8">
                 <p className="text-lg italic text-gray-700 mb-6">"{t('testimonials.user1')}"</p>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-deep-red/10 flex items-center justify-center font-bold text-deep-red">RP</div>
                   <div>
                     <h4 className="font-semibold">Rajesh Prasad</h4>
                     <p className="text-sm text-gray-500">Member since 2026</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </section>


      {/* Registration Dialog for New Visitors */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gold/20">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-4">
              <Heart className="text-deep-red fill-deep-red w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-heading text-deep-red">Join BangaliBandhan</DialogTitle>
            <DialogDescription className="text-gray-600">
              Start your journey to find the perfect life partner today. Join our community of thousands.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Link href="/register" className="w-full">
              <Button className="w-full bg-deep-red hover:bg-deep-red/90 text-white rounded-full py-6">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full border-gold/20 text-deep-red hover:bg-cream rounded-full py-6">
                Login to Existing Account
              </Button>
            </Link>
          </div>
          <DialogFooter className="text-center sm:justify-center text-xs text-gray-400">
            By joining, you agree to our Terms and Privacy Policy.
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
