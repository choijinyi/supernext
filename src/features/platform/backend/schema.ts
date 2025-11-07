import { z } from 'zod';

// ============================================
// 회원가입 & 온보딩 스키마
// ============================================
export const signupBaseSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  phone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 휴대폰 번호 형식이 아닙니다'),
  terms_agreed: z.boolean().refine((val) => val === true, '약관에 동의해야 합니다'),
});

export const advertiserOnboardingSchema = z.object({
  business_name: z.string().min(2, '업체명은 최소 2자 이상이어야 합니다'),
  location: z.string().min(2, '위치를 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  business_registration_number: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)'),
});

export const influencerOnboardingSchema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (예: 1990-01-01)'),
  naver_blog_name: z.string().optional(),
  naver_blog_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  youtube_name: z.string().optional(),
  youtube_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  instagram_name: z.string().optional(),
  instagram_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  threads_name: z.string().optional(),
  threads_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
});

export const completeAdvertiserSignupSchema = signupBaseSchema.extend({
  role: z.literal('advertiser'),
  advertiser_profile: advertiserOnboardingSchema,
});

export const completeInfluencerSignupSchema = signupBaseSchema.extend({
  role: z.literal('influencer'),
  influencer_profile: influencerOnboardingSchema,
});

// ============================================
// 체험단 (Campaign) 스키마
// ============================================
export const createCampaignSchema = z.object({
  title: z.string().min(5, '체험단명은 최소 5자 이상이어야 합니다'),
  recruitment_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다'),
  recruitment_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다'),
  recruitment_count: z.number().int().min(1, '모집 인원은 최소 1명 이상이어야 합니다'),
  benefits: z.string().min(10, '제공 혜택은 최소 10자 이상이어야 합니다'),
  store_info: z.string().min(10, '매장 정보는 최소 10자 이상이어야 합니다'),
  mission: z.string().min(10, '미션 내용은 최소 10자 이상이어야 합니다'),
});

export const updateCampaignStatusSchema = z.object({
  status: z.enum(['recruiting', 'closed', 'selected', 'completed']),
});

export const listCampaignsQuerySchema = z.object({
  status: z.enum(['recruiting', 'closed', 'selected', 'completed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// 지원 (Application) 스키마
// ============================================
export const createApplicationSchema = z.object({
  campaign_id: z.string().uuid('올바른 체험단 ID가 아닙니다'),
  message: z.string().min(10, '각오 한마디는 최소 10자 이상이어야 합니다'),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다'),
});

export const selectApplicantsSchema = z.object({
  application_ids: z.array(z.string().uuid()).min(1, '최소 1명 이상 선정해야 합니다'),
});

export const listApplicationsQuerySchema = z.object({
  status: z.enum(['pending', 'selected', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// 응답 스키마
// ============================================
export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['advertiser', 'influencer']),
  advertiser_profile: z.object({
    business_name: z.string(),
    location: z.string(),
    category: z.string(),
  }).optional(),
  influencer_profile: z.object({
    birth_date: z.string(),
    naver_blog_name: z.string().optional(),
    youtube_name: z.string().optional(),
    instagram_name: z.string().optional(),
    threads_name: z.string().optional(),
  }).optional(),
});

export const campaignResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  recruitment_start_date: z.string(),
  recruitment_end_date: z.string(),
  recruitment_count: z.number(),
  benefits: z.string(),
  store_info: z.string(),
  mission: z.string(),
  status: z.enum(['recruiting', 'closed', 'selected', 'completed']),
  created_at: z.string(),
  advertiser: userProfileResponseSchema.optional(),
  application_count: z.number().optional(),
});

export const applicationResponseSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  message: z.string(),
  visit_date: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  created_at: z.string(),
  campaign: campaignResponseSchema.optional(),
  influencer: userProfileResponseSchema.optional(),
});

export type SignupBase = z.infer<typeof signupBaseSchema>;
export type AdvertiserOnboarding = z.infer<typeof advertiserOnboardingSchema>;
export type InfluencerOnboarding = z.infer<typeof influencerOnboardingSchema>;
export type CompleteAdvertiserSignup = z.infer<typeof completeAdvertiserSignupSchema>;
export type CompleteInfluencerSignup = z.infer<typeof completeInfluencerSignupSchema>;
export type CreateCampaign = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignStatus = z.infer<typeof updateCampaignStatusSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
export type CreateApplication = z.infer<typeof createApplicationSchema>;
export type SelectApplicants = z.infer<typeof selectApplicantsSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type CampaignResponse = z.infer<typeof campaignResponseSchema>;
export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;

