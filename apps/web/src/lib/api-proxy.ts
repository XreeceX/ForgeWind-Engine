import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function proxyToBackend(
  req: NextRequest,
  pathSegments: string[],
  serverEnvKey: 'USER_SERVICE_URL' | 'FORGEWIND_API_URL',
  publicEnvKey?: 'NEXT_PUBLIC_USER_SERVICE_URL' | 'NEXT_PUBLIC_FORGEWIND_API_URL',
): Promise<NextResponse> {
  const base =
    process.env[serverEnvKey]?.trim() ||
    (publicEnvKey ? process.env[publicEnvKey]?.trim() : undefined);

  if (!base) {
    return NextResponse.json(
      { message: `${serverEnvKey} is not configured on the server` },
      { status: 503 },
    );
  }

  const session = await auth();
  const path = pathSegments.filter(Boolean).join('/');
  const url = `${base.replace(/\/$/, '')}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  } else if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  const res = await fetch(url, init);
  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
    },
  });
}
