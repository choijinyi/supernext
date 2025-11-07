'use client';

import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaign, useCreateApplication } from '@/features/platform/hooks/usePlatform';
import { createApplicationSchema, type CreateApplication } from '@/features/platform/lib/dto';
import { useToast } from '@/hooks/use-toast';

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data: campaignData, isLoading: campaignLoading } = useCampaign(id);
  const createApplication = useCreateApplication();

  const form = useForm<CreateApplication>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      campaign_id: id,
      message: '',
      visit_date: '',
    },
  });

  const handleSubmit = async (data: CreateApplication) => {
    try {
      await createApplication.mutateAsync(data);
      toast({
        title: '지원 완료',
        description: '체험단 지원이 완료되었습니다.',
      });
      router.push(`/campaigns/${id}`);
    } catch (error: any) {
      toast({
        title: '지원 실패',
        description: error.response?.data?.message || '지원에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const campaign = campaignData?.data;

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">체험단을 찾을 수 없습니다</h2>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold">블로그 체험단</h1>
          </Link>
          <Link href={`/campaigns/${id}`}>
            <Button variant="ghost">← 뒤로가기</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>체험단 지원하기</CardTitle>
              <CardDescription>{campaign.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* 각오 한마디 */}
                <div className="space-y-2">
                  <Label htmlFor="message">
                    각오 한마디 *
                    <span className="text-muted-foreground text-sm ml-2">(최소 10자)</span>
                  </Label>
                  <Textarea
                    id="message"
                    {...form.register('message')}
                    placeholder="이 체험단에 지원하시는 이유와 각오를 작성해주세요. (예: 평소 해당 브랜드에 관심이 많았으며, 솔직한 리뷰로 많은 분들께 도움이 되고 싶습니다.)"
                    rows={6}
                    className={form.formState.errors.message ? 'border-destructive' : ''}
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                  )}
                </div>

                {/* 방문 예정일자 */}
                <div className="space-y-2">
                  <Label htmlFor="visit_date">
                    방문 예정일자 *
                    <span className="text-muted-foreground text-sm ml-2">(체험 가능한 날짜)</span>
                  </Label>
                  <Input
                    id="visit_date"
                    type="date"
                    {...form.register('visit_date')}
                    min={new Date().toISOString().split('T')[0]}
                    className={form.formState.errors.visit_date ? 'border-destructive' : ''}
                  />
                  {form.formState.errors.visit_date && (
                    <p className="text-sm text-destructive">{form.formState.errors.visit_date.message}</p>
                  )}
                </div>

                {/* 안내사항 */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">📌 지원 전 확인사항</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>체험단 선정 후에는 반드시 미션을 완료해주셔야 합니다.</li>
                    <li>허위 정보 기재 시 선정이 취소될 수 있습니다.</li>
                    <li>선정 결과는 모집 마감 후 개별 안내됩니다.</li>
                    <li>방문 예정일은 선정 후 광고주와 협의하여 조정 가능합니다.</li>
                  </ul>
                </div>

                {/* 제출 버튼 */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createApplication.isPending}
                  >
                    {createApplication.isPending ? '제출 중...' : '지원하기'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

