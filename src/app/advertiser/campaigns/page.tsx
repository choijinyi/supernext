'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateCampaignDialog } from '@/features/platform/components/create-campaign-dialog';
import { useCampaigns, useUserProfile } from '@/features/platform/hooks/usePlatform';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Users, MapPin } from 'lucide-react';

export default function AdvertiserCampaignsPage() {
  const [page, setPage] = useState(1);
  const { data: profileData } = useUserProfile();
  const { data: campaignsData, isLoading } = useCampaigns({ page, limit: 10 });

  // 현재 사용자의 체험단만 필터링
  const userCampaigns = campaignsData?.data?.campaigns?.filter(
    (campaign: any) => campaign.advertiser_id === profileData?.data?.id
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recruiting':
        return <Badge variant="default">모집중</Badge>;
      case 'closed':
        return <Badge variant="secondary">모집종료</Badge>;
      case 'selected':
        return <Badge variant="outline">선정완료</Badge>;
      case 'completed':
        return <Badge>완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">체험단 관리</h1>
              <p className="text-muted-foreground">등록한 체험단을 관리하고 신청자를 확인하세요</p>
            </div>
            <CreateCampaignDialog />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>전체 체험단</CardDescription>
                <CardTitle className="text-3xl">{userCampaigns.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>모집중</CardDescription>
                <CardTitle className="text-3xl">
                  {userCampaigns.filter((c: any) => c.status === 'recruiting').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>모집종료</CardDescription>
                <CardTitle className="text-3xl">
                  {userCampaigns.filter((c: any) => c.status === 'closed').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>선정완료</CardDescription>
                <CardTitle className="text-3xl">
                  {userCampaigns.filter((c: any) => c.status === 'selected').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Campaigns List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : userCampaigns.length > 0 ? (
            <div className="space-y-4">
              {userCampaigns.map((campaign: any) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      {getStatusBadge(campaign.status)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(campaign.created_at), 'yyyy년 M월 d일 등록', { locale: ko })}
                      </span>
                    </div>
                    <Link href={`/advertiser/campaigns/${campaign.id}`}>
                      <CardTitle className="hover:underline cursor-pointer text-xl">
                        {campaign.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {campaign.user_profiles?.advertiser_profiles?.[0]?.location || '위치 정보 없음'}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">모집 기간</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(campaign.recruitment_start_date), 'M/d', { locale: ko })} ~{' '}
                          {format(new Date(campaign.recruitment_end_date), 'M/d', { locale: ko })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">모집 인원</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {campaign.recruitment_count}명
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">신청자 수</p>
                        <p className="font-semibold text-primary">
                          {campaign.application_count || 0}명 신청
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">제공 혜택</p>
                      <p className="text-sm line-clamp-2">{campaign.benefits}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/advertiser/campaigns/${campaign.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        신청자 관리
                      </Button>
                    </Link>
                    {campaign.status === 'recruiting' && (
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="secondary" className="w-full">
                          공개 페이지 보기
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">아직 등록한 체험단이 없습니다.</p>
                <p className="text-sm text-muted-foreground mb-6">
                  새로운 체험단을 등록하고 인플루언서를 모집하세요!
                </p>
                <CreateCampaignDialog />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

