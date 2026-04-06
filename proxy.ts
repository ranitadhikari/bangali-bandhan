import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// This function can be marked `async` if using `await` inside
export function proxy(request: any) {
  const middleware = createMiddleware(routing);
  return middleware(request);
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
