import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Authentication Middleware
 * 
 * Protects routes that require authentication:
 * - /landlord/* - Landlord dashboard and features
 * - /tenant/* - Tenant dashboard and features
 * 
 * Public routes (no authentication required):
 * - /login - Login page
 * - /register - Registration page
 * - /api/auth/* - NextAuth API routes
 * - / - Home page
 * 
 * Redirects unauthenticated users to /login
 * 
 * Requirements: 11.1
 */

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If no token, NextAuth will redirect to login automatically
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control
    const role = token.role as string;

    // Landlord trying to access tenant routes
    if (path.startsWith('/tenant') && role !== 'TENANT') {
      return NextResponse.redirect(new URL('/landlord/dashboard', req.url));
    }

    // Tenant trying to access landlord routes
    if (path.startsWith('/landlord') && role !== 'LANDLORD') {
      return NextResponse.redirect(new URL('/tenant/dashboard', req.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if token exists, false otherwise
        // If false, user will be redirected to login page
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

/**
 * Matcher configuration
 * 
 * Specifies which routes should be protected by this middleware.
 * 
 * Protected routes:
 * - /landlord/:path* - All landlord routes
 * - /tenant/:path* - All tenant routes
 * 
 * Excluded routes (public):
 * - /api/auth/:path* - NextAuth API routes
 * - /_next/:path* - Next.js internal routes
 * - /favicon.ico - Favicon
 * - /login - Login page
 * - /register - Registration page
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (NextAuth API routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt (static files)
     * - /login, /register (public pages)
     * - / (home page)
     */
    '/landlord/:path*',
    '/tenant/:path*',
  ],
};
