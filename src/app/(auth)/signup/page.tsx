'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
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

const basicInfoSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  phone: z.string().min(10, '올바른 휴대폰 번호를 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  terms_agreed: z.boolean().refine((val) => val === true, '약관에 동의해야 합니다'),
});

type BasicInfo = z.infer<typeof basicInfoSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<SignupStep>('role');
  const [role, setRole] = useState<UserRole | null>(null);

  const signupAdvertiser = useSignupAdvertiser();
  const signupInfluencer = useSignupInfluencer();

  const basicForm = useForm<BasicInfo>({
    resolver: zodResolver(basicInfoSchema),
    mode: 'onBlur',
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
    console.log('=== Basic Info Submit ===');
    
    const isValid = await basicForm.trigger();
    console.log('Form validation result:', isValid);
    console.log('Form errors:', basicForm.formState.errors);
    console.log('Form values:', basicForm.getValues());

    if (!isValid) {
      const errors = basicForm.formState.errors;
      const firstError = Object.values(errors)[0];
      toast({
        title: '입력 오류',
        description: firstError?.message || '입력 정보를 확인해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const values = basicForm.getValues();
    
    if (values.password !== values.confirmPassword) {
      basicForm.setError('confirmPassword', {
        type: 'manual',
        message: '비밀번호가 일치하지 않습니다.',
      });
      toast({
        title: '오류',
        description: '비밀번호가 일치하지 않습니다.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Validation passed, moving to details step');
    setStep('details');
  };

  const handleFinalSubmit = async () => {
    const basicValues = basicForm.getValues();

    console.log('=== Final Submit Started ===');
    console.log('Role:', role);

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

      console.log('Advertiser signup data:', { ...data, password: '***' });

      try {
        console.log('Calling signupAdvertiser.mutateAsync...');
        const result = await signupAdvertiser.mutateAsync(data);
        console.log('Signup success:', result);
        
        toast({
          title: '회원가입 완료',
          description: '광고주 회원가입이 완료되었습니다.',
        });
        router.push('/login');
      } catch (error: any) {
        console.error('=== Advertiser signup error ===');
        console.error('Error object:', error);
        console.error('Error response:', error?.response);
        console.error('Error response data:', error?.response?.data);
        
        const errorData = error?.response?.data;
        const errorMessage = errorData?.error?.message || errorData?.message || error?.message || '회원가입에 실패했습니다.';
        const errorDetails = errorData?.error?.details;
        
        toast({
          title: '오류',
          description: errorDetails 
            ? `${errorMessage}\n${JSON.stringify(errorDetails, null, 2)}`
            : errorMessage,
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

      console.log('Influencer signup data:', { ...data, password: '***' });

      try {
        console.log('Calling signupInfluencer.mutateAsync...');
        const result = await signupInfluencer.mutateAsync(data);
        console.log('Signup success:', result);
        
        toast({
          title: '회원가입 완료',
          description: '인플루언서 회원가입이 완료되었습니다.',
        });
        router.push('/login');
      } catch (error: any) {
        console.error('=== Influencer signup error ===');
        console.error('Error object:', error);
        console.error('Error response:', error?.response);
        console.error('Error response data:', error?.response?.data);
        
        const errorData = error?.response?.data;
        const errorMessage = errorData?.error?.message || errorData?.message || error?.message || '회원가입에 실패했습니다.';
        const errorDetails = errorData?.error?.details;
        
        toast({
          title: '오류',
          description: errorDetails 
            ? `${errorMessage}\n${JSON.stringify(errorDetails, null, 2)}`
            : errorMessage,
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
                {basicForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{basicForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">휴대폰번호 *</Label>
                <Input id="phone" {...basicForm.register('phone')} placeholder="010-1234-5678" />
                {basicForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">{basicForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input id="email" type="email" {...basicForm.register('email')} placeholder="example@example.com" />
                {basicForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{basicForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input id="password" type="password" {...basicForm.register('password')} placeholder="최소 8자 이상" />
                {basicForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{basicForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                <Input id="confirmPassword" type="password" {...basicForm.register('confirmPassword')} placeholder="비밀번호 재입력" />
                {basicForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{basicForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
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
                {basicForm.formState.errors.terms_agreed && (
                  <p className="text-sm text-red-500">{basicForm.formState.errors.terms_agreed.message}</p>
                )}
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
                  {signupAdvertiser.isPending && (
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  )}
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
                  {signupInfluencer.isPending && (
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  )}
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

