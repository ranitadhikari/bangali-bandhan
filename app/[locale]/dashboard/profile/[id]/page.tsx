'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MapPin, 
  User, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Accessibility, 
  Info,
  ArrowLeft,
  Mail,
  Phone,
  Loader2,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestRecord, setInterestRecord] = useState<any>(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const t = useTranslations('Search');
  const td = useTranslations('Dashboard');
  const tr = useTranslations('Requests');

  const mid = currentUser?.id || (currentUser as any)?._id;
  const isOwnProfile = !!mid && (
    mid === profile?.user?._id || 
    mid === profile?.user || 
    mid === profile?._id ||
    mid === profile?.user?.id
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Step 1: Try fetching directly by ID
        let data = null;
        try {
          const response = await api.get(`/api/profile/${id}`);
          data = response.data?.profile || response.data;
        } catch (e) {
          console.log("Direct profile fetch failed, trying search fallback...");
        }

        // Step 2: Search fallback if direct fetch failed or returned empty
        if (!data || typeof data !== 'object' || !data._id) {
          const searchRes = await api.get('/api/profile/search');
          const allProfiles = searchRes.data?.profiles || (Array.isArray(searchRes.data) ? searchRes.data : []);
          
          data = allProfiles.find((p: any) => 
            p._id === id || 
            p.user?._id === id || 
            p.user === id
          );
        }

        if (data && data._id) {
          setProfile(data);
          await checkInterestStatus(data);
        } else {
          toast.error('Profile not found');
        }
      } catch (error) {
        console.error('All fetch attempts failed', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const checkInterestStatus = async (profileData: any) => {
      try {
        // Fetch both sent and received interests to determine mutual status
        const [sentRes, receivedRes] = await Promise.all([
          api.get('/api/interests/sent'),
          api.get('/api/interests/received')
        ]);

        const sentData = sentRes.data?.interests || (Array.isArray(sentRes.data) ? sentRes.data : []);
        const receivedData = receivedRes.data?.interests || (Array.isArray(receivedRes.data) ? receivedRes.data : []);
        
        // Find if there's any interest between these users
        const matchInterest = (interestList: any[], isSent: boolean) => {
          return interestList.find((i: any) => {
            const otherId = isSent 
              ? ((typeof i.toUser === 'object' ? i.toUser?._id : i.toUser) || (typeof i.receiver === 'object' ? i.receiver?._id : i.receiver))
              : ((typeof i.fromUser === 'object' ? i.fromUser?._id : i.fromUser) || (typeof i.sender === 'object' ? i.sender?._id : i.sender));
            
            return (
              otherId === id || 
              otherId === profileData._id || 
              otherId === profileData.user?._id ||
              otherId === profileData.user
            );
          });
        };

        const sentInterest = matchInterest(sentData, true);
        const receivedInterest = matchInterest(receivedData, false);

        setInterestRecord(sentInterest || receivedInterest || null);
      } catch (e) {
        console.error("Failed to check interest status", e);
      }
    };

    fetchProfile();
  }, [id, currentUser?.id]);

  const handleSendInterest = async () => {
    setSendingInterest(true);
    try {
      const toUserId = profile.user?._id || profile._id;
      await api.post('/api/interests', { toUserId });
      toast.success(t('interestSent'));
      // Refresh status
      try {
        const sentRes = await api.get('/api/interests/sent');
        const sentData = sentRes.data?.interests || (Array.isArray(sentRes.data) ? sentRes.data : []);
        const newInterest = sentData.find((i: any) => 
          (i.toUser?._id || i.toUser || i.receiver?._id || i.receiver) === (profile.user?._id || profile._id)
        );
        if (newInterest) setInterestRecord(newInterest);
      } catch (e) {}
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] w-full rounded-2xl lg:col-span-1" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20">Profile not found.</div>;

  const renderInterestButton = () => {
    if (isOwnProfile) return null;

    if (!interestRecord) {
      return (
        <Button
          onClick={handleSendInterest}
          disabled={sendingInterest}
          className="w-full py-6 rounded-xl text-lg transition-all bg-deep-red hover:bg-deep-red/90 text-white"
        >
          {sendingInterest ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Heart className="w-5 h-5 mr-2" />
          )}
          {t('sendInterest')}
        </Button>
      );
    }

    const { status } = interestRecord;

    if (status === 'accepted') {
      return (
        <Button
          disabled
          className="w-full py-6 rounded-xl text-lg transition-all bg-green-600 text-white opacity-100"
        >
          <Check className="w-5 h-5 mr-2" /> Match Accepted ❤️
        </Button>
      );
    }

    if (status === 'rejected') {
      return (
        <Button
          disabled
          className="w-full py-6 rounded-xl text-lg transition-all bg-gray-500 text-white opacity-100"
        >
          <X className="w-5 h-5 mr-2" /> Request Rejected ❌
        </Button>
      );
    }

    // Pending state
    return (
      <Button
        disabled
        className="w-full py-6 rounded-xl text-lg transition-all bg-amber-500 text-white opacity-100"
      >
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Interest Sent ⏳
      </Button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/dashboard/search">
        <Button variant="ghost" className="mb-6 text-[#8b6d31] hover:bg-[#fdfaf5]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-gold/10 shadow-lg rounded-2xl">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.fullName}&background=A1122F&color=fff&size=512`}
                alt={profile.fullName}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <CardContent className="p-6 text-center">
              <h1 className="text-3xl font-serif text-[#8b6d31] font-bold mb-2">{profile.fullName}</h1>
              <p className="text-gray-500 mb-6">{profile.age} yrs • {profile.location}</p>
              
              {renderInterestButton()}
            </CardContent>
          </Card>

          {/* Additional Photos */}
          {profile.photos?.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.slice(1).map((photo: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gold/10">
                  <Image src={photo} alt="" fill sizes="128px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gold/10 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#fdfaf5] border-b border-gold/10">
              <CardTitle className="text-xl font-serif text-[#8b6d31] flex items-center gap-2">
                <Info className="w-5 h-5" /> About {profile.fullName.split(' ')[0]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.about || "No bio provided."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gold/10 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif text-[#8b6d31] flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem label="Gender" value={td(`enums.${profile.gender}`)} />
                <DetailItem label="Religion" value={td(`enums.${profile.religion}`)} />
                <DetailItem label="Caste" value={profile.caste || 'N/A'} />
                <DetailItem label="Marital Status" value={td(`enums.${profile.maritalStatus}`)} />
                {profile.height && <DetailItem label="Height" value={profile.height} />}
                <div className="flex justify-between items-center py-2 border-b border-[#fdfaf5] last:border-0">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Accessibility className="w-4 h-4" /> <span>Disability</span>
                  </div>
                  <span className="font-semibold text-[#8b6d31]">
                    {profile.disability?.hasDisability ? `Yes - ${profile.disability.details || ''}` : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/10 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif text-[#8b6d31] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Professional Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem label="Education" value={profile.education} icon={<GraduationCap className="w-4 h-4" />} />
                <DetailItem label="Occupation" value={profile.occupation} icon={<Briefcase className="w-4 h-4" />} />
                <DetailItem label="Income" value={profile.income} icon={<DollarSign className="w-4 h-4" />} />
              </CardContent>
            </Card>
          </div>
          
            <Card className="border-gold/10 shadow-sm rounded-2xl overflow-hidden border-2 border-amber-100/50">
              <CardHeader className="bg-[#fdfaf5] border-b border-gold/10">
                <CardTitle className="text-lg font-serif text-[#8b6d31] flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isOwnProfile || interestRecord?.status === 'accepted' ? (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between py-2 border-b border-[#fdfaf5]">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Mail className="w-4 h-4" /> <span>Email Address</span>
                      </div>
                      <span className="font-semibold text-[#8b6d31]">{profile.user?.email || profile.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#fdfaf5] last:border-0">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Phone className="w-4 h-4" /> <span>Phone Number</span>
                      </div>
                      <span className="font-semibold text-[#8b6d31]">
                        {profile.user?.phone || profile.phone || profile.phoneNumber || profile.mobile || 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl bg-amber-50/50 border border-amber-100 border-dashed">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-[#8b6d31] font-medium mb-1">Contact details are locked</p>
                    <p className="text-sm text-gray-500">
                      👉 Contact details will be visible after match is accepted
                    </p>
                    {!interestRecord && (
                      <Button 
                        variant="link" 
                        onClick={handleSendInterest}
                        className="mt-2 text-deep-red font-bold"
                      >
                        Send Interest to Connect
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#fdfaf5] last:border-0">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        {icon} <span>{label}</span>
      </div>
      <span className="font-semibold text-[#8b6d31]">{value}</span>
    </div>
  );
}
