import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  services: {
    user: process.env.USER_SERVICE_URL ?? 'http://localhost:4001',
    job: process.env.JOB_SERVICE_URL ?? 'http://localhost:4002',
    content: process.env.CONTENT_SERVICE_URL ?? 'http://localhost:4003',
    profile: process.env.PROFILE_SERVICE_URL ?? 'http://localhost:4004',
    agent: process.env.AGENT_SERVICE_URL ?? 'http://localhost:4005',
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    callbackUrl:
      process.env.LINKEDIN_CALLBACK_URL ??
      'http://localhost:4000/api/v1/auth/linkedin/callback',
  },
}));
