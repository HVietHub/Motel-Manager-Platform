import 'next-auth';
import 'next-auth/jwt';

/**
 * Type definitions for NextAuth
 * 
 * Extends NextAuth types to include custom user properties:
 * - role: User role (LANDLORD or TENANT)
 * - landlordId: ID of associated landlord record (if role is LANDLORD)
 * - tenantId: ID of associated tenant record (if role is TENANT)
 */

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    landlordId?: string;
    tenantId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      landlordId?: string;
      tenantId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    landlordId?: string;
    tenantId?: string;
  }
}
