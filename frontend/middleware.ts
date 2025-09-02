import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const authRoutes = ['/login', '/register'];
  const protectedRoutes = ['/dashboard', '/admin'];

  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // If trying to access auth page while logged in, redirect to proper page
  if (accessToken && authRoutes.includes(pathname)) {
    const payload: any = decodeToken(accessToken);
    const role = payload?.type || payload?.role;
    const target = role === 'Admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // If trying to access protected page while not logged in, redirect to login
  if (!accessToken && protectedRoutes.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};