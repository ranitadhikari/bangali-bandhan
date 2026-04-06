'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import ProfileCard from '@/components/ProfileCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, SlidersHorizontal, X, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function AllProfilesPage() {
  const { user: authUser } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('Search');
  const td = useTranslations('Dashboard');
  
  const [filters, setFilters] = useState({
    ageRange: [18, 60],
    gender: 'Any',
    religion: 'Any',
    maritalStatus: 'Any',
    location: '',
    caste: '',
    hasDisability: 'Any',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get my profile if logged in
      let myProfile = null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        try {
          const myProfileRes = await api.get('/api/profile/me');
          myProfile = myProfileRes.data;
        } catch (e) {}
      }

      const params: any = {};
      
      // Auto-filter by gender if logged in and profile exists
      if (myProfile?.gender) {
        params.gender = myProfile.gender === 'male' ? 'female' : 'male';
      }
      
      if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) {
        params.minAge = filters.ageRange[0];
        params.maxAge = filters.ageRange[1];
      }
      
      // Manual filter overrides auto-filter if selected
      if (filters.gender !== 'Any') params.gender = filters.gender;
      if (filters.religion !== 'Any') params.religion = filters.religion;
      if (filters.maritalStatus !== 'Any') params.maritalStatus = filters.maritalStatus;
      if (filters.location) params.location = filters.location;
      if (filters.caste) params.caste = filters.caste;
      if (filters.hasDisability !== 'Any') params.hasDisability = filters.hasDisability;

      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/profile/search?${queryString}` : '/api/profile/search';
      
      const response = await api.get(url);
      
      // Handle the new response format: { count: number, profiles: [] }
      let data = [];
      if (response.data && Array.isArray(response.data.profiles)) {
        data = response.data.profiles;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      // Fallback: if search returns nothing, try fetching all profiles
      if (data.length === 0 && !queryString) {
        try {
          const allRes = await api.get('/api/profile');
          if (allRes.data && Array.isArray(allRes.data.profiles)) {
            data = allRes.data.profiles;
          } else if (Array.isArray(allRes.data)) {
            data = allRes.data;
          }
        } catch (e) {
          console.error('Fallback fetch failed', e);
        }
      }
      
      // Filter out own profile and keep approved/pending profiles
      const filteredData = data.filter((p: any) => 
        p._id !== myProfile?._id && 
        p.user?._id !== authUser?.id &&
        (p.status === 'approved' || p.status === 'pending')
      );
      setProfiles(filteredData);
    } catch (error: any) {
      console.error('Failed to fetch profiles', error);
      if (error.response?.status === 401) {
        setError('Login Required');
      } else {
        setError('Access Protected');
      }
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles();
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading text-deep-red mb-4">{t('title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover your perfect match from our diverse community of verified profiles.
        </p>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-xl font-bold text-deep-red">{t('filters')}</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </Button>
        </div>

        <form onSubmit={handleSearch} className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-deep-red">
                {t('ageRange')}: {filters.ageRange[0]} - {filters.ageRange[1]}
              </Label>
              <Slider
                min={18}
                max={70}
                step={1}
                value={filters.ageRange}
                onValueChange={(value) => setFilters({ ...filters, ageRange: value })}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-deep-red">{t('gender')}</Label>
              <Select value={filters.gender} onValueChange={(val) => setFilters({ ...filters, gender: val })}>
                <SelectTrigger className="border-gold/20 focus:ring-deep-red">
                  <SelectValue placeholder={t('any')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">{t('any')}</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-deep-red">{t('religion')}</Label>
              <Select value={filters.religion} onValueChange={(val) => setFilters({ ...filters, religion: val })}>
                <SelectTrigger className="border-gold/20 focus:ring-deep-red">
                  <SelectValue placeholder={t('any')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">{t('any')}</SelectItem>
                  <SelectItem value="hindu">Hindu</SelectItem>
                  <SelectItem value="muslim">Muslim</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                  <SelectItem value="christian">Christian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-deep-red">{t('maritalStatus')}</Label>
              <Select value={filters.maritalStatus} onValueChange={(val) => setFilters({ ...filters, maritalStatus: val })}>
                <SelectTrigger className="border-gold/20 focus:ring-deep-red">
                  <SelectValue placeholder={t('any')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">{t('any')}</SelectItem>
                  <SelectItem value="unmarried">Unmarried</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widow">Widow / Widower</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-deep-red">{t('disability')}</Label>
              <Select value={filters.hasDisability} onValueChange={(val) => setFilters({ ...filters, hasDisability: val })}>
                <SelectTrigger className="border-gold/20 focus:ring-deep-red">
                  <SelectValue placeholder={t('any')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">{t('any')}</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-deep-red">{t('caste')}</Label>
              <Input
                placeholder="e.g. Brahmin"
                value={filters.caste}
                onChange={(e) => setFilters({ ...filters, caste: e.target.value })}
                className="border-gold/20 focus-visible:ring-deep-red h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-deep-red">{t('location')}</Label>
              <Input
                placeholder="e.g. Kolkata"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="border-gold/20 focus-visible:ring-deep-red h-10"
              />
            </div>

            <Button type="submit" className="w-full bg-deep-red hover:bg-deep-red/90 text-white h-10">
              <SearchIcon className="w-4 h-4 mr-2" /> {t('searchButton')}
            </Button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      <main>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10 shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              {error === 'Login Required' ? (
                <User className="w-10 h-10 text-deep-red/40" />
              ) : (
                <SearchIcon className="w-10 h-10 text-deep-red/40" />
              )}
            </div>
            <p className="text-2xl font-heading text-deep-red mb-4">
              {error === 'Login Required' ? 'Login to Browse' : 
               error === 'Profile Required' ? 'Complete Your Profile' : 
               'Access Protected'}
            </p>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {error === 'Login Required' 
                ? 'Please login to your account to view all verified matrimonial profiles.' 
                : error === 'Profile Required'
                ? 'You need to create your own profile first to see and connect with other members.'
                : 'To protect the privacy of our members, full profile details are only visible to registered users.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {error === 'Login Required' ? (
                <>
                  <Button className="bg-deep-red hover:bg-deep-red/90 px-8" onClick={() => window.location.href='/login'}>
                    Login Now
                  </Button>
                  <Button variant="outline" className="border-deep-red text-deep-red" onClick={() => window.location.href='/register'}>
                    Create Account
                  </Button>
                </>
              ) : error === 'Profile Required' ? (
                <Button className="bg-deep-red hover:bg-deep-red/90 px-8" onClick={() => window.location.href='/dashboard/profile'}>
                  Create My Profile
                </Button>
              ) : (
                <Button className="bg-deep-red hover:bg-deep-red/90 px-8" onClick={() => window.location.href='/login'}>
                  Login to View
                </Button>
              )}
            </div>
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {profiles.map((profile: any) => (
                <motion.div
                  key={profile._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileCard profile={profile} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10 shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-10 h-10 text-gold/40" />
            </div>
            <p className="text-2xl font-heading text-deep-red mb-4">No Profiles Found</p>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              We couldn't find any profiles matching your current filters. Try clearing them or login to see more results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-gold/20 text-deep-red hover:bg-cream"
                onClick={() => {
                  setFilters({
                    ageRange: [18, 60],
                    gender: 'Any',
                    religion: 'Any',
                    maritalStatus: 'Any',
                    location: '',
                    caste: '',
                    hasDisability: 'Any',
                  });
                  fetchProfiles();
                }}
              >
                Clear All Filters
              </Button>
              <Button className="bg-deep-red hover:bg-deep-red/90 px-8" onClick={() => window.location.href='/login'}>
                Login to See More
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
