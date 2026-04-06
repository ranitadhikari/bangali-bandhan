'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProfileCard from '@/components/ProfileCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';

export default function SearchProfilesPage() {
  const { user: authUser } = useAuth();
  const t = useTranslations('Search');
  const td = useTranslations('Dashboard');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      // Get my profile to filter it out and get gender
      let myProfile = null;
      try {
        const myProfileRes = await api.get('/api/profile/me');
        myProfile = myProfileRes.data;
      } catch (e) {}

      const params: any = {};
      
      // Auto-filter by opposite gender
      if (myProfile?.gender) {
        params.gender = myProfile.gender === 'male' ? 'female' : 'male';
      }

      if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) {
        params.minAge = filters.ageRange[0];
        params.maxAge = filters.ageRange[1];
      }
      
      // Manual filter overrides auto-filter
      if (filters.gender !== 'Any') params.gender = filters.gender;
      if (filters.religion !== 'Any') params.religion = filters.religion;
      if (filters.maritalStatus !== 'Any') params.maritalStatus = filters.maritalStatus;
      if (filters.location) params.location = filters.location;
      if (filters.caste) params.caste = filters.caste;
      if (filters.hasDisability !== 'Any') params.hasDisability = filters.hasDisability;

      const queryParams = new URLSearchParams(params);
      const res = await api.get(`/api/profile/search?${queryParams.toString()}`);
      
      // Handle the new response format: { count: number, profiles: [] }
      let data = [];
      if (res.data && Array.isArray(res.data.profiles)) {
        data = res.data.profiles;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      }
      
      // Filter out own profile and keep approved/pending profiles
      const filteredData = data.filter((p: any) => 
        p._id !== myProfile?._id && 
        p.user?._id !== authUser?.id &&
        (p.status === 'approved' || p.status === 'pending')
      );
      setProfiles(filteredData);
    } catch (error) {
      console.error('Failed to fetch profiles', error);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#8b6d31] font-bold">{t('title')}</h1>
          <p className="text-gray-500">Find your soulmate from thousands of verified profiles.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 border-[#e5d5b7] text-[#8b6d31]"
        >
          <SlidersHorizontal className="w-4 h-4" /> {t('filters')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className={`
          ${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-[#e5d5b7] shadow-sm h-fit sticky top-24
        `}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-xl font-bold text-[#8b6d31]">{t('filters')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[#8b6d31]">
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
              <Label className="text-[#8b6d31]">{t('gender')}</Label>
              <Select value={filters.gender} onValueChange={(val) => setFilters({ ...filters, gender: val })}>
                <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
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
              <Label className="text-[#8b6d31]">{t('religion')}</Label>
              <Select value={filters.religion} onValueChange={(val) => setFilters({ ...filters, religion: val })}>
                <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
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
              <Label className="text-[#8b6d31]">{t('maritalStatus')}</Label>
              <Select value={filters.maritalStatus} onValueChange={(val) => setFilters({ ...filters, maritalStatus: val })}>
                <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
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
              <Label className="text-[#8b6d31]">{t('disability')}</Label>
              <Select value={filters.hasDisability} onValueChange={(val) => setFilters({ ...filters, hasDisability: val })}>
                <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
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
              <Label className="text-[#8b6d31]">{t('caste')}</Label>
              <Input
                placeholder="e.g. Brahmin"
                value={filters.caste}
                onChange={(e) => setFilters({ ...filters, caste: e.target.value })}
                className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#8b6d31]">{t('location')}</Label>
              <Input
                placeholder="e.g. Kolkata"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
              />
            </div>

            <Button type="submit" className="w-full bg-[#d4af37] hover:bg-[#b8962f] text-white">
              <SearchIcon className="w-4 h-4 mr-2" /> {t('searchButton')}
            </Button>
          </form>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-72 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#e5d5b7]">
              <div className="w-20 h-20 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-[#d4af37]/40" />
              </div>
              <h3 className="text-2xl font-serif text-[#8b6d31] mb-2">{t('noResults')}</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
