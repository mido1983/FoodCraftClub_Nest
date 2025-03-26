import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Маршруты, которые можно посещать без аутентификации
  publicRoutes: [
    '/',
    '/products',
    '/products/(.*)',
    '/about',
    '/sellers',
    '/api/clerk-webhook',
    '/sign-in',
    '/sign-up'
  ],
  // Маршруты, которые всегда доступны, даже если пользователь не аутентифицирован
  ignoredRoutes: [
    '/api/webhook',
    '/_next/static/(.*)',
    '/_next/image',
    '/favicon.ico',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
