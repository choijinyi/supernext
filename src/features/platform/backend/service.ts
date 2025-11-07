import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppLogger } from '@/backend/hono/context';
import type {
  CompleteAdvertiserSignup,
  CompleteInfluencerSignup,
  CreateCampaign,
  CreateApplication,
  ListCampaignsQuery,
  ListApplicationsQuery,
} from './schema';
import { success, failure } from '@/backend/http/response';
import { PlatformError } from './error';

export class PlatformService {
  constructor(
    private supabase: SupabaseClient,
    private logger: AppLogger
  ) {}

  async signupAdvertiser(data: CompleteAdvertiserSignup) {
    try {
      const { email, password, name, phone, terms_agreed, advertiser_profile } = data;

      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: 'advertiser',
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        },
      });

      if (authError || !authData.user) {
        this.logger.error('Advertiser signup failed', { error: authError });
        return failure(400, PlatformError.SIGNUP_FAILED, authError?.message || '회원가입에 실패했습니다');
      }

      const userId = authData.user.id;

      const { error: profileError } = await this.supabase.from('user_profiles').insert({
        id: userId,
        name,
        phone,
        email,
        role: 'advertiser',
        terms_agreed,
      });

      if (profileError) {
        this.logger.error('Failed to create user profile', { error: profileError });
        return failure(500, PlatformError.PROFILE_CREATE_FAILED, '프로필 생성에 실패했습니다');
      }

      const { error: advertiserError } = await this.supabase.from('advertiser_profiles').insert({
        user_id: userId,
        business_name: advertiser_profile.business_name,
        location: advertiser_profile.location,
        category: advertiser_profile.category,
        business_registration_number: advertiser_profile.business_registration_number,
      });

      if (advertiserError) {
        this.logger.error('Failed to create advertiser profile', { error: advertiserError });
        return failure(500, PlatformError.PROFILE_CREATE_FAILED, '광고주 프로필 생성에 실패했습니다');
      }

      return success({ user_id: userId });
    } catch (error) {
      this.logger.error('Unexpected error during advertiser signup', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async signupInfluencer(data: CompleteInfluencerSignup) {
    try {
      const { email, password, name, phone, terms_agreed, influencer_profile } = data;

      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: 'influencer',
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        },
      });

      if (authError || !authData.user) {
        this.logger.error('Influencer signup failed', { error: authError });
        return failure(400, PlatformError.SIGNUP_FAILED, authError?.message || '회원가입에 실패했습니다');
      }

      const userId = authData.user.id;

      const { error: profileError } = await this.supabase.from('user_profiles').insert({
        id: userId,
        name,
        phone,
        email,
        role: 'influencer',
        terms_agreed,
      });

      if (profileError) {
        this.logger.error('Failed to create user profile', { error: profileError });
        return failure(500, PlatformError.PROFILE_CREATE_FAILED, '프로필 생성에 실패했습니다');
      }

      const { error: influencerError } = await this.supabase.from('influencer_profiles').insert({
        user_id: userId,
        birth_date: influencer_profile.birth_date,
        naver_blog_name: influencer_profile.naver_blog_name,
        naver_blog_url: influencer_profile.naver_blog_url || null,
        youtube_name: influencer_profile.youtube_name,
        youtube_url: influencer_profile.youtube_url || null,
        instagram_name: influencer_profile.instagram_name,
        instagram_url: influencer_profile.instagram_url || null,
        threads_name: influencer_profile.threads_name,
        threads_url: influencer_profile.threads_url || null,
      });

      if (influencerError) {
        this.logger.error('Failed to create influencer profile', { error: influencerError });
        return failure(500, PlatformError.PROFILE_CREATE_FAILED, '인플루언서 프로필 생성에 실패했습니다');
      }

      return success({ user_id: userId });
    } catch (error) {
      this.logger.error('Unexpected error during influencer signup', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select('*, advertiser_profiles(*), influencer_profiles(*)')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return failure(404, PlatformError.USER_NOT_FOUND, '사용자를 찾을 수 없습니다');
      }

      return success(profile);
    } catch (error) {
      this.logger.error('Error fetching user profile', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '프로필 조회에 실패했습니다');
    }
  }

  async listCampaigns(query: ListCampaignsQuery) {
    try {
      const { status, page, limit } = query;
      const offset = (page - 1) * limit;

      let queryBuilder = this.supabase
        .from('campaigns')
        .select('*, user_profiles!campaigns_advertiser_id_fkey(name, advertiser_profiles(business_name, location))', { count: 'exact' });

      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Failed to fetch campaigns', { error });
        return failure(500, PlatformError.FETCH_FAILED, '체험단 목록 조회에 실패했습니다');
      }

      return success({
        campaigns: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    } catch (error) {
      this.logger.error('Unexpected error fetching campaigns', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async getCampaignById(campaignId: string, userId?: string) {
    try {
      const { data: campaign, error } = await this.supabase
        .from('campaigns')
        .select('*, user_profiles!campaigns_advertiser_id_fkey(name, email, advertiser_profiles(*))')
        .eq('id', campaignId)
        .single();

      if (error || !campaign) {
        return failure(404, PlatformError.CAMPAIGN_NOT_FOUND, '체험단을 찾을 수 없습니다');
      }

      let applicationCount = 0;
      let userApplication = null;

      const { count } = await this.supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

      applicationCount = count || 0;

      if (userId) {
        const { data: app } = await this.supabase
          .from('applications')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', userId)
          .single();

        userApplication = app;
      }

      return success({
        ...campaign,
        application_count: applicationCount,
        user_application: userApplication,
      });
    } catch (error) {
      this.logger.error('Error fetching campaign', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '체험단 조회에 실패했습니다');
    }
  }

  async createCampaign(advertiserId: string, data: CreateCampaign) {
    try {
      const { data: campaign, error } = await this.supabase
        .from('campaigns')
        .insert({
          advertiser_id: advertiserId,
          ...data,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to create campaign', { error });
        return failure(400, PlatformError.CREATE_FAILED, '체험단 등록에 실패했습니다');
      }

      return success(campaign);
    } catch (error) {
      this.logger.error('Unexpected error creating campaign', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async updateCampaignStatus(campaignId: string, advertiserId: string, status: string) {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId)
        .eq('advertiser_id', advertiserId)
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update campaign status', { error });
        return failure(400, PlatformError.UPDATE_FAILED, '체험단 상태 변경에 실패했습니다');
      }

      return success(data);
    } catch (error) {
      this.logger.error('Unexpected error updating campaign status', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async createApplication(influencerId: string, data: CreateApplication) {
    try {
      const { data: application, error } = await this.supabase
        .from('applications')
        .insert({
          influencer_id: influencerId,
          ...data,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to create application', { error });
        return failure(400, PlatformError.APPLICATION_FAILED, '지원에 실패했습니다');
      }

      return success(application);
    } catch (error) {
      this.logger.error('Unexpected error creating application', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async listMyApplications(influencerId: string, query: ListApplicationsQuery) {
    try {
      const { status, page, limit } = query;
      const offset = (page - 1) * limit;

      let queryBuilder = this.supabase
        .from('applications')
        .select('*, campaigns(*)', { count: 'exact' })
        .eq('influencer_id', influencerId);

      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Failed to fetch applications', { error });
        return failure(500, PlatformError.FETCH_FAILED, '지원 목록 조회에 실패했습니다');
      }

      return success({
        applications: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    } catch (error) {
      this.logger.error('Unexpected error fetching applications', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async listCampaignApplications(campaignId: string, advertiserId: string) {
    try {
      const { data: campaign, error: campaignError } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('advertiser_id', advertiserId)
        .single();

      if (campaignError || !campaign) {
        return failure(403, PlatformError.UNAUTHORIZED, '권한이 없습니다');
      }

      const { data, error } = await this.supabase
        .from('applications')
        .select('*, user_profiles!applications_influencer_id_fkey(name, email, phone, influencer_profiles(*))')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Failed to fetch campaign applications', { error });
        return failure(500, PlatformError.FETCH_FAILED, '신청자 목록 조회에 실패했습니다');
      }

      return success(data || []);
    } catch (error) {
      this.logger.error('Unexpected error fetching campaign applications', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }

  async selectApplicants(campaignId: string, advertiserId: string, applicationIds: string[]) {
    try {
      const { data: campaign, error: campaignError } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('advertiser_id', advertiserId)
        .single();

      if (campaignError || !campaign) {
        return failure(403, PlatformError.UNAUTHORIZED, '권한이 없습니다');
      }

      const { error: updateError } = await this.supabase
        .from('applications')
        .update({ status: 'selected' })
        .in('id', applicationIds)
        .eq('campaign_id', campaignId);

      if (updateError) {
        this.logger.error('Failed to select applicants', { error: updateError });
        return failure(400, PlatformError.UPDATE_FAILED, '선정 처리에 실패했습니다');
      }

      const { error: campaignUpdateError } = await this.supabase
        .from('campaigns')
        .update({ status: 'selected' })
        .eq('id', campaignId);

      if (campaignUpdateError) {
        this.logger.error('Failed to update campaign status to selected', { error: campaignUpdateError });
      }

      return success({ selected_count: applicationIds.length });
    } catch (error) {
      this.logger.error('Unexpected error selecting applicants', { error });
      return failure(500, PlatformError.INTERNAL_ERROR, '예상치 못한 오류가 발생했습니다');
    }
  }
}

