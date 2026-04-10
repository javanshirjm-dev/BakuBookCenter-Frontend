import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Define your supported languages
const locales = ['az', 'en', 'ru'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 2. Check if the URL already has a language (e.g., /en/books)
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // 3. If no language in URL, redirect to the default language (e.g., /az/books)
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
}

// 4. Tell Next.js WHICH paths this middleware should run on.
// We exclude API routes, Next.js internal files, and your uploads!
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|uploads|favicon.ico|admin).*)',
    ],
};