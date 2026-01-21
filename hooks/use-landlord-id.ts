import { useSession } from "next-auth/react";

/**
 * Custom hook to get landlordId from session
 * Returns landlordId or null if not available
 */
export function useLandlordId() {
  const { data: session } = useSession();
  return session?.user?.landlordId || null;
}
