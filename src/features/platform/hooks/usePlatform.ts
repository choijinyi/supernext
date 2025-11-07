'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type {
  CompleteAdvertiserSignup,
  CompleteInfluencerSignup,
  CreateCampaign,
  CreateApplication,
  ListCampaignsQuery,
  ListApplicationsQuery,
  SelectApplicants,
} from '../lib/dto';

// ============================================
// 회원가입
// ============================================
export function useSignupAdvertiser() {
  return useMutation({
    mutationFn: async (data: CompleteAdvertiserSignup) => {
      const response = await apiClient.post('/api/auth/signup/advertiser', data);
      return response.data;
    },
  });
}

export function useSignupInfluencer() {
  return useMutation({
    mutationFn: async (data: CompleteInfluencerSignup) => {
      const response = await apiClient.post('/api/auth/signup/influencer', data);
      return response.data;
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/profile');
      return response.data;
    },
  });
}

// ============================================
// 체험단 (Campaign)
// ============================================
export function useCampaigns(query: ListCampaignsQuery = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['campaigns', query],
    queryFn: async () => {
      const response = await apiClient.get('/api/campaigns', { params: query });
      return response.data;
    },
  });
}

export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/campaigns/${campaignId}`);
      return response.data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaign) => {
      const response = await apiClient.post('/api/campaigns', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: string; status: string }) => {
      const response = await apiClient.patch(`/api/campaigns/${campaignId}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// ============================================
// 지원 (Application)
// ============================================
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplication) => {
      const response = await apiClient.post('/api/applications', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaign_id] });
    },
  });
}

export function useMyApplications(query: ListApplicationsQuery = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['my-applications', query],
    queryFn: async () => {
      const response = await apiClient.get('/api/applications/my', { params: query });
      return response.data;
    },
  });
}

export function useCampaignApplications(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-applications', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/campaigns/${campaignId}/applications`);
      return response.data;
    },
    enabled: !!campaignId,
  });
}

export function useSelectApplicants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, application_ids }: { campaignId: string } & SelectApplicants) => {
      const response = await apiClient.post(`/api/campaigns/${campaignId}/select`, { application_ids });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

