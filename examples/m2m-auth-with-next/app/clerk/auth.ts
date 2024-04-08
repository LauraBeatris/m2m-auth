import { auth as clerkAuth } from "@clerk/nextjs";
import { cookies } from "next/headers";

/**
 * Wrapper on top of `@clerk/nextjs`'s `auth` function to return additional context
 * regarding "consumer/machine/non-user identity"
 */
export function auth() {
  /**
   * Coercing to `string`, but this would be safely parsed from the session cookie
   * within Clerk's backend
   */
  const externalClientId = cookies().get("externalClientId")?.value as string;

  return { ...clerkAuth(), externalClientId };
}
