'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, User, Briefcase, Eye } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/routing';

import { useAuth } from '@/context/AuthContext';

interface ProfileCardProps {
  profile: {
    _id: string;
    fullName: string;
    age: number | string;
    gender: string;
    location: string;
    religion?: string;
    caste?: string;
    maritalStatus?: string;
    photos: string[];
    about?: string;
    occupation?: string;
    user?: {
      _id: string;
      name?: string;
      email?: string;
    };
  };
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const t = useTranslations('Search');
  const td = useTranslations('Dashboard');
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendInterest = async () => {
    if (!user) {
      toast.error('Please login to send interest');
      router.push('/login');
      return;
    }

    // Check if user has a profile before sending interest
    try {
      const profileRes = await api.get('/api/profile/me');
      if (!profileRes.data) {
        toast.error('Please create your profile first');
        router.push('/dashboard/profile');
        return;
      }
    } catch (e: any) {
      toast.error('Please create your profile first');
      router.push('/dashboard/profile');
      return;
    }

    setLoading(true);
    try {
      // Use toUserId if profile.user exists, otherwise use profile._id
      const toUserId = profile.user?._id || profile._id;
      await api.post('/api/interests', { toUserId });
      setSent(true);
      toast.success(t('interestSent'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    } finally {
      setLoading(false);
    }
  };

  const detailHref = user ? `/dashboard/profile/${profile._id}` : '/login';

  return (
    <Card className="overflow-hidden border-gold/10 hover:shadow-xl transition-shadow group bg-white">
      <Link href={detailHref}>
        <div className="relative h-72 w-full overflow-hidden cursor-pointer">
          <Image
            src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.fullName}&background=A1122F&color=fff&size=512`}
            alt={profile.fullName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-110 duration-500"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
            <h3 className="text-xl font-bold text-[#fbc02d] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">{profile.fullName}, {profile.age}</h3>
            <p className="text-[10px] flex items-center gap-1 opacity-90 text-white/90 font-medium">
              <MapPin className="w-3 h-3 text-[#fbc02d]" /> {profile.location}
            </p>
          </div>
        </div>
      </Link>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-cream text-deep-red border-gold/20 text-[10px] h-5">
            <User className="w-3 h-3 mr-1" /> {td(`enums.${profile.gender}`)}
          </Badge>
          {profile.religion && (
            <Badge variant="secondary" className="bg-cream text-deep-red border-gold/20 text-[10px] h-5">
              {profile.religion}
            </Badge>
          )}
          {profile.maritalStatus && (
            <Badge variant="secondary" className="bg-cream text-deep-red border-gold/20 text-[10px] h-5">
              {td(`enums.${profile.maritalStatus}`)}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={detailHref} className="flex-1">
          <Button
            variant="outline"
            className="w-full border-deep-red text-deep-red hover:bg-deep-red/10"
          >
            <Eye className="w-4 h-4 mr-2" /> View
          </Button>
        </Link>
        <Button
          onClick={handleSendInterest}
          disabled={loading || sent}
          className={`flex-[1.5] ${sent ? 'bg-green-600 hover:bg-green-700' : 'bg-deep-red hover:bg-deep-red/90'} text-white transition-all`}
        >
          {sent ? (
            <>{t('interestSent')}</>
          ) : (
            <><Heart className="w-4 h-4 mr-2" /> {t('sendInterest')}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
