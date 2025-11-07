'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCampaign } from '@/features/platform/hooks/usePlatform';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin, Users, Gift, Target } from 'lucide-react';

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useCampaign(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">체험단을 찾을 수 없습니다</h2>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const campaign = data.data;
  const advertiser = campaign.user_profiles;
  const advertiserProfile = advertiser?.advertiser_profiles?.[0];
  const hasApplied = !!campaign.user_application;

  const handleApply = () => {
    router.push(`/campaigns/${id}/apply`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold">블로그 체험단</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/">
              <Button variant="ghost">홈</Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="ghost">체험단 목록</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="mb-4">
            {campaign.status === 'recruiting' && (
              <Badge variant="default" className="text-base px-4 py-1">
                모집중
              </Badge>
            )}
            {campaign.status === 'closed' && (
              <Badge variant="secondary" className="text-base px-4 py-1">
                모집종료
              </Badge>
            )}
            {campaign.status === 'selected' && (
              <Badge variant="outline" className="text-base px-4 py-1">
                선정완료
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>

          {/* Advertiser Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{advertiserProfile?.business_name || '광고주'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(campaign.created_at), 'yyyy년 M월 d일', { locale: ko })}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* 모집 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    모집 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">모집 기간</span>
                    <span className="font-semibold">
                      {format(new Date(campaign.recruitment_start_date), 'M월 d일', { locale: ko })} ~{' '}
                      {format(new Date(campaign.recruitment_end_date), 'M월 d일', { locale: ko })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">모집 인원</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {campaign.recruitment_count}명
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">신청자 수</span>
                    <span className="font-semibold">{campaign.application_count || 0}명</span>
                  </div>
                </CardContent>
              </Card>

              {/* 제공 혜택 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    제공 혜택
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.benefits}</p>
                </CardContent>
              </Card>

              {/* 미션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    미션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.mission}</p>
                </CardContent>
              </Card>

              {/* 매장 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    매장 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.store_info}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply CTA */}
              <Card>
                <CardHeader>
                  <CardTitle>지원하기</CardTitle>
                  <CardDescription>
                    {campaign.status === 'recruiting' ? '지금 바로 지원하세요!' : '모집이 종료되었습니다.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasApplied ? (
                    <div className="space-y-4">
                      <Badge variant="outline" className="w-full justify-center py-2">
                        지원 완료
                      </Badge>
                      <p className="text-sm text-muted-foreground text-center">
                        이미 지원하신 체험단입니다.
                      </p>
                      {campaign.user_application && (
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">신청 상태</p>
                          {campaign.user_application.status === 'pending' && (
                            <Badge variant="secondary">대기중</Badge>
                          )}
                          {campaign.user_application.status === 'selected' && (
                            <Badge variant="default">선정됨</Badge>
                          )}
                          {campaign.user_application.status === 'rejected' && (
                            <Badge variant="destructive">반려됨</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleApply}
                      disabled={campaign.status !== 'recruiting'}
                    >
                      {campaign.status === 'recruiting' ? '지원하기' : '모집종료'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Advertiser Info */}
              {advertiserProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>광고주 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">업체명</p>
                      <p className="font-semibold">{advertiserProfile.business_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">위치</p>
                      <p className="font-semibold">{advertiserProfile.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">카테고리</p>
                      <p className="font-semibold">{advertiserProfile.category}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

