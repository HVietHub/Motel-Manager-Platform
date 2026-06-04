"use client";

import { SessionProvider } from "next-auth/react";

/**
 * NextAuth SessionProvider wrapper component
 * 
 * This component wraps the application with NextAuth's SessionProvider
 * to enable session management throughout the app.
 */
export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
