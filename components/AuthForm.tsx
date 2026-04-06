'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from '@/i18n/routing';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations('Auth');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin, user } = useAuth();

  const loginSchema = z.object({
    email: z.string().email(t('emailLabel')),
    password: z.string().min(6, t('passwordLabel')),
  });

  const registerSchema = z.object({
    name: z.string().min(2, t('fullNameLabel')),
    email: z.string().email(t('emailLabel')),
    password: z.string().min(6, t('passwordLabel')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const schema = mode === 'login' ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (mode === 'register') {
        await api.post('/api/auth/register', data);
        toast.success(t('registerTitle') + ' successful!');
        router.push('/login');
      } else {
        const response = await api.post('/api/auth/login', data);
        const { token, user: userData } = response.data;
        authLogin(token, userData);
        toast.success(t('loginButton') + ' successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4 bg-[#fdfaf5]">
      <Card className="w-full max-w-md border-none shadow-xl bg-white ring-1 ring-[#e5d5b7]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif text-[#8b6d31]">
            {mode === 'login' ? t('loginTitle') : t('registerTitle')}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {mode === 'login'
              ? 'Find your perfect match today'
              : 'Create your account to start your journey'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#8b6d31]">{t('fullNameLabel')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`border-[#e5d5b7] focus-visible:ring-[#d4af37] ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500">{(errors.name as any).message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8b6d31]">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register('email')}
                className={`border-[#e5d5b7] focus-visible:ring-[#d4af37] ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500">{(errors.email as any).message}</p>}
            </div>
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#8b6d31]">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  {...register('phone')}
                  className={`border-[#e5d5b7] focus-visible:ring-[#d4af37] ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-500">{(errors.phone as any).message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#8b6d31]">{t('passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`border-[#e5d5b7] focus-visible:ring-[#d4af37] ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-xs text-red-500">{(errors.password as any).message}</p>}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#b8962f] text-white font-semibold transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                mode === 'login' ? t('loginButton') : t('registerButton')
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-[#fdfaf5] mt-4 pt-4">
          <button
            onClick={() => router.push(mode === 'login' ? '/register' : '/login')}
            className="text-sm text-[#8b6d31] hover:underline transition-colors"
          >
            {mode === 'login'
              ? t('noAccount')
              : t('haveAccount')}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
