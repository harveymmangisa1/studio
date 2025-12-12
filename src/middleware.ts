
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const publicUrls = ['/auth/login'];

  // if user is not signed in and the current path is not public, redirect the user to /auth/login
  if (!session && !publicUrls.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // if user is signed in and the current path is /auth/login, redirect the user to /
  if (session && req.nextUrl.pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
