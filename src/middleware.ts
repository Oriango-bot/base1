
import { NextResponse, type NextRequest } from 'next/server';
import { validateApiKey } from '@/lib/services/api.service';

export const config = {
  matcher: '/api/v1/:path*',
};

export async function middleware(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized: API Key is missing.' }, { status: 401 });
  }

  const apiKeyData = await validateApiKey(apiKey);

  if (!apiKeyData) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API Key.' }, { status: 401 });
  }

  // Example of scope checking for a specific route
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/v1/forms/generate') && !apiKeyData.scopes.includes('forms:write')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions for this action.' }, { status: 403 });
  }

  // Add the validated partnerId to the request headers so API routes can use it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Partner-ID', apiKeyData.partnerId.toString());
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
