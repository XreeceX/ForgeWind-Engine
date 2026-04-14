# Option A Deployment Guide (Vercel + Hosted Backend)

This guide deploys the `apps/web` frontend to Vercel and deploys backend services and data stores to Railway (or Render).

Use this when you want a public demo URL quickly without running full infrastructure on your local machine.

## Architecture for Option A

- Frontend: Vercel (`apps/web`)
- API + services: Railway/Render (NestJS services from this monorepo)
- Database: Managed PostgreSQL (Railway/Render add-on or external provider)
- Cache/queues: Managed Redis

## 1) Deploy frontend to Vercel

1. Push your repository to GitHub.
2. In Vercel, create a new project from this repository.
3. Set **Root Directory** to `apps/web`.
4. Add required environment variable:
   - `NEXT_PUBLIC_API_URL=https://<your-api-gateway-domain>/api/v1`
5. Deploy.

After deploy, your frontend is live but depends on the API URL being reachable.

## 2) Deploy backend services

Deploy at least:

- `apps/api-gateway`
- `services/user-service`
- Any additional services used by routes in your current demo flow

For each service in Railway/Render:

1. Create a service from the same GitHub repo.
2. Set service root to that package folder.
3. Set start command to that service's production entrypoint.
4. Set all required environment variables from `.env.example`.

## 3) Configure shared environment variables

Minimum required variables for early testing:

- `NODE_ENV=production`
- `DATABASE_URL=...`
- `REDIS_URL=...`
- `OPENAI_API_KEY=...`
- `JWT_SECRET=...`

Frontend variable:

- `NEXT_PUBLIC_API_URL=https://<api-gateway-domain>/api/v1`

Note: if `NEXT_PUBLIC_API_URL` is not set, the frontend falls back to localhost and production API calls will fail.

## 4) Verify deployment

1. Open frontend URL from Vercel.
2. Open API docs at `https://<api-gateway-domain>/api/docs`.
3. Test one auth route and one domain route from Swagger.
4. Validate frontend actions call the hosted API successfully.

## 5) Common issues

- 404/Network errors in frontend:
  - `NEXT_PUBLIC_API_URL` is missing or points to wrong domain/path.
- CORS failures:
  - API gateway CORS config does not include Vercel domain.
- 500 errors on backend:
  - Missing required env vars, DB not reachable, or Redis unavailable.

## 6) Notes

- Vercel is ideal for the Next.js frontend in this repository.
- This repository's microservice architecture is better hosted on Railway/Render/Fly/AWS for backend runtime needs.
