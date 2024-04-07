"use server";

import { kv } from "@vercel/kv";
import { revalidatePath, unstable_noStore } from "next/cache";
import { TimeSpan } from "oslo";
import { HMAC, alphabet, generateRandomString } from "oslo/crypto";
import { createJWT } from "oslo/jwt";

interface ApiKey {
  keyId: string;
  expiresIn: TimeSpan;
}

/**
 * For the purposes of this example, API keys are going to be stored and retrieved from Vercel KV
 */
export async function fetchActiveApiKeys() {
  // Recently created keys should be reflected in the UI, therefore opting out for not caching it
  unstable_noStore();

  const keys = await kv.smembers<Array<ApiKey>>("api-keys");

  return keys;
}

export async function createApiKey() {
  const secret = await new HMAC("SHA-256").generateKey();

  const keyId = generateRandomString(10, alphabet("a-z", "0-9"));
  const expiresIn = new TimeSpan(30, "d");

  const payload = {
    keyId,
  };

  const jwt = await createJWT("HS256", secret, payload, {
    headers: {
      kid: "123",
    },
    expiresIn,
    issuer: "test",
    subject: "test",
    audiences: ["test"],
    includeIssuedTimestamp: true,
  });

  await kv.sadd("api-keys", {
    keyId,
    expiresInMilliseconds: expiresIn.milliseconds(),
  });

  revalidatePath("/");

  return jwt;
}

export async function verifyApiKey() {
  // TODO - Verify API key
}
