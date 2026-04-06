'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProfileCard from './ProfileCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export default function SuggestedMatches() {
  const t = useTranslations('Index');
  const ts = useTranslations('Search');
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSuggestedProfiles = async () => {
    setLoading(true);
    try {
      // Get current user profile to filter by gender
      let myProfile = null;
      if (user) {
        try {
          const myProfileRes = await api.get('/api/profile/me');
          myProfile = myProfileRes.data;
        } catch (e) {}
      }

      const params: any = {};
      if (myProfile?.gender) {
        params.gender = myProfile.gender === 'male' ? 'female' : 'male';
      }

      try {
        const queryParams = new URLSearchParams(params);
        const res = await api.get(`/api/profile/search?${queryParams.toString()}`);
        
        let data = [];
        if (res.data && Array.isArray(res.data.profiles)) {
          data = res.data.profiles;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }

        // Filter: Exclude current user and show approved/pending profiles
        const filtered = data.filter((p: any) => 
          p._id !== myProfile?._id && 
          (p.status === 'approved' || p.status === 'pending')
        ).slice(0, 12);

        setProfiles(filtered);
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.log('User not logged in, hiding suggested profiles on homepage');
          setProfiles([]);
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Failed to fetch suggested profiles', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedProfiles();
  }, [user]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!loading && profiles.length === 0) {
    if (user) {
      return (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-heading text-deep-red mb-8">Suggested Matches</h2>
            <div className="p-12 bg-cream/30 rounded-3xl border border-dashed border-gold/20 max-w-2xl mx-auto">
              <Heart className="w-12 h-12 text-gold mx-auto mb-4 opacity-40" />
              <p className="text-xl text-gray-600 font-medium">No suggested matches found yet.</p>
              <p className="text-gray-500 mt-2">Try updating your profile or preferences to see more results.</p>
              <Link href="/dashboard/profile">
                <Button className="mt-8 bg-deep-red hover:bg-deep-red/90 text-white px-8 rounded-full">
                  Complete My Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>
      );
    }
    return null; // Guest users still see nothing if empty/401
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-heading text-deep-red">Suggested Matches</h2>
            <p className="text-gray-600">Based on your preferences and profile details</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll('left')}
              className="rounded-full border-gold/20 text-deep-red hover:bg-cream"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll('right')}
              className="rounded-full border-gold/20 text-deep-red hover:bg-cream"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] snap-start">
                <Skeleton className="h-[400px] w-full rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            profiles.map((profile) => (
              <div key={profile._id} className="min-w-[280px] md:min-w-[320px] snap-start">
                <ProfileCard profile={profile} />
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/profiles">
            <Button className="bg-deep-red hover:bg-deep-red/90 text-white px-8 py-6 rounded-full text-lg shadow-lg hover:scale-105 transition-all">
              View All Matches
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
