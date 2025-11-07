export type UserRole = 'advertiser' | 'influencer';

export type CampaignStatus = 'recruiting' | 'closed' | 'selected' | 'completed';

export type ApplicationStatus = 'pending' | 'selected' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  terms_agreed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserProfile {
  id: string;
  user_id: string;
  business_name: string;
  location: string;
  category: string;
  business_registration_number: string;
  created_at: string;
  updated_at: string;
}

export interface InfluencerProfile {
  id: string;
  user_id: string;
  birth_date: string;
  naver_blog_url?: string | null;
  naver_blog_name?: string | null;
  youtube_url?: string | null;
  youtube_name?: string | null;
  instagram_url?: string | null;
  instagram_name?: string | null;
  threads_url?: string | null;
  threads_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  advertiser_id: string;
  title: string;
  recruitment_start_date: string;
  recruitment_end_date: string;
  recruitment_count: number;
  benefits: string;
  store_info: string;
  mission: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  campaign_id: string;
  influencer_id: string;
  message: string;
  visit_date: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithAdvertiser extends Campaign {
  advertiser: UserProfile & {
    advertiser_profile: AdvertiserProfile;
  };
}

export interface ApplicationWithDetails extends Application {
  campaign: Campaign;
  influencer: UserProfile & {
    influencer_profile: InfluencerProfile;
  };
}

