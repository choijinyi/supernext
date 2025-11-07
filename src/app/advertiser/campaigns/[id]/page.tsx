'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useCampaign,
  useCampaignApplications,
  useUpdateCampaignStatus,
  useSelectApplicants,
} from '@/features/platform/hooks/usePlatform';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin, Users, Gift, Target, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvertiserCampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdvertiserCampaignDetailPage({ params }: AdvertiserCampaignDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  
  const { data: campaignData, isLoading: campaignLoading } = useCampaign(id);
  const { data: applicationsData, isLoading: applicationsLoading } = useCampaignApplications(id);
  const updateStatus = useUpdateCampaignStatus();
  const selectApplicants = useSelectApplicants();

  const campaign = campaignData?.data;
  const applications = applicationsData?.data || [];

  const handleCloseCampaign = async () => {
    try {
      await updateStatus.mutateAsync({ campaignId: id, status: 'closed' });
      toast({
        title: '모집 종료',
        description: '체험단 모집이 종료되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '모집 종료에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectApplicants = async () => {
    if (selectedApplicants.length === 0) {
      toast({
        title: '알림',
        description: '선정할 신청자를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await selectApplicants.mutateAsync({
        campaignId: id,
        application_ids: selectedApplicants,
      });
      toast({
        title: '선정 완료',
        description: `${selectedApplicants.length}명의 체험단이 선정되었습니다.`,
      });
      setSelectedApplicants([]);
    } catch (error) {
      toast({
        title: '오류',
        description: '체험단 선정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const toggleApplicant = (applicantId: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(applicantId)
        ? prev.filter((id) => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  const toggleAll = () => {
    if (selectedApplicants.length === applications.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applications.map((app: any) => app.id));
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">체험단을 찾을 수 없습니다</h2>
        <Link href="/advertiser/campaigns">
          <Button>체험단 관리로 돌아가기</Button>
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
          <nav className="flex gap-4 items-center">
            <Link href="/advertiser/campaigns">
              <Button variant="ghost">← 체험단 관리</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Campaign Info */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-2 items-center mb-2">
                  {campaign.status === 'recruiting' && <Badge variant="default">모집중</Badge>}
                  {campaign.status === 'closed' && <Badge variant="secondary">모집종료</Badge>}
                  {campaign.status === 'selected' && <Badge variant="outline">선정완료</Badge>}
                </div>
                <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                <p className="text-muted-foreground">
                  {format(new Date(campaign.created_at), 'yyyy년 M월 d일 등록', { locale: ko })}
                </p>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'recruiting' && (
                  <Button
                    variant="outline"
                    onClick={handleCloseCampaign}
                    disabled={updateStatus.isPending}
                  >
                    모집 종료
                  </Button>
                )}
                <Link href={`/campaigns/${id}`}>
                  <Button variant="secondary">공개 페이지 보기</Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>모집 인원</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {campaign.recruitment_count}명
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>총 신청자</CardDescription>
                  <CardTitle className="text-2xl text-primary">
                    {applications.length}명
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>선정된 인원</CardDescription>
                  <CardTitle className="text-2xl text-green-600">
                    {applications.filter((app: any) => app.status === 'selected').length}명
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Applicants Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>신청자 목록</CardTitle>
                  <CardDescription>
                    {applications.length > 0
                      ? `총 ${applications.length}명이 지원했습니다`
                      : '아직 지원자가 없습니다'}
                  </CardDescription>
                </div>
                {campaign.status === 'closed' && applications.length > 0 && (
                  <Button
                    onClick={handleSelectApplicants}
                    disabled={selectApplicants.isPending || selectedApplicants.length === 0}
                  >
                    {selectApplicants.isPending ? '처리중...' : `선정하기 (${selectedApplicants.length}명)`}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-4">
                  {/* Select All */}
                  {campaign.status === 'closed' && (
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Checkbox
                        checked={selectedApplicants.length === applications.length}
                        onCheckedChange={toggleAll}
                      />
                      <span className="text-sm font-medium">전체 선택</span>
                    </div>
                  )}

                  {applications.map((application: any) => {
                    const influencer = application.user_profiles;
                    const profile = influencer?.influencer_profiles?.[0];

                    return (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {campaign.status === 'closed' && application.status === 'pending' && (
                            <Checkbox
                              checked={selectedApplicants.includes(application.id)}
                              onCheckedChange={() => toggleApplicant(application.id)}
                            />
                          )}

                          <div className="flex-1 space-y-3">
                            {/* Applicant Info */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-lg">{influencer?.name}</h4>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                  {influencer?.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {influencer.email}
                                    </span>
                                  )}
                                  {influencer?.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {influencer.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {application.status === 'pending' && (
                                  <Badge variant="secondary">대기중</Badge>
                                )}
                                {application.status === 'selected' && (
                                  <Badge variant="default">선정됨</Badge>
                                )}
                                {application.status === 'rejected' && (
                                  <Badge variant="destructive">반려됨</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(application.created_at), 'M월 d일 지원', { locale: ko })}
                                </span>
                              </div>
                            </div>

                            {/* SNS Channels */}
                            {profile && (
                              <div className="flex flex-wrap gap-2">
                                {profile.naver_blog_name && (
                                  <Badge variant="outline">네이버: {profile.naver_blog_name}</Badge>
                                )}
                                {profile.youtube_name && (
                                  <Badge variant="outline">유튜브: {profile.youtube_name}</Badge>
                                )}
                                {profile.instagram_name && (
                                  <Badge variant="outline">인스타: {profile.instagram_name}</Badge>
                                )}
                                {profile.threads_name && (
                                  <Badge variant="outline">스레드: {profile.threads_name}</Badge>
                                )}
                              </div>
                            )}

                            <Separator />

                            {/* Application Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">방문 예정일</p>
                                <p className="font-semibold flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(application.visit_date), 'yyyy년 M월 d일 (E)', { locale: ko })}
                                </p>
                              </div>
                            </div>

                            {/* Message */}
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-xs text-muted-foreground mb-1">각오 한마디</p>
                              <p className="text-sm">{application.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">아직 지원자가 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    모집 기간 동안 인플루언서들의 지원을 기다려주세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

