-- Migration: 블로그 체험단 플랫폼 스키마 생성
-- Description: 광고주와 인플루언서를 연결하는 체험단 매칭 플랫폼

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 사용자 프로필 (공통)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('advertiser', 'influencer')),
  terms_agreed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS '사용자 공통 프로필 정보 (광고주/인플루언서 구분)';
COMMENT ON COLUMN public.user_profiles.role IS 'advertiser: 광고주, influencer: 인플루언서';

-- ============================================
-- 광고주 프로필
-- ============================================
CREATE TABLE IF NOT EXISTS public.advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  business_registration_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.advertiser_profiles IS '광고주 전용 프로필 정보';
COMMENT ON COLUMN public.advertiser_profiles.business_registration_number IS '사업자등록번호';

-- ============================================
-- 인플루언서 프로필
-- ============================================
CREATE TABLE IF NOT EXISTS public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  birth_date DATE NOT NULL,
  naver_blog_url TEXT,
  naver_blog_name TEXT,
  youtube_url TEXT,
  youtube_name TEXT,
  instagram_url TEXT,
  instagram_name TEXT,
  threads_url TEXT,
  threads_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.influencer_profiles IS '인플루언서 전용 프로필 정보 (SNS 채널)';

-- ============================================
-- 체험단 (캠페인)
-- ============================================
CREATE TYPE campaign_status AS ENUM ('recruiting', 'closed', 'selected', 'completed');

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  recruitment_start_date DATE NOT NULL,
  recruitment_end_date DATE NOT NULL,
  recruitment_count INTEGER NOT NULL CHECK (recruitment_count > 0),
  benefits TEXT NOT NULL,
  store_info TEXT NOT NULL,
  mission TEXT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'recruiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.campaigns IS '체험단 정보 (광고주가 등록)';
COMMENT ON COLUMN public.campaigns.status IS 'recruiting: 모집중, closed: 모집종료, selected: 선정완료, completed: 완료';

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- ============================================
-- 체험단 지원 내역
-- ============================================
CREATE TYPE application_status AS ENUM ('pending', 'selected', 'rejected');

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

COMMENT ON TABLE public.applications IS '체험단 지원 내역';
COMMENT ON COLUMN public.applications.message IS '각오 한마디';
COMMENT ON COLUMN public.applications.visit_date IS '방문 예정일자';
COMMENT ON COLUMN public.applications.status IS 'pending: 신청완료, selected: 선정, rejected: 반려';

CREATE INDEX IF NOT EXISTS idx_applications_campaign ON public.applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_influencer ON public.applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON public.advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 비활성화 (프로젝트 가이드라인에 따라)
-- ============================================
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.advertiser_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 샘플 데이터 (테스트용)
-- ============================================
-- Note: Supabase Auth를 사용하므로 실제 사용자는 Auth를 통해 생성됩니다.
-- 여기서는 테이블 구조만 생성하고 샘플 데이터는 생략합니다.

