import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const publicUrls = ['/auth/login'];
  const isPublicUrl = publicUrls.some(url => req.nextUrl.pathname.startsWith(url));

  // if user is not signed in and the current path is not public, redirect the user to /auth/login
  if (!session && !isPublicUrl) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url));
  }

  // if user is signed in and the current path is any public url, redirect the user to /
  if (session && isPublicUrl) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
