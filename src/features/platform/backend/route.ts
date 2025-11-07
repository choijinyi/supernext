import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv } from '@/backend/hono/context';
import { respond } from '@/backend/http/response';
import { PlatformService } from './service';
import {
  completeAdvertiserSignupSchema,
  completeInfluencerSignupSchema,
  createCampaignSchema,
  updateCampaignStatusSchema,
  listCampaignsQuerySchema,
  createApplicationSchema,
  selectApplicantsSchema,
  listApplicationsQuerySchema,
} from './schema';

export function registerPlatformRoutes(app: Hono<AppEnv>) {
  // ============================================
  // 회원가입 & 인증
  // ============================================
  app.post(
    '/api/auth/signup/advertiser',
    zValidator('json', completeAdvertiserSignupSchema),
    async (c) => {
      const data = c.req.valid('json');
      const supabase = c.get('supabase');
      const logger = c.get('logger');
      const service = new PlatformService(supabase, logger);

      const result = await service.signupAdvertiser(data);
      return respond(c, result);
    }
  );

  app.post(
    '/api/auth/signup/influencer',
    zValidator('json', completeInfluencerSignupSchema),
    async (c) => {
      const data = c.req.valid('json');
      const supabase = c.get('supabase');
      const logger = c.get('logger');
      const service = new PlatformService(supabase, logger);

      const result = await service.signupInfluencer(data);
      return respond(c, result);
    }
  );

  app.get('/api/auth/profile', async (c) => {
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const service = new PlatformService(supabase, logger);
    const result = await service.getUserProfile(user.id);
    return respond(c, result);
  });

  // ============================================
  // 체험단 (Campaign) API
  // ============================================
  app.get(
    '/api/campaigns',
    zValidator('query', listCampaignsQuerySchema),
    async (c) => {
      const query = c.req.valid('query');
      const supabase = c.get('supabase');
      const logger = c.get('logger');
      const service = new PlatformService(supabase, logger);

      const result = await service.listCampaigns(query);
      return respond(c, result);
    }
  );

  app.get('/api/campaigns/:id', async (c) => {
    const campaignId = c.req.param('id');
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    const { data: { user } } = await supabase.auth.getUser();
    const service = new PlatformService(supabase, logger);

    const result = await service.getCampaignById(campaignId, user?.id);
    return respond(c, result);
  });

  app.post(
    '/api/campaigns',
    zValidator('json', createCampaignSchema),
    async (c) => {
      const data = c.req.valid('json');
      const supabase = c.get('supabase');
      const logger = c.get('logger');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const service = new PlatformService(supabase, logger);
      const result = await service.createCampaign(user.id, data);
      return respond(c, result);
    }
  );

  app.patch(
    '/api/campaigns/:id/status',
    zValidator('json', updateCampaignStatusSchema),
    async (c) => {
      const campaignId = c.req.param('id');
      const { status } = c.req.valid('json');
      const supabase = c.get('supabase');
      const logger = c.get('logger');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const service = new PlatformService(supabase, logger);
      const result = await service.updateCampaignStatus(campaignId, user.id, status);
      return respond(c, result);
    }
  );

  // ============================================
  // 지원 (Application) API
  // ============================================
  app.post(
    '/api/applications',
    zValidator('json', createApplicationSchema),
    async (c) => {
      const data = c.req.valid('json');
      const supabase = c.get('supabase');
      const logger = c.get('logger');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const service = new PlatformService(supabase, logger);
      const result = await service.createApplication(user.id, data);
      return respond(c, result);
    }
  );

  app.get(
    '/api/applications/my',
    zValidator('query', listApplicationsQuerySchema),
    async (c) => {
      const query = c.req.valid('query');
      const supabase = c.get('supabase');
      const logger = c.get('logger');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const service = new PlatformService(supabase, logger);
      const result = await service.listMyApplications(user.id, query);
      return respond(c, result);
    }
  );

  app.get('/api/campaigns/:id/applications', async (c) => {
    const campaignId = c.req.param('id');
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const service = new PlatformService(supabase, logger);
    const result = await service.listCampaignApplications(campaignId, user.id);
    return respond(c, result);
  });

  app.post(
    '/api/campaigns/:id/select',
    zValidator('json', selectApplicantsSchema),
    async (c) => {
      const campaignId = c.req.param('id');
      const { application_ids } = c.req.valid('json');
      const supabase = c.get('supabase');
      const logger = c.get('logger');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const service = new PlatformService(supabase, logger);
      const result = await service.selectApplicants(campaignId, user.id, application_ids);
      return respond(c, result);
    }
  );
}

