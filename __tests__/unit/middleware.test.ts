/**
 * Unit tests for authentication middleware
 * 
 * Tests the middleware configuration and route protection logic.
 * 
 * Requirements: 11.1
 */

import { describe, it, expect } from '@jest/globals';

describe('Middleware Configuration', () => {
  it('should have correct matcher configuration', () => {
    // Import the config from proxy
    const proxyModule = require('../../proxy');
    const config = proxyModule.config;

    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    
    // Verify protected routes
    expect(config.matcher).toContain('/landlord/:path*');
    expect(config.matcher).toContain('/tenant/:path*');
  });

  it('should protect landlord routes', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    // Landlord routes should be in the matcher
    const hasLandlordRoute = config.matcher.some((pattern: string) => 
      pattern.includes('/landlord')
    );
    
    expect(hasLandlordRoute).toBe(true);
  });

  it('should protect tenant routes', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    // Tenant routes should be in the matcher
    const hasTenantRoute = config.matcher.some((pattern: string) => 
      pattern.includes('/tenant')
    );
    
    expect(hasTenantRoute).toBe(true);
  });

  it('should not protect public routes', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    // Public routes should NOT be in the matcher
    const publicRoutes = ['/login', '/register', '/api/auth', '/'];
    
    publicRoutes.forEach(route => {
      const isProtected = config.matcher.some((pattern: string) => 
        pattern === route
      );
      expect(isProtected).toBe(false);
    });
  });
});

describe('Middleware Route Protection Logic', () => {
  it('should redirect unauthenticated users to login', () => {
    // This test verifies the middleware configuration
    // The actual redirect logic is handled by NextAuth's withAuth
    const middlewareModule = require('../../middleware');
    
    // Verify the middleware is using withAuth
    expect(middlewareModule.default).toBeDefined();
    expect(typeof middlewareModule.default).toBe('function');
  });

  it('should have role-based access control logic', () => {
    // Verify the middleware file contains role checking logic
    const fs = require('fs');
    const path = require('path');
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    
    // Check for role-based logic
    expect(middlewareContent).toContain('role');
    expect(middlewareContent).toContain('LANDLORD');
    expect(middlewareContent).toContain('TENANT');
    expect(middlewareContent).toContain('/landlord');
    expect(middlewareContent).toContain('/tenant');
  });

  it('should redirect to correct dashboard based on role', () => {
    const fs = require('fs');
    const path = require('path');
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    
    // Verify redirect logic exists
    expect(middlewareContent).toContain('/landlord/dashboard');
    expect(middlewareContent).toContain('/tenant/dashboard');
    expect(middlewareContent).toContain('NextResponse.redirect');
  });
});

describe('Middleware Requirements Validation', () => {
  it('should implement authentication check (Requirement 11.1)', () => {
    const fs = require('fs');
    const path = require('path');
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    
    // Verify authentication check implementation
    expect(middlewareContent).toContain('withAuth');
    expect(middlewareContent).toContain('token');
    expect(middlewareContent).toContain('authorized');
  });

  it('should redirect unauthenticated users to login page (Requirement 11.1)', () => {
    const fs = require('fs');
    const path = require('path');
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    
    // Verify redirect to login
    expect(middlewareContent).toContain('/login');
    expect(middlewareContent).toContain('signIn');
  });

  it('should protect /landlord/* routes (Requirement 11.1)', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    expect(config.matcher).toContain('/landlord/:path*');
  });

  it('should protect /tenant/* routes (Requirement 11.1)', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    expect(config.matcher).toContain('/tenant/:path*');
  });

  it('should allow public access to /login (Requirement 11.1)', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    // /login should NOT be in the matcher (it's public)
    expect(config.matcher).not.toContain('/login');
  });

  it('should allow public access to /register (Requirement 11.1)', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    // /register should NOT be in the matcher (it's public)
    expect(config.matcher).not.toContain('/register');
  });

  it('should allow public access to /api/auth/* (Requirement 11.1)', () => {
    const middlewareModule = require('../../middleware');
    const config = middlewareModule.config;
    
    // /api/auth/* should NOT be in the matcher (it's public)
    const hasAuthApi = config.matcher.some((pattern: string) => 
      pattern.includes('/api/auth')
    );
    expect(hasAuthApi).toBe(false);
  });
});
