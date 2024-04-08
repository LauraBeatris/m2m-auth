/**
 * Actions that would be defined within @clerk/nextjs
 */

"use server";

import { Unkey } from "@unkey/api";
import * as z from "zod";

const CreateKeySchema = z.object({
  name: z.string(),
  /**
   * Links a API key to a customer record
   */
  consumerId: z.string(),
});

export type CreateKeySchema = z.infer<typeof CreateKeySchema>;

export interface Key {
  keyId: string;
  key: string;
}

export async function createApiKey(formData: FormData): Promise<Key> {
  const form = Object.fromEntries(formData);
  const { name, consumerId } = CreateKeySchema.parse(form);

  const token = process.env.UNKEY_ROOT_KEY;

  // This would be mapped to Clerk's application ID
  const apiId = process.env.UNKEY_API_ID;

  const unkey = new Unkey({ token });
  const { result } = await unkey.keys.create({
    name,
    ownerId: consumerId,
    apiId,
  });

  if (!result) {
    throw new Error("Failed to create API key");
  }

  return result;
}
