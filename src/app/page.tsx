'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCampaigns } from '@/features/platform/hooks/usePlatform';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCampaigns({ status: 'recruiting', page, limit: 12 });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold">블로그 체험단</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/campaigns">
              <Button variant="ghost">체험단 목록</Button>
            </Link>
            <Link href="/my/applications">
              <Button variant="ghost">내 지원 목록</Button>
            </Link>
            <Link href="/advertiser/campaigns">
              <Button variant="ghost">체험단 관리</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>회원가입</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold mb-4">
              블로그 체험단 플랫폼
            </h2>
            <p className="text-xl mb-8">
              광고주와 인플루언서를 연결하는 가장 쉬운 방법
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  지금 시작하기
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  체험단 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,234</div>
              <div className="text-muted-foreground">진행중인 체험단</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,678</div>
              <div className="text-muted-foreground">활동 인플루언서</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">9,876</div>
              <div className="text-muted-foreground">누적 리뷰</div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">모집 중인 체험단</h2>
              <p className="text-muted-foreground">지금 바로 지원 가능한 체험단을 확인하세요</p>
            </div>
            <Link href="/campaigns">
              <Button variant="outline">전체 보기</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.data?.campaigns && data.data.campaigns.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.campaigns.map((campaign: any) => (
                  <Link href={`/campaigns/${campaign.id}`} key={campaign.id}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">모집중</Badge>
                          <span className="text-sm text-muted-foreground">
                            {campaign.user_profiles?.advertiser_profiles?.[0]?.business_name || '광고주'}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {campaign.user_profiles?.advertiser_profiles?.[0]?.location || ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">모집 인원</span>
                            <span className="font-semibold">{campaign.recruitment_count}명</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">마감일</span>
                            <span className="font-semibold">
                              {format(new Date(campaign.recruitment_end_date), 'M월 d일', { locale: ko })}
                            </span>
                          </div>
                          <div className="mt-4 p-3 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">혜택</p>
                            <p className="font-medium line-clamp-2">{campaign.benefits}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" variant="outline">
                          자세히 보기
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>

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
            <div className="text-center py-12">
              <p className="text-muted-foreground">현재 모집 중인 체험단이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            광고주도, 인플루언서도 쉽게 사용할 수 있습니다
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                광고주로 시작하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground hover:bg-primary-foreground/10">
                인플루언서로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 블로그 체험단. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
