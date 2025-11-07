'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSignupAdvertiser, useSignupInfluencer } from '@/features/platform/hooks/usePlatform';
import {
  completeAdvertiserSignupSchema,
  completeInfluencerSignupSchema,
  type CompleteAdvertiserSignup,
  type CompleteInfluencerSignup,
} from '@/features/platform/lib/dto';
import { useToast } from '@/hooks/use-toast';

type SignupStep = 'role' | 'basic' | 'details';
type UserRole = 'advertiser' | 'influencer';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<SignupStep>('role');
  const [role, setRole] = useState<UserRole | null>(null);

  const signupAdvertiser = useSignupAdvertiser();
  const signupInfluencer = useSignupInfluencer();

  const basicForm = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms_agreed: false,
    },
  });

  const advertiserForm = useForm<CompleteAdvertiserSignup['advertiser_profile']>({
    defaultValues: {
      business_name: '',
      location: '',
      category: '',
      business_registration_number: '',
    },
  });

  const influencerForm = useForm<CompleteInfluencerSignup['influencer_profile']>({
    defaultValues: {
      birth_date: '',
      naver_blog_name: '',
      naver_blog_url: '',
      youtube_name: '',
      youtube_url: '',
      instagram_name: '',
      instagram_url: '',
      threads_name: '',
      threads_url: '',
    },
  });

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('basic');
  };

  const handleBasicInfoSubmit = async () => {
    const values = basicForm.getValues();
    
    if (!values.name || !values.phone || !values.email || !values.password) {
      toast({
        title: '오류',
        description: '모든 필수 정보를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast({
        title: '오류',
        description: '비밀번호가 일치하지 않습니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!values.terms_agreed) {
      toast({
        title: '오류',
        description: '약관에 동의해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setStep('details');
  };

  const handleFinalSubmit = async () => {
    const basicValues = basicForm.getValues();

    if (role === 'advertiser') {
      const advertiserValues = advertiserForm.getValues();
      const data: CompleteAdvertiserSignup = {
        name: basicValues.name,
        phone: basicValues.phone,
        email: basicValues.email,
        password: basicValues.password,
        terms_agreed: basicValues.terms_agreed,
        role: 'advertiser',
        advertiser_profile: advertiserValues,
      };

      try {
        await signupAdvertiser.mutateAsync(data);
        toast({
          title: '회원가입 완료',
          description: '광고주 회원가입이 완료되었습니다.',
        });
        router.push('/login');
      } catch (error: any) {
        console.error('Advertiser signup error:', error);
        const errorMessage = error?.response?.data?.message || error?.message || '회원가입에 실패했습니다.';
        toast({
          title: '오류',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } else if (role === 'influencer') {
      const influencerValues = influencerForm.getValues();
      const data: CompleteInfluencerSignup = {
        name: basicValues.name,
        phone: basicValues.phone,
        email: basicValues.email,
        password: basicValues.password,
        terms_agreed: basicValues.terms_agreed,
        role: 'influencer',
        influencer_profile: influencerValues,
      };

      try {
        await signupInfluencer.mutateAsync(data);
        toast({
          title: '회원가입 완료',
          description: '인플루언서 회원가입이 완료되었습니다.',
        });
        router.push('/login');
      } catch (error: any) {
        console.error('Influencer signup error:', error);
        const errorMessage = error?.response?.data?.message || error?.message || '회원가입에 실패했습니다.';
        toast({
          title: '오류',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            {step === 'role' && '역할을 선택해주세요'}
            {step === 'basic' && '기본 정보를 입력해주세요'}
            {step === 'details' && (role === 'advertiser' ? '광고주 정보를 입력해주세요' : '인플루언서 정보를 입력해주세요')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'role' && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32"
                onClick={() => handleRoleSelect('advertiser')}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  <span className="text-lg font-semibold">광고주</span>
                  <span className="text-sm text-muted-foreground">체험단 모집</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-32"
                onClick={() => handleRoleSelect('influencer')}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span className="text-lg font-semibold">인플루언서</span>
                  <span className="text-sm text-muted-foreground">체험단 참여</span>
                </div>
              </Button>
            </div>
          )}

          {step === 'basic' && (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input id="name" {...basicForm.register('name')} placeholder="홍길동" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">휴대폰번호 *</Label>
                <Input id="phone" {...basicForm.register('phone')} placeholder="010-1234-5678" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input id="email" type="email" {...basicForm.register('email')} placeholder="example@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input id="password" type="password" {...basicForm.register('password')} placeholder="최소 8자 이상" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                <Input id="confirmPassword" type="password" {...basicForm.register('confirmPassword')} placeholder="비밀번호 재입력" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={basicForm.watch('terms_agreed')}
                  onCheckedChange={(checked) => basicForm.setValue('terms_agreed', !!checked)}
                />
                <Label htmlFor="terms" className="cursor-pointer">
                  이용약관 및 개인정보처리방침에 동의합니다 *
                </Label>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('role')} className="flex-1">
                  이전
                </Button>
                <Button type="button" onClick={handleBasicInfoSubmit} className="flex-1">
                  다음
                </Button>
              </div>
            </form>
          )}

          {step === 'details' && role === 'advertiser' && (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">업체명 *</Label>
                <Input id="business_name" {...advertiserForm.register('business_name')} placeholder="회사명 또는 매장명" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">위치 *</Label>
                <Input id="location" {...advertiserForm.register('location')} placeholder="서울시 강남구..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Input id="category" {...advertiserForm.register('category')} placeholder="예: 음식점, 카페, 뷰티..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_registration_number">사업자등록번호 *</Label>
                <Input
                  id="business_registration_number"
                  {...advertiserForm.register('business_registration_number')}
                  placeholder="123-45-67890"
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('basic')} className="flex-1">
                  이전
                </Button>
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={signupAdvertiser.isPending}
                  className="flex-1"
                >
                  {signupAdvertiser.isPending ? '처리중...' : '가입완료'}
                </Button>
              </div>
            </form>
          )}

          {step === 'details' && role === 'influencer' && (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">생년월일 *</Label>
                <Input id="birth_date" type="date" {...influencerForm.register('birth_date')} />
              </div>

              <Separator className="my-4" />
              <h3 className="font-semibold">SNS 채널 정보 (최소 1개 이상)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="naver_blog_name">네이버 블로그명</Label>
                  <Input id="naver_blog_name" {...influencerForm.register('naver_blog_name')} placeholder="블로그 이름" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naver_blog_url">네이버 블로그 URL</Label>
                  <Input id="naver_blog_url" {...influencerForm.register('naver_blog_url')} placeholder="https://blog.naver.com/..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube_name">유튜브 채널명</Label>
                  <Input id="youtube_name" {...influencerForm.register('youtube_name')} placeholder="채널 이름" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">유튜브 URL</Label>
                  <Input id="youtube_url" {...influencerForm.register('youtube_url')} placeholder="https://youtube.com/@..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram_name">인스타그램 계정</Label>
                  <Input id="instagram_name" {...influencerForm.register('instagram_name')} placeholder="@username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">인스타그램 URL</Label>
                  <Input id="instagram_url" {...influencerForm.register('instagram_url')} placeholder="https://instagram.com/..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threads_name">스레드 계정</Label>
                  <Input id="threads_name" {...influencerForm.register('threads_name')} placeholder="@username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threads_url">스레드 URL</Label>
                  <Input id="threads_url" {...influencerForm.register('threads_url')} placeholder="https://threads.net/@..." />
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('basic')} className="flex-1">
                  이전
                </Button>
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={signupInfluencer.isPending}
                  className="flex-1"
                >
                  {signupInfluencer.isPending ? '처리중...' : '가입완료'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

