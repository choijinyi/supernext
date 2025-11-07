'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateCampaign } from '../hooks/usePlatform';
import { createCampaignSchema, type CreateCampaign } from '../lib/dto';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createCampaign = useCreateCampaign();

  const form = useForm<CreateCampaign>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: '',
      recruitment_start_date: '',
      recruitment_end_date: '',
      recruitment_count: 1,
      benefits: '',
      store_info: '',
      mission: '',
    },
  });

  const handleSubmit = async (data: CreateCampaign) => {
    try {
      await createCampaign.mutateAsync(data);
      toast({
        title: '체험단 등록 완료',
        description: '새로운 체험단이 등록되었습니다.',
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: '등록 실패',
        description: error.response?.data?.message || '체험단 등록에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="h-5 w-5 mr-2" />
          새 체험단 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 체험단 등록</DialogTitle>
          <DialogDescription>
            모집하실 체험단 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
          {/* 체험단명 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              체험단명 *
              <span className="text-muted-foreground text-sm ml-2">(최소 5자)</span>
            </Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="예: 강남 맛집 브런치 카페 체험단"
              className={form.formState.errors.title ? 'border-destructive' : ''}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* 모집 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recruitment_start_date">모집 시작일 *</Label>
              <Input
                id="recruitment_start_date"
                type="date"
                {...form.register('recruitment_start_date')}
                min={new Date().toISOString().split('T')[0]}
                className={form.formState.errors.recruitment_start_date ? 'border-destructive' : ''}
              />
              {form.formState.errors.recruitment_start_date && (
                <p className="text-sm text-destructive">{form.formState.errors.recruitment_start_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recruitment_end_date">모집 마감일 *</Label>
              <Input
                id="recruitment_end_date"
                type="date"
                {...form.register('recruitment_end_date')}
                min={form.watch('recruitment_start_date') || new Date().toISOString().split('T')[0]}
                className={form.formState.errors.recruitment_end_date ? 'border-destructive' : ''}
              />
              {form.formState.errors.recruitment_end_date && (
                <p className="text-sm text-destructive">{form.formState.errors.recruitment_end_date.message}</p>
              )}
            </div>
          </div>

          {/* 모집 인원 */}
          <div className="space-y-2">
            <Label htmlFor="recruitment_count">
              모집 인원 *
              <span className="text-muted-foreground text-sm ml-2">(1명 이상)</span>
            </Label>
            <Input
              id="recruitment_count"
              type="number"
              min="1"
              {...form.register('recruitment_count', { valueAsNumber: true })}
              placeholder="5"
              className={form.formState.errors.recruitment_count ? 'border-destructive' : ''}
            />
            {form.formState.errors.recruitment_count && (
              <p className="text-sm text-destructive">{form.formState.errors.recruitment_count.message}</p>
            )}
          </div>

          {/* 제공 혜택 */}
          <div className="space-y-2">
            <Label htmlFor="benefits">
              제공 혜택 *
              <span className="text-muted-foreground text-sm ml-2">(최소 10자)</span>
            </Label>
            <Textarea
              id="benefits"
              {...form.register('benefits')}
              placeholder="예: 브런치 세트 무료 제공, 음료 2잔 무료 제공"
              rows={3}
              className={form.formState.errors.benefits ? 'border-destructive' : ''}
            />
            {form.formState.errors.benefits && (
              <p className="text-sm text-destructive">{form.formState.errors.benefits.message}</p>
            )}
          </div>

          {/* 매장 정보 */}
          <div className="space-y-2">
            <Label htmlFor="store_info">
              매장 정보 *
              <span className="text-muted-foreground text-sm ml-2">(주소, 영업시간 등)</span>
            </Label>
            <Textarea
              id="store_info"
              {...form.register('store_info')}
              placeholder="예: 서울시 강남구 테헤란로 123&#10;영업시간: 10:00 - 22:00&#10;주차: 발레파킹 가능"
              rows={4}
              className={form.formState.errors.store_info ? 'border-destructive' : ''}
            />
            {form.formState.errors.store_info && (
              <p className="text-sm text-destructive">{form.formState.errors.store_info.message}</p>
            )}
          </div>

          {/* 미션 */}
          <div className="space-y-2">
            <Label htmlFor="mission">
              미션 *
              <span className="text-muted-foreground text-sm ml-2">(인플루언서가 수행할 미션)</span>
            </Label>
            <Textarea
              id="mission"
              {...form.register('mission')}
              placeholder="예: &#10;1. 방문 후 3일 이내 블로그 리뷰 작성&#10;2. 사진 5장 이상 첨부&#10;3. #체험단 #브런치카페 해시태그 필수"
              rows={5}
              className={form.formState.errors.mission ? 'border-destructive' : ''}
            />
            {form.formState.errors.mission && (
              <p className="text-sm text-destructive">{form.formState.errors.mission.message}</p>
            )}
          </div>

          {/* 안내사항 */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">📌 등록 전 확인사항</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>등록 후 모집 기간 동안 지원자가 신청할 수 있습니다.</li>
              <li>모집 마감 후 선정 기능을 통해 체험단을 선정할 수 있습니다.</li>
              <li>제공 혜택과 미션은 명확하게 작성해주세요.</li>
            </ul>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                form.reset();
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createCampaign.isPending}
            >
              {createCampaign.isPending ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

