'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMyApplications } from '@/features/platform/hooks/usePlatform';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';
import type { ApplicationStatus } from '@/features/platform/types';

export default function MyApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  
  const queryStatus = statusFilter === 'all' ? undefined : statusFilter;
  const { data, isLoading } = useMyApplications({ status: queryStatus, page, limit: 10 });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">신청완료</Badge>;
      case 'selected':
        return <Badge variant="default">선정</Badge>;
      case 'rejected':
        return <Badge variant="destructive">반려</Badge>;
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
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">내 지원 목록</h1>
            <p className="text-muted-foreground">지원한 체험단의 진행 상태를 확인하세요</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
            >
              전체
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
            >
              신청완료
            </Button>
            <Button
              variant={statusFilter === 'selected' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('selected');
                setPage(1);
              }}
            >
              선정
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('rejected');
                setPage(1);
              }}
            >
              반려
            </Button>
          </div>

          {/* Applications List */}
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
          ) : data?.data?.applications && data.data.applications.length > 0 ? (
            <>
              <div className="space-y-4">
                {data.data.applications.map((application: any) => {
                  const campaign = application.campaigns;
                  
                  return (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          {getStatusBadge(application.status)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(application.created_at), 'yyyy년 M월 d일', { locale: ko })} 지원
                          </span>
                        </div>
                        <Link href={`/campaigns/${campaign?.id}`}>
                          <CardTitle className="hover:underline cursor-pointer">
                            {campaign?.title || '제목 없음'}
                          </CardTitle>
                        </Link>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          {campaign?.user_profiles?.advertiser_profiles?.[0] && (
                            <>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {campaign.user_profiles.advertiser_profiles[0].business_name}
                              </span>
                              <span>·</span>
                              <span>{campaign.user_profiles.advertiser_profiles[0].location}</span>
                            </>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* 지원 정보 */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">방문 예정일</p>
                              <p className="font-semibold flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(application.visit_date), 'M월 d일 (E)', { locale: ko })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">모집 마감일</p>
                              <p className="font-semibold">
                                {campaign && format(new Date(campaign.recruitment_end_date), 'M월 d일 (E)', { locale: ko })}
                              </p>
                            </div>
                          </div>

                          <Separator />

                          {/* 각오 한마디 */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">각오 한마디</p>
                            <p className="text-sm bg-muted p-3 rounded-md">{application.message}</p>
                          </div>

                          {/* 상태별 안내 */}
                          {application.status === 'pending' && (
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                              <p className="text-sm text-blue-900 dark:text-blue-100">
                                💡 광고주의 검토를 기다리고 있습니다. 선정 결과는 모집 마감 후 안내됩니다.
                              </p>
                            </div>
                          )}
                          {application.status === 'selected' && (
                            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                              <p className="text-sm text-green-900 dark:text-green-100">
                                🎉 축하합니다! 체험단에 선정되셨습니다. 광고주의 추가 안내를 기다려주세요.
                              </p>
                            </div>
                          )}
                          {application.status === 'rejected' && (
                            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                              <p className="text-sm text-red-900 dark:text-red-100">
                                아쉽게도 이번 체험단에 선정되지 못했습니다. 다른 체험단에 도전해보세요!
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/campaigns/${campaign?.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                체험단 상세보기
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {data.data.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    이전
                  </Button>
                  <span className="flex items-center px-4">
                    {page} / {data.data.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= data.data.total_pages}
                    onClick={() => setPage(page + 1)}
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'all'
                    ? '아직 지원한 체험단이 없습니다.'
                    : '해당 상태의 지원 내역이 없습니다.'}
                </p>
                <Link href="/campaigns">
                  <Button>체험단 둘러보기</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

