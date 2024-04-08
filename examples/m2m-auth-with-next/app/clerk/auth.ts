import { auth as clerkAuth } from "@clerk/nextjs";
import { cookies } from "next/headers";

export function auth() {
  /**
   * Coercing to `string`, but this would be safely parsed from the session cookie
   * within Clerk's backend
   */
  const externalClientId = cookies().get("externalClientId")?.value as string;

  return { ...clerkAuth(), externalClientId };
}
