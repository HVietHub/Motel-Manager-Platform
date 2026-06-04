import { useSession } from "next-auth/react";

/**
 * Custom hook to get tenantId from session
 * Returns tenantId or null if not available
 */
export function useTenantId() {
  const { data: session } = useSession();
  return session?.user?.tenantId || null;
}
