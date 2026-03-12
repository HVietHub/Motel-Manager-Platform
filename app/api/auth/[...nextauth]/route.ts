import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/services/auth.service';

/**
 * NextAuth Configuration
 * 
 * Implements authentication using credentials provider with JWT session strategy.
 * Supports both LANDLORD and TENANT roles.
 * 
 * Requirements: 1.3, 1.4
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và mật khẩu là bắt buộc');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            landlord: true,
            tenant: true,
          },
        });

        // Check if user exists
        if (!user) {
          throw new Error('Tài khoản không tồn tại');
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error('Mật khẩu không đúng');
        }

        // Return user object with role-specific data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          landlordId: user.landlord?.id,
          tenantId: user.tenant?.id,
          rememberMe: credentials.rememberMe === 'true',
        };
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 14 * 24 * 60 * 60, // 14 days
      },
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.landlordId = user.landlordId;
        token.tenantId = user.tenantId;
        token.rememberMe = user.rememberMe;
        
        // Set token expiry - 14 days for remember me, 1 day otherwise
        if (user.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60);
        } else {
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add token data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.landlordId = token.landlordId as string | undefined;
        session.user.tenantId = token.tenantId as string | undefined;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
