'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  User,
  ArrowRight,
  Check,
  X as XIcon,
  Globe
} from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('Dashboard');
  const [stats, setStats] = useState({
    profiles: 0,
    matches: 0,
    received: 0,
    sent: 0,
  });
  const [recentReceived, setRecentReceived] = useState<any[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Check if user has a profile
      let myProfileData = null;
      try {
        const myProfileRes = await api.get('/api/profile/me');
        myProfileData = myProfileRes.data;
        setMyProfile(myProfileData);
        setShowProfilePrompt(false);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setShowProfilePrompt(true);
        }
      }

      const [profilesRes, receivedRes, sentRes] = await Promise.allSettled([
        api.get('/api/profile/search'),
        api.get('/api/interests/received'),
        api.get('/api/interests/sent'),
      ]);

      const getResData = (result: any) => result.status === 'fulfilled' ? result.value.data : null;
      
      const profilesData = getResData(profilesRes);
      const receivedRaw = getResData(receivedRes);
      const sentRaw = getResData(sentRes);

      const getInterests = (data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.interests) return data.interests;
        if (data.data) return data.data;
        if (data.requests) return data.requests;
        return [];
      };

      let allProfiles = profilesData?.profiles || (Array.isArray(profilesData) ? profilesData : []);
      const receivedData = getInterests(receivedRaw);
      const sentData = getInterests(sentRaw);

      // Filter out own profile and auto-filter by opposite gender and approved status
      if (myProfileData) {
        allProfiles = allProfiles.filter((p: any) => p._id !== myProfileData?._id);
        
        if (myProfileData?.gender) {
          const oppositeGender = myProfileData.gender === 'male' ? 'female' : 'male';
          allProfiles = allProfiles.filter((p: any) => p.gender === oppositeGender);
        }
      }

      // Show only approved and pending profiles
      allProfiles = allProfiles.filter((p: any) => p.status === 'approved' || p.status === 'pending');

      const matchesCount = 
        receivedData.filter((r: any) => r.status === 'accepted').length +
        sentData.filter((s: any) => s.status === 'accepted').length;

      setStats({
        profiles: allProfiles.length || 0,
        matches: matchesCount,
        received: receivedData.length || 0,
        sent: sentData.length || 0,
      });

      setRecentReceived(receivedData.slice(0, 3));
      setSuggestedProfiles(allProfiles.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (id: string, action: 'accepted' | 'rejected') => {
    try {
      await api.put(`/api/interests/${id}`, { status: action });
      toast.success(`Interest ${action}`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const statCards = [
    { title: t('newProfiles'), value: stats.profiles, icon: Users, color: 'text-blue-600' },
    { title: t('matches'), value: stats.matches, icon: Heart, color: 'text-red-600' },
    { title: t('received'), value: stats.received, icon: MessageSquare, color: 'text-purple-600' },
    { title: t('sent'), value: stats.sent, icon: User, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#8b6d31] font-bold">
            {t('welcome')}, {myProfile?.fullName || user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-500">{t('tagline')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/profiles">
            <Button variant="outline" className="border-[#e5d5b7] text-[#8b6d31] hover:bg-[#fdfaf5]">
              <Globe className="w-4 h-4 mr-2" /> {t('browseSite')}
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button className="bg-[#d4af37] hover:bg-[#b8962f] text-white shadow-md shadow-[#d4af37]/20">
              {t('editProfile')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border-[#fdfaf5]">
                  <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-8 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              statCards.map((card) => (
                <Card key={card.title} className="border-white bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {card.title}
                    </CardTitle>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-[#8b6d31]">{card.value}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* My Profile Quick View */}
          {myProfile && (
            <Card className="border-[#e5d5b7] overflow-hidden bg-white shadow-sm">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-48 relative">
                  <Image 
                    src={myProfile.photos?.[0] || `https://ui-avatars.com/api/?name=${myProfile.fullName}&background=A1122F&color=fff`} 
                    alt="" 
                    fill 
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-serif text-[#8b6d31] font-bold">{myProfile.fullName}</h3>
                    <Badge className="bg-green-50 text-green-600 border-green-100 uppercase tracking-widest text-[10px]">{t('activeProfile')}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#d4af37]" /> {myProfile.age} {t('yearsOld')}</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#d4af37]" /> {myProfile.location}</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#d4af37]" /> {myProfile.religion}</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#d4af37]" /> {myProfile.occupation}</p>
                  </div>
                  <Link href="/dashboard/profile">
                    <Button variant="link" className="text-[#d4af37] p-0 h-auto font-bold flex items-center gap-2">
                      {t('updateProfileDetails')} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Interests */}
          <Card className="border-[#e5d5b7] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#fdfaf5]">
              <CardTitle className="text-xl font-serif text-[#8b6d31]">{t('recentInterests')}</CardTitle>
              <Link href="/dashboard/requests">
                <Button variant="link" className="text-[#d4af37] p-0 h-auto font-bold">{t('viewAll')}</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : recentReceived.length > 0 ? (
                recentReceived.map((interest) => {
                  const sender = interest.sender || interest.fromUser || interest.from;
                  const senderName = sender?.fullName || sender?.name || sender?.email?.split('@')[0] || 'Member';
                  const senderPhoto = sender?.photos?.[0] || sender?.profile?.photos?.[0];
                  const senderLocation = sender?.location || sender?.profile?.location || 'Location hidden';
                  
                  return (
                    <div key={interest._id} className="flex items-center justify-between p-4 border-b border-[#fdfaf5] last:border-0 hover:bg-[#fdfaf5]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#fdfaf5] border border-[#e5d5b7] flex items-center justify-center text-[#8b6d31] font-bold overflow-hidden">
                          {senderPhoto ? (
                            <Image src={senderPhoto} alt="" width={48} height={48} className="object-cover" />
                          ) : (
                            senderName[0] || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{senderName}</p>
                          <p className="text-xs text-gray-500">{senderLocation}</p>
                        </div>
                      </div>
                      {interest.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4"
                            onClick={() => handleAction(interest._id, 'accepted')}
                          >
                            {t('accept')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleAction(interest._id, 'rejected')}
                          >
                            {t('reject')}
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className={
                          interest.status === 'accepted' ? "text-green-600 bg-green-50 border-green-100" : "text-red-600 bg-red-50 border-red-100"
                        }>
                          {interest.status}
                        </Badge>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 italic">
                  No recent interests received.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Suggested Matches */}
          <Card className="border-[#e5d5b7] bg-white shadow-sm">
            <CardHeader className="border-b border-[#fdfaf5]">
              <CardTitle className="text-xl font-serif text-[#8b6d31]">{t('suggestedMatches')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : suggestedProfiles.length > 0 ? (
                suggestedProfiles.map((profile) => (
                  <div key={profile._id} className="flex items-center justify-between p-4 border-b border-[#fdfaf5] last:border-0 hover:bg-[#fdfaf5]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#fdfaf5] border border-[#e5d5b7] flex items-center justify-center text-[#8b6d31] font-bold overflow-hidden">
                        {profile.photos?.[0] ? (
                          <Image src={profile.photos[0]} alt="" width={48} height={48} className="object-cover" />
                        ) : (
                          profile.fullName?.[0] || 'U'
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg">{user?.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{profile.age} {t('yrs')} • {profile.location || 'Location hidden'}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/profile/${profile._id}`}>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#d4af37] hover:bg-[#fdfaf5]">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 italic">
                  No suggestions available.
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 bg-[#fdfaf5]/50">
              <Link href="/dashboard/search" className="w-full">
                <Button className="w-full bg-white border border-[#e5d5b7] text-[#8b6d31] hover:bg-white/80 shadow-sm">
                  {t('findMoreMatches')}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Help Card */}
          <Card className="border-none bg-gradient-to-br from-[#8b6d31] to-[#d4af37] text-white overflow-hidden shadow-lg shadow-[#d4af37]/20">
            <CardContent className="p-6 relative">
              <Heart className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
              <h3 className="text-xl font-serif font-bold mb-2">{t('needAssistance')}</h3>
              <p className="text-white/80 text-sm mb-6">{t('assistanceDesc')}</p>
              <Button className="w-full bg-white text-[#8b6d31] hover:bg-white/90 font-bold">
                {t('talkToExpert')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Creation Prompt Dialog */}
      <Dialog open={showProfilePrompt} onOpenChange={setShowProfilePrompt}>
        <DialogContent className="sm:max-w-md bg-white border-gold/20">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <User className="text-amber-600 w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-heading text-[#8b6d31]">{t('completeProfile')}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {t('noProfileDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Link href="/dashboard/profile" className="w-full">
              <Button className="w-full bg-[#d4af37] hover:bg-[#b8962f] text-white rounded-full py-6">
                {t('createProfileNow')}
              </Button>
            </Link>
          </div>
          <DialogFooter className="text-center sm:justify-center text-xs text-gray-400">
            {t('profileTip')}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
