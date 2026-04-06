'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, Save, User, Trash2, Loader2, Plus, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from 'next-intl';

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const t = useTranslations('Profile');
  const td = useTranslations('Dashboard');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>({
    fullName: '',
    age: '',
    gender: 'male',
    height: '',
    religion: 'hindu',
    caste: '',
    maritalStatus: 'unmarried',
    disability: {
      hasDisability: false,
      details: '',
    },
    education: '',
    occupation: '',
    income: '',
    location: '',
    about: '',
    email: '',
    phone: '',
  });
  const [photos, setPhotos] = useState<any[]>([]); 
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/profile/me');
      if (res.data && res.data._id) {
        setProfile(res.data);
        setPhotos(res.data.photos || []);
        setMode('view');
      } else {
        setMode('create');
        // Pre-fill email and phone from user account
        if (user) {
          setProfile((prev: any) => ({
            ...prev,
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setMode('create');
        // Pre-fill email and phone from user account
        if (user) {
          setProfile((prev: any) => ({
            ...prev,
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      } else {
        toast.error('Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]); // Re-fetch or pre-fill if user context changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append basic profile fields
      formData.append('fullName', profile.fullName);
      formData.append('age', profile.age.toString());
      formData.append('gender', profile.gender);
      formData.append('height', profile.height || '');
      formData.append('religion', profile.religion);
      formData.append('caste', profile.caste || '');
      formData.append('maritalStatus', profile.maritalStatus);
      formData.append('education', profile.education || '');
      formData.append('occupation', profile.occupation || '');
      formData.append('income', profile.income || '');
      formData.append('location', profile.location);
      formData.append('about', profile.about || '');
      
      // Fix: Ensure email and phone are sent during profile creation/update
      // These are required by the backend Profile validation
      formData.append('email', profile.email || '');
      formData.append('phone', profile.phone || '');
      
      // Handle nested disability object for FormData - match backend expectation
      formData.append('hasDisability', profile.disability.hasDisability.toString());
      formData.append('disabilityDetails', profile.disability.details || '');

      // Append photos
      photos.forEach((photo) => {
        if (photo instanceof File) {
          formData.append('photos', photo);
        } else if (typeof photo === 'string') {
          formData.append('existingPhotos[]', photo);
        }
      });

      let res;
      if (mode === 'create') {
        res = await api.post('/api/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Profile created successfully!');
      } else {
        try {
          res = await api.put('/api/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Profile updated successfully!');
        } catch (err: any) {
          // Fallback to POST if PUT returns 404 (upsert logic)
          if (err.response?.status === 404) {
            res = await api.post('/api/profile', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Profile created successfully!');
          } else {
            throw err;
          }
        }
      }
      setProfile(res.data);
      setPhotos(res.data.photos || []);
      // The backend field is 'status', UI often uses 'profileStatus'
      updateUser({ profileStatus: res.data.status || 'pending' });
      setMode('view');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await api.delete('/api/profile');
      toast.success('Profile deleted successfully');
      setProfile(null);
      setPhotos([]);
      setMode('create');
      setIsDeleteDialogOpen(false);
      updateUser({ profileStatus: undefined });
    } catch (error: any) {
      toast.error('Failed to delete profile');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (photos.length + files.length > 5) {
        toast.error("You can upload up to 5 photos only.");
        return;
      }
      setPhotos(prev => [...prev, ...files]);
    }
  };

  const getPhotoPreview = (photo: any) => {
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return photo;
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (mode === 'view' && profile) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-[#e5d5b7] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fdfaf5] flex items-center justify-center text-[#d4af37]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-[#8b6d31] font-bold">{td('myProfile')}</h1>
              <p className="text-sm text-gray-500">Manage your personal information and photos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setMode('edit')}
              className="bg-[#d4af37] hover:bg-[#b8962f] text-white shadow-sm transition-all"
            >
              <Save className="w-4 h-4 mr-2" /> {t('editProfile')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" /> {td('delete')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-4 border-[#e5d5b7] shadow-sm bg-white overflow-hidden h-fit">
            <CardContent className="p-0">
              <div className="relative aspect-[3/4] overflow-hidden group">
                {photos[0] ? (
                  <Image src={getPhotoPreview(photos[0])} alt="Profile" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-[#fdfaf5] text-gray-300">
                    <User className="w-32 h-32" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white text-sm font-medium">Main Profile Photo</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-4 gap-2 bg-[#fdfaf5]">
                {photos.slice(1, 5).map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e5d5b7] shadow-sm hover:scale-105 transition-transform cursor-pointer">
                    <Image src={getPhotoPreview(photo)} alt={`Photo ${i+2}`} fill sizes="96px" className="object-cover" />
                  </div>
                ))}
                {photos.length < 5 && Array(5 - photos.length).fill(0).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-lg border-2 border-dashed border-[#e5d5b7] flex items-center justify-center text-gray-300">
                    <Camera className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-[#e5d5b7] shadow-sm overflow-hidden bg-white">
              <div className="h-2 bg-[#d4af37]" />
              <CardHeader className="pb-2 border-b border-[#fdfaf5]">
                <CardTitle className="text-3xl font-serif text-[#8b6d31]">{profile.fullName}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2 text-base pt-1">
                  <Badge variant="outline" className="border-[#e5d5b7] text-[#8b6d31] bg-[#fdfaf5]">
                    {profile.age} {t('age')}
                  </Badge>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-gray-600">{profile.gender && typeof profile.gender === 'string' ? td(`enums.${profile.gender}`) : ''}</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-gray-600">{profile.maritalStatus && typeof profile.maritalStatus === 'string' ? td(`enums.${profile.maritalStatus}`) : ''}</span>
                  {profile.height && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="font-medium text-gray-600">{profile.height}</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 pt-8">
                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">{t('religion')} / {t('caste')}</Label>
                  <p className="text-lg font-medium text-gray-800">{profile.religion && typeof profile.religion === 'string' ? td(`enums.${profile.religion}`) : ''} / {profile.caste}</p>
                </div>
                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">{t('education')}</Label>
                  <p className="text-lg font-medium text-gray-800">{profile.education || '—'}</p>
                </div>
                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">{t('occupation')}</Label>
                  <p className="text-lg font-medium text-gray-800">{profile.occupation || '—'}</p>
                </div>
                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">{t('income')}</Label>
                  <p className="text-lg font-medium text-gray-800">{profile.income || '—'}</p>
                </div>
              <div className="space-y-1 group">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">Email Address</Label>
                <p className="text-lg font-medium text-gray-800">{user?.email || '—'}</p>
              </div>
              <div className="space-y-1 group">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">Phone Number</Label>
                <p className="text-lg font-medium text-gray-800">{user?.phone || '—'}</p>
              </div>
              <div className="space-y-1 group">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">{t('location')}</Label>
                <p className="text-lg font-medium text-gray-800">{profile.location || '—'}</p>
              </div>
                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-[#d4af37] transition-colors">{t('disability')}</Label>
                  <p className="text-lg font-medium text-gray-800">
                    {profile.disability?.hasDisability ? `Yes - ${profile.disability.details}` : 'No'}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-3 pt-6 border-t border-[#fdfaf5]">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{t('about')}</Label>
                  <div className="bg-[#fdfaf5] p-6 rounded-2xl border border-[#e5d5b7]/30">
                    <p className="text-gray-700 leading-relaxed font-serif text-lg italic">
                      "{profile.about || 'No description provided.'}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md border-[#e5d5b7]">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {td('delete')}
              </DialogTitle>
              <DialogDescription>
                {td('confirmDelete')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[#e5d5b7]">
                {td('cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDeleteProfile} className="bg-red-600 hover:bg-red-700">
                Confirm {td('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif text-[#8b6d31] font-bold">
          {mode === 'create' ? td('createTitle') : td('editTitle')}
        </h1>
        <p className="text-gray-500">{td('createDesc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-[#e5d5b7]">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#8b6d31] flex items-center gap-2">
                <Camera className="w-5 h-5" /> {t('photos')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <Image src={getPhotoPreview(photo)} alt={`Photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-[#e5d5b7] bg-[#fdfaf5] flex flex-col items-center justify-center cursor-pointer hover:bg-[#e5d5b7]/20 transition-colors">
                    <Plus className="w-6 h-6 text-[#d4af37] mb-1" />
                    <span className="text-xs text-[#8b6d31]">Upload</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#e5d5b7]">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#8b6d31]">{td('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t('fullName')}</Label>
                <Input 
                  required
                  value={profile?.fullName || ''} 
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  required
                  type="email"
                  value={profile?.email || ''} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  required
                  value={profile?.phone || ''} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input 
                  placeholder="e.g. 5ft 7in"
                  value={profile?.height || ''} 
                  onChange={(e) => setProfile({...profile, height: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('age')}</Label>
                <Input 
                  type="number" 
                  required
                  min={18}
                  max={80}
                  value={profile?.age || ''} 
                  onChange={(e) => setProfile({...profile, age: e.target.value ? parseInt(e.target.value) : ''})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('gender')}</Label>
                <Select value={profile?.gender || 'male'} onValueChange={(v) => setProfile({...profile, gender: v})}>
                  <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('religion')}</Label>
                <Select value={profile?.religion || 'hindu'} onValueChange={(v) => setProfile({...profile, religion: v})}>
                  <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hindu">Hindu</SelectItem>
                    <SelectItem value="muslim">Muslim</SelectItem>
                    <SelectItem value="sikh">Sikh</SelectItem>
                    <SelectItem value="christian">Christian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('caste')}</Label>
                <Input 
                  value={profile?.caste || ''} 
                  onChange={(e) => setProfile({...profile, caste: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('maritalStatus')}</Label>
                <Select value={profile?.maritalStatus || 'unmarried'} onValueChange={(v) => setProfile({...profile, maritalStatus: v})}>
                  <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unmarried">Unmarried</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widow">Widow / Widower</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disability Status</Label>
                <Select 
                  value={profile?.disability?.hasDisability ? 'true' : 'false'} 
                  onValueChange={(v) => setProfile({...profile, disability: { ...profile.disability, hasDisability: v === 'true' }})}
                >
                  <SelectTrigger className="border-[#e5d5b7] focus:ring-[#d4af37]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {profile?.disability?.hasDisability && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Disability Details</Label>
                  <Input 
                    placeholder="Provide details about disability"
                    value={profile?.disability?.details || ''} 
                    onChange={(e) => setProfile({...profile, disability: { ...profile.disability, details: e.target.value }})}
                    className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#e5d5b7]">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#8b6d31]">{td('eduProf')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t('education')}</Label>
                <Input 
                  value={profile?.education || ''} 
                  onChange={(e) => setProfile({...profile, education: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('occupation')}</Label>
                <Input 
                  value={profile?.occupation || ''} 
                  onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('income')}</Label>
                <Input 
                  value={profile?.income || ''} 
                  onChange={(e) => setProfile({...profile, income: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('location')}</Label>
                <Input 
                  required
                  value={profile?.location || ''} 
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5b7]">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#8b6d31]">{t('about')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[150px] border-[#e5d5b7] focus-visible:ring-[#d4af37]"
                value={profile?.about || ''} 
                onChange={(e) => setProfile({...profile, about: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={submitting}
              className="flex-1 bg-[#d4af37] hover:bg-[#b8962f] text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-[#d4af37]/20 transition-all"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {mode === 'create' ? 'Create My Profile' : 'Save Changes'}
            </Button>
            {mode === 'edit' && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setMode('view')}
                className="px-8 border-[#e5d5b7] text-[#8b6d31] hover:bg-[#fdfaf5]"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
