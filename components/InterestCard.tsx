'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Check, X, Heart, Mail, Eye, Phone } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';

interface InterestCardProps {
  interest: {
    _id: string;
    sender?: any;
    receiver?: any;
    fromUser?: any;
    toUser?: any;
    from?: any;
    to?: any;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    email?: string;
  };
  type: 'received' | 'sent';
  onUpdate?: () => void;
}

export default function InterestCard({ interest, type, onUpdate }: InterestCardProps) {
  const t = useTranslations('Requests');
  const td = useTranslations('Dashboard');
  const [loading, setLoading] = useState(false);
  
  // Robust profile extraction based on the provided backend controller
  const rawTarget = type === 'received' 
    ? (interest.fromUser || interest.sender || interest.from) 
    : (interest.toUser || interest.receiver || interest.to);
  
  // Try to find if this user object has an associated profile
  // If not, we'll use the user object itself as a fallback for name/email/phone
  const profile = rawTarget?.profile || (rawTarget?._id ? rawTarget : null);
  
  // Backend returns 'name' in User model, but 'fullName' in Profile model
  const displayName = 
    rawTarget?.name || 
    profile?.fullName || 
    profile?.name || 
    'Member';
  
  const email = type === 'received' 
    ? (interest.fromUser?.email || interest.sender?.user?.email || interest.sender?.email || interest.from?.email || profile?.email || rawTarget?.email || interest.email) 
    : (interest.toUser?.email || interest.receiver?.user?.email || interest.receiver?.email || interest.to?.email || profile?.email || rawTarget?.email || interest.email);

  const phone = type === 'received'
    ? (interest.fromUser?.phone || interest.sender?.user?.phone || interest.sender?.phone || interest.from?.phone || profile?.phone || rawTarget?.phone)
    : (interest.toUser?.phone || interest.receiver?.user?.phone || interest.receiver?.phone || interest.to?.phone || profile?.phone || rawTarget?.phone);

  const handleAction = async (action: 'accepted' | 'rejected') => {
    setLoading(true);
    try {
      await api.put(`/api/interests/${interest._id}`, { status: action });
      toast.success(`Interest ${action}`);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // Only return null if we have absolutely no data about the person
  if (!rawTarget && !interest.sender && !interest.receiver && !interest.to && !interest.from && !interest.toUser && !interest.fromUser) return null;

  // Robust ID extraction
  const profileId = 
    (typeof profile === 'object' ? profile?._id : null) || 
    (typeof rawTarget === 'object' ? rawTarget?._id : null) || 
    (typeof rawTarget === 'string' ? rawTarget : null) ||
    interest.toUser?._id ||
    interest.fromUser?._id ||
    interest.receiver?._id || 
    interest.sender?._id ||
    interest.to?._id ||
    interest.from?._id;

  return (
    <Card className="overflow-hidden border-gold/10 bg-white hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <Link href={profileId ? `/dashboard/profile/${profileId}` : '#'} className="relative w-full sm:w-32 h-40 sm:h-auto overflow-hidden block bg-[#fdfaf5]">
          {profile?.photos?.[0] ? (
            <Image
              src={profile.photos[0]}
              alt={displayName}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : rawTarget?.photos?.[0] ? (
            <Image
              src={rawTarget.photos[0]}
              alt={displayName}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#d4af37] bg-[#fdfaf5]">
              {displayName !== 'Member' ? (
                <span className="text-2xl font-bold">{displayName[0]}</span>
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>
          )}
        </Link>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Link href={profileId ? `/dashboard/profile/${profileId}` : '#'}>
                <h3 className="text-lg font-bold text-gray-800 hover:text-deep-red transition-colors">
                  {displayName}{(profile?.age || rawTarget?.age) ? `, ${profile?.age || rawTarget?.age}` : ''}
                </h3>
              </Link>
              <Badge 
                variant="outline" 
                className={
                  interest.status === 'accepted' ? "border-green-500 text-green-600 bg-green-50" :
                  interest.status === 'rejected' ? "border-red-500 text-red-600 bg-red-50" :
                  "border-yellow-500 text-yellow-600 bg-yellow-50"
                }
              >
                {t(interest.status)}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              {profile?.location && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</p>}
              {profile?.gender && <p className="flex items-center gap-1"><User className="w-3 h-3" /> {td(`enums.${profile.gender}`)}</p>}
              <div className="flex flex-col gap-1 mt-2">
                {interest.status === 'accepted' ? (
                  <div className="bg-green-50 p-2 rounded-lg border border-green-100 space-y-1">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">
                      {t('matchFound')}
                    </p>
                    {email && (
                      <p className="flex items-center gap-1.5 text-deep-red font-semibold">
                        <Mail className="w-3.5 h-3.5" /> 
                        <span className="truncate">{email}</span>
                      </p>
                    )}
                    {phone && (
                      <p className="flex items-center gap-1.5 text-deep-red font-semibold">
                        <Phone className="w-3.5 h-3.5" /> 
                        <span>{phone}</span>
                      </p>
                    )}
                    {!phone && !email && (
                      <p className="text-xs text-gray-500 italic">Contact details will be shared via email</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Contact details visible after acceptance
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {type === 'received' && interest.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => handleAction('accepted')} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <Check className="w-4 h-4 mr-1" /> {t('accept')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAction('rejected')} 
                  disabled={loading}
                  className="border-red-500 text-red-600 hover:bg-red-50 flex-1"
                >
                  <X className="w-4 h-4 mr-1" /> {t('reject')}
                </Button>
              </>
            )}
            {profileId && (
              <Link href={`/dashboard/profile/${profileId}`} className="flex-1">
                <Button size="sm" variant="ghost" className="w-full text-[#d4af37] hover:bg-[#fdfaf5]">
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
