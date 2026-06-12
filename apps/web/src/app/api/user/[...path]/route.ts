import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(req, path, 'USER_SERVICE_URL', 'NEXT_PUBLIC_USER_SERVICE_URL');
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
